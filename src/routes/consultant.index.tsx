import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useConsultantState } from "@/context/ConsultantStateContext";
import {
  Calendar,
  Clock,
  Video,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Star,
  ChevronRight,
  FileText,
  CircleDollarSign,
  RefreshCcw,
} from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/consultant/")({
  component: ConsultantDashboardHome,
});

function ConsultantDashboardHome() {
  const { currentUser, userDoc } = useAuth();
  const { metrics, bookings, refreshData } = useConsultantState();

  // Real display name from userDoc or Firebase auth
  const displayName =
    userDoc?.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Consultant";

  const firstName = displayName.split(" ")[0];

  // Get hour-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Helper to safely parse dates
  const safeDate = (dateStr: any) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Upcoming confirmed bookings sorted by date
  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((b: any) => b.status === "CONFIRMED" || b.status === "Confirmed")
      .filter((b: any) => safeDate(b.when || b.date) !== null)
      .sort((a: any, b: any) => {
        const da = safeDate(a.when || a.date);
        const db = safeDate(b.when || b.date);
        return (da ? da.getTime() : 0) - (db ? db.getTime() : 0);
      });
  }, [bookings]);

  const nextBooking = upcomingBookings[0];

  // Today's bookings count
  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b: any) => {
    const d = safeDate(b.when || b.date);
    if (!d) return false;
    // Format to local date string to match todayStr
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const bDate = `${d.getFullYear()}-${month}-${day}`;
    return bDate === todayStr;
  }).length;

  // Completed sessions this month
  const completedThisMonth = bookings.filter((b: any) => {
    const d = safeDate(b.when || b.date);
    if (!d) return false;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const bMonth = `${d.getFullYear()}-${month}`;
    const thisMonth = new Date().toISOString().substring(0, 7);
    return b.status === "COMPLETED" && bMonth === thisMonth;
  }).length;

  // Pending payout: completed * 450 AED
  const pendingPayout = metrics.completedSessions * 450;

  // Generate real 7-day calendar strip from today
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${d.getFullYear()}-${month}-${dayStr}`;
      
      const dayBookings = bookings.filter((b: any) => {
        const bd = safeDate(b.when || b.date);
        if (!bd) return false;
        const bMonth = String(bd.getMonth() + 1).padStart(2, '0');
        const bDay = String(bd.getDate()).padStart(2, '0');
        const bDate = `${bd.getFullYear()}-${bMonth}-${bDay}`;
        return bDate === dateStr && (b.status === "CONFIRMED" || b.status === "Confirmed");
      }).length;
      
      days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.getDate().toString(),
        status: i === 0 ? "Today" : dayBookings > 0 ? `${dayBookings} Session${dayBookings > 1 ? "s" : ""}` : "Available",
        active: i === 0,
        sessions: dayBookings,
        off: dayBookings === 0 && i !== 0,
      });
    }
    return days;
  }, [bookings]);

  // Pending reports (completed bookings without a report)
  const pendingReports = bookings.filter(
    (b: any) => b.status === "COMPLETED" && !b.report
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {greeting}, {firstName}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            {todayBookings > 0
              ? `You have ${todayBookings} session${todayBookings > 1 ? "s" : ""} scheduled today.`
              : "No sessions today — your schedule is clear."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors flex items-center gap-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Link
            to="/consultant/bookings"
            className="px-4 py-2 bg-[color:var(--t10-navy)] text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Manage Schedule
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Next Consultation or No Upcoming Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[color:var(--t10-emerald)] shadow-sm overflow-hidden">
          <div className="bg-[color:var(--t10-emerald)]/10 px-6 py-3 border-b border-[color:var(--t10-emerald)]/20 flex justify-between items-center">
            <span className="text-xs font-bold text-[color:var(--t10-emerald)] uppercase tracking-wider flex items-center gap-2">
              {nextBooking ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--t10-emerald)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--t10-emerald)]"></span>
                  </span>
                  Next Upcoming Session
                </>
              ) : (
                "No Upcoming Sessions"
              )}
            </span>
            {nextBooking && safeDate(nextBooking.when || nextBooking.date) && (
              <span className="text-xs text-[color:var(--t10-grey)]">
                {safeDate(nextBooking.when || nextBooking.date)!.toLocaleDateString("en-AE", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          <div className="p-6">
            {nextBooking ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">
                      {nextBooking.topic || "Advisory Session"}
                    </h3>
                    <p className="text-neutral-500 flex items-center gap-2 mt-2">
                      <Video className="w-4 h-4" /> Client ID: {nextBooking.userId?.substring(0, 8) || "Unknown"}
                    </p>
                    {safeDate(nextBooking.when || nextBooking.date) && (
                      <p className="text-neutral-500 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />{" "}
                        {safeDate(nextBooking.when || nextBooking.date)!.toLocaleString("en-AE", {
                          weekday: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {nextBooking.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={nextBooking.meetLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[color:var(--t10-emerald)] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[color:var(--t10-emerald)]/90 transition-colors flex justify-center items-center gap-2"
                  >
                    <Video className="w-4 h-4" /> Join Call Room
                  </a>
                  <Link
                    to="/consultant/bookings"
                    className="flex-1 bg-white border border-neutral-200 text-neutral-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors flex justify-center items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> View Details
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No upcoming confirmed sessions.</p>
                <p className="text-neutral-400 text-xs mt-1">
                  New bookings from customers will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Required / Alerts */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-bold text-neutral-900">Action Required</h3>
          </div>
          <div className="flex-1 p-0 overflow-y-auto">
            <ul className="divide-y divide-neutral-100">
              {pendingReports > 0 && (
                <li className="p-4 hover:bg-neutral-50 cursor-pointer flex gap-4 transition-colors">
                  <div className="mt-0.5 bg-amber-100 p-1.5 rounded-full text-amber-600 h-fit">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {pendingReports} Session Report{pendingReports > 1 ? "s" : ""} Pending
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Complete post-session reports for your clients.
                    </p>
                    <p className="text-xs font-semibold text-amber-600 mt-2">Action required</p>
                  </div>
                </li>
              )}
              {pendingReports === 0 && upcomingBookings.length === 0 && (
                <li className="p-4 flex gap-4 text-neutral-400">
                  <CheckCircle2 className="w-5 h-5 text-[color:var(--t10-emerald)] mt-0.5 shrink-0" />
                  <p className="text-sm">All clear — no pending actions.</p>
                </li>
              )}
              {upcomingBookings.length > 0 && (
                <li className="p-4 hover:bg-neutral-50 cursor-pointer flex gap-4 transition-colors">
                  <div className="mt-0.5 bg-blue-100 p-1.5 rounded-full text-blue-600 h-fit">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Prepare for upcoming sessions
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {upcomingBookings.length} session{upcomingBookings.length > 1 ? "s" : ""} scheduled.
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Today's Sessions</h4>
            <Calendar className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">{todayBookings}</span>
            <span className="text-sm text-neutral-500">booked</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Quality Score</h4>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">
              {metrics.rating > 0 ? metrics.rating.toFixed(1) : "—"}
            </span>
            {metrics.rating > 0 && (
              <span className="text-sm text-[color:var(--t10-emerald)] flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {metrics.rating >= 4.5 ? "Top 10%" : "Good"}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Completed</h4>
            <CheckCircle2 className="w-5 h-5 text-[color:var(--t10-emerald)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">{metrics.completedSessions}</span>
            <span className="text-sm text-neutral-500">sessions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Pending Payout</h4>
            <CircleDollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">
              AED {pendingPayout.toLocaleString()}
            </span>
            <span className="text-sm text-neutral-500">est.</span>
          </div>
        </div>
      </div>

      {/* Live 7-Day Calendar Strip */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
          <h3 className="font-bold text-neutral-900">Your Week Ahead</h3>
          <Link
            to="/consultant/bookings"
            className="text-sm text-[color:var(--t10-emerald)] font-medium hover:underline flex items-center"
          >
            View full calendar <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-7 gap-4">
          {weekDays.map((col, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                col.active
                  ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-emerald)]/5 ring-1 ring-[color:var(--t10-emerald)]"
                  : col.sessions > 0
                    ? "border-blue-200 bg-blue-50"
                    : "border-neutral-100 bg-neutral-50 text-neutral-400"
              }`}
            >
              <span className={`text-xs font-semibold uppercase ${col.active ? "text-[color:var(--t10-emerald)]" : col.sessions > 0 ? "text-blue-600" : ""}`}>
                {col.day}
              </span>
              <span className={`text-2xl font-bold mt-1 ${col.active ? "text-[color:var(--t10-navy)]" : col.sessions > 0 ? "text-blue-800" : ""}`}>
                {col.date}
              </span>
              <span className={`text-[10px] mt-2 font-medium text-center ${col.active ? "text-[color:var(--t10-emerald)]" : col.sessions > 0 ? "text-blue-600" : "text-neutral-400"}`}>
                {col.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
