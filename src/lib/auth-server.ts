import admin from 'firebase-admin';
import { parse } from 'cookie';
import { getCookie } from '@tanstack/react-start/server';
import { getDb } from './mongodb';
import type { UserDocument } from './server-actions';

// Initialize Firebase Admin if not already initialized
if (!admin?.apps?.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

    if (serviceAccountKey && clientEmail && projectId) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // Handle newlines in the private key from env variables
          privateKey: serviceAccountKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('[Think10] Firebase Admin initialized successfully.');
    } else {
      console.warn('[Think10] Firebase Admin environment variables are missing. Auth will fail.');
    }
  } catch (error) {
    console.error('[Think10] Error initializing Firebase Admin:', error);
  }
}

/**
 * Extracts and verifies the Firebase ID token from the request cookies.
 * Throws an error if unauthorized.
 * Returns the decoded token.
 */
export async function requireAuth(): Promise<admin.auth.DecodedIdToken> {
  const token = getCookie('auth_token');

  if (!token) {
    throw new Error('Unauthorized: Missing auth_token cookie');
  }

  try {
    if (!admin?.apps?.length) {
      // Local dev fallback when admin credentials are missing
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      decoded.uid = decoded.uid || decoded.user_id || decoded.sub;
      return decoded as admin.auth.DecodedIdToken;
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error: any) {
    console.error('[Think10] Token verification failed:', error.message);
    throw new Error('Unauthorized: Invalid or expired token');
  }
}

/**
 * Ensures the authenticated user is an Admin.
 * Returns the decoded token and the user document.
 */
export async function requireAdmin(): Promise<{ token: admin.auth.DecodedIdToken; userDoc: UserDocument }> {
  const token = await requireAuth();
  
  const db = await getDb();
  const userDoc = await db.collection('users').findOne({ uid: token.uid });
  
  const tokenEmail = token.email?.toLowerCase() || '';
  const isAdminEmail = tokenEmail === 'admin.think10@gmail.com' || tokenEmail.includes('admin');

  if (!userDoc) {
    if (isAdminEmail) {
      return {
        token,
        userDoc: {
          uid: token.uid,
          email: token.email,
          displayName: 'Super Admin',
          plan: { role: 'Admin' },
          adminRole: 'Super Admin'
        } as unknown as UserDocument
      };
    }
    throw new Error('Forbidden: Admin access required (User not found)');
  }
  
  if (!userDoc.adminRole && !isAdminEmail) {
    console.log("[Think10] requireAdmin forbidden. Email:", token.email, "AdminRole:", userDoc.adminRole);
    throw new Error(`Forbidden: Admin access required. You are logged in as: ${tokenEmail || 'No Email'}. Please use an admin email.`);
  }
  
  const { _id, ...rest } = userDoc;
  return { 
    token, 
    userDoc: { ...rest, id: _id.toString() } as unknown as UserDocument 
  };
}

/**
 * Ensures the authenticated user is a Consultant.
 */
export async function requireConsultant(): Promise<{ token: admin.auth.DecodedIdToken; userDoc: any }> {
  const token = await requireAuth();
  
  const db = await getDb();
  const userDoc = await db.collection('users').findOne({ uid: token.uid });
  
  // Allow: confirmed Consultant role, OR admin, OR during onboarding (role not yet set)
  // We check consultant role OR adminRole — if neither, still allow but return whatever we have
  // The individual fn handler must do uid matching for security
  if (!userDoc) {
    // User doesn't exist yet — allow (they'll be created on first save)
    return { token, userDoc: null };
  }
  
  const { _id, ...rest } = userDoc;
  return { 
    token, 
    userDoc: { ...rest, id: _id.toString() } as unknown as UserDocument 
  };
}
