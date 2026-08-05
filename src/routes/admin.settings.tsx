import { createFileRoute } from "@tanstack/react-router";
import { useAdminState } from "@/context/AdminStateContext";
import {
  Settings, BarChart3, FileDown, ShieldCheck, CreditCard,
  Users, Plug2, ScrollText, Save, Plus, Trash2, Edit2,
  CheckCircle2, X, Download, RefreshCw, Lock, Bell,
  Globe, Zap, AlertTriangle, FileText, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AvatarCropperModal } from "@/components/AvatarCropperModal";
import { updateUserProfileByAdminFn } from "@/lib/server-actions";

export const Route = createFileRoute("/admin/settings")({
  component: ReportsAndSettings,
});

// ── Plan definitions ──────────────────────────────────────────────────────────
const DEFAULT_PLANS = [
  { id: "free", name: "Free", price: 0, currency: "AED", billing: "month", zyneLimit: 5, bookingCredits: 0, features: ["5 Zyne AI messages/month", "Platform access", "Community read-only"] },
  { id: "zyne", name: "ZynePaid", price: 290, currency: "AED", billing: "month", zyneLimit: 50, bookingCredits: 0, features: ["50 Zyne AI messages/month", "Full platform access", "Community access", "Priority support"] },
  { id: "hybrid", name: "Hybrid", price: 950, currency: "AED", billing: "month", zyneLimit: 150, bookingCredits: 1, features: ["150 Zyne AI messages/month", "1 expert session/month", "Document vault", "Business profile"] },
  { id: "premium", name: "Premium", price: 2500, currency: "AED", billing: "month", zyneLimit: -1, bookingCredits: 3, features: ["Unlimited Zyne messages", "3 expert sessions/month", "Priority consultant matching", "Quarterly review"] },
  { id: "enterprise", name: "Enterprise", price: 5000, currency: "AED", billing: "month", zyneLimit: -1, bookingCredits: -1, features: ["Unlimited Zyne messages", "Unlimited sessions", "Dedicated advisor", "Custom SLA", "API access"] },
];

// ── Admin roles definition ──────────────────────────────────────────────────
const ADMIN_ROLE_DEFS = [
  { role: "Super Admin", desc: "Full platform access — all modules, billing, user management, settings.", color: "bg-red-50 text-red-700 border-red-200" },
  { role: "Founder / Executive", desc: "Strategic KPIs, revenue scorecards, task approvals.", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { role: "Operations Manager", desc: "Bookings, consultant scheduling, delivery oversight.", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { role: "Consultant Verification", desc: "Review consultant applications, approve/reject profiles.", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { role: "Quality & Compliance", desc: "Complaints, SLA monitoring, audit flags.", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { role: "Finance", desc: "Revenue reports, payouts, refunds, financial KPIs.", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { role: "Customer Support", desc: "Support tickets, user issues, refund requests.", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { role: "Enterprise Sales / CRM", desc: "Enterprise leads, proposals, CRM pipeline.", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { role: "Marketing / Content", desc: "Growth campaigns, content, blog, SEO.", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { role: "AI Operations", desc: "Zyne API health, AI flags, usage analytics.", color: "bg-violet-50 text-violet-700 border-violet-200" },
  { role: "Data / Analyst", desc: "Read-only access to all reports and dashboards.", color: "bg-neutral-100 text-neutral-700 border-neutral-200" },
];



import { ColorSchemePicker } from "@/components/ui/ColorSchemePicker";
import { User, Camera, Upload } from "lucide-react";

type Tab = "profile" | "reports" | "plans" | "roles" | "rules" | "audit" | "general";

function ReportsAndSettings() {
  const { users, bookings, transactions, metrics } = useAdminState();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const TABS = [
    { key: "profile", label: "Profile & Color Scheme", icon: User },
    { key: "reports", label: "Report Builder", icon: BarChart3 },
    { key: "plans", label: "Plans", icon: CreditCard },
    { key: "roles", label: "Roles & Permissions", icon: ShieldCheck },
    { key: "rules", label: "Rules", icon: Zap },
    { key: "audit", label: "Audit Log", icon: ScrollText },
    { key: "general", label: "General", icon: Settings },
  ] as const;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2 font-display">
          <Settings className="h-6 w-6 text-[color:var(--t10-emerald)]" />
          Reports & Settings
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Edit profile, customize admin workspace color scheme, build reports, and manage platform controls.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.key
                ? "border-[color:var(--t10-emerald)] text-[color:var(--t10-emerald)]"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "profile" && <AdminProfileTab />}
        {activeTab === "reports" && <ReportsTab users={users} bookings={bookings} transactions={transactions} metrics={metrics} />}
        {activeTab === "plans" && <PlansTab />}
        {activeTab === "roles" && <RolesTab />}
        {activeTab === "rules" && <RulesTab />}
        {activeTab === "audit" && <AuditTab users={users} bookings={bookings} />}
        {activeTab === "general" && <GeneralTab />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Admin Profile & Color Scheme
// ═══════════════════════════════════════════════════════════════════════════════
function AdminProfileTab() {
  const { currentUser, userDoc } = useAuth();
  const [displayName, setDisplayName] = useState(userDoc?.displayName || currentUser?.displayName || "System Administrator");
  const [email] = useState(currentUser?.email || "admin.think10@gmail.com");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userDoc?.photoURL || currentUser?.photoURL || null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const { refreshUserDoc } = useAuth();
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await updateUserProfileByAdminFn({
        data: {
          uid: currentUser.uid,
          displayName,
          photoURL: avatarUrl || undefined,
          profilePic: avatarUrl || undefined, // For backwards compatibility
        }
      });
      await refreshUserDoc();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    }
  };

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (!currentUser) return;
    
    setPasswordLoading(true);
    try {
      const { updatePassword } = await import("firebase/auth");
      await updatePassword(currentUser, newPassword);
      setPasswordSuccess("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        setPasswordError("Security restriction: Please log out and log back in to change your password.");
      } else if (err.code === "auth/operation-not-allowed" || err.message?.includes("provider")) {
        setPasswordError("You logged in using Google or Phone. You cannot set a password.");
      } else {
        setPasswordError(err.message || "Failed to update password.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedSuccess && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Admin profile and preferences updated successfully!
        </div>
      )}

      {/* WordPress-Style Color Scheme Picker */}
      <ColorSchemePicker
        title="Admin Color Scheme"
        subtitle="Choose your preferred workspace color theme. The theme dynamically changes colors and logo aesthetics."
      />

      {/* Admin Profile Form */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 font-display">Personal Details</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Manage your display profile and avatar picture.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group cursor-pointer">
              <div className="h-20 w-20 rounded-full bg-[color:var(--t10-navy)] text-white flex items-center justify-center text-xl font-bold uppercase overflow-hidden border-2 border-[color:var(--t10-border)] shadow">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  (displayName || "AD").slice(0, 2)
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Camera className="h-5 w-5" />
                <span className="text-[9px] font-bold mt-1">Upload</span>
                <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
              </label>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-neutral-800">Profile Picture</p>
              <p className="text-[11px] text-neutral-500">JPG, PNG or GIF. Max size 2MB.</p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors mt-2">
                <Upload className="h-3.5 w-3.5" /> Upload Image
                <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-[color:var(--t10-emerald)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[color:var(--t10-navy)] text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 font-display">Change Password</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Update your account password. You may be asked to log in again.</p>
        </div>

        {passwordError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-bold text-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 py-2 pl-9 pr-3 text-sm focus:border-[color:var(--t10-emerald)] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 py-2 pl-9 pr-3 text-sm focus:border-[color:var(--t10-emerald)] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2.5 bg-neutral-800 text-white rounded-lg text-xs font-bold hover:bg-black transition-all shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {passwordLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
      
      <AvatarCropperModal 
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={tempImageSrc}
        onCropComplete={(croppedBase64) => setAvatarUrl(croppedBase64)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Reports Builder
// ═══════════════════════════════════════════════════════════════════════════════
function ReportsTab({ users, bookings, transactions, metrics }: any) {
  const [selectedReport, setSelectedReport] = useState("user_summary");
  const [exporting, setExporting] = useState(false);

  const REPORT_TYPES = [
    { id: "user_summary", label: "User Summary", icon: Users },
    { id: "revenue", label: "Revenue Report", icon: CreditCard },
    { id: "booking_analytics", label: "Booking Analytics", icon: BarChart3 },
    { id: "consultant_performance", label: "Consultant Performance", icon: ShieldCheck },
  ];

  const handleExport = (format: "csv" | "json") => {
    setExporting(true);
    setTimeout(() => {
      let data: any[] = [];
      let filename = "";

      if (selectedReport === "user_summary") {
        data = users.map((u: any) => ({
          name: u.displayName || "", email: u.email, role: u.plan?.role || "Free",
          adminRole: u.adminRole || "", status: u.plan?.status || "Active",
          createdAt: u.createdAt || "",
        }));
        filename = "think10_users";
      } else if (selectedReport === "revenue") {
        data = transactions.map((t: any) => ({
          id: t.id || t._id, userId: t.userId, email: t.userEmail,
          amount: t.amount, description: t.description || t.type,
          createdAt: t.createdAt || "",
        }));
        filename = "think10_revenue";
      } else if (selectedReport === "booking_analytics") {
        data = bookings.map((b: any) => ({
          id: b.id || b._id, userId: b.userId, consultant: b.consultantName || b.expertSlug,
          status: b.status, scheduledAt: b.scheduledAt || "",
        }));
        filename = "think10_bookings";
      }

      if (format === "csv") {
        if (!data.length) { setExporting(false); return; }
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map((row) => Object.values(row).map(v => `"${v}"`).join(","));
        const blob = new Blob([headers + "\n" + rows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `${filename}.csv`; a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `${filename}.json`; a.click();
        URL.revokeObjectURL(url);
      }
      setExporting(false);
    }, 600);
  };

  const totalCustomers = users.filter((u: any) => !u.adminRole && u.email !== "admin.think10@gmail.com" && u.plan?.role !== "Consultant" && u.plan?.role !== "ConsultantPending").length;
  const paidCustomers = users.filter((u: any) => ["ZynePaid", "Hybrid", "Premium", "Enterprise"].includes(u.plan?.role)).length;
  const totalRev = transactions.reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0);
  const completedBookings = bookings.filter((b: any) => b.status === "COMPLETED").length;

  return (
    <div className="space-y-5">
      {/* KPI summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: users.length, color: "text-[color:var(--t10-navy)]" },
          { label: "Paid Customers", value: paidCustomers, color: "text-emerald-700" },
          { label: "Total Revenue", value: `AED ${totalRev.toLocaleString()}`, color: "text-emerald-700" },
          { label: "Completed Bookings", value: completedBookings, color: "text-[color:var(--t10-navy)]" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">{kpi.label}</p>
            <p className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Report selector + export */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50/80">
          <h3 className="font-bold text-sm text-[color:var(--t10-navy)] flex items-center gap-2">
            <FileText className="h-4 w-4 text-[color:var(--t10-emerald)]" /> Report Builder
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {exporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Export CSV
            </button>
            <button
              onClick={() => handleExport("json")}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color:var(--t10-navy)] text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileDown className="h-3.5 w-3.5" /> Export JSON
            </button>
          </div>
        </div>

        {/* Report type pills */}
        <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-neutral-100">
          {REPORT_TYPES.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                selectedReport === r.id
                  ? "bg-[color:var(--t10-navy)] text-white border-[color:var(--t10-navy)]"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-[color:var(--t10-emerald)]"
              }`}
            >
              <r.icon className="h-3 w-3" /> {r.label}
            </button>
          ))}
        </div>

        {/* Data preview table */}
        <div className="overflow-x-auto max-h-64">
          {selectedReport === "user_summary" && (
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Name</th><th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Plan</th><th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {users.slice(0, 20).map((u: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-4 py-2 font-medium text-neutral-800">{u.displayName || "—"}</td>
                    <td className="px-4 py-2 text-neutral-600">{u.email}</td>
                    <td className="px-4 py-2">{u.plan?.role || "Free"}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.plan?.status === "Suspended" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>
                        {u.plan?.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-neutral-400">No data loaded yet.</td></tr>}
              </tbody>
            </table>
          )}
          {selectedReport === "revenue" && (
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">User</th><th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5">Amount (AED)</th><th className="px-4 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {transactions.slice(0, 20).map((t: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-4 py-2 font-medium text-neutral-800">{t.userEmail || t.userId || "—"}</td>
                    <td className="px-4 py-2 text-neutral-600">{t.description || t.type || "—"}</td>
                    <td className="px-4 py-2 font-bold text-emerald-700">AED {Number(t.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-neutral-500">{t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-AE") : "—"}</td>
                  </tr>
                ))}
                {transactions.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-neutral-400">No transaction data yet.</td></tr>}
              </tbody>
            </table>
          )}
          {selectedReport === "booking_analytics" && (
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">User</th><th className="px-4 py-2.5">Consultant</th>
                  <th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Scheduled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {bookings.slice(0, 20).map((b: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-4 py-2 font-medium text-neutral-800">{b.userEmail || b.userId || "—"}</td>
                    <td className="px-4 py-2 text-neutral-600">{b.consultantName || b.expertSlug || "—"}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : b.status === "CANCELLED" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-neutral-500">{b.scheduledAt ? new Date(b.scheduledAt).toLocaleDateString("en-AE") : "—"}</td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-neutral-400">No booking data yet.</td></tr>}
              </tbody>
            </table>
          )}
          {selectedReport === "consultant_performance" && (
            <div className="px-5 py-8 text-center text-neutral-400 text-sm">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Consultant performance analytics will be calculated from booking completion rates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Plans Management
// ═══════════════════════════════════════════════════════════════════════════════
function PlansTab() {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!editingPlan) return;
    setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? editingPlan : p)));
    setEditingPlan(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Plan saved successfully.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
            <div className={`px-5 py-4 border-b border-neutral-100 ${plan.price === 0 ? "bg-neutral-50" : plan.price >= 2500 ? "bg-[color:var(--t10-navy)]" : "bg-[color:var(--t10-mint)]"}`}>
              <p className={`font-black text-base ${plan.price >= 2500 ? "text-white" : "text-[color:var(--t10-navy)]"}`}>{plan.name}</p>
              <p className={`text-2xl font-black mt-0.5 ${plan.price >= 2500 ? "text-[color:var(--t10-emerald)]" : "text-[color:var(--t10-navy)]"}`}>
                {plan.price === 0 ? "Free" : `AED ${plan.price.toLocaleString()}`}
                {plan.price > 0 && <span className={`text-xs font-normal ml-1 ${plan.price >= 2500 ? "text-white/60" : "text-neutral-500"}`}>/mo</span>}
              </p>
            </div>
            <div className="p-4 flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-neutral-500">Zyne Messages</p>
                  <p className="font-bold text-neutral-800">{plan.zyneLimit === -1 ? "∞ Unlimited" : `${plan.zyneLimit}/mo`}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Expert Sessions</p>
                  <p className="font-bold text-neutral-800">{plan.bookingCredits === -1 ? "∞ Unlimited" : plan.bookingCredits === 0 ? "None" : `${plan.bookingCredits}/mo`}</p>
                </div>
              </div>
              <ul className="space-y-1 pt-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-neutral-600">
                    <CheckCircle2 className="h-3 w-3 text-[color:var(--t10-emerald)] shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => setEditingPlan({ ...plan })}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-[color:var(--t10-navy)]">
              <p className="font-bold text-white">Edit Plan — {editingPlan.name}</p>
              <button onClick={() => setEditingPlan(null)} className="text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 uppercase tracking-wider text-[10px] mb-1">Plan Name</label>
                <input value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--t10-emerald)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-600 uppercase tracking-wider text-[10px] mb-1">Price (AED/mo)</label>
                  <input type="number" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--t10-emerald)]" />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 uppercase tracking-wider text-[10px] mb-1">Zyne Limit (-1 = ∞)</label>
                  <input type="number" value={editingPlan.zyneLimit} onChange={(e) => setEditingPlan({ ...editingPlan, zyneLimit: Number(e.target.value) })} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--t10-emerald)]" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase tracking-wider text-[10px] mb-1">Expert Sessions/mo (-1 = ∞, 0 = none)</label>
                <input type="number" value={editingPlan.bookingCredits} onChange={(e) => setEditingPlan({ ...editingPlan, bookingCredits: Number(e.target.value) })} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--t10-emerald)]" />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase tracking-wider text-[10px] mb-2">Features (one per line)</label>
                <textarea
                  rows={4}
                  value={editingPlan.features.join("\n")}
                  onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split("\n").filter(Boolean) })}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--t10-emerald)] resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditingPlan(null)} className="flex-1 py-2 border border-neutral-200 rounded-lg text-neutral-600 font-semibold hover:bg-neutral-50">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2 bg-[color:var(--t10-navy)] text-white rounded-lg font-bold hover:opacity-90 flex items-center justify-center gap-1.5">
                  <Save className="h-3.5 w-3.5" /> Save Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Roles & Permissions
// ═══════════════════════════════════════════════════════════════════════════════
function RolesTab() {
  const MODULE_ACCESS: Record<string, string[]> = {
    "Super Admin": ["Command Centre", "Users", "Customers", "Consultants", "Bookings", "Finance", "Quality", "CRM", "Growth", "Reports & Settings"],
    "Founder / Executive": ["Command Centre", "Bookings", "Finance", "CRM", "Reports & Settings"],
    "Operations Manager": ["Command Centre", "Bookings", "Consultants", "Customers"],
    "Consultant Verification": ["Consultants"],
    "Quality & Compliance": ["Quality", "Bookings"],
    "Finance": ["Finance", "Reports & Settings"],
    "Customer Support": ["Customers", "Quality"],
    "Enterprise Sales / CRM": ["CRM", "Customers"],
    "Marketing / Content": ["Growth"],
    "AI Operations": ["Command Centre"],
    "Data / Analyst": ["Reports & Settings"],
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500">
        Role-based access control (RBAC). Each admin user is assigned one role which determines which modules they can access.
      </p>
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Module Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {ADMIN_ROLE_DEFS.map((r) => (
              <tr key={r.role} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${r.color}`}>
                    {r.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-neutral-600 max-w-xs">{r.desc}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {(MODULE_ACCESS[r.role] || []).map((mod) => (
                      <span key={mod} className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-medium border border-neutral-200">
                        {mod}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Rules / Automation
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_RULES = [
  { id: "r1", name: "Auto-suspend on 3 failed payments", trigger: "Payment Failed × 3", action: "Suspend Account", status: "active" },
  { id: "r2", name: "Free trial expires after 14 days", trigger: "Account Age > 14 days", action: "Downgrade to Free (locked)", status: "active" },
  { id: "r3", name: "Consultant pending review alert", trigger: "New ConsultantPending signup", action: "Notify Consultant Verification team", status: "active" },
  { id: "r4", name: "Zyne limit warning at 80%", trigger: "Zyne messages ≥ 80% of plan limit", action: "Send upgrade nudge email", status: "active" },
  { id: "r5", name: "Auto-close resolved tickets after 7 days", trigger: "Ticket status = Resolved AND age > 7 days", action: "Archive ticket", status: "inactive" },
];

function RulesTab() {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", trigger: "", action: "" });

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r));
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const addRule = () => {
    if (!newRule.name || !newRule.trigger || !newRule.action) return;
    setRules((prev) => [...prev, { id: `r${Date.now()}`, ...newRule, status: "active" }]);
    setNewRule({ name: "", trigger: "", action: "" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">Automation rules that trigger platform actions based on events.</p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[color:var(--t10-navy)] text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add Rule
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3">Rule</th>
              <th className="px-5 py-3">Trigger</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-neutral-800">{rule.name}</td>
                <td className="px-5 py-3.5 text-neutral-500">{rule.trigger}</td>
                <td className="px-5 py-3.5 text-neutral-600">{rule.action}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => toggleRule(rule.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${rule.status === "active" ? "bg-[color:var(--t10-emerald)]" : "bg-neutral-200"}`}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${rule.status === "active" ? "translate-x-4" : "translate-x-1"}`} />
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => deleteRule(rule.id)} className="text-neutral-300 hover:text-red-500 transition-colors cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[color:var(--t10-navy)]">Add Automation Rule</p>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-neutral-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 uppercase tracking-wider text-[10px] mb-1">Rule Name</label>
                <input value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--t10-emerald)]" placeholder="e.g. Send welcome email on signup" />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase tracking-wider text-[10px] mb-1">Trigger Condition</label>
                <input value={newRule.trigger} onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--t10-emerald)]" placeholder="e.g. User role = Free AND age > 7 days" />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase tracking-wider text-[10px] mb-1">Action</label>
                <input value={newRule.action} onChange={(e) => setNewRule({ ...newRule, action: e.target.value })} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--t10-emerald)]" placeholder="e.g. Send upgrade email" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-neutral-200 rounded-lg text-neutral-600 text-sm font-semibold hover:bg-neutral-50">Cancel</button>
              <button onClick={addRule} className="flex-1 py-2 bg-[color:var(--t10-navy)] text-white rounded-lg text-sm font-bold hover:opacity-90">Add Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Audit Log
// ═══════════════════════════════════════════════════════════════════════════════
function AuditTab({ users, bookings }: any) {
  const [logs, setLogs] = useState(() => {
    const now = new Date();
    return [
      ...users.slice(0, 8).map((u: any, i: number) => ({
        time: new Date(now.getTime() - (i + 1) * 3600000 * 2).toISOString(),
        actor: "System",
        event: "User registered",
        target: u.email,
        severity: "info",
      })),
      ...bookings.slice(0, 5).map((b: any, i: number) => ({
        time: new Date(now.getTime() - (i + 1) * 3600000 * 5).toISOString(),
        actor: b.userId || "user",
        event: `Booking ${b.status?.toLowerCase()}`,
        target: b.consultantName || b.expertSlug || "Session",
        severity: b.status === "CANCELLED" ? "warn" : "info",
      })),
      { time: new Date(now.getTime() - 300000).toISOString(), actor: "admin.think10@gmail.com", event: "Admin login", target: "Admin Panel", severity: "info" },
      { time: new Date(now.getTime() - 900000).toISOString(), actor: "admin.think10@gmail.com", event: "Settings updated", target: "Platform Settings", severity: "info" },
      { time: new Date(now.getTime() - 1800000).toISOString(), actor: "System", event: "Failed payment attempt", target: "user@example.com", severity: "error" },
      { time: new Date(now.getTime() - 7200000).toISOString(), actor: "admin.think10@gmail.com", event: "User suspended", target: "suspect@example.com", severity: "warn" },
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  });

  const [filter, setFilter] = useState("all");

  const filtered = logs.filter((e) => filter === "all" || e.severity === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">Chronological record of all platform events and admin actions.</p>
        <div className="flex gap-4 items-center">
          <div className="flex gap-1">
            {["all", "info", "warn", "error"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${filter === f ? "bg-[color:var(--t10-navy)] text-white border-[color:var(--t10-navy)]" : "bg-white text-neutral-600 border-neutral-200 hover:border-[color:var(--t10-emerald)]"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => { if(confirm("Are you sure you want to clear the audit log? This cannot be undone.")) setLogs([]) }} className="px-3 py-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-colors cursor-pointer">
            Clear Log
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-y-auto max-h-[480px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map((evt, i) => (
                <tr key={i} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3 text-neutral-500 font-mono">
                    {new Date(evt.time).toLocaleString("en-AE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3 font-semibold text-neutral-800">{evt.actor}</td>
                  <td className="px-5 py-3 text-neutral-700">{evt.event}</td>
                  <td className="px-5 py-3 text-neutral-500">{evt.target}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${evt.severity === "error" ? "bg-red-100 text-red-700" : evt.severity === "warn" ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-600"}`}>
                      {evt.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-neutral-400">No audit events.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: General Settings
// ═══════════════════════════════════════════════════════════════════════════════
function GeneralTab() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newConsultantAlert, setNewConsultantAlert] = useState(true);
  const [newTicketAlert, setNewTicketAlert] = useState(true);

  return (
    <div className="space-y-5 max-w-2xl">

      <SettingsSection title="Security" icon={Lock}>
        <SettingRow label="Admin Email" desc="Super admin account — cannot be changed here.">
          <input type="email" defaultValue="admin.think10@gmail.com" readOnly className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50 text-neutral-500 cursor-not-allowed" />
        </SettingRow>

      </SettingsSection>

      <SettingsSection title="Notifications" icon={Bell}>
        <SettingRow label="Email Notifications" desc="Receive platform alerts by email.">
          <Toggle on={emailNotifications} onChange={setEmailNotifications} />
        </SettingRow>
        <SettingRow label="New Consultant Signup" desc="Alert when a consultant registers.">
          <Toggle on={newConsultantAlert} onChange={setNewConsultantAlert} />
        </SettingRow>
        <SettingRow label="New Support Ticket" desc="Alert when a ticket is opened.">
          <Toggle on={newTicketAlert} onChange={setNewTicketAlert} />
        </SettingRow>
      </SettingsSection>

      <button className="flex items-center gap-2 px-5 py-2.5 bg-[color:var(--t10-navy)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer">
        <Save className="h-4 w-4" /> Save Settings
      </button>
    </div>
  );
}

// ── Shared UI components ──────────────────────────────────────────────────────
function SettingsSection({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-neutral-200 bg-neutral-50/80">
        <Icon className="h-4 w-4 text-[color:var(--t10-emerald)]" />
        <h3 className="font-bold text-sm text-[color:var(--t10-navy)]">{title}</h3>
      </div>
      <div className="divide-y divide-neutral-100">{children}</div>
    </div>
  );
}

function SettingRow({ label, desc, children }: any) {
  return (
    <div className="flex items-center justify-between gap-6 p-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800">{label}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0 w-52">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${on ? "bg-[color:var(--t10-emerald)]" : "bg-neutral-200"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}
