/**
 * google-auth.ts
 * Server-side only — never import in client components.
 * Manages Google OAuth2 tokens for Calendar API + Google Meet link generation.
 */

import { google } from 'googleapis';
import { getDb } from '@/lib/mongodb';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Returns a configured OAuth2 client (not yet authorized).
 */
export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = IS_DEV
    ? process.env.GOOGLE_REDIRECT_URI_LOCAL
    : process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured in .env');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Returns the Google OAuth2 authorization URL to send admin to Google login.
 */
export function getAuthorizationUrl(): string {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force refresh_token on every connect
  });
}

/**
 * Exchanges authorization code for tokens and saves them to MongoDB.
 */
export async function exchangeCodeForTokens(code: string): Promise<void> {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  await saveGoogleTokens(tokens);
}

/**
 * Saves Google OAuth tokens to MongoDB system_config collection.
 */
export async function saveGoogleTokens(tokens: any): Promise<void> {
  const db = await getDb();
  await db.collection('system_config').updateOne(
    { key: 'google_oauth_tokens' },
    {
      $set: {
        key: 'google_oauth_tokens',
        ...tokens,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );
}

/**
 * Loads Google OAuth tokens from MongoDB.
 */
export async function loadGoogleTokens(): Promise<any | null> {
  const db = await getDb();
  const doc = await db.collection('system_config').findOne({ key: 'google_oauth_tokens' });
  if (!doc) return null;
  const { _id, key, updatedAt, ...tokens } = doc;
  return tokens;
}

/**
 * Returns an authorized Google OAuth2 client with valid (auto-refreshed) tokens.
 * Throws if no tokens are stored — admin must connect their Google account first.
 */
export async function getAuthorizedOAuthClient() {
  const tokens = await loadGoogleTokens();
  if (!tokens || !tokens.refresh_token) {
    throw new Error('Google account not connected. Please go to Admin → Google Connect to authorize.');
  }

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(tokens);

  // Auto-refresh token if expired
  oauth2Client.on('tokens', async (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    await saveGoogleTokens(merged);
  });

  return oauth2Client;
}

/**
 * Returns an authorized Google Calendar API client.
 */
export async function getCalendarClient() {
  const auth = await getAuthorizedOAuthClient();
  return google.calendar({ version: 'v3', auth });
}

/**
 * Checks if Google account is connected by verifying tokens exist in DB.
 */
export async function isGoogleConnected(): Promise<boolean> {
  try {
    const tokens = await loadGoogleTokens();
    return !!(tokens?.refresh_token);
  } catch {
    return false;
  }
}
