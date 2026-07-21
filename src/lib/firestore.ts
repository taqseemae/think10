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
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import type { BusinessProfile, HealthScores, UserRole, BookingSession, SupportTicket } from "@/context/DashboardStateContext";
import type { AdminRole } from "@/context/AdminStateContext";

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
  adminRole?: AdminRole;
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
  const snap = await getDocFromServer(ref);
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
  const existing = await getDocFromServer(ref);
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

// ── Bookings Operations ───────────────────────────────────────────────────────

export async function createBookingDoc(booking: Omit<BookingSession, "id">): Promise<string> {
  const colRef = collection(db, "bookings");
  const docRef = await addDoc(colRef, {
    ...booking,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<void> {
  const ref = doc(db, "bookings", bookingId);
  await updateDoc(ref, { status });
}

export async function cancelBookingDoc(bookingId: string): Promise<void> {
  await updateBookingStatus(bookingId, "Cancelled");
}

export async function rescheduleBookingDoc(bookingId: string, newSlot: string): Promise<void> {
  const ref = doc(db, "bookings", bookingId);
  await updateDoc(ref, { date: newSlot, status: "Confirmed" });
}

// ── Tickets Operations ────────────────────────────────────────────────────────

export async function createSupportTicketDoc(ticket: Omit<SupportTicket, "id">): Promise<string> {
  const colRef = collection(db, "tickets");
  const docRef = await addDoc(colRef, {
    ...ticket,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSupportTicketStatus(ticketId: string, status: "Open" | "In Progress" | "Resolved"): Promise<void> {
  const ref = doc(db, "tickets", ticketId);
  await updateDoc(ref, { status });
}

// ── Admin Utilities ───────────────────────────────────────────────────────────

export async function setAdminRole(uid: string, role: AdminRole): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { adminRole: role });
}
