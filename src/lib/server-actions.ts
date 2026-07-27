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

// --- Bookings (Real Google Calendar + Meet) ---

export type NewBookingInput = {
  userId: string;
  userEmail: string;
  userName: string;
  consultantId: string;  // consultant's Firebase UID or expertSlug
  consultantName: string;
  consultantEmail: string;
  expertSlug: string;
  expertRole: string;
  startTime: string;  // ISO8601
  endTime: string;    // ISO8601
  timezone: string;
  topic: string;
  sessionType: string;
  preCallAnswers?: {
    challenge: string;
    questions: string;
    additionalDocs: string;
  };
};

export const createGoogleMeetBookingFn = createServerFn({ method: 'POST' })
  .validator((d: NewBookingInput) => d)
  .handler(async ({ data }) => {
    const db = await getDb();

    // 1. Validate the slot is still available
    const { isSlotAvailable } = await import('@/lib/availability');
    const available = await isSlotAvailable(data.consultantId, data.startTime, data.endTime);
    if (!available) {
      throw new Error('This time slot is no longer available. Please select a different slot.');
    }

    let googleMeetLink = '';
    let googleEventId = '';

    // 2. Try to create Google Calendar event with Meet link
    try {
      const { getCalendarClient } = await import('@/lib/google-auth');
      const calendar = await getCalendarClient();

      const event = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: {
          summary: `Think10 Strategy Session: ${data.topic}`,
          description: `Strategy session between ${data.userName} and ${data.consultantName} via Think10 Advisory.\n\nTopic: ${data.topic}\n\nClient Challenge: ${data.preCallAnswers?.challenge || 'Not provided'}\n\nBooking ID: (assigned after creation)`,
          start: {
            dateTime: data.startTime,
            timeZone: data.timezone,
          },
          end: {
            dateTime: data.endTime,
            timeZone: data.timezone,
          },
          attendees: [
            { email: data.userEmail, displayName: data.userName },
            { email: data.consultantEmail, displayName: data.consultantName },
          ],
          conferenceData: {
            createRequest: {
              requestId: `think10-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 24 hours before
              { method: 'popup', minutes: 30 },       // 30 minutes before
            ],
          },
        },
      });

      googleEventId = event.data.id || '';
      // Extract the Google Meet link from the conference data
      const meetEntry = event.data.conferenceData?.entryPoints?.find(
        (ep: any) => ep.entryPointType === 'video'
      );
      googleMeetLink = meetEntry?.uri || event.data.hangoutLink || '';
    } catch (calendarError: any) {
      console.warn('[Think10] Google Calendar API error — falling back to placeholder meet link:', calendarError?.message);
      // Fallback: generate a formatted placeholder (won't be a real meeting room)
      const meetId = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
      googleMeetLink = `https://meet.google.com/${meetId}`;
    }

    // 3. Save booking to MongoDB
    const bookingData = {
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      consultantId: data.consultantId,
      consultantEmail: data.consultantEmail,
      expertSlug: data.expertSlug,
      expertName: data.consultantName,
      expertRole: data.expertRole,
      startTime: data.startTime,
      endTime: data.endTime,
      when: data.startTime, // legacy field compatibility
      timezone: data.timezone,
      topic: data.topic,
      sessionType: data.sessionType,
      preCallAnswers: data.preCallAnswers || null,
      status: 'CONFIRMED',
      googleEventId,
      meetLink: googleMeetLink,
      emailSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await db.collection('bookings').insertOne(bookingData);
    const bookingId = res.insertedId.toString();

    // 4. Send confirmation emails (non-blocking)
    try {
      const { sendBookingConfirmationToUser, sendBookingNotificationToConsultant } = await import('@/lib/email');
      const emailData = {
        userName: data.userName,
        userEmail: data.userEmail,
        consultantName: data.consultantName,
        consultantEmail: data.consultantEmail,
        topic: data.topic,
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone,
        googleMeetLink,
        bookingId,
      };
      await Promise.all([
        sendBookingConfirmationToUser(emailData),
        sendBookingNotificationToConsultant(emailData),
      ]);
      await db.collection('bookings').updateOne(
        { _id: res.insertedId },
        { $set: { emailSent: true } }
      );
    } catch (emailError: any) {
      console.warn('[Think10] Email send failed:', emailError?.message);
    }

    return { bookingId, googleMeetLink };
  });

// Keep legacy createBookingFn for backwards compatibility (used internally)
export const createBookingFn = createServerFn({ method: 'POST' })
  .validator((d: Omit<BookingSession, "id">) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    const meetId = Math.random().toString(36).substring(2, 5) + "-" +
                   Math.random().toString(36).substring(2, 6) + "-" +
                   Math.random().toString(36).substring(2, 5);
    const meetLink = `https://meet.google.com/${meetId}`;
    const bookingData = { ...data, meetLink, createdAt: new Date() };
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

// --- Cancel Booking (Google Calendar + DB + Email) ---
export const cancelBookingFn = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string; cancelledBy: 'user' | 'consultant' }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    const { ObjectId } = require('mongodb');
    
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(data.bookingId) });
    if (!booking) throw new Error('Booking not found');

    // Cancel Google Calendar event if we have an event ID
    if (booking.googleEventId) {
      try {
        const { getCalendarClient } = await import('@/lib/google-auth');
        const calendar = await getCalendarClient();
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: booking.googleEventId,
          sendUpdates: 'all',
        });
      } catch (err: any) {
        console.warn('[Think10] Failed to delete Google Calendar event:', err?.message);
      }
    }

    // Update booking status in DB
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(data.bookingId) },
      { $set: { status: 'CANCELLED', cancelledBy: data.cancelledBy, updatedAt: new Date().toISOString() } }
    );

    // Send cancellation emails
    try {
      const { sendCancellationEmail } = await import('@/lib/email');
      await sendCancellationEmail({
        userName: booking.userName || '',
        userEmail: booking.userEmail || '',
        consultantName: booking.expertName || '',
        consultantEmail: booking.consultantEmail || '',
        topic: booking.topic || '',
        startTime: booking.startTime || booking.when || '',
        endTime: booking.endTime || '',
        timezone: booking.timezone || 'Asia/Dubai',
        googleMeetLink: booking.meetLink || '',
        bookingId: data.bookingId,
      }, data.cancelledBy);
    } catch (err: any) {
      console.warn('[Think10] Cancellation email failed:', err?.message);
    }

    return true;
  });

// --- Reschedule Booking (Google Calendar + DB + Email) ---
export const rescheduleBookingFn = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string; newStartTime: string; newEndTime: string; timezone: string }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    const { ObjectId } = require('mongodb');

    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(data.bookingId) });
    if (!booking) throw new Error('Booking not found');

    const oldStartTime = booking.startTime || booking.when || '';

    // Update Google Calendar event time
    if (booking.googleEventId) {
      try {
        const { getCalendarClient } = await import('@/lib/google-auth');
        const calendar = await getCalendarClient();
        await calendar.events.patch({
          calendarId: 'primary',
          eventId: booking.googleEventId,
          sendUpdates: 'all',
          requestBody: {
            start: { dateTime: data.newStartTime, timeZone: data.timezone },
            end: { dateTime: data.newEndTime, timeZone: data.timezone },
          },
        });
      } catch (err: any) {
        console.warn('[Think10] Failed to update Google Calendar event:', err?.message);
      }
    }

    // Update booking in DB
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(data.bookingId) },
      {
        $set: {
          startTime: data.newStartTime,
          endTime: data.newEndTime,
          when: data.newStartTime,
          status: 'CONFIRMED',
          updatedAt: new Date().toISOString(),
        },
      }
    );

    // Send reschedule emails
    try {
      const { sendRescheduleEmail } = await import('@/lib/email');
      await sendRescheduleEmail({
        userName: booking.userName || '',
        userEmail: booking.userEmail || '',
        consultantName: booking.expertName || '',
        consultantEmail: booking.consultantEmail || '',
        topic: booking.topic || '',
        startTime: data.newStartTime,
        endTime: data.newEndTime,
        timezone: data.timezone,
        googleMeetLink: booking.meetLink || '',
        bookingId: data.bookingId,
      }, oldStartTime);
    } catch (err: any) {
      console.warn('[Think10] Reschedule email failed:', err?.message);
    }

    return true;
  });

// --- Consultant Availability ---
export type ConsultantAvailabilityInput = {
  consultantId: string;
  consultantName: string;
  consultantEmail: string;
  weeklySchedule: Record<string, { start: string; end: string }[]>;
  timezone: string;
  sessionDurationMinutes: number;
  bufferMinutes: number;
  blockedDates: string[];
};

export const setConsultantAvailabilityFn = createServerFn({ method: 'POST' })
  .validator((d: ConsultantAvailabilityInput) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.collection('consultant_availability').updateOne(
      { consultantId: data.consultantId },
      { $set: { ...data, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return true;
  });

export const getConsultantAvailabilityFn = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(async ({ data: consultantId }) => {
    const db = await getDb();
    const doc = await db.collection('consultant_availability').findOne({ consultantId });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest;
  });

export const getAvailableSlotsForDateFn = createServerFn({ method: 'POST' })
  .validator((d: { consultantId: string; date: string }) => d)
  .handler(async ({ data }) => {
    const { getAvailableSlots } = await import('@/lib/availability');
    return await getAvailableSlots(data.consultantId, data.date);
  });

export const getAvailableDatesForMonthFn = createServerFn({ method: 'POST' })
  .validator((d: { consultantId: string; year: number; month: number }) => d)
  .handler(async ({ data }) => {
    const { getAvailableDatesForMonth } = await import('@/lib/availability');
    return await getAvailableDatesForMonth(data.consultantId, data.year, data.month);
  });

// --- Google Connection Status ---
export const getGoogleConnectionStatusFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const { isGoogleConnected } = await import('@/lib/google-auth');
      return { connected: await isGoogleConnected() };
    } catch {
      return { connected: false };
    }
  });

export const getGoogleAuthUrlFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { getAuthorizationUrl } = await import('@/lib/google-auth');
    return { url: getAuthorizationUrl() };
  });

export const exchangeGoogleCodeFn = createServerFn({ method: 'POST' })
  .validator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    const { exchangeCodeForTokens } = await import('@/lib/google-auth');
    await exchangeCodeForTokens(data.code);
    return { success: true };
  });

// --- Admin Users Management ---
export const getAllUsersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = await getDb();
    const users = await db.collection('users').find().sort({ createdAt: -1 }).toArray();
    return users.map(u => {
      const { _id, ...rest } = u;
      return { ...rest, id: _id.toString() };
    });
  });

export const updateUserAdminRoleFn = createServerFn({ method: 'POST' })
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

export const updateUserProfileByAdminFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; displayName?: string; email?: string; planRole?: string }) => d)
  .handler(async ({ data }) => {
    const db = await getDb();
    const updates: any = { updatedAt: new Date().toISOString() };
    if (data.displayName) updates.displayName = data.displayName;
    if (data.email) updates.email = data.email;
    if (data.planRole) updates['plan.role'] = data.planRole;
    await db.collection('users').updateOne({ uid: data.uid }, { $set: updates });
    return true;
  });
