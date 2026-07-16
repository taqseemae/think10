// ──────────────────────────────────────────────────────────────────────────────
// Firestore Helper Functions
// ──────────────────────────────────────────────────────────────────────────────

import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { BusinessProfile, HealthScores, UserRole } from "@/context/DashboardStateContext";

// ── User Document Types ────────────────────────────────────────────────────────

export type UserDocument = {
  uid: string;
  email: string;
  displayName: string;
  companyName: string;
  createdAt: unknown; // Firestore Timestamp
  plan: {
    role: UserRole;
  };
  onboarding: {
    completed: boolean;
    step: number;
  };
  profile: BusinessProfile;
  healthScores: HealthScores | null;
};

// ── Default blank values for a new user ───────────────────────────────────────

export const BLANK_PROFILE: BusinessProfile = {
  businessName: "",
  stage: "",
  industry: "",
  channels: [],
  teamSize: "",
  revenue: "",
  goals: [],
  challenges: [],
};

export const BLANK_HEALTH_SCORES: HealthScores = {
  valueProp: 0,
  marketFit: 0,
  unitEconomics: 0,
  channelEfficiency: 0,
  operations: 0,
  teamOrg: 0,
  marketingRoi: 0,
  cashFlow: 0,
  supplyChain: 0,
  systems: 0,
};

// ── Firestore Operations ───────────────────────────────────────────────────────

/**
 * Fetch a user's full document from Firestore.
 * Returns null if the document doesn't exist yet.
 */
export async function getUserDocument(uid: string): Promise<UserDocument | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserDocument;
}

/**
 * Create a fresh user document after signup.
 * Only called once — when the user registers for the first time.
 */
export async function initUserDocument(
  uid: string,
  email: string,
  displayName: string,
  companyName = ""
): Promise<void> {
  const ref = doc(db, "users", uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return; // Don't overwrite

  const newUser: Omit<UserDocument, "createdAt"> & { createdAt: unknown } = {
    uid,
    email,
    displayName,
    companyName,
    createdAt: serverTimestamp(),
    plan: { role: "Free" },
    onboarding: { completed: false, step: 1 },
    profile: { ...BLANK_PROFILE, businessName: companyName },
    healthScores: null,
  };

  await setDoc(ref, newUser);
}

/**
 * Save (merge) user profile data to Firestore.
 */
export async function saveUserProfile(uid: string, profile: Partial<BusinessProfile>): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    profile,
  });
}

/**
 * Update the user's plan/role in Firestore.
 */
export async function saveUserPlan(uid: string, role: UserRole): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { "plan.role": role });
}

/**
 * Update onboarding state in Firestore.
 */
export async function saveOnboardingState(
  uid: string,
  completed: boolean,
  step: number
): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    "onboarding.completed": completed,
    "onboarding.step": step,
  });
}

/**
 * Save health scores to Firestore.
 */
export async function saveHealthScores(uid: string, scores: HealthScores): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { healthScores: scores });
}
