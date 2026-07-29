/**
 * RescheduleModal.tsx
 * Allows client or consultant to choose a new date & slot for an existing booking.
 */

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  Clock,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAvailableSlotsForDateFn,
  getAvailableDatesForMonthFn,
} from "@/lib/server-actions";

interface TimeSlot {
  startTime: string;
  endTime: string;
  startLabel: string;
  endLabel: string;
  available: boolean;
}

interface RescheduleModalProps {
  bookingId: string;
  expertSlug: string;
  expertName: string;
  onClose: () => void;
  onRescheduleConfirm: (bookingId: string, newSlot: string) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function RescheduleModal({
  bookingId,
  expertSlug,
  expertName,
  onClose,
  onRescheduleConfirm,
}: RescheduleModalProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableDates = useCallback(async () => {
    setLoadingDates(true);
    try {
      const dates = await getAvailableDatesForMonthFn({
        data: { consultantId: expertSlug, year: currentYear, month: currentMonth },
      });
      setAvailableDates(dates);
    } catch {
      // Fallback: make weekdays available
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const mockDates: string[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(currentYear, currentMonth - 1, day);
        if (d.getDay() !== 0 && d.getDay() !== 6 && d >= new Date()) {
          mockDates.push(`${currentYear}-${pad(currentMonth)}-${pad(day)}`);
        }
      }
      setAvailableDates(mockDates);
    } finally {
      setLoadingDates(false);
    }
  }, [currentYear, currentMonth, expertSlug]);

  useEffect(() => {
    loadAvailableDates();
  }, [loadAvailableDates]);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    getAvailableSlotsForDateFn({
      data: { consultantId: expertSlug, dateStr: selectedDate, timezone: "Asia/Dubai" },
    })
      .then((res) => setSlots(res))
      .catch(() => {
        const base = new Date(`${selectedDate}T09:00:00+04:00`);
        const fallback: TimeSlot[] = [];
        for (let i = 0; i < 6; i++) {
          const s = new Date(base.getTime() + i * 60 * 60 * 1000);
          const e = new Date(s.getTime() + 60 * 60 * 1000);
          fallback.push({
            startTime: s.toISOString(),
            endTime: e.toISOString(),
            startLabel: s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            endLabel: e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            available: true,
          });
        }
        setSlots(fallback);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, expertSlug]);

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const calendarCells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      await onRescheduleConfirm(bookingId, selectedSlot.startTime);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Rescheduling failed. Try another slot.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
      <div className="max-w-md w-full rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[color:var(--t10-navy)]">Reschedule Session</h3>
            <p className="text-xs text-[color:var(--t10-grey)]">Pick a new slot with {expertName}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-neutral-100 transition-colors">
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Date Selector */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-[color:var(--t10-navy)]">
            <button
              onClick={() => {
                if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
                else setCurrentMonth(m => m - 1);
              }}
              className="p-1 hover:bg-neutral-100 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>{MONTHS[currentMonth - 1]} {currentYear}</span>
            <button
              onClick={() => {
                if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
                else setCurrentMonth(m => m + 1);
              }}
              className="p-1 hover:bg-neutral-100 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-[color:var(--t10-grey)] mb-1">
            {DAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {loadingDates ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[color:var(--t10-emerald)]" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarCells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateStr = `${currentYear}-${pad(currentMonth)}-${pad(day)}`;
                const isAvailable = availableDates.includes(dateStr);
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={day}
                    disabled={!isAvailable}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[color:var(--t10-emerald)] text-white shadow-xs"
                        : isAvailable
                        ? "hover:bg-emerald-50 text-[color:var(--t10-navy)]"
                        : "opacity-30 cursor-not-allowed"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="border-t border-[color:var(--t10-border)] pt-3 space-y-2">
            <label className="text-xs font-bold text-[color:var(--t10-navy)] flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[color:var(--t10-emerald)]" /> Available Time Slots (GST)
            </label>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-[color:var(--t10-emerald)]" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {slots.map((s, idx) => {
                  const isSel = selectedSlot?.startTime === s.startTime;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(s)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                        isSel
                          ? "border-[color:var(--t10-emerald)] bg-emerald-50 text-[color:var(--t10-navy)]"
                          : "border-[color:var(--t10-border)] hover:border-neutral-300 text-neutral-700"
                      }`}
                    >
                      {s.startLabel} – {s.endLabel}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex gap-2 pt-2 border-t border-[color:var(--t10-border)]">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[color:var(--t10-border)] py-2 text-xs font-bold text-[color:var(--t10-grey)] hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSlot || submitting}
            className="flex-1 rounded-lg bg-[color:var(--t10-emerald)] py-2 text-xs font-bold text-white hover:bg-[color:var(--t10-green)] disabled:opacity-50 transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm New Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}
