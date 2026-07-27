/**
 * availability.ts
 * Server-side utility for calculating consultant availability slots.
 * Takes weekly schedule, subtracts existing bookings, returns free slots.
 */

import { getDb } from '@/lib/mongodb';

export interface TimeRange {
  start: string; // "09:00"
  end: string;   // "12:00"
}

export interface WeeklySchedule {
  monday?: TimeRange[];
  tuesday?: TimeRange[];
  wednesday?: TimeRange[];
  thursday?: TimeRange[];
  friday?: TimeRange[];
  saturday?: TimeRange[];
  sunday?: TimeRange[];
}

export interface ConsultantAvailability {
  consultantId: string;
  consultantName: string;
  consultantEmail: string;
  weeklySchedule: WeeklySchedule;
  timezone: string;
  sessionDurationMinutes: number;
  bufferMinutes: number;
  blockedDates: string[]; // "YYYY-MM-DD"
}

export interface TimeSlot {
  startTime: string; // ISO8601
  endTime: string;   // ISO8601
  startLabel: string; // "9:00 AM"
  endLabel: string;   // "10:00 AM"
  available: boolean;
}

const DAY_MAP: Record<number, keyof WeeklySchedule> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

/**
 * Loads consultant availability settings from DB.
 * Returns default availability (Mon–Fri 9am–6pm GST) if not set.
 */
export async function getConsultantAvailabilitySettings(
  consultantId: string
): Promise<ConsultantAvailability | null> {
  const db = await getDb();
  const doc = await db.collection('consultant_availability').findOne({ consultantId });
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest as ConsultantAvailability;
}

/**
 * Returns available time slots for a consultant on a given date.
 * Accounts for existing bookings and buffer time between sessions.
 */
export async function getAvailableSlots(
  consultantId: string,
  dateStr: string // "YYYY-MM-DD"
): Promise<TimeSlot[]> {
  const db = await getDb();

  // Load availability config or use defaults
  const avail = await getConsultantAvailabilitySettings(consultantId);

  const sessionDuration = avail?.sessionDurationMinutes ?? 60;
  const buffer = avail?.bufferMinutes ?? 15;
  const timezone = avail?.timezone ?? 'Asia/Dubai';
  const blockedDates = avail?.blockedDates ?? [];

  // If the date is blocked, return empty
  if (blockedDates.includes(dateStr)) return [];

  // Get day of week
  const date = new Date(dateStr + 'T00:00:00Z');
  const dayName = DAY_MAP[date.getDay()];

  // Get day's schedule ranges
  const dayRanges: TimeRange[] = avail?.weeklySchedule?.[dayName] ?? [
    { start: '09:00', end: '18:00' } // Default Mon–Fri 9–6
  ];

  // If no ranges for this day, consultant is off
  if (!dayRanges || dayRanges.length === 0) return [];

  // Fetch existing bookings for this consultant on this date
  const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
  const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

  const existingBookings = await db.collection('bookings').find({
    $or: [{ consultantId }, { expertSlug: consultantId }],
    startTime: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() },
    status: { $nin: ['CANCELLED', 'NO_SHOW'] },
  }).toArray();

  const bookedRanges = existingBookings.map((b: any) => ({
    start: new Date(b.startTime).getTime(),
    end: new Date(b.endTime).getTime(),
  }));

  // Generate slots from day ranges
  const slots: TimeSlot[] = [];

  for (const range of dayRanges) {
    const [startH, startM] = range.start.split(':').map(Number);
    const [endH, endM] = range.end.split(':').map(Number);

    // Convert to minutes from midnight
    let current = startH * 60 + startM;
    const rangeEnd = endH * 60 + endM;

    while (current + sessionDuration <= rangeEnd) {
      const slotStartMs = new Date(`${dateStr}T${pad(Math.floor(current / 60))}:${pad(current % 60)}:00.000Z`).getTime() - (4 * 60 * 60 * 1000); // Adjust for GST (UTC+4)
      const slotEndMs = slotStartMs + sessionDuration * 60 * 1000;

      // Check if this slot overlaps with any booked range
      const isBooked = bookedRanges.some(
        (booked) => slotStartMs < booked.end && slotEndMs > booked.start
      );

      // Check if slot is in the past
      const isPast = slotStartMs < Date.now();

      const startISO = new Date(slotStartMs).toISOString();
      const endISO = new Date(slotEndMs).toISOString();

      if (!isPast) {
        slots.push({
          startTime: startISO,
          endTime: endISO,
          startLabel: formatTime(current),
          endLabel: formatTime(current + sessionDuration),
          available: !isBooked,
        });
      }

      current += sessionDuration + buffer;
    }
  }

  return slots;
}

/**
 * Validates that a specific slot is still available before booking.
 */
export async function isSlotAvailable(
  consultantId: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const db = await getDb();

  const conflicting = await db.collection('bookings').findOne({
    $or: [{ consultantId }, { expertSlug: consultantId }],
    status: { $nin: ['CANCELLED', 'NO_SHOW'] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  });

  return !conflicting;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${pad(m)} ${period}`;
}

/**
 * Returns dates with at least one available slot for the given month.
 */
export async function getAvailableDatesForMonth(
  consultantId: string,
  year: number,
  month: number // 1-indexed
): Promise<string[]> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const availableDates: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${pad(month)}-${pad(day)}`;
    const slots = await getAvailableSlots(consultantId, dateStr);
    if (slots.some((s) => s.available)) {
      availableDates.push(dateStr);
    }
  }

  return availableDates;
}
