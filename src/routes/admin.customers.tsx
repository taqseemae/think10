import { createFileRoute } from "@tanstack/react-router";
import { useAdminState } from "@/context/AdminStateContext";
import {
  Users, Search, CalendarCheck, CreditCard, Clock,
  CheckCircle2, X, Sparkles, Eye, ChevronDown,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersAdminPage,
});

// Plan pricing map (AED/month)
const PLAN_PRICE: Record<string, number> = {
  Free: 0,
  ZynePaid: 290,
  Hybrid: 950,
  Premium: 2500,
  Enterprise: 5000,
};

// Zyne AI message allowance per plan per month
const ZYNE_LIMIT: Record<string, number | "∞"> = {
  Free: 5,
  ZynePaid: 50,
  Hybrid: 150,
  Premium: Infinity,
  Enterprise: Infinity,
};

const PLAN_PILL: Record<string, string> = {
  Free: "bg-neutral-100 text-neutral-600 border-neutral-200",
  ZynePaid: "bg-blue-50 text-blue-700 border-blue-200",
  Hybrid: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Premium: "bg-purple-50 text-purple-700 border-purple-200",
  Enterprise: "bg-amber-50 text-amber-800 border-amber-300",
};

function ZyneBar({ used, limit }: { used: number; limit: number | typeof Infinity }) {
  if (!isFinite(limit)) {
    return (
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-purple-500 shrink-0" />
        <span className="text-[11px] font-bold text-purple-700">Unlimited</span>
        {used > 0 && <span className="text-[10px] text-neutral-400">({used} used)</span>}
      </div>
    );
  }
  const pct = Math.min((used / limit) * 100, 100);
  const barColor = pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-[color:var(--t10-emerald)]";
  return (
    <div className="space-y-0.5 w-full max-w-[120px]">
      <div className="flex justify-between text-[10px] font-semibold text-neutral-600">
        <span>{used} used</span>
        <span className="text-neutral-400">{limit} total</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[10px] text-neutral-400">{Math.max(0, (limit as number) - used)} remaining</div>
    </div>
  );
}

function CustomersAdminPage() {
  const { users, bookings, transactions } = useAdminState();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [viewingCustomer, setViewingCustomer] = useState<any | null>(null);

  // ── ONLY customers: exclude admins and consultants ──────────────────────────
  const customers = users.filter((u) => {
    const isAdmin = Boolean(u.adminRole) || u.email === "admin.think10@gmail.com";
    const isConsultant =
      u.plan?.role === "Consultant" ||
      u.plan?.role === "ConsultantPending" ||
      Boolean(u.consultantProfile);
    return !isAdmin && !isConsultant;
  });

  // Plan tab counts
  const planCounts: Record<string, number> = {
    all: customers.length,
    Free: customers.filter((u) => !u.plan?.role || u.plan?.role === "Free").length,
    ZynePaid: customers.filter((u) => u.plan?.role === "ZynePaid").length,
    Hybrid: customers.filter((u) => u.plan?.role === "Hybrid").length,
    Premium: customers.filter((u) => u.plan?.role === "Premium").length,
    Enterprise: customers.filter((u) => u.plan?.role === "Enterprise").length,
  };

  // Filtered customers
  const filtered = customers.filter((u) => {
    const plan = u.plan?.role || "Free";
    if (planFilter !== "all" && plan !== planFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (u.displayName || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term)
    );
  });

  // Stats per customer
  const getStats = (customer: any) => {
    const plan = customer.plan?.role || "Free";

    const customerBookings = bookings.filter(
      (b: any) => b.userId === customer.uid || b.userEmail === customer.email || b.clientId === customer.uid
    );
    const completedBookings = customerBookings.filter(
      (b: any) => b.status === "COMPLETED" || b.status === "CONFIRMED"
    );

    const customerTxns = transactions.filter(
      (t: any) => t.userId === customer.uid || t.userEmail === customer.email
    );
    const totalPaid = customerTxns.reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

    const createdAt = customer.createdAt ? new Date(customer.createdAt) : null;
    const accountAgeDays = createdAt ? Math.floor((Date.now() - createdAt.getTime()) / 86400000) : null;
    const onFreeTrial = plan === "Free" && accountAgeDays !== null && accountAgeDays <= 14;
    const freeTrialDaysLeft = onFreeTrial && accountAgeDays !== null ? 14 - accountAgeDays : null;

    // Zyne token usage — from user doc if stored, else 0 fallback
    const zyneUsed: number = customer.plan?.zyneUsed ?? customer.zyneMessagesUsed ?? 0;
    const zyneLimit = ZYNE_LIMIT[plan] ?? 5;

    return {
      plan,
      pricePerMonth: PLAN_PRICE[plan] ?? 0,
      totalBookings: customerBookings.length,
      completedBookings: completedBookings.length,
      totalPaidAED: totalPaid,
      txnCount: customerTxns.length,
      onFreeTrial,
      freeTrialDaysLeft,
      createdAt,
      accountAgeDays,
      zyneUsed,
      zyneLimit,
    };
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <Users className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            Customers
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Customer plans, Zyne AI token usage, bookings activity, and payment history.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-60 pl-9 pr-4 py-1.5 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[color:var(--t10-emerald)] bg-white shadow-sm transition-colors"
          />
        </div>
      </div>

      {/* Plan Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 pb-3">
        {[
          { key: "all", label: "All" },
          { key: "Free", label: "Free" },
          { key: "ZynePaid", label: "ZynePaid" },
          { key: "Hybrid", label: "Hybrid" },
          { key: "Premium", label: "Premium" },
          { key: "Enterprise", label: "Enterprise" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setPlanFilter(tab.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all border cursor-pointer ${
              planFilter === tab.key
                ? "bg-[color:var(--t10-navy)] text-white border-[color:var(--t10-navy)]"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-[color:var(--t10-emerald)] hover:text-[color:var(--t10-emerald)]"
            }`}
          >
            {tab.label}{" "}
            <span className={planFilter === tab.key ? "opacity-70" : "text-neutral-400"}>
              ({planCounts[tab.key] ?? 0})
            </span>
          </button>
        ))}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Plan & Status</th>
                <th className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    Zyne AI Tokens
                  </div>
                </th>
                <th className="px-4 py-3.5">Bookings</th>
                <th className="px-4 py-3.5">Total Paid</th>
                <th className="px-4 py-3.5">Joined</th>
                <th className="px-4 py-3.5 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-neutral-400">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-25" />
                    <p className="text-sm font-medium">No customers found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  const s = getStats(customer);
                  const initial = customer.displayName?.charAt(0) || customer.email?.charAt(0) || "U";

                  return (
                    <tr key={customer.uid || customer.id} className="hover:bg-neutral-50/80 transition-colors group">
                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 text-xs">
                              {customer.displayName || customer.email?.split("@")[0] || "—"}
                            </p>
                            <p className="text-[10px] text-neutral-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plan & Status */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PLAN_PILL[s.plan] || "bg-neutral-100 text-neutral-600 border-neutral-200"}`}>
                            {s.plan}
                            {s.pricePerMonth > 0 && <span className="ml-1 opacity-60">· {s.pricePerMonth} AED/mo</span>}
                          </span>
                          {s.onFreeTrial ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                              <Clock className="h-2.5 w-2.5" />
                              Free Trial — {s.freeTrialDaysLeft}d left
                            </span>
                          ) : customer.plan?.status === "Suspended" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
                              <X className="h-2.5 w-2.5" /> Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Zyne AI Tokens */}
                      <td className="px-4 py-3.5">
                        <ZyneBar used={s.zyneUsed} limit={s.zyneLimit} />
                      </td>

                      {/* Bookings */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-neutral-900">{s.totalBookings}</span>
                          <span className="text-[10px] text-neutral-500">{s.completedBookings} completed</span>
                        </div>
                      </td>

                      {/* Total Paid */}
                      <td className="px-4 py-3.5">
                        {s.totalPaidAED > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-emerald-700">AED {s.totalPaidAED.toLocaleString()}</span>
                            <span className="text-[10px] text-neutral-500">{s.txnCount} transaction{s.txnCount !== 1 ? "s" : ""}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3.5">
                        {s.createdAt ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-neutral-700 font-medium">
                              {s.createdAt.toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="text-[10px] text-neutral-400">{s.accountAgeDays}d ago</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      {/* Detail button */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setViewingCustomer(customer)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[color:var(--t10-emerald)] border border-[color:var(--t10-emerald)] rounded-lg px-2.5 py-1 hover:bg-[color:var(--t10-mint)] transition-colors cursor-pointer"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {viewingCustomer && (() => {
        const s = getStats(viewingCustomer);
        const customerBookings = bookings.filter(
          (b: any) => b.userId === viewingCustomer.uid || b.userEmail === viewingCustomer.email || b.clientId === viewingCustomer.uid
        );
        const customerTxns = transactions.filter(
          (t: any) => t.userId === viewingCustomer.uid || t.userEmail === viewingCustomer.email
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-w-xl w-full rounded-2xl bg-white border border-neutral-200 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-[color:var(--t10-navy)]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)] flex items-center justify-center font-bold text-base uppercase">
                    {viewingCustomer.displayName?.charAt(0) || viewingCustomer.email?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {viewingCustomer.displayName || viewingCustomer.email?.split("@")[0]}
                    </p>
                    <p className="text-[11px] text-neutral-300">{viewingCustomer.email}</p>
                  </div>
                </div>
                <button onClick={() => setViewingCustomer(null)} className="rounded-full p-1.5 hover:bg-white/10">
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Plan & Zyne */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-neutral-500">Current Plan</p>
                    <p className="font-bold text-neutral-900 mt-0.5 text-sm">{s.plan}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Monthly Cost</p>
                    <p className="font-bold text-emerald-700 mt-0.5 text-sm">
                      {s.pricePerMonth === 0 ? "Free" : `AED ${s.pricePerMonth.toLocaleString()}/mo`}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Account Status</p>
                    <p className={`font-bold mt-0.5 ${viewingCustomer.plan?.status === "Suspended" ? "text-red-600" : "text-emerald-600"}`}>
                      {viewingCustomer.plan?.status || "Active"}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Total Paid</p>
                    <p className="font-bold text-emerald-700 mt-0.5">
                      {s.totalPaidAED > 0 ? `AED ${s.totalPaidAED.toLocaleString()}` : "No payments yet"}
                    </p>
                  </div>
                  {s.onFreeTrial && (
                    <div className="col-span-2 bg-amber-50 rounded-lg p-2 border border-amber-200 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <p className="text-amber-800 font-semibold text-xs">
                        Free Trial — {s.freeTrialDaysLeft} days remaining
                      </p>
                    </div>
                  )}
                </div>

                {/* Zyne Token Usage */}
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" /> Zyne AI Token Usage
                  </h4>
                  <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-2">
                    {isFinite(Number(s.zyneLimit)) ? (
                      <>
                        <div className="flex justify-between text-xs font-semibold text-neutral-700">
                          <span>Messages Used</span>
                          <span className="text-[color:var(--t10-emerald)]">{s.zyneUsed} / {s.zyneLimit}</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (s.zyneUsed / Number(s.zyneLimit)) >= 0.9 ? "bg-red-500" :
                              (s.zyneUsed / Number(s.zyneLimit)) >= 0.6 ? "bg-amber-500" :
                              "bg-[color:var(--t10-emerald)]"
                            }`}
                            style={{ width: `${Math.min((s.zyneUsed / Number(s.zyneLimit)) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-neutral-500">
                          <span>{Math.max(0, Number(s.zyneLimit) - s.zyneUsed)} messages remaining this month</span>
                          <span>{s.plan} plan limit</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <p className="text-sm font-bold text-purple-700">Unlimited Zyne Messages</p>
                        {s.zyneUsed > 0 && <span className="text-xs text-neutral-400">({s.zyneUsed} used total)</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bookings */}
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Booking Activity</h4>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Total", value: s.totalBookings, color: "text-[color:var(--t10-navy)]" },
                      { label: "Completed", value: s.completedBookings, color: "text-emerald-600" },
                      { label: "Upcoming", value: customerBookings.filter((b: any) => b.status === "PENDING" || b.status === "SCHEDULED").length, color: "text-blue-600" },
                    ].map((st) => (
                      <div key={st.label} className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 text-center">
                        <p className={`text-xl font-black ${st.color}`}>{st.value}</p>
                        <p className="text-[10px] text-neutral-500 font-medium">{st.label}</p>
                      </div>
                    ))}
                  </div>
                  {customerBookings.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {customerBookings.slice(0, 5).map((b: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-neutral-50 rounded-lg border border-neutral-100 px-3 py-2 text-xs">
                          <div>
                            <p className="font-semibold text-neutral-800">{b.consultantName || b.expertSlug || "Advisory Session"}</p>
                            <p className="text-neutral-500 text-[10px]">
                              {b.scheduledAt ? new Date(b.scheduledAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" }) : "Date TBD"}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === "COMPLETED" || b.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" :
                            b.status === "CANCELLED" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"
                          }`}>{b.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Transactions */}
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Payment Transactions</h4>
                  {customerTxns.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-3 text-center border border-dashed border-neutral-200 rounded-xl">No transactions recorded yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {customerTxns.map((t: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-neutral-50 rounded-lg border border-neutral-100 px-3 py-2 text-xs">
                          <div>
                            <p className="font-semibold text-neutral-800">{t.description || t.type || "Plan Payment"}</p>
                            <p className="text-neutral-500 text-[10px]">
                              {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" }) : "Date unknown"}
                            </p>
                          </div>
                          <span className="font-bold text-emerald-700">AED {Number(t.amount || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
