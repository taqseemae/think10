import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/lib/mongodb';
import type { BookingSession, SupportTicket, BusinessProfile, HealthScores } from '@/context/DashboardStateContext';
import type { AdminRole } from '@/context/AdminStateContext';

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

// ─── USERS ────────────────────────────────────────────────────────────────────

/**
 * syncUserDoc — called on every login/signup.
 *
 * Rules:
 *  - If user doesn't exist → insert with provided role (or 'Free')
 *  - If user already exists → only update safe fields (email, displayName, companyName)
 *    NEVER overwrite plan.role, adminRole, or onboarding on re-login.
 *  - uid is the unique key — no duplicates possible.
 */
export const syncUserDoc = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; email: string; displayName: string; companyName?: string; role?: string }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    const col = db.collection('users');

    const existing = await col.findOne({ uid: data.uid });

    if (existing) {
      // User exists — only update non-sensitive display fields, NEVER role
      await col.updateOne(
        { uid: data.uid },
        {
          $set: {
            email: data.email || existing.email,
            displayName: data.displayName || existing.displayName,
            updatedAt: new Date().toISOString(),
          },
        }
      );
    } else {
      // Brand new user — insert with role
      await col.insertOne({
        uid: data.uid,
        email: data.email || '',
        displayName: data.displayName || '',
        companyName: data.companyName || '',
        plan: { role: data.role || 'Free', status: 'Active' },
        onboarding: { completed: false, step: 1 },
        profile: {
          businessName: data.companyName || '',
          stage: '',
          industry: '',
          channels: [],
          teamSize: '',
          revenue: '',
          goals: [],
          challenges: [],
        },
        healthScores: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return true;
  });


export const getUserDocFn = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(async ({ data: uid }) => {
    const db = await getDb();
    const doc = await db.collection('users').findOne({ uid });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { ...rest, id: _id.toString() } as unknown as UserDocument;
  });

export const updateUserProfileFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; profile: Partial<BusinessProfile> }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    // Use dot notation to merge fields if needed, or simply overwrite the whole profile
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { profile: data.profile } });
    return true;
  });

export const updateUserPlanFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; role: string }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { "plan.role": data.role } });
    return true;
  });

export const updateUserOnboardingFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; completed: boolean; step: number }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { "onboarding.completed": data.completed, "onboarding.step": data.step } });
    return true;
  });

export const updateHealthScoresFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; scores: HealthScores }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { healthScores: data.scores } });
    return true;
  });

// --- Bookings ---
export const createBookingFn = createServerFn({ method: 'POST' })
  .validator((d: Omit<BookingSession, "id">) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    
    // Generate a secure simulated Google Meet Link
    const meetId = Math.random().toString(36).substring(2, 5) + "-" + 
                   Math.random().toString(36).substring(2, 6) + "-" + 
                   Math.random().toString(36).substring(2, 5);
    const meetLink = `https://meet.google.com/${meetId}`;

    const bookingData = {
      ...data,
      meetLink, // Add the simulated meet link to the database
      createdAt: new Date(),
    };

    const res = await db.collection('bookings').insertOne(bookingData);
    return res.insertedId.toString();
  });

export const updateBookingStatusFn = createServerFn({ method: 'POST' })
  .validator((d: { id: string, status: string }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    const { ObjectId } = require('mongodb');
    await db.collection('bookings').updateOne({ _id: new ObjectId(data.id) }, { $set: { status: data.status } });
    return true;
  });

export const getUserBookingsFn = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(async ({ data: uid }) => {
    const db = await getDb();
    const docs = await db.collection('bookings').find({ userId: uid }).sort({ when: -1 }).toArray();
    return docs.map(d => ({ ...d, id: d._id.toString() })) as unknown as BookingSession[];
  });

export const getConsultantBookingsFn = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(async ({ data: consultantId }) => {
    const db = await getDb();
    // Match by consultantId (uid), expertSlug, or expertName
    const docs = await db.collection('bookings').find({
      $or: [
        { consultantId },
        { expertSlug: consultantId },
      ]
    }).sort({ createdAt: -1 }).toArray();
    return docs.map(d => ({ ...d, id: d._id.toString() })) as unknown as BookingSession[];
  });

// --- Tickets ---
export const createSupportTicketFn = createServerFn({ method: 'POST' })
  .validator((d: Omit<SupportTicket, "id">) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    const res = await db.collection('tickets').insertOne({ ...data, createdAt: new Date() });
    return res.insertedId.toString();
  });

export const updateSupportTicketStatusFn = createServerFn({ method: 'POST' })
  .validator((d: { id: string, status: string }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    const { ObjectId } = require('mongodb');
    await db.collection('tickets').updateOne({ _id: new ObjectId(data.id) }, { $set: { status: data.status } });
    return true;
  });

export const getUserTicketsFn = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(async ({ data: uid }) => {
    const db = await getDb();
    const docs = await db.collection('tickets').find({ userId: uid }).sort({ timestamp: -1 }).toArray();
    return docs.map(d => ({ ...d, id: d._id.toString() })) as unknown as SupportTicket[];
  });

// --- Admin ---
export const getAllAdminDataFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = await getDb();
    const users = await db.collection('users').find().toArray();
    const tickets = await db.collection('tickets').find().toArray();
    const bookings = await db.collection('bookings').find().toArray();
    
    return {
      users: users.map(u => {
        const { _id, ...rest } = u;
        return { ...rest, id: _id.toString() };
      }),
      tickets: tickets.map(t => {
        const { _id, ...rest } = t;
        return { ...rest, id: _id.toString() };
      }),
      bookings: bookings.map(b => {
        const { _id, ...rest } = b;
        return { ...rest, id: _id.toString() };
      })
    };
  });

export const suspendUserFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string, isSuspended: boolean }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { "plan.status": data.isSuspended ? "Suspended" : "Active" } });
    return true;
  });

export const approveConsultantFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { "plan.role": "Consultant" } });
    return true;
  });

/**
 * setAdminRoleFn — grant or revoke admin access for a user.
 */
export const setAdminRoleFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; adminRole: string | null }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    if (data.adminRole) {
      await db.collection('users').updateOne({ uid: data.uid }, { $set: { adminRole: data.adminRole } });
    } else {
      await db.collection('users').updateOne({ uid: data.uid }, { $unset: { adminRole: '' } });
    }
    return true;
  });

// --- Admin Metrics (Real AED Pricing) ---
export const getAdminMetricsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = await getDb();
    const users = await db.collection('users').find().toArray();
    const bookings = await db.collection('bookings').find().toArray();
    const tickets = await db.collection('tickets').find().toArray();

    let mrr = 0;
    let activePaidUsers = 0;
    let pendingVerifications = 0;

    for (const u of users) {
      const role = u.plan?.role;
      const status = u.plan?.status;
      if (status === 'Suspended') continue;
      if (role === 'ZynePaid') { mrr += 290; activePaidUsers++; }
      else if (role === 'Hybrid') { mrr += 950; activePaidUsers++; }
      else if (role === 'Premium') { mrr += 2500; activePaidUsers++; }
      else if (role === 'Enterprise') { mrr += 5000; activePaidUsers++; }
      if (role === 'ConsultantPending') pendingVerifications++;
    }

    const openTickets = tickets.filter((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const pendingPayouts = bookings.filter((b: any) => b.status === 'COMPLETED' && !b.payoutProcessed).length;
    const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED').length;
    const completionRate = bookings.length > 0 ? Math.round((completedBookings / bookings.length) * 100) : 0;

    return {
      mrr,
      arr: mrr * 12,
      activePaidUsers,
      totalUsers: users.length,
      pendingVerifications,
      openTickets,
      pendingPayouts,
      totalBookings: bookings.length,
      completedBookings,
      completionRate,
    };
  });

// --- Quality Cases ---
export const createQualityCaseFn = createServerFn({ method: 'POST' })
  .validator((d: { type: string; severity: string; relatedBookingId?: string; consultantId?: string; customerId?: string; description: string }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    const res = await db.collection('qualityCases').insertOne({
      ...data,
      status: 'OPEN',
      createdAt: new Date(),
    });
    return res.insertedId.toString();
  });
