/**
 * BookingCalendarModal.tsx
 * Calendly-style booking modal with:
 * - Step 1: Month calendar + date selection (only available dates highlighted)
 * - Step 2: Time slot selection + pre-call questionnaire
 * - Step 3: Confirmation screen with real Google Meet link
 */

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle,
  Video,
  Loader2,
  ExternalLink,
  AlertTriangle,
  User,
} from "lucide-react";
import {
  getAvailableSlotsForDateFn,
  getAvailableDatesForMonthFn,
  createBookingFn,
} from "@/lib/server-actions";
import { useAuth } from "@/context/AuthContext";
import { useDashboardState } from "@/context/DashboardStateContext";
import type { Expert } from "@/data/think10";
import { CreditCard } from "lucide-react";

interface TimeSlot {
  startTime: string;
  endTime: string;
  startLabel: string;
  endLabel: string;
  available: boolean;
}

interface BookingCalendarModalProps {
  expert: Expert;
  onClose: () => void;
  onSuccess?: (bookingId: string, meetLink: string) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function BookingCalendarModal({ expert, onClose, onSuccess }: BookingCalendarModalProps) {
  const { currentUser, userDoc } = useAuth();
  const dashboardState = (() => {
    try { return useDashboardState(); } catch { return null; }
  })();

  const [payingMock, setPayingMock] = useState(false);
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [sessionType, setSessionType] = useState(expert.sessionTypes[0] || "Strategy Session");
  const [preCall, setPreCall] = useState({ challenge: "", questions: "", additionalDocs: "" });

  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ bookingId: string; meetLink: string } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Load available dates when month/year changes
  const loadAvailableDates = useCallback(async () => {
    setLoadingDates(true);
    try {
      const dates = await getAvailableDatesForMonthFn({
        data: { consultantId: expert.slug, year: currentYear, month: currentMonth },
      });
      setAvailableDates(dates || []);
    } catch (err) {
      // If availability not set, fall back to showing all weekdays
      const fallback: string[] = [];
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(currentYear, currentMonth - 1, d);
        const dayOfWeek = date.getDay();
        // Mon–Fri (1–5), only future dates
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && date > today) {
          fallback.push(formatISO(date));
        }
      }
      setAvailableDates(fallback);
    } finally {
      setLoadingDates(false);
    }
  }, [expert.slug, currentYear, currentMonth]);

  useEffect(() => {
    loadAvailableDates();
  }, [loadAvailableDates]);

  // Load slots when date selected
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    getAvailableSlotsForDateFn({ data: { consultantId: expert.slug, date: selectedDate } })
      .then((s) => setSlots(s || []))
      .catch(() => {
        // Fallback slots if availability not configured
        const fallback: TimeSlot[] = [];
        const hours = [9, 10, 11, 14, 15, 16, 17];
        for (const h of hours) {
          const start = new Date(`${selectedDate}T${pad(h)}:00:00+04:00`);
          const end = new Date(start.getTime() + 60 * 60 * 1000);
          if (start > new Date()) {
            const sl = h >= 12 ? 'PM' : 'AM';
            const el = (h + 1) >= 12 ? 'PM' : 'AM';
            const dh = h > 12 ? h - 12 : h;
            const eh = (h + 1) > 12 ? (h + 1) - 12 : (h + 1);
            fallback.push({
              startTime: start.toISOString(),
              endTime: end.toISOString(),
              startLabel: `${dh}:00 ${sl}`,
              endLabel: `${eh}:00 ${el}`,
              available: true,
            });
          }
        }
        setSlots(fallback);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, expert.slug]);

  // Calendar grid calculation
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const calendarCells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleDateSelect = (day: number) => {
    const dateStr = `${currentYear}-${pad(currentMonth)}-${pad(day)}`;
    if (!availableDates.includes(dateStr)) return;
    setSelectedDate(dateStr);
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !currentUser) return;
    setBooking(true);
    setBookingError(null);
    try {
      const result = await createBookingFn({
        data: {
          userId: currentUser.uid,
          userEmail: currentUser.email || userDoc?.email || "",
          userName: currentUser.displayName || userDoc?.displayName || "Client",
          consultantId: expert.slug,
          consultantName: expert.name,
          consultantEmail: expert.email || `${expert.slug}@think10.ae`,
          expertSlug: expert.slug,
          expertRole: expert.role,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          timezone: "Asia/Dubai",
          topic: preCall.challenge || sessionType,
          sessionType,
          preCallAnswers: preCall,
        },
      });
      setBookingResult(result);
      setStep(3);
      onSuccess?.(result.bookingId, result.meetLink);
    } catch (err: any) {
      setBookingError(err?.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const handleInstantBooking = async () => {
    if (!currentUser) return;
    setBooking(true);
    setBookingError(null);
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 30 * 60 * 1000);
      const result = await createBookingFn({
        data: {
          userId: currentUser.uid,
          userEmail: currentUser.email || userDoc?.email || "",
          userName: currentUser.displayName || userDoc?.displayName || "Client",
          consultantId: expert.slug,
          consultantName: expert.name,
          consultantEmail: expert.email || `${expert.slug}@think10.ae`,
          expertSlug: expert.slug,
          expertRole: expert.role,
          startTime: now.toISOString(),
          endTime: end.toISOString(),
          timezone: "Asia/Dubai",
          topic: "Instant Test Meeting",
          sessionType,
          preCallAnswers: { challenge: "Instant Test Run", questions: "", additionalDocs: "" },
          preCallFiles: [],
        },
      });

      setBookingResult(result);
      setStep(3);

      dashboardState?.fetchBookings();
    } catch (err: any) {
      setBookingError(err?.message || "Booking failed. Please try again.");
      alert("Instant Booking Error: " + (err?.message || err));
    } finally {
      setBooking(false);
    }
  };

  const formatSelectedDateTime = () => {
    if (!selectedSlot) return "";
    try {
      return new Intl.DateTimeFormat("en-AE", {
        timeZone: "Asia/Dubai",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(selectedSlot.startTime));
    } catch {
      return selectedDate || "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[color:var(--t10-border)] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[color:var(--t10-border)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--t10-navy)] text-sm font-bold text-white uppercase">
              {expert.initials}
            </span>
            <div>
              <p className="text-xs text-[color:var(--t10-grey)] font-medium">Booking session with</p>
              <p className="text-sm font-bold text-[color:var(--t10-navy)]">{expert.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Step indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${step >= s ? "w-6 bg-[color:var(--t10-emerald)]" : "w-2 bg-neutral-200"}`}
                />
              ))}
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-neutral-100 transition-colors">
              <X className="h-5 w-5 text-[color:var(--t10-grey)]" />
            </button>
          </div>
        </div>

        {/* STEP 1: Date Picker */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-[color:var(--t10-navy)]">Select a Date</h3>
              <p className="text-xs text-[color:var(--t10-grey)] flex items-center gap-1 mt-0.5">
                <Clock className="h-3.5 w-3.5" /> All times shown in Gulf Standard Time (GST, UTC+4)
              </p>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="rounded-full p-2 hover:bg-neutral-100 transition-colors">
                <ChevronLeft className="h-5 w-5 text-[color:var(--t10-navy)]" />
              </button>
              <h4 className="text-sm font-bold text-[color:var(--t10-navy)]">
                {MONTHS[currentMonth - 1]} {currentYear}
              </h4>
              <button onClick={nextMonth} className="rounded-full p-2 hover:bg-neutral-100 transition-colors">
                <ChevronRight className="h-5 w-5 text-[color:var(--t10-navy)]" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 text-center">
              {DAYS.map((d) => (
                <div key={d} className="py-1.5 text-[10px] font-bold text-[color:var(--t10-grey)] uppercase">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {loadingDates ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-[color:var(--t10-emerald)]" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const dateStr = `${currentYear}-${pad(currentMonth)}-${pad(day)}`;
                  const isAvailable = availableDates.includes(dateStr);
                  const isToday = dateStr === formatISO(today);
                  const isPast = new Date(dateStr) < new Date(formatISO(today));
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => !isPast && isAvailable && handleDateSelect(day)}
                      disabled={isPast || !isAvailable}
                      className={`
                        aspect-square w-full rounded-full text-xs font-semibold flex items-center justify-center transition-all
                        ${isSelected ? "bg-[color:var(--t10-emerald)] text-white shadow-md" : ""}
                        ${isAvailable && !isSelected && !isPast ? "text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-mint)] cursor-pointer" : ""}
                        ${isPast || !isAvailable ? "text-neutral-300 cursor-not-allowed" : ""}
                        ${isToday && !isSelected ? "ring-2 ring-[color:var(--t10-emerald)] ring-offset-1" : ""}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-4 text-[10px] text-[color:var(--t10-grey)]">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[color:var(--t10-emerald)]" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-neutral-200" /> Unavailable
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full ring-2 ring-[color:var(--t10-emerald)]" /> Today
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: Time Slot + Pre-Call Form */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(1)} className="rounded-full p-1.5 hover:bg-neutral-100 transition-colors">
                <ChevronLeft className="h-4 w-4 text-[color:var(--t10-grey)]" />
              </button>
              <div>
                <h3 className="text-base font-bold text-[color:var(--t10-navy)]">Select a Time</h3>
                <p className="text-xs text-[color:var(--t10-grey)]">{formatSelectedDateTime()}</p>
              </div>
            </div>

            {/* Session Type */}
            <label className="block text-xs">
              <span className="mb-1.5 block font-bold text-[color:var(--t10-navy)]">Session Type</span>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full rounded-lg border border-[color:var(--t10-border)] bg-white px-3 py-2 text-sm"
              >
                {expert.sessionTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            {/* Time Slots */}
            <div>
              <p className="mb-2 text-xs font-bold text-[color:var(--t10-navy)]">Available Slots (GST)</p>
              {loadingSlots ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-5 w-5 animate-spin text-[color:var(--t10-emerald)]" />
                </div>
              ) : slots.filter(s => s.available).length === 0 ? (
                <div className="text-center py-6 text-xs text-[color:var(--t10-grey)]">
                  No available slots for this date. Please select another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.filter(s => s.available).map((slot) => (
                    <button
                      key={slot.startTime}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border py-2.5 text-center text-xs font-semibold transition-all ${
                        selectedSlot?.startTime === slot.startTime
                          ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] text-[color:var(--t10-navy)]"
                          : "border-[color:var(--t10-border)] hover:border-[color:var(--t10-emerald)] text-[color:var(--t10-grey)]"
                      }`}
                    >
                      {slot.startLabel}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleInstantBooking}
                disabled={booking}
                className="w-full rounded-lg bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-all shadow flex items-center justify-center gap-2"
              >
                {booking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating instant meeting...
                  </>
                ) : (
                  <span>⚡ Quick Test: Start Instant Meeting Now</span>
                )}
              </button>
            </div>

            {/* Pre-call questionnaire */}
            {selectedSlot && (
              <div className="space-y-3 pt-4 border-t border-[color:var(--t10-border)]">
                <p className="text-[10px] font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">Pre-Session Brief</p>
                <label className="block text-xs">
                  <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">Primary challenge for this session *</span>
                  <textarea
                    rows={2}
                    value={preCall.challenge}
                    onChange={(e) => setPreCall({ ...preCall, challenge: e.target.value })}
                    className="w-full rounded-lg border border-[color:var(--t10-border)] p-2.5 text-xs outline-none focus:border-[color:var(--t10-emerald)]"
                    placeholder="e.g. Optimizing Amazon ACOS, reviewing P&L..."
                    required
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">Specific questions for the advisor</span>
                  <textarea
                    rows={2}
                    value={preCall.questions}
                    onChange={(e) => setPreCall({ ...preCall, questions: e.target.value })}
                    className="w-full rounded-lg border border-[color:var(--t10-border)] p-2.5 text-xs outline-none focus:border-[color:var(--t10-emerald)]"
                    placeholder="List any specific questions..."
                  />
                </label>
              </div>
            )}

            {/* Error */}
            {bookingError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Mock Payment banner if user has 0 credits */}
            {dashboardState && dashboardState.credits <= 0 ? (
              <div className="space-y-2 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-center justify-between text-xs text-amber-900 font-medium">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CreditCard className="h-4 w-4 text-amber-600" /> Pay Now (Test Mode)
                  </span>
                  <span className="font-bold">AED 450</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  You have 0 credits. Click Pay Now to simulate credit purchase and complete booking.
                </p>
                <button
                  type="button"
                  disabled={!selectedSlot || !preCall.challenge.trim() || booking || payingMock}
                  onClick={async () => {
                    setPayingMock(true);
                    setTimeout(() => {
                      if (dashboardState?.buyCredits) {
                        dashboardState.buyCredits(1);
                      }
                      setPayingMock(false);
                      handleConfirmBooking();
                    }, 800);
                  }}
                  className="w-full rounded-lg bg-[color:var(--t10-navy)] py-3 text-xs font-bold text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow flex items-center justify-center gap-2"
                >
                  {payingMock ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay Now & Confirm Booking
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleConfirmBooking}
                  disabled={!selectedSlot || !preCall.challenge.trim() || booking}
                  className="w-full rounded-lg bg-[color:var(--t10-emerald)] py-3 text-sm font-bold text-white hover:bg-[color:var(--t10-green)] disabled:opacity-50 transition-all shadow flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating your Zoom Meeting session...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      Confirm Booking & Generate Zoom Link
                    </>
                  )}
                </button>
              </div>
            )}
            <p className="text-center text-[10px] text-[color:var(--t10-grey)]">
              A Zoom Meeting invite will be sent to your email after confirmation.
            </p>
          </div>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && bookingResult && (
          <div className="p-6 space-y-5 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-9 w-9 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[color:var(--t10-navy)]">Session Confirmed! 🎉</h3>
              <p className="text-xs text-[color:var(--t10-grey)] mt-1">
                Your strategy session has been booked. A Zoom invite has been created for your session.
              </p>
            </div>

            {/* Session Details */}
            <div className="w-full rounded-2xl border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] p-5 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <User className="h-4 w-4 text-[color:var(--t10-emerald)]" />
                <span className="text-[color:var(--t10-grey)]">Advisor:</span>
                <span className="font-bold text-[color:var(--t10-navy)]">{expert.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-4 w-4 text-[color:var(--t10-emerald)]" />
                <span className="text-[color:var(--t10-grey)]">Date:</span>
                <span className="font-bold text-[color:var(--t10-navy)]">{formatSelectedDateTime()}</span>
              </div>
              {selectedSlot && (
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-4 w-4 text-[color:var(--t10-emerald)]" />
                  <span className="text-[color:var(--t10-grey)]">Time:</span>
                  <span className="font-bold text-[color:var(--t10-navy)]">{selectedSlot.startLabel} – {selectedSlot.endLabel} GST</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-xs border-t border-[color:var(--t10-border)] pt-3">
                <Video className="h-4 w-4 text-[color:var(--t10-emerald)] mt-0.5 shrink-0" />
                <div>
                  <span className="text-[color:var(--t10-grey)] block">Zoom Meeting Link:</span>
                  <a
                    href={bookingResult.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[color:var(--t10-emerald)] hover:underline break-all"
                  >
                    {bookingResult.meetLink}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <a
                href={bookingResult.meetLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-[color:var(--t10-emerald)] py-3 text-sm font-bold text-white hover:bg-[color:var(--t10-green)] transition-all shadow"
              >
                <Video className="h-4 w-4" />
                Join Zoom Meeting
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={onClose}
                className="rounded-lg border border-[color:var(--t10-border)] py-2.5 text-sm font-semibold text-[color:var(--t10-navy)] hover:bg-neutral-50 transition-all"
              >
                View in My Sessions →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
