"use client";

// ──────────────────────────────────────────────────────────────────────────────
// Firebase Auth Context
// ──────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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
      const result = await getUserDocFn(uid);
      return result as unknown as UserDocument;
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
      await syncUserDoc(uid, email, displayName, companyName || '', role);
      const result = await getUserDocFn(uid);
      return result as unknown as UserDocument;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const activeAuthOp = useRef(false);

  const loadUserDoc = useCallback(async (user: User) => {
    if (activeAuthOp.current) return; // Let the active auth operation handle fetching and state
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
      if (user) {
        setDocLoading(true); // Synchronously set docLoading to true to prevent split-second race conditions
        setCurrentUser(user);
        setAuthLoading(false);
        // Load the document in the background
        await loadUserDoc(user);
      } else {
        setCurrentUser(user);
        setUserDoc(null);
        setAuthLoading(false);
        setDocLoading(false);
      }
    });
    return unsub;
  }, [loadUserDoc]);

  // ── Auth operations ───────────────────────────────────────────────────────

  const signInWithEmail = async (email: string, password: string, defaultRole?: string) => {
    activeAuthOp.current = true;
    setDocLoading(true);
    try {
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
    } finally {
      activeAuthOp.current = false;
      setDocLoading(false);
    }
  };


  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    companyName: string,
    defaultRole?: string
  ) => {
    activeAuthOp.current = true;
    setDocLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      // Auto-send email verification link
      try { await sendEmailVerification(user); } catch (_) {}
      const fetched = await initAndFetchDoc(user.uid, email, displayName, companyName, defaultRole || 'Free');
      setUserDoc(fetched);
    } finally {
      activeAuthOp.current = false;
      setDocLoading(false);
    }
  };

  const signInWithGoogle = async (defaultRole?: string) => {
    activeAuthOp.current = true;
    setDocLoading(true);
    try {
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
    } finally {
      activeAuthOp.current = false;
      setDocLoading(false);
    }
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
    activeAuthOp.current = true;
    setDocLoading(true);
    try {
      const { user } = await confirmationResult.confirm(otp);
      const fetched = await initAndFetchDoc(
        user.uid,
        user.email ?? "",
        user.displayName ?? user.phoneNumber ?? "",
        "",
        defaultRole
      );
      setUserDoc(fetched);
    } finally {
      activeAuthOp.current = false;
      setDocLoading(false);
    }
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
