import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { AdminStateProvider, useAdminState, type AdminRole } from "@/context/AdminStateContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarCheck,
  BrainCircuit,
  CircleDollarSign,
  ShieldAlert,
  Building2,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  UserCog,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayoutWrapper,
});

function AdminLayoutWrapper() {
  const { currentUser, userDoc, authLoading, docLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (authLoading || docLoading) return;
    if (currentUser) {
      if (!userDoc?.adminRole && userDoc?.email !== "admin@think10.ae") {
         navigate({ to: "/" });
      }
    }
  }, [currentUser, userDoc, authLoading, docLoading, navigate]);

  if (authLoading || docLoading) {
    return <div className="p-8 text-center">Loading Admin...</div>;
  }

  if (!currentUser) {
    return <AdminLoginView />;
  }

  if (!userDoc?.adminRole && userDoc?.email !== "admin@think10.ae") {
    return null;
  }

  return (
    <AdminStateProvider>
      <AdminLayout />
    </AdminStateProvider>
  );
}

function AdminLayout() {
  const { adminRole } = useAdminState();
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { to: "/admin", icon: LayoutDashboard, label: "Command Centre" },
    { to: "/admin/customers", icon: Users, label: "Customers" },
    { to: "/admin/consultants", icon: Briefcase, label: "Consultants" },
    { to: "/admin/bookings", icon: CalendarCheck, label: "Bookings & Delivery" },
    { to: "/admin/ai", icon: BrainCircuit, label: "Zyne & AI" },
    { to: "/admin/finance", icon: CircleDollarSign, label: "Revenue & Finance" },
    { to: "/admin/quality", icon: ShieldAlert, label: "Quality, Risk & Support" },
    { to: "/admin/crm", icon: Building2, label: "Enterprise CRM" },
    { to: "/admin/growth", icon: TrendingUp, label: "Growth & Content" },
    { to: "/admin/users", icon: UserCog, label: "System Users" },
    { to: "/admin/settings", icon: Settings, label: "Reports & Settings" },
  ];

  return (
    <div className="flex h-screen w-full bg-neutral-100 font-sans text-neutral-900">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-neutral-200 bg-white shadow-sm shrink-0 h-full overflow-y-auto z-10 relative">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-neutral-200">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo/t10-brand-logo.svg?v=2" alt="Think10" className="h-6 w-[109px] shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold border border-neutral-200 rounded px-1.5 py-0.5 ml-1">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 [&.active]:bg-[color:var(--t10-mint)] [&.active]:text-[color:var(--t10-emerald)] transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <button 
            onClick={() => navigate({ to: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">Platform Control</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                Role: {adminRole}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function parseFirebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/user-not-found": "No account found with this email.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

function AdminLoginView() {
  const { signInWithEmail, loading: contextLoading } = useAuth() as any;
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!loginEmail || !loginPassword) { setErrorMsg("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[color:var(--t10-offwhite)] t10-grid-bg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[color:var(--t10-border)] shadow-2xl overflow-hidden p-8 md:p-10">
        <div className="flex flex-col items-center justify-center space-y-2 mb-6">
            <img src="/logo/t10-brand-logo.svg" alt="Think10" className="h-10 w-auto mb-2" />
            <h1 className="text-2xl font-bold text-[color:var(--t10-navy)] font-display text-center">Admin Portal</h1>
            <p className="text-xs text-[color:var(--t10-grey)] text-center">Authorized personnel only.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{errorMsg}</div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
          <label className="block space-y-1.5">
            <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Admin Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@think10.ae"
                autoComplete="email"
                className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all"
              />
            </div>
          </label>
          <label className="block space-y-1.5">
            <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
              <input
                type={showLoginPw ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-10 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all"
              />
              <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer" aria-label="Toggle password">
                {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--t10-navy)] py-2.5 font-bold text-white hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow text-sm cursor-pointer"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "LOGIN TO ADMIN"}
          </button>
        </form>
      </div>
      <Link
        to="/"
        className="mt-6 flex items-center gap-1.5 text-xs text-[color:var(--t10-grey)] hover:text-[color:var(--t10-navy)] font-semibold transition-colors cursor-pointer"
      >
        Back to Think10
      </Link>
    </div>
  );
}
