import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Clock,
  Save,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Loader2,
  Settings,
  CalendarX,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  setConsultantAvailabilityFn,
  getConsultantAvailabilityFn,
} from "@/lib/server-actions";

export const Route = createFileRoute("/consultant/availability")({
  component: ConsultantAvailabilityPage,
});

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

type TimeRange = { start: string; end: string };
type WeeklySchedule = Record<string, TimeRange[]>;

const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: [{ start: "09:00", end: "18:00" }],
  tuesday: [{ start: "09:00", end: "18:00" }],
  wednesday: [{ start: "09:00", end: "18:00" }],
  thursday: [{ start: "09:00", end: "18:00" }],
  friday: [{ start: "09:00", end: "18:00" }],
  saturday: [],
  sunday: [],
};

function ConsultantAvailabilityPage() {
  const { currentUser, userDoc } = useAuth();
  const [schedule, setSchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const uid = currentUser?.uid || "";

  // Load existing availability
  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    getConsultantAvailabilityFn({ data: uid })
      .then((data) => {
        if (data) {
          setSchedule((data.weeklySchedule as WeeklySchedule) || DEFAULT_SCHEDULE);
          setSessionDuration(data.sessionDurationMinutes as number || 60);
          setBufferMinutes(data.bufferMinutes as number || 15);
          setBlockedDates((data.blockedDates as string[]) || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [uid]);

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day]?.length > 0 ? [] : [{ start: "09:00", end: "18:00" }],
    }));
  };

  const updateTimeRange = (day: string, idx: number, field: "start" | "end", value: string) => {
    setSchedule((prev) => {
      const ranges = [...(prev[day] || [])];
      ranges[idx] = { ...ranges[idx], [field]: value };
      return { ...prev, [day]: ranges };
    });
  };

  const addTimeRange = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: "09:00", end: "12:00" }],
    }));
  };

  const removeTimeRange = (day: string, idx: number) => {
    setSchedule((prev) => {
      const ranges = [...(prev[day] || [])].filter((_, i) => i !== idx);
      return { ...prev, [day]: ranges };
    });
  };

  const addBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates((prev) => [...prev, newBlockedDate].sort());
      setNewBlockedDate("");
    }
  };

  const removeBlockedDate = (date: string) => {
    setBlockedDates((prev) => prev.filter((d) => d !== date));
  };

  const handleSave = async () => {
    if (!uid) return;
    setSaving(true);
    setSaved(false);
    try {
      await setConsultantAvailabilityFn({
        data: {
          consultantId: uid,
          consultantName: userDoc?.displayName || currentUser?.displayName || "",
          consultantEmail: userDoc?.email || currentUser?.email || "",
          weeklySchedule: schedule,
          timezone: "Asia/Dubai",
          sessionDurationMinutes: sessionDuration,
          bufferMinutes,
          blockedDates,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save availability:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--t10-emerald)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[color:var(--t10-navy)]">My Availability</h2>
          <p className="text-sm text-[color:var(--t10-grey)] mt-1">
            Define your working hours so clients can book real sessions with Google Meet.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[color:var(--t10-emerald)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[color:var(--t10-green)] disabled:opacity-60 transition-all shadow"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Saved!" : "Save Schedule"}
        </button>
      </div>

      {/* Session Settings */}
      <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-4 w-4 text-[color:var(--t10-emerald)]" />
          <p className="text-sm font-bold text-[color:var(--t10-navy)]">Session Settings</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-xs">
            <span className="mb-1.5 block font-semibold text-[color:var(--t10-navy)]">Session Duration</span>
            <select
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              className="w-full rounded-lg border border-[color:var(--t10-border)] bg-white px-3 py-2 text-sm"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </label>
          <label className="block text-xs">
            <span className="mb-1.5 block font-semibold text-[color:var(--t10-navy)]">Buffer Between Sessions</span>
            <select
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-[color:var(--t10-border)] bg-white px-3 py-2 text-sm"
            >
              <option value={0}>No buffer</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2 text-xs text-[color:var(--t10-grey)]">
          <Clock className="h-3.5 w-3.5 text-[color:var(--t10-emerald)]" />
          <span>All times are in Gulf Standard Time (GST, UTC+4)</span>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-[color:var(--t10-emerald)]" />
          <p className="text-sm font-bold text-[color:var(--t10-navy)]">Weekly Schedule</p>
        </div>

        {DAYS.map(({ key, label }) => {
          const ranges = schedule[key] || [];
          const isOn = ranges.length > 0;

          return (
            <div key={key} className={`rounded-xl border transition-all ${isOn ? "border-[color:var(--t10-border)]" : "border-transparent bg-neutral-50"} p-3`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleDay(key)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${isOn ? "bg-[color:var(--t10-emerald)]" : "bg-neutral-200"}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isOn ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <span className={`text-sm font-semibold ${isOn ? "text-[color:var(--t10-navy)]" : "text-neutral-400"}`}>
                    {label}
                  </span>
                </div>
                {isOn && (
                  <button
                    onClick={() => addTimeRange(key)}
                    className="flex items-center gap-1 rounded-md bg-[color:var(--t10-mint)] px-2 py-1 text-[10px] font-bold text-[color:var(--t10-emerald)] hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add Range
                  </button>
                )}
              </div>

              {/* Time Ranges */}
              {ranges.map((range, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-2 ml-12">
                  <input
                    type="time"
                    value={range.start}
                    onChange={(e) => updateTimeRange(key, idx, "start", e.target.value)}
                    className="rounded-lg border border-[color:var(--t10-border)] px-2 py-1.5 text-xs"
                  />
                  <span className="text-xs text-[color:var(--t10-grey)]">→</span>
                  <input
                    type="time"
                    value={range.end}
                    onChange={(e) => updateTimeRange(key, idx, "end", e.target.value)}
                    className="rounded-lg border border-[color:var(--t10-border)] px-2 py-1.5 text-xs"
                  />
                  {ranges.length > 1 && (
                    <button
                      onClick={() => removeTimeRange(key, idx)}
                      className="rounded-full p-1 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              ))}

              {!isOn && (
                <p className="ml-12 text-xs text-neutral-400 mt-1">Unavailable</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Blocked Dates */}
      <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <CalendarX className="h-4 w-4 text-red-400" />
          <p className="text-sm font-bold text-[color:var(--t10-navy)]">Blocked / Holiday Dates</p>
        </div>
        <p className="text-xs text-[color:var(--t10-grey)]">Clients cannot book on these dates.</p>

        {/* Add blocked date */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="rounded-lg border border-[color:var(--t10-border)] px-3 py-2 text-xs"
          />
          <button
            onClick={addBlockedDate}
            disabled={!newBlockedDate}
            className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Block Date
          </button>
        </div>

        {blockedDates.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {blockedDates.map((date) => (
              <div key={date} className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-700">
                {date}
                <button onClick={() => removeBlockedDate(date)} className="hover:text-red-900 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 italic">No blocked dates yet.</p>
        )}
      </div>

      {/* Save at bottom too */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--t10-emerald)] py-3 text-sm font-bold text-white hover:bg-[color:var(--t10-green)] disabled:opacity-60 transition-all shadow"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? "Schedule Saved Successfully!" : "Save My Availability"}
      </button>
    </div>
  );
}
