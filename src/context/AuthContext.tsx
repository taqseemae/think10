// ──────────────────────────────────────────────────────────────────────────────
// Firebase Auth Context
// ──────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
  sendEmailVerification,
  type User,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { syncUserDoc, getUserDocFn } from "@/lib/server-actions";
import type { UserDocument } from "@/lib/server-actions";

// ── Context Type ──────────────────────────────────────────────────────────────

interface AuthContextType {
  currentUser: User | null;
  userDoc: UserDocument | null;
  authLoading: boolean;
  docLoading: boolean;

  signInWithEmail: (email: string, password: string, defaultRole?: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
    companyName: string,
    defaultRole?: string
  ) => Promise<void>;
  signInWithGoogle: (defaultRole?: string) => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, otp: string, defaultRole?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserDoc: () => Promise<void>;
}

// ── Helper: load Firestore doc with retry on "offline" error ─────────────────

async function fetchUserDocWithRetry(uid: string): Promise<UserDocument | null> {
  const MAX_RETRIES = 4;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await getUserDocFn({ data: uid });
      return result;
    } catch (err: any) {
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        continue;
      }
      console.warn("[Think10] MongoDB unavailable, skipping doc load:", err?.message ?? err);
      return null;
    }
  }
  return null;
}

// ── Helper: init + load doc with retry ───────────────────────────────────────

async function initAndFetchDoc(
  uid: string,
  email: string,
  displayName: string,
  companyName: string,
  role?: string
): Promise<UserDocument | null> {
  const MAX_RETRIES = 4;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await syncUserDoc({ data: { uid, email, displayName, companyName: companyName || '', role } });
      return await getUserDocFn({ data: uid });
    } catch (err: any) {
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        continue;
      }
      console.warn("[Think10] MongoDB init failed:", err?.message ?? err);
      return null;
    }
  }
  return null;
}

// ── Provider ──────────────────────────────────────────────────────────────────

// Safe default — returned during SSR before AuthProvider mounts
const SAFE_DEFAULT_CTX: AuthContextType = {
  currentUser: null,
  userDoc: null,
  authLoading: true,
  docLoading: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  sendPhoneOtp: async () => { throw new Error('AuthProvider not mounted'); },
  confirmPhoneOtp: async () => {},
  logout: async () => {},
  refreshUserDoc: async () => {},
};

const AuthContext = createContext<AuthContextType>(SAFE_DEFAULT_CTX);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);

  const loadUserDoc = useCallback(async (user: User) => {
    setDocLoading(true);
    const fetched = await fetchUserDocWithRetry(user.uid);
    setUserDoc(fetched);
    setDocLoading(false);
  }, []);

  // ── Listen to Firebase auth state changes (client-only) ────────────────────
  useEffect(() => {
    if (typeof window === "undefined") {
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      // Resolve auth loading immediately so router transitions fast
      setAuthLoading(false);

      if (user) {
        // Fetch ID token and set as cookie for server functions
        try {
          // Use Secure flag only on HTTPS (not on localhost)
          const idToken = await user.getIdToken();
          const isSecure = window.location.protocol === 'https:';
          const secureFlag = isSecure ? '; Secure' : '';
          document.cookie = `auth_token=${idToken}; path=/; max-age=3600${secureFlag}; SameSite=Strict`;
        } catch (e) {
          console.error("Failed to get ID token", e);
        }
        
        // Load the document in the background
        loadUserDoc(user);
      } else {
        // Clear auth token cookie
        document.cookie = `auth_token=; path=/; max-age=0`;
        setUserDoc(null);
        setDocLoading(false);
      }
    });
    return unsub;
  }, [loadUserDoc]);

  // ── Auth operations ───────────────────────────────────────────────────────

  const signInWithEmail = async (email: string, password: string, defaultRole?: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    // Sync to MongoDB (will not overwrite role if user exists)
    const fetched = await initAndFetchDoc(
      user.uid,
      user.email ?? email,
      user.displayName ?? '',
      '',
      defaultRole
    );
    setUserDoc(fetched);
  };


  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    companyName: string,
    defaultRole?: string
  ) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    // Auto-send email verification link
    try { await sendEmailVerification(user); } catch (_) {}
    const fetched = await initAndFetchDoc(user.uid, email, displayName, companyName, defaultRole || 'Free');
    setUserDoc(fetched);
  };

  const signInWithGoogle = async (defaultRole?: string) => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    const { user } = await signInWithPopup(auth, provider);
    const fetched = await initAndFetchDoc(
      user.uid,
      user.email ?? "",
      user.displayName ?? "",
      "",
      defaultRole
    );
    setUserDoc(fetched);
  };

  const sendPhoneOtp = async (
    phoneNumber: string,
    recaptchaContainerId: string
  ): Promise<ConfirmationResult> => {
    const recaptcha = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: "invisible",
    });
    return await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
  };

  const confirmPhoneOtp = async (confirmationResult: ConfirmationResult, otp: string, defaultRole?: string) => {
    const { user } = await confirmationResult.confirm(otp);
    const fetched = await initAndFetchDoc(
      user.uid,
      user.email ?? "",
      user.displayName ?? user.phoneNumber ?? "",
      "",
      defaultRole
    );
    setUserDoc(fetched);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserDoc(null);
  };

  const refreshUserDoc = async () => {
    if (currentUser) {
      await loadUserDoc(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userDoc,
        authLoading,
        docLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPhoneOtp,
        confirmPhoneOtp,
        logout,
        refreshUserDoc,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
