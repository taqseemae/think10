"use server";

import type { BusinessProfile, HealthScores, BookingSession, SupportTicket } from '@/context/DashboardStateContext';
import type { AdminRole } from '@/context/AdminStateContext';
import { getDb } from './mongodb';

export type UserDocument = {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  companyName: string;
  plan: { role: string; status?: string };
  onboarding: { completed: boolean; step: number; };
  profile: BusinessProfile;
  healthScores: HealthScores | null;
  adminRole?: AdminRole;
};


const BLANK_PROFILE: BusinessProfile = {
  businessName: "",
  stage: "",
  industry: "",
  channels: [],
  teamSize: "",
  revenue: "",
  goals: [],
  challenges: [],
};

const BLANK_HEALTH_SCORES: HealthScores = {
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

export const syncUserDoc = async (uid: string, email: string, displayName: string, companyName: string, role?: string) => {
  const db = await getDb();
  const collection = db.collection<UserDocument>('users');
  
  const existing = await collection.findOne({ uid });
  if (existing) {
    // Only update display name
    await collection.updateOne({ uid }, { $set: { displayName } });
    return;
  }
  
  const newUser: Omit<UserDocument, "id"> = {
    uid,
    email,
    displayName,
    companyName,
    plan: { role: role || "Free" },
    onboarding: { completed: false, step: 1 },
    profile: BLANK_PROFILE,
    healthScores: BLANK_HEALTH_SCORES,
  };
  
  await collection.insertOne(newUser);
};

export const getUserDocFn = async (uid: string) => {
  const db = await getDb();
  const user = await db.collection<UserDocument>('users').findOne({ uid });
  if (user) {
    const { _id, ...rest } = user as any;
    return { id: _id.toString(), ...rest };
  }
  return null;
};

export const updateUserProfileFn = async ({ data: { uid, profile } }: { data: { uid: string, profile: BusinessProfile } }) => {
  const db = await getDb();
  await db.collection('users').updateOne({ uid }, { $set: { profile } });
};

export const updateUserPlanFn = async ({ data: { uid, plan } }: { data: { uid: string, plan: { role: string; status?: string } } }) => {
  const db = await getDb();
  await db.collection('users').updateOne({ uid }, { $set: { plan } });
};

export const updateUserOnboardingFn = async ({ data: { uid, completed, step } }: { data: { uid: string, completed: boolean, step: number } }) => {
  const db = await getDb();
  await db.collection('users').updateOne({ uid }, { $set: { "onboarding.completed": completed, "onboarding.step": step } });
};

export const updateHealthScoresFn = async ({ data: { uid, healthScores } }: { data: { uid: string, healthScores: HealthScores } }) => {
  const db = await getDb();
  await db.collection('users').updateOne({ uid }, { $set: { healthScores } });
};

export const createBookingFn = async ({ data: booking }: { data: any }) => {
  const db = await getDb();
  await db.collection('bookings').insertOne(booking);
};

export const updateBookingStatusFn = async ({ data: { bookingId, status } }: { data: { bookingId: string, status: string } }) => {
  // Not fully implemented, just a stub
};

export const getUserBookingsFn = async ({ data: uid }: { data: string }) => {
  const db = await getDb();
  const bookings = await db.collection('bookings').find({ userId: uid }).toArray();
  return bookings.map(b => ({ ...b, id: b._id.toString(), _id: undefined }));
};

export const getConsultantBookingsFn = async ({ data: consultantId }: { data: string }) => {
  const db = await getDb();
  const bookings = await db.collection('bookings').find({ consultantId }).toArray();
  return bookings.map(b => ({ ...b, id: b._id.toString(), _id: undefined }));
};

export const createSupportTicketFn = async ({ data: ticket }: { data: any }) => {
  const db = await getDb();
  await db.collection('tickets').insertOne(ticket);
};

export const updateSupportTicketStatusFn = async ({ data: { ticketId, status } }: { data: { ticketId: string, status: string } }) => {
  // Not fully implemented
};

export const getUserTicketsFn = async ({ data: uid }: { data: string }) => {
  const db = await getDb();
  const tickets = await db.collection('tickets').find({ userId: uid }).toArray();
  return tickets.map(t => ({ ...t, id: t._id.toString(), _id: undefined }));
};

export const getAllAdminDataFn = async () => {
  const db = await getDb();
  const users = await db.collection('users').find({}).toArray();
  return { users: users.map(u => ({ ...u, id: u._id.toString(), _id: undefined })) };
};

export const suspendUserFn = async ({ data: { uid, isSuspended } }: { data: { uid: string, isSuspended: boolean } }) => {
  // Not fully implemented
};

export const approveConsultantFn = async ({ data: { uid } }: { data: { uid: string } }) => {
  // Not fully implemented
};

export const setAdminRoleFn = async ({ data: { uid, role } }: { data: { uid: string, role: string } }) => {
  const db = await getDb();
  await db.collection('users').updateOne({ uid }, { $set: { adminRole: role } });
};
