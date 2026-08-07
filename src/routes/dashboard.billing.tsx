import { createFileRoute } from "@tanstack/react-router";
import { useDashboardState, type UserRole } from "@/context/DashboardStateContext";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createStripeCheckoutSessionFn, createStripeCustomerPortalFn } from "@/lib/server-actions";
import {
  CreditCard,
  Plus,
  Info,
  Download,
  AlertTriangle,
  CheckCircle,
  X,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { userDoc } = useAuth();
  const {
    role,
    setRole,
    credits,
    buyCredits,
    creditsLedger,
    invoices,
    zyneTokens,
    resetAllData,
  } = useDashboardState();
  const [loadingStripe, setLoadingStripe] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const getPlanName = (r: UserRole) => {
    switch (r) {
      case "Free":
        return "Free Preview Tier";
      case "ZynePaid":
        return "Zyne Paid AI-First";
      case "Hybrid":
        return "Think10 Hybrid Advisory";
      case "Premium":
        return "Think10 Premium Advisory";
      case "Cancelled":
        return "Cancelled Plan (Read-only)";
      default:
        return "Custom Enterprise Plan";
    }
  };

  const getPlanDetails = (r: UserRole) => {
    switch (r) {
      case "Free":
        return { price: "AED 0.00", renewal: "N/A", desc: "Access limited Zyne VA platform guidance." };
      case "ZynePaid":
        return { price: "AED 290.00 / mo", renewal: "01 Aug 2026", desc: "Unlimited Zyne VC business diagnostics." };
      case "Hybrid":
        return { price: "AED 950.00 / mo", renewal: "01 Aug 2026", desc: "Core subscription with 2 human expert credits monthly." };
      case "Premium":
        return { price: "AED 1,950.00 / mo", renewal: "01 Aug 2026", desc: "High-tier plan with 5 human expert credits monthly." };
      case "Cancelled":
        return { price: "AED 0.00", renewal: "Expired", desc: "Read-only access to historical documents." };
      default:
        return { price: "Custom quote", renewal: "N/A", desc: "Enterprise support & proposals." };
    }
  };

  const plan = getPlanDetails(role);

  const handleTopUp = async () => {
    try {
      setLoadingStripe(true);
      const res = await createStripeCheckoutSessionFn({
        data: {
          amount: 450,
          productName: "Strategy Session Credit",
          isSubscription: false,
          planRole: role,
          successUrl: window.location.origin + "/dashboard/billing?success=true",
          cancelUrl: window.location.origin + "/dashboard/billing?canceled=true",
        }
      });
      if (res?.url) window.location.href = res.url;
    } catch (err: any) {
      alert(err.message || 'Failed to initialize checkout');
      setLoadingStripe(false);
    }
  };

  const handleTopUpZyne = async () => {
    try {
      setLoadingStripe(true);
      const res = await createStripeCheckoutSessionFn({
        data: {
          amount: 50,
          productName: "500 Zyne AI Tokens",
          isSubscription: false,
          isZyneToken: true,
          planRole: role,
          successUrl: window.location.origin + "/dashboard/billing?success=true",
          cancelUrl: window.location.origin + "/dashboard/billing?canceled=true",
        }
      });
      if (res?.url) window.location.href = res.url;
    } catch (err: any) {
      alert(err.message || 'Failed to initialize checkout');
      setLoadingStripe(false);
    }
  };

  const handleUpgrade = async (target: UserRole) => {
    try {
      setLoadingStripe(true);
      let amount = 0;
      let productName = "";
      if (target === "ZynePaid") { amount = 290; productName = "Zyne Paid AI-First"; }
      if (target === "Hybrid") { amount = 950; productName = "Think10 Hybrid Advisory"; }
      if (target === "Premium") { amount = 1950; productName = "Think10 Premium Advisory"; }
      
      const res = await createStripeCheckoutSessionFn({
        data: {
          amount,
          productName,
          isSubscription: true,
          planRole: target,
          successUrl: window.location.origin + "/dashboard/billing?success=true",
          cancelUrl: window.location.origin + "/dashboard/billing?canceled=true",
        }
      });
      if (res?.url) window.location.href = res.url;
    } catch (err: any) {
      alert(err.message || 'Failed to initialize checkout');
      setLoadingStripe(false);
    }
  };

  const handleManageBilling = async () => {
    if (!userDoc?.stripeCustomerId) {
      alert("No active billing profile found.");
      return;
    }
    try {
      setLoadingStripe(true);
      const res = await createStripeCustomerPortalFn({
        data: {
          customerId: userDoc.stripeCustomerId,
          returnUrl: window.location.href
        }
      });
      if (res?.url) window.location.href = res.url;
    } catch (err: any) {
      alert(err.message || 'Failed to open customer portal');
      setLoadingStripe(false);
    }
  };

  const handleSaveOfferDowngrade = () => {
    setRole("ZynePaid");
    setShowCancelModal(false);
    setSuccessMsg("Membership downgraded to Zyne Paid (AI-First). Your context history remains secure.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSaveOfferDiscount = () => {
    setShowCancelModal(false);
    setSuccessMsg("Discount accepted! 50% off has been applied to your next monthly billing cycle.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleConfirmCancel = () => {
    setRole("Cancelled");
    setShowCancelModal(false);
    setSuccessMsg("Subscription cancelled. Workspace transitioned to read-only historical mode.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs text-[color:var(--t10-navy)]">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold">Plan & Credits</h2>
        <p className="text-sm text-[color:var(--t10-grey)]">
          Manage your subscription plans, buy advisor credits, and audit ledger transactions.
        </p>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Plan Status + Credit Ledger */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Plan Overview */}
        <div className="space-y-6">
          {/* Active plan summary */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2 flex items-center gap-1.5">
              <CreditCard className="h-4.5 w-4.5 text-[color:var(--t10-emerald)]" /> Active Subscription Plan
            </h3>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-[color:var(--t10-grey)]">Current Tier</span>
              <h4 className="text-base font-bold">{getPlanName(role)}</h4>
              <p className="text-[11px] text-[color:var(--t10-grey)]">{plan.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-[color:var(--t10-grey)] block">
                  Recurring Cost
                </span>
                <p className="font-bold text-sm text-[color:var(--t10-navy)]">{plan.price}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[color:var(--t10-grey)] block">
                  Next Renewal
                </span>
                <p className="font-bold text-sm text-[color:var(--t10-navy)]">{plan.renewal}</p>
              </div>
            </div>

            {/* Cancel controls */}
            {role !== "Cancelled" && role !== "Free" && (
              <div className="pt-4 border-t border-[color:var(--t10-border)] flex items-center justify-between">
                <span className="text-[10px] text-[color:var(--t10-grey)]">Need to update payment method?</span>
                <button
                  onClick={handleManageBilling}
                  disabled={loadingStripe}
                  className="font-bold text-[color:var(--t10-navy)] hover:underline disabled:opacity-50"
                >
                  Manage Billing
                </button>
              </div>
            )}
            
            {role !== "Cancelled" && role !== "Free" && (
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-[color:var(--t10-grey)]">Want to suspend membership?</span>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="font-bold text-red-600 hover:underline"
                >
                  Cancel Plan
                </button>
              </div>
            )}
          </div>

          {/* Credit balance card */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2 flex items-center justify-between">
              <span>Strategy Session Credits</span>
              {role !== "Cancelled" && role !== "Free" && (
                <button
                  onClick={handleTopUp}
                  className="inline-flex items-center gap-1 rounded bg-[color:var(--t10-navy)] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Buy Credit (AED 450)
                </button>
              )}
            </h3>

            <div className="flex items-center gap-4">
              <div className="text-center rounded-xl bg-[color:var(--t10-mint)] border border-emerald-100 p-4 w-28 shrink-0">
                <span className="text-[9px] uppercase font-bold text-[color:var(--t10-grey)] block">
                  Balance
                </span>
                <p className="text-3xl font-bold text-[color:var(--t10-navy)]">{credits}</p>
                <span className="text-[9px] text-[color:var(--t10-grey)]">Credits</span>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[color:var(--t10-navy)] leading-normal">
                  1 credit = 60-min Strategy Session
                </p>
                <p className="text-[11px] text-[color:var(--t10-grey)] leading-normal">
                  Hybrid/Premium credits reset monthly. Purchase additional credits anytime for pay-per-call strategy reviews.
                </p>
              </div>
            </div>
          </div>

          {/* Zyne Tokens card */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2 flex items-center justify-between">
              <span>Zyne AI Tokens</span>
              <button
                onClick={handleTopUpZyne}
                disabled={loadingStripe}
                className="inline-flex items-center gap-1 rounded bg-black px-3 py-1.5 text-[10px] font-bold text-white hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" /> Buy Tokens (AED 50)
              </button>
            </h3>

            <div className="flex items-center gap-4">
              <div className="text-center rounded-xl bg-indigo-50 border border-indigo-100 p-4 w-28 shrink-0">
                <span className="text-[9px] uppercase font-bold text-indigo-400 block">
                  Balance
                </span>
                <p className={`text-3xl font-bold ${zyneTokens <= 0 ? 'text-red-500' : 'text-indigo-600'}`}>{zyneTokens}</p>
                <span className="text-[9px] text-indigo-400">Tokens</span>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[color:var(--t10-navy)] leading-normal">
                  1 token = 1 AI interaction
                </p>
                <p className="text-[11px] text-[color:var(--t10-grey)] leading-normal">
                  Zyne AI Tokens allow you to consult with your AI business advisor. Purchase 500 tokens for AED 50.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Credits Ledger Transaction Logs */}
        <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm flex flex-col justify-between h-[420px] overflow-hidden">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2 flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-[color:var(--t10-grey)]" /> Credits transaction ledger
            </h3>

            <div className="overflow-y-auto max-h-[300px] pr-1 space-y-2 text-[11px]">
              {creditsLedger.map((led) => {
                const isAdd = led.amount > 0;
                return (
                  <div
                    key={led.id}
                    className="rounded-lg border border-neutral-100 bg-[color:var(--t10-offwhite)] p-2.5 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-[color:var(--t10-navy)]">{led.description}</p>
                      <p className="text-[9px] text-neutral-400">{led.timestamp} · {led.status}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${isAdd ? "text-emerald-700" : "text-red-700"}`}>
                        {isAdd ? "+" : ""}
                        {led.amount}
                      </span>
                      <p className="text-[9px] text-neutral-400">Bal: {led.balanceAfter}</p>
                    </div>
                  </div>
                );
              })}
              {creditsLedger.length === 0 && (
                <p className="text-xs text-[color:var(--t10-grey)] italic text-center py-8">
                  No credit ledger history.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Invoices Table */}
      <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2">
          Billing Invoices & Receipts
        </h3>

        <div className="overflow-x-auto text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-[color:var(--t10-grey)] font-semibold">
                <th className="py-2.5">Invoice ID</th>
                <th className="py-2.5">Billing Date</th>
                <th className="py-2.5">Amount Billed</th>
                <th className="py-2.5">Payment Status</th>
                <th className="py-2.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-[color:var(--t10-navy)]">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 font-semibold">{inv.id}</td>
                  <td className="py-3 text-neutral-500">{inv.date}</td>
                  <td className="py-3 font-medium">{inv.amount}</td>
                  <td className="py-3">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="inline-flex items-center gap-1 font-bold text-[color:var(--t10-navy)] hover:text-[color:var(--t10-emerald)] transition-colors">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan comparison upgrade drawer */}
      <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2">
          Change Membership Tiers
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Zyne Paid Card */}
          <div className="rounded-xl border border-[color:var(--t10-border)] p-4 flex flex-col justify-between h-48 bg-[color:var(--t10-offwhite)]">
            <div>
              <p className="font-bold text-sm">Zyne Paid AI-First</p>
              <p className="text-neutral-500 text-[11px] mt-1 leading-normal">
                Perfect for validation and pricing calibration models.
              </p>
              <p className="mt-2 text-lg font-bold">AED 290 / mo</p>
            </div>
            <button
              onClick={() => handleUpgrade("ZynePaid")}
              disabled={role === "ZynePaid" || loadingStripe}
              className="w-full rounded bg-[color:var(--t10-navy)] py-1.5 font-bold text-white text-[11px] disabled:opacity-50 hover:bg-neutral-800 flex justify-center items-center gap-1"
            >
              {loadingStripe ? "Processing..." : (role === "ZynePaid" ? "Active" : "Downgrade to AI")}
            </button>
          </div>

          {/* Hybrid Card */}
          <div className="rounded-xl border border-[color:var(--t10-border)] p-4 flex flex-col justify-between h-48 bg-[color:var(--t10-offwhite)]">
            <div>
              <p className="font-bold text-sm">Hybrid Advisory</p>
              <p className="text-neutral-500 text-[11px] mt-1 leading-normal">
                Includes 2 strategy session credits and complete context lockers.
              </p>
              <p className="mt-2 text-lg font-bold">AED 950 / mo</p>
            </div>
            <button
              onClick={() => handleUpgrade("Hybrid")}
              disabled={role === "Hybrid" || loadingStripe}
              className="w-full rounded bg-[color:var(--t10-navy)] py-1.5 font-bold text-white text-[11px] disabled:opacity-50 hover:bg-neutral-800 flex justify-center items-center gap-1"
            >
              {loadingStripe ? "Processing..." : (role === "Hybrid" ? "Active" : "Switch to Hybrid")}
            </button>
          </div>

          {/* Premium Card */}
          <div className="rounded-xl border border-[color:var(--t10-border)] p-4 flex flex-col justify-between h-48 bg-[color:var(--t10-offwhite)]">
            <div>
              <p className="font-bold text-sm">Premium Advisory</p>
              <p className="text-neutral-500 text-[11px] mt-1 leading-normal">
                Includes 5 strategy credits, dedicated WhatsApp, priority slots.
              </p>
              <p className="mt-2 text-lg font-bold">AED 1,950 / mo</p>
            </div>
            <button
              onClick={() => handleUpgrade("Premium")}
              disabled={role === "Premium" || loadingStripe}
              className="w-full rounded bg-[color:var(--t10-navy)] py-1.5 font-bold text-white text-[11px] disabled:opacity-50 hover:bg-neutral-800 flex justify-center items-center gap-1"
            >
              {loadingStripe ? "Processing..." : (role === "Premium" ? "Active" : "Upgrade to Premium")}
            </button>
          </div>
        </div>
      </div>

      {/* CANCELLATION SAVE-OFFER DIALOG */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-2">
              <div className="flex items-center gap-1.5 text-red-700 font-bold">
                <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                <span>Suspending Membership</span>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="font-bold text-sm text-[color:var(--t10-navy)]">
                Wait Sarah! Don't lose your diagnostic history.
              </p>
              
              <div className="text-[11px] text-[color:var(--t10-grey)] leading-relaxed space-y-2">
                <p>
                  Think10 has advised <strong>AED 400M+ in GCC sales</strong>. If you cancel, your
                  advisor credits will be lost, and Zyne chat history will be archived.
                </p>
                
                <div className="rounded-lg bg-[color:var(--t10-mint)] border border-emerald-100 p-3 space-y-2">
                  <p className="font-bold text-[color:var(--t10-navy)] flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-[color:var(--t10-emerald)]" /> Downgrade to Zyne Paid (AI Only)
                  </p>
                  <p>
                    Keep all your cost sheets, health history, and Zyne memory intact for just{" "}
                    <strong>AED 290/mo</strong> (Free during current preview).
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid gap-2 border-t border-[color:var(--t10-border)] pt-4 text-xs font-semibold">
                <button
                  onClick={handleSaveOfferDowngrade}
                  className="w-full rounded-lg bg-[color:var(--t10-navy)] py-2 text-white hover:bg-neutral-800 transition-colors"
                >
                  Downgrade to Zyne Paid (Preserve Data)
                </button>
                <button
                  onClick={handleSaveOfferDiscount}
                  className="w-full rounded-lg border border-[color:var(--t10-emerald)] py-2 text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-mint)] transition-colors"
                >
                  Accept 50% discount off next month
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="w-full rounded-lg border border-red-200 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Proceed to Cancel Plan (Lose Credits)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
