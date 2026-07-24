import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 5000;

// ── CORS — allow all local dev ports ─────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080',
  ],
  credentials: true,
}));
app.use(express.json());

// ── MongoDB Connection ────────────────────────────────────────────────────────
let _clientPromise: Promise<MongoClient> | null = null;

async function getDb() {
  if (!_clientPromise) {
    const rawUri = process.env.VITE_MONGODB_URI || '';
    if (!rawUri) throw new Error('VITE_MONGODB_URI not set in .env');

    // Strip tlsCAFile (certificate file not available on local machine) and allow self-signed cert
    let uri = rawUri.replace(/&?tlsCAFile=[^&]+/, '');
    if (uri.includes('tls=true') && !uri.includes('tlsAllowInvalidCertificates')) {
      uri += '&tlsAllowInvalidCertificates=true';
    }

    const client = new MongoClient(uri);
    _clientPromise = client.connect();
  }
  const c = await _clientPromise;
  return c.db('think10');
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Admin Metrics ─────────────────────────────────────────────────────────────
// GET /api/admin/metrics — aggregated KPIs for Admin Command Centre
app.get('/api/admin/metrics', async (_req, res) => {
  try {
    const db = await getDb();

    const users = await db.collection('users').find().toArray();
    const bookings = await db.collection('bookings').find().toArray();
    const tickets = await db.collection('tickets').find().toArray();

    // Calculate MRR with real AED pricing
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
      // Consultant pending verification
      if (role === 'ConsultantPending') pendingVerifications++;
    }

    const openTickets = tickets.filter((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const pendingPayouts = bookings.filter((b: any) => b.status === 'COMPLETED' && !b.payoutProcessed).length;

    // Booking completion rate
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED').length;
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

    res.json({
      mrr,
      arr: mrr * 12,
      activePaidUsers,
      totalUsers: users.length,
      pendingVerifications,
      openTickets,
      pendingPayouts,
      totalBookings,
      completedBookings,
      completionRate,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[API] /api/admin/metrics error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Bookings ──────────────────────────────────────────────────────────────────
// GET /api/bookings — all bookings (admin) or filtered by userId/consultantId
app.get('/api/bookings', async (req, res) => {
  try {
    const db = await getDb();
    const { userId, consultantId, status, limit = '50' } = req.query;

    const filter: Record<string, any> = {};
    if (userId) filter.userId = userId;
    if (consultantId) filter.$or = [{ consultantId }, { expertSlug: consultantId }];
    if (status) filter.status = status;

    const docs = await db.collection('bookings')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .toArray();

    res.json(docs.map(d => ({ ...d, id: d._id.toString(), _id: undefined })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/create — create new booking
app.post('/api/bookings/create', async (req, res) => {
  try {
    const db = await getDb();
    const bookingData = req.body;

    // Generate Google Meet link
    const meetId = Math.random().toString(36).substring(2, 5) + '-' +
                   Math.random().toString(36).substring(2, 6) + '-' +
                   Math.random().toString(36).substring(2, 5);
    const meetLink = `https://meet.google.com/${meetId}`;

    const result = await db.collection('bookings').insertOne({
      ...bookingData,
      meetLink,
      status: 'CONFIRMED',
      createdAt: new Date(),
    });

    res.json({ id: result.insertedId.toString(), meetLink, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/:id/status — update booking status
app.post('/api/bookings/:id/status', async (req, res) => {
  try {
    const { ObjectId } = await import('mongodb');
    const db = await getDb();
    const { status } = req.body;

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Earnings ──────────────────────────────────────────────────────────────────
// GET /api/earnings/:consultantId — consultant earnings breakdown
app.get('/api/earnings/:consultantId', async (req, res) => {
  try {
    const db = await getDb();
    const { consultantId } = req.params;

    // Find all completed bookings for this consultant
    const completedBookings = await db.collection('bookings').find({
      $or: [
        { consultantId },
        { expertSlug: consultantId },
      ],
      status: 'COMPLETED',
    }).sort({ createdAt: -1 }).toArray();

    // Calculate earnings (AED 450 per session, 20% commission = AED 90)
    const SESSION_FEE = 450;
    const COMMISSION_RATE = 0.20;

    const entries = completedBookings.map(b => {
      const gross = SESSION_FEE;
      const commission = Math.round(gross * COMMISSION_RATE);
      const net = gross - commission;
      return {
        id: b._id.toString(),
        bookingId: b._id.toString(),
        clientTopic: b.topic || 'Advisory Session',
        completedAt: b.updatedAt || b.createdAt,
        grossAmount: gross,
        commission,
        netAmount: net,
        status: b.payoutProcessed ? 'PAID' : 'ELIGIBLE',
      };
    });

    const totalGross = entries.reduce((s, e) => s + e.grossAmount, 0);
    const totalNet = entries.reduce((s, e) => s + e.netAmount, 0);
    const paidOut = entries.filter(e => e.status === 'PAID').reduce((s, e) => s + e.netAmount, 0);
    const eligible = entries.filter(e => e.status === 'ELIGIBLE').reduce((s, e) => s + e.netAmount, 0);

    res.json({
      consultantId,
      summary: { totalGross, totalNet, paidOut, eligible, sessionCount: entries.length },
      entries,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Quality Cases ──────────────────────────────────────────────────────────────
// POST /api/quality/cases — create a quality/compliance case
app.post('/api/quality/cases', async (req, res) => {
  try {
    const db = await getDb();
    const caseData = {
      ...req.body,
      status: 'OPEN',
      createdAt: new Date(),
    };

    const result = await db.collection('qualityCases').insertOne(caseData);
    res.json({ id: result.insertedId.toString(), success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quality/cases — list quality cases
app.get('/api/quality/cases', async (req, res) => {
  try {
    const db = await getDb();
    const { status, consultantId } = req.query;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (consultantId) filter.consultantId = consultantId;

    const cases = await db.collection('qualityCases').find(filter).sort({ createdAt: -1 }).toArray();
    res.json(cases.map(c => ({ ...c, id: c._id.toString(), _id: undefined })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Users (Admin) ─────────────────────────────────────────────────────────────
// GET /api/users — paginated user list for admin
app.get('/api/users', async (req, res) => {
  try {
    const db = await getDb();
    const { role, status, limit = '100', skip = '0' } = req.query;
    const filter: Record<string, any> = {};
    if (role) filter['plan.role'] = role;
    if (status) filter['plan.status'] = status;

    const users = await db.collection('users')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip as string))
      .limit(parseInt(limit as string))
      .toArray();

    const total = await db.collection('users').countDocuments(filter);
    res.json({ users: users.map(u => ({ ...u, id: u._id?.toString(), _id: undefined })), total });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/suspend — suspend or unsuspend a user
app.post('/api/users/suspend', async (req, res) => {
  try {
    const db = await getDb();
    const { uid, isSuspended } = req.body;

    await db.collection('users').updateOne(
      { uid },
      { $set: { 'plan.status': isSuspended ? 'Suspended' : 'Active', updatedAt: new Date() } }
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/approve-consultant — approve consultant application
app.post('/api/users/approve-consultant', async (req, res) => {
  try {
    const db = await getDb();
    const { uid } = req.body;

    await db.collection('users').updateOne(
      { uid },
      { $set: { 'plan.role': 'Consultant', 'plan.status': 'Active', approvedAt: new Date() } }
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Tickets (Admin) ───────────────────────────────────────────────────────────
// GET /api/tickets — all support tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const db = await getDb();
    const { status } = req.query;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;

    const tickets = await db.collection('tickets').find(filter).sort({ createdAt: -1 }).toArray();
    res.json(tickets.map(t => ({ ...t, id: t._id?.toString(), _id: undefined })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n✅ Think10 Backend API running on http://localhost:${port}`);
  console.log(`   → Health: http://localhost:${port}/api/health`);
  console.log(`   → Admin Metrics: http://localhost:${port}/api/admin/metrics`);
  console.log(`   → Bookings: http://localhost:${port}/api/bookings`);
  console.log(`   → Earnings: http://localhost:${port}/api/earnings/:consultantId\n`);
});
