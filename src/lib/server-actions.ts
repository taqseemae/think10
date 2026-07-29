import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/lib/mongodb';
import { requireAuth, requireAdmin, requireConsultant } from './auth-server';
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
  consultantProfile?: {
    title: string;
    bio: string;
    primaryArea: string;
    topics: string[];
  };
};

// ─── USERS ────────────────────────────────────────────────────────────────────

export const syncUserDoc = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; email: string; displayName: string; companyName?: string; role?: string }) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    if (token.uid !== data.uid) throw new Error('Unauthorized UID mismatch');
    
    const db = await getDb();
    const col = db.collection('users');
    const existing = await col.findOne({ uid: data.uid });

    if (existing) {
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
    const token = await requireAuth();
    if (token.uid !== uid) {
      // Allow if they are admin
      const db = await getDb();
      const user = await db.collection('users').findOne({ uid: token.uid });
      if (!user?.adminRole) throw new Error('Unauthorized');
    }
    
    const db = await getDb();
    const doc = await db.collection('users').findOne({ uid });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { ...rest, id: _id.toString() } as unknown as UserDocument;
  });

export const updateUserProfileFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; profile: Partial<BusinessProfile> }) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    if (!data?.uid || token.uid !== data.uid) throw new Error('Unauthorized');
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { profile: data.profile } });
    return true;
  });

export const updateUserPlanFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; role: string }) => d)
  .handler(async ({ data }) => {
    const { token, userDoc } = await requireAdmin(); // only admin can arbitrarily update plans
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { "plan.role": data.role } });
    return true;
  });

export const updateUserOnboardingFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; completed: boolean; step: number }) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    if (!data?.uid || token.uid !== data.uid) throw new Error('Unauthorized');
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { "onboarding.completed": data.completed, "onboarding.step": data.step } });
    return true;
  });

export const updateHealthScoresFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; scores: HealthScores }) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    if (!data?.uid || token.uid !== data.uid) throw new Error('Unauthorized');
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { healthScores: data.scores } });
    return true;
  });

// --- Bookings ---
export type NewBookingInput = {
  userId: string;
  userEmail: string;
  userName: string;
  consultantId: string;
  consultantName: string;
  consultantEmail: string;
  expertSlug: string;
  expertRole: string;
  startTime: string;
  endTime: string;
  timezone: string;
  topic: string;
  sessionType: string;
  preCallAnswers?: { challenge: string; questions: string; additionalDocs: string; };
};

export const createBookingFn = createServerFn({ method: 'POST' })
  .validator((d: NewBookingInput) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    if (token.uid !== data.userId) throw new Error('Unauthorized');
    
    const db = await getDb();
    const { isSlotAvailable } = await import('@/lib/availability');
    const available = await isSlotAvailable(data.consultantId, data.startTime, data.endTime);
    if (!available) throw new Error('Slot unavailable');

    let meetLink = '';
    let googleEventId = '';
    
    try {
      const { getCalendarClient } = await import('@/lib/google-auth');
      const calendar = await getCalendarClient();
      const event = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: {
          summary: `Think10 Strategy Session: ${data.topic}`,
          description: `Strategy session between ${data.userName} and ${data.consultantName}\nTopic: ${data.topic}`,
          start: { dateTime: data.startTime, timeZone: data.timezone },
          end: { dateTime: data.endTime, timeZone: data.timezone },
          attendees: [
            { email: data.userEmail, displayName: data.userName },
            { email: data.consultantEmail, displayName: data.consultantName },
          ],
          conferenceData: {
            createRequest: {
              requestId: `t10-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
      });
      googleEventId = event.data.id || '';
      const meetEntry = event.data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video');
      meetLink = meetEntry?.uri || event.data.hangoutLink || '';
      
      if (!meetLink) {
        throw new Error('Google Calendar did not generate a Meet link. Please ensure your Workspace account supports Meet generation.');
      }
    } catch (calendarError: any) {
      console.warn('[Think10] Google Calendar API error:', calendarError?.message);
      throw new Error(`Google Meet generation failed: ${calendarError?.message}. Please ensure Google Account is connected in Admin.`);
    }

    const bookingData = {
      ...data,
      when: data.startTime,
      status: 'CONFIRMED',
      googleEventId,
      meetLink,
      emailSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await db.collection('bookings').insertOne(bookingData);
    
    try {
      const { sendBookingConfirmationToUser, sendBookingNotificationToConsultant } = await import('@/lib/email');
      const emailData = { ...data, googleMeetLink: meetLink, bookingId: res.insertedId.toString() };
      await Promise.all([
        sendBookingConfirmationToUser(emailData),
        sendBookingNotificationToConsultant(emailData),
      ]);
      await db.collection('bookings').updateOne({ _id: res.insertedId }, { $set: { emailSent: true } });
    } catch (e) {
      console.warn('[Think10] Failed to send booking emails:', e);
    }

    return { bookingId: res.insertedId.toString(), meetLink };
  });

export const updateBookingStatusFn = createServerFn({ method: 'POST' })
  .validator((d: { id: string, status: string }) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    await db.collection('bookings').updateOne({ _id: new ObjectId(data.id) }, { $set: { status: data.status, updatedAt: new Date().toISOString() } });
    return true;
  });

export const getUserBookingsFn = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(async ({ data: uid }) => {
    const token = await requireAuth();
    if (token.uid !== uid) throw new Error('Unauthorized');
    const db = await getDb();
    const docs = await db.collection('bookings').find({ userId: uid }).sort({ createdAt: -1 }).toArray();
    return docs.map(d => {
      const { _id, ...rest } = d;
      return { ...rest, id: _id.toString(), when: d.when || new Date(d.startTime).toLocaleString() };
    }) as unknown as BookingSession[];
  });

export const getConsultantBookingsFn = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(async ({ data: consultantId }) => {
    const token = await requireAuth();
    if (token.uid !== consultantId) throw new Error('Unauthorized');
    const db = await getDb();
    const docs = await db.collection('bookings').find({ $or: [{ consultantId }, { expertSlug: consultantId }] }).sort({ createdAt: -1 }).toArray();
    return docs.map(d => {
      const { _id, ...rest } = d;
      return { ...rest, id: _id.toString(), when: d.when || new Date(d.startTime).toLocaleString() };
    }) as unknown as BookingSession[];
  });

// --- Tickets ---
export const createSupportTicketFn = createServerFn({ method: 'POST' })
  .validator((d: Omit<SupportTicket, "id">) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    const db = await getDb();
    const res = await db.collection('tickets').insertOne({ ...data, userId: token.uid, createdAt: new Date() });
    return res.insertedId.toString();
  });

export const getUserTicketsFn = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(async ({ data: uid }) => {
    const token = await requireAuth();
    if (token.uid !== uid) throw new Error('Unauthorized');
    const db = await getDb();
    const docs = await db.collection('tickets').find({ userId: uid }).sort({ timestamp: -1 }).toArray();
    return docs.map(d => {
      const { _id, ...rest } = d;
      return { ...rest, id: _id.toString() };
    }) as unknown as SupportTicket[];
  });

export const updateSupportTicketStatusFn = createServerFn({ method: 'POST' })
  .validator((d: { id: string; status: string }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    await db.collection('tickets').updateOne({ _id: new ObjectId(data.id) }, { $set: { status: data.status, updatedAt: new Date().toISOString() } });
    return true;
  });


// --- Admin ---
export const getAllAdminDataFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin();
    const db = await getDb();
    const users = await db.collection('users').find().toArray();
    const tickets = await db.collection('tickets').find().toArray();
    const bookings = await db.collection('bookings').find().toArray();
    return {
      users: users.map(u => ({ ...u, id: u._id.toString(), _id: undefined })),
      tickets: tickets.map(t => ({ ...t, id: t._id.toString(), _id: undefined })),
      bookings: bookings.map(b => ({ ...b, id: b._id.toString(), _id: undefined }))
    };
  });

export const suspendUserFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string, isSuspended: boolean }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { "plan.status": data.isSuspended ? "Suspended" : "Active" } });
    return true;
  });

export const approveConsultantFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { "plan.role": "Consultant" } });
    return true;
  });

export const getAdminMetricsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin();
    const db = await getDb();
    const users = await db.collection('users').find().toArray();
    const bookings = await db.collection('bookings').find().toArray();
    const tickets = await db.collection('tickets').find().toArray();

    let mrr = 0; let activePaidUsers = 0; let pendingVerifications = 0;
    for (const u of users) {
      const role = u.plan?.role;
      if (u.plan?.status === 'Suspended') continue;
      if (role === 'ZynePaid') { mrr += 290; activePaidUsers++; }
      else if (role === 'Hybrid') { mrr += 950; activePaidUsers++; }
      else if (role === 'Premium') { mrr += 2500; activePaidUsers++; }
      else if (role === 'Enterprise') { mrr += 5000; activePaidUsers++; }
      if (role === 'ConsultantPending') pendingVerifications++;
    }
    const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED').length;
    return {
      mrr, arr: mrr * 12, activePaidUsers, totalUsers: users.length,
      pendingVerifications,
      openTickets: tickets.filter((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
      pendingPayouts: bookings.filter((b: any) => b.status === 'COMPLETED' && !b.payoutProcessed).length,
      totalBookings: bookings.length,
      completedBookings,
      completionRate: bookings.length > 0 ? Math.round((completedBookings / bookings.length) * 100) : 0,
    };
  });

export const getAllUsersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin();
    const db = await getDb();
    const users = await db.collection('users').find().sort({ createdAt: -1 }).toArray();
    return users.map(u => ({ ...u, id: u._id.toString(), _id: undefined }));
  });

export const updateUserAdminRoleFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; adminRole: string | null }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
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
    await requireAdmin();
    const db = await getDb();
    const updates: any = { updatedAt: new Date().toISOString() };
    if (data.displayName) updates.displayName = data.displayName;
    if (data.email) updates.email = data.email;
    if (data.planRole) updates['plan.role'] = data.planRole;
    await db.collection('users').updateOne({ uid: data.uid }, { $set: updates });
    return true;
  });

// --- Cancel/Reschedule ---
export const cancelBookingFn = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string; cancelledBy: 'user' | 'consultant' }) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(data.bookingId) });
    if (!booking) throw new Error('Booking not found');
    if (booking.userId !== token.uid && booking.consultantId !== token.uid && booking.expertSlug !== token.uid) {
      throw new Error('Unauthorized');
    }

    if (booking.googleEventId) {
      try {
        const { getCalendarClient } = await import('@/lib/google-auth');
        const calendar = await getCalendarClient();
        await calendar.events.delete({ calendarId: 'primary', eventId: booking.googleEventId, sendUpdates: 'all' });
      } catch (e) {}
    }

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(data.bookingId) },
      { $set: { status: 'CANCELLED', cancelledBy: data.cancelledBy, updatedAt: new Date().toISOString() } }
    );
    
    try {
      const { sendCancellationEmail } = await import('@/lib/email');
      await sendCancellationEmail({
        ...booking,
        bookingId: data.bookingId,
        timezone: booking.timezone || 'Asia/Dubai',
      } as any, data.cancelledBy);
    } catch (e) {}
    return true;
  });

export const rescheduleBookingFn = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string; newStartTime: string; newEndTime: string; timezone: string }) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(data.bookingId) });
    if (!booking) throw new Error('Booking not found');
    if (booking.userId !== token.uid && booking.consultantId !== token.uid) throw new Error('Unauthorized');

    const oldStartTime = booking.startTime || booking.when || '';
    if (booking.googleEventId) {
      try {
        const { getCalendarClient } = await import('@/lib/google-auth');
        const calendar = await getCalendarClient();
        await calendar.events.patch({
          calendarId: 'primary', eventId: booking.googleEventId, sendUpdates: 'all',
          requestBody: {
            start: { dateTime: data.newStartTime, timeZone: data.timezone },
            end: { dateTime: data.newEndTime, timeZone: data.timezone },
          },
        });
      } catch (e) {}
    }

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(data.bookingId) },
      { $set: { startTime: data.newStartTime, endTime: data.newEndTime, when: data.newStartTime, status: 'CONFIRMED', updatedAt: new Date().toISOString() } }
    );
    return true;
  });

// --- Consultant Availability ---
export const setConsultantAvailabilityFn = createServerFn({ method: 'POST' })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const { token } = await requireConsultant();
    if (token.uid !== data.consultantId) throw new Error('Unauthorized');
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

export const updateConsultantProfileFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string; profile: any }) => d)
  .handler(async ({ data }) => {
    const { token } = await requireConsultant();
    if (!data?.uid || token.uid !== data.uid) throw new Error('Unauthorized');
    const db = await getDb();
    await db.collection('users').updateOne({ uid: data.uid }, { $set: { consultantProfile: data.profile } });
    return true;
  });

// --- Quality Cases ---
export const createQualityCaseFn = createServerFn({ method: 'POST' })
  .validator((d: { type: string; severity: string; relatedBookingId?: string; consultantId?: string; customerId?: string; description: string }) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    const db = await getDb();
    const res = await db.collection('qualityCases').insertOne({
      ...data,
      status: 'OPEN',
      createdAt: new Date(),
    });
    return res.insertedId.toString();
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

// --- Stripe Payments ---
export const createStripeCheckoutSessionFn = createServerFn({ method: 'POST' })
  .validator((d: { priceId: string; planRole: string; successUrl: string; cancelUrl: string }) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    const { stripe } = await import('@/lib/stripe');

    // In a real scenario, you'd lookup or create a Stripe Customer ID based on token.uid
    // For now, we'll pass the uid in client_reference_id
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      client_reference_id: token.uid,
      metadata: {
        planRole: data.planRole,
        uid: token.uid
      }
    });

    return { url: session.url };
  });

export const createStripeCustomerPortalFn = createServerFn({ method: 'POST' })
  .validator((d: { customerId: string; returnUrl: string }) => d)
  .handler(async ({ data }) => {
    const token = await requireAuth();
    const { stripe } = await import('@/lib/stripe');

    const session = await stripe.billingPortal.sessions.create({
      customer: data.customerId,
      return_url: data.returnUrl,
    });

    return { url: session.url };
  });

export const deleteBookingFn = createServerFn({ method: 'POST' })
  .validator((d: { bookingId: string }) => d)
  .handler(async ({ data }) => {
    await requireAuth();
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    
    const idStr = data?.bookingId || '';
    if (!idStr) return true;

    const deleteQueries: any[] = [{ id: idStr }, { _id: idStr }];
    try {
      deleteQueries.push({ _id: new ObjectId(idStr) });
    } catch {}

    await db.collection('bookings').deleteMany({ $or: deleteQueries });
    return true;
  });

export const deleteMultipleBookingsFn = createServerFn({ method: 'POST' })
  .validator((d: { bookingIds: string[] }) => d)
  .handler(async ({ data }) => {
    await requireAuth();
    const db = await getDb();
    const { ObjectId } = await import('mongodb');

    const ids = data?.bookingIds || [];
    if (ids.length === 0) return true;

    for (const idStr of ids) {
      if (!idStr) continue;
      const deleteQueries: any[] = [{ id: idStr }, { _id: idStr }];
      try {
        deleteQueries.push({ _id: new ObjectId(idStr) });
      } catch {}

      await db.collection('bookings').deleteMany({ $or: deleteQueries });
    }

    return true;
  });

export const deleteUserFn = createServerFn({ method: 'POST' })
  .validator((d: { uid: string }) => d)
  .handler(async ({ data }) => {
    await requireAuth();
    const db = await getDb();
    if (!data?.uid) return true;

    await db.collection('users').deleteOne({ uid: data.uid });
    await db.collection('bookings').deleteMany({
      $or: [{ userId: data.uid }, { consultantId: data.uid }, { expertSlug: data.uid }]
    });
    return true;
  });

export const getPublicConsultantsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = await getDb();
    const docs = await db.collection('users').find({
      $or: [
        { 'plan.role': 'Consultant' },
        { consultantProfile: { $exists: true } }
      ]
    }).toArray();

    return docs.map((d) => {
      const { _id, ...rest } = d;
      const profile = d.consultantProfile || {};
      const name = d.displayName || d.email?.split('@')[0] || 'Consultant';
      const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'C';

      return {
        slug: d.uid,
        name,
        email: d.email || '',
        role: profile.title || 'Business Advisor',
        bio: profile.bio || 'Experienced business consultant on Think10.',
        experienceYears: 10,
        areas: profile.primaryArea ? [profile.primaryArea] : ['Business Launch & Feasibility'],
        languages: ['English', 'Arabic'],
        location: 'Dubai, UAE',
        sessionTypes: ['Strategy Session', '30-Min Advisory'],
        pricePlaceholder: 'AED 450',
        availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        verified: true,
        initials,
        consultantProfile: profile,
      };
    });
  });



