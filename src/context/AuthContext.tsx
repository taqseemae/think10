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
import { initUserDocument, getUserDocument, type UserDocument } from "@/lib/firestore";

// ── Context Type ──────────────────────────────────────────────────────────────

interface AuthContextType {
  currentUser: User | null;
  userDoc: UserDocument | null;
  authLoading: boolean;

  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
    companyName?: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserDoc: () => Promise<void>;
}

// ── Helper: load Firestore doc with retry on "offline" error ─────────────────

async function fetchUserDocWithRetry(uid: string): Promise<UserDocument | null> {
  const MAX_RETRIES = 4;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await getUserDocument(uid);
      return result;
    } catch (err: any) {
      const isOffline =
        err?.code === "unavailable" ||
        (typeof err?.message === "string" &&
          (err.message.includes("offline") || err.message.includes("Failed to get document")));

      if (isOffline && attempt < MAX_RETRIES - 1) {
        // Exponential backoff: 500ms, 1s, 2s
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        continue;
      }

      // Non-retriable or max retries hit — log silently and return null
      console.warn("[Think10] Firestore unavailable, skipping doc load:", err?.message ?? err);
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
  companyName: string
): Promise<UserDocument | null> {
  const MAX_RETRIES = 4;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await initUserDocument(uid, email, displayName, companyName);
      return await getUserDocument(uid);
    } catch (err: any) {
      const isOffline =
        err?.code === "unavailable" ||
        (typeof err?.message === "string" &&
          (err.message.includes("offline") || err.message.includes("Failed to get document")));

      if (isOffline && attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        continue;
      }
      console.warn("[Think10] Firestore init failed:", err?.message ?? err);
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

  const loadUserDoc = useCallback(async (user: User) => {
    const fetched = await fetchUserDocWithRetry(user.uid);
    setUserDoc(fetched);
  }, []);

  // ── Listen to Firebase auth state changes (client-only) ────────────────────
  useEffect(() => {
    if (typeof window === "undefined") {
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserDoc(user);
      } else {
        setUserDoc(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, [loadUserDoc]);

  // ── Auth operations ───────────────────────────────────────────────────────

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    companyName = ""
  ) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    // Auto-send email verification link
    try { await sendEmailVerification(user); } catch (_) {}
    const fetched = await initAndFetchDoc(user.uid, email, displayName, companyName);
    setUserDoc(fetched);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    const { user } = await signInWithPopup(auth, provider);
    const fetched = await initAndFetchDoc(
      user.uid,
      user.email ?? "",
      user.displayName ?? "",
      ""
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

  const confirmPhoneOtp = async (confirmationResult: ConfirmationResult, code: string) => {
    const { user } = await confirmationResult.confirm(code);
    const fetched = await initAndFetchDoc(
      user.uid,
      user.email ?? "",
      user.displayName ?? user.phoneNumber ?? "",
      ""
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
