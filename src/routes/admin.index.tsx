import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdminState } from "@/context/AdminStateContext";
import {
  TrendingUp, Users, Briefcase, AlertTriangle, CheckCircle2,
  Clock, BrainCircuit, CreditCard, CalendarCheck, UserCog,
  ArrowRight, ShieldCheck, CircleDollarSign,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: CommandCentre,
});

const PLAN_PRICE: Record<string, number> = {
  ZynePaid: 290, Hybrid: 950, Premium: 2500, Enterprise: 5000,
};

function CommandCentre() {
  const { adminRole, metrics, tasks, resolveTask, users, bookings } = useAdminState();

  // ── Derived real data ─────────────────────────────────────────────────────
  const totalUsers = users.length;

  const adminUsers = users.filter(
    (u) => Boolean(u.adminRole) || u.email === "admin.think10@gmail.com"
  ).length;

  const consultantUsers = users.filter(
    (u) =>
      u.plan?.role === "Consultant" ||
      u.plan?.role === "ConsultantPending" ||
      Boolean(u.consultantProfile)
  ).length;

  const customerUsers = users.filter((u) => {
    const isAdmin = Boolean(u.adminRole) || u.email === "admin.think10@gmail.com";
    const isCon =
      u.plan?.role === "Consultant" ||
      u.plan?.role === "ConsultantPending" ||
      Boolean(u.consultantProfile);
    return !isAdmin && !isCon;
  }).length;

  const paidCustomers = users.filter((u) => {
    const r = u.plan?.role;
    return r === "ZynePaid" || r === "Hybrid" || r === "Premium" || r === "Enterprise";
  }).length;

  const pendingConsultants = users.filter(
    (u) => u.plan?.role === "ConsultantPending" || u.approvalStatus === "PENDING"
  ).length;

  const suspendedUsers = users.filter((u) => u.plan?.status === "Suspended").length;

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(
    (b) => b.status === "PENDING" || b.status === "SCHEDULED" || b.status === "CONFIRMED"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  // Task queue
  const visibleTasks =
    adminRole === "Super Admin" || adminRole === "Founder / Executive"
      ? tasks
      : tasks.filter((t) => t.ownerRole === adminRole);
  const pendingTasks = visibleTasks.filter((t) => t.status !== "Resolved");
  const resolvedTasks = visibleTasks.filter((t) => t.status === "Resolved");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)]">Command Centre</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Welcome back —{" "}
            <strong className="text-[color:var(--t10-emerald)]">{adminRole}</strong> cockpit
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
          <CheckCircle2 className="h-3 w-3" /> Platform Live
        </span>
      </div>

      {/* System Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatusCard title="Platform Uptime" value="99.98%" status="good" icon={CheckCircle2} />
        <StatusCard title="Payment Gateway" value="Operational" status="good" icon={CreditCard} />
        <StatusCard title="Zyne AI API" value="Operational" status="good" icon={BrainCircuit} />
        <StatusCard title="Critical Incidents" value="0 Active" status="good" icon={AlertTriangle} />
      </div>

      {/* ── Metric Cards (real data) ──────────────────────────────────────── */}
      {["Super Admin", "Founder / Executive", "Data / Analyst", "Finance", "Operations Manager"].includes(adminRole) && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-[color:var(--t10-navy)] border-b border-neutral-200 pb-2">
            Platform Overview
          </h3>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <OverviewCard
              label="Total Users"
              value={totalUsers.toLocaleString()}
              sub={`${adminUsers} admin · ${consultantUsers} consultant`}
              icon={Users}
              linkTo="/admin/users"
              color="text-[color:var(--t10-navy)]"
            />
            <OverviewCard
              label="Customers"
              value={customerUsers.toLocaleString()}
              sub={`${paidCustomers} paid · ${customerUsers - paidCustomers} free`}
              icon={UserCog}
              linkTo="/admin/customers"
              color="text-[color:var(--t10-navy)]"
            />
            <OverviewCard
              label="Monthly Revenue"
              value={`AED ${metrics.mrr.toLocaleString()}`}
              sub={`${metrics.activePaidUsers} active subscriptions`}
              icon={CircleDollarSign}
              linkTo="/admin/finance"
              color="text-emerald-700"
            />
            <OverviewCard
              label="Total Bookings"
              value={totalBookings.toLocaleString()}
              sub={`${activeBookings} active · ${completedBookings} done`}
              icon={CalendarCheck}
              linkTo="/admin/bookings"
              color="text-[color:var(--t10-navy)]"
            />
          </div>

          {/* Secondary row */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <OverviewCard
              label="Consultants"
              value={consultantUsers.toLocaleString()}
              sub={`${pendingConsultants} awaiting approval`}
              icon={Briefcase}
              linkTo="/admin/consultants"
              color="text-purple-700"
              alert={pendingConsultants > 0}
            />
            <OverviewCard
              label="Pending Verifications"
              value={metrics.pendingVerifications.toString()}
              sub="Consultant docs to review"
              icon={ShieldCheck}
              linkTo="/admin/consultants"
              color="text-amber-700"
              alert={metrics.pendingVerifications > 0}
            />
            <OverviewCard
              label="Open Tickets"
              value={metrics.openTickets.toString()}
              sub="Support & quality queue"
              icon={AlertTriangle}
              linkTo="/admin/quality"
              color="text-red-600"
              alert={metrics.openTickets > 0}
            />
            <OverviewCard
              label="Suspended Accounts"
              value={suspendedUsers.toString()}
              sub="Users with restricted access"
              icon={UserCog}
              linkTo="/admin/users"
              color="text-red-600"
              alert={suspendedUsers > 0}
            />
          </div>
        </div>
      )}

      {/* ── Task Queue ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <h3 className="text-base font-bold text-[color:var(--t10-navy)]">
            My Task & Approval Queue
          </h3>
          {pendingTasks.length > 0 && (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
              {pendingTasks.length} pending
            </span>
          )}
        </div>

        {pendingTasks.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-500 shadow-sm">
            <CheckCircle2 className="mx-auto h-8 w-8 text-neutral-300 mb-3" />
            <p className="font-medium">All clear — no pending tasks in your queue.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                      {task.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        task.priority === "High"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : task.priority === "Medium"
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[color:var(--t10-navy)] leading-snug">
                    {task.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {task.ownerRole}
                  </p>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => resolveTask(task.id)}
                    className="flex-1 bg-[color:var(--t10-emerald)] text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-all"
                  >
                    Resolve / Approve
                  </button>
                  <button className="flex-1 border border-neutral-200 bg-white text-neutral-700 text-xs font-bold py-2 rounded-lg hover:bg-neutral-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {resolvedTasks.length > 0 && (
          <div className="pt-4">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Recently Resolved
            </h4>
            <ul className="space-y-1.5">
              {resolvedTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 text-sm text-neutral-400 bg-neutral-50 px-4 py-2.5 rounded-lg border border-neutral-100"
                >
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--t10-emerald)] shrink-0" />
                  <span className="line-through text-xs">{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusCard({ title, value, status, icon: Icon }: any) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center gap-3 shadow-sm">
      <div
        className={`p-2.5 rounded-full shrink-0 ${
          status === "good" ? "bg-emerald-50 text-[color:var(--t10-emerald)]" : "bg-red-50 text-red-500"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] text-neutral-500 font-medium leading-none">{title}</p>
        <p className="text-sm font-bold text-[color:var(--t10-navy)] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function OverviewCard({ label, value, sub, icon: Icon, linkTo, color, alert }: any) {
  return (
    <Link
      to={linkTo}
      className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[color:var(--t10-emerald)] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{label}</p>
        <div className={`p-1.5 rounded-lg ${alert ? "bg-red-50" : "bg-[color:var(--t10-mint)]"}`}>
          <Icon className={`h-4 w-4 ${alert ? "text-red-500" : "text-[color:var(--t10-emerald)]"}`} />
        </div>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-[10px] text-neutral-500">{sub}</p>
        <ArrowRight className="h-3 w-3 text-neutral-300 group-hover:text-[color:var(--t10-emerald)] transition-colors" />
      </div>
    </Link>
  );
}
