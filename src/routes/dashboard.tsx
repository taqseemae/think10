import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useDashboardState, type UserRole } from "@/context/DashboardStateContext";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  ClipboardList,
  FileText,
  Folder,
  Settings,
  CreditCard,
  HelpCircle,
  Users,
  Sparkles,
  AlertTriangle,
  X,
} from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  head: () => ({
    meta: [{ title: "Command Centre | Think10" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
});

function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const {
    role,
    floatingAlert,
    setFloatingAlert,
    credits,
    onboardingCompleted,
    logout,
    isLoggedIn,
  } = useDashboardState();
  const { authLoading, docLoading, userDoc, currentUser } = useAuth();

  const navigate = useNavigate();

  // Route Gating: wait for Firebase to resolve auth state first
  useEffect(() => {
    if (authLoading || docLoading) return; // Still loading — don't redirect yet
    if (!isLoggedIn) {
      navigate({ to: "/login" });
      return;
    }

    // Role-based redirection out of the user dashboard
    if (userDoc?.adminRole || userDoc?.email === "admin@think10.ae" || currentUser?.email === "admin@think10.ae") {
      navigate({ to: "/admin" });
      return;
    }
    if (userDoc?.plan?.role === "Consultant") {
      navigate({ to: "/consultant" });
      return;
    }

    if (!onboardingCompleted && pathname !== "/dashboard" && pathname !== "/dashboard/") {
      navigate({ to: "/dashboard" });
    }
  }, [isLoggedIn, authLoading, docLoading, onboardingCompleted, pathname, userDoc, navigate]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  // Show nothing while auth is still loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--t10-offwhite)]">
        <div className="flex flex-col items-center gap-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--t10-navy)] text-white shadow-sm animate-pulse">
            <span className="h-3 w-3 rounded-full border-2 border-white" />
          </span>
          <p className="text-xs font-semibold text-[color:var(--t10-grey)] tracking-wider uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  // Dynamic navigation based on role permissions
  const NAV_ITEMS = [
    { to: "/dashboard", label: "Overview", Icon: LayoutDashboard, exact: true, show: true },
    { to: "/dashboard/zyne", label: "Ask Zyne", Icon: MessageSquare, show: true },
    { to: "/dashboard/advisors", label: "Advisors", Icon: Users, show: role !== "Cancelled" },
    { to: "/dashboard/sessions", label: "Bookings", Icon: Calendar, show: true },
    { to: "/dashboard/action-plans", label: "Action Plans", Icon: ClipboardList, show: true },
    { to: "/dashboard/business-profile", label: "My Business", Icon: Folder, show: true },
    { to: "/dashboard/documents", label: "Documents", Icon: FileText, show: true },
    { to: "/dashboard/billing", label: "Plan & Credits", Icon: CreditCard, show: true },
    { to: "/dashboard/community", label: "Community & Help", Icon: HelpCircle, show: true },
    { to: "/dashboard/settings", label: "Settings", Icon: Settings, show: true },
  ];



  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--t10-offwhite)] text-foreground">
      {/* Dashboard Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-[color:var(--t10-border)] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-3" aria-label="Think10 dashboard home">
            <img src="/logo/t10-brand-logo.svg?v=2" alt="Think10 Command Centre" className="h-[44px] w-[200px] object-contain object-left shrink-0" />
            <span className="leading-tight hidden sm:block">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-[color:var(--t10-grey)] mt-1">
                Command Centre
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center rounded-full bg-[color:var(--t10-mint)] px-2.5 py-0.5 text-xs font-semibold text-[color:var(--t10-navy)] border border-emerald-100">
              {role} Plan
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold text-[color:var(--t10-navy)] hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      </header>


      {/* Floating System alerts */}
      {floatingAlert && (
        <div className={`border-b px-4 py-3 text-sm ${floatingAlert.type === "error" ? "bg-red-50 border-red-200 text-red-900" : floatingAlert.type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-900" : "bg-emerald-50 border-emerald-200 text-emerald-900"}`}>
          <div className="t10-container flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 shrink-0 ${floatingAlert.type === "error" ? "text-red-500" : floatingAlert.type === "warning" ? "text-yellow-500" : "text-emerald-500"}`} />
              <span>{floatingAlert.message}</span>
              {floatingAlert.actionLabel && floatingAlert.actionTo && (
                <Link
                  to={floatingAlert.actionTo}
                  className="ml-3 font-semibold underline text-xs"
                >
                  {floatingAlert.actionLabel}
                </Link>
              )}
            </div>
            {floatingAlert.dismissible && (
              <button
                onClick={() => setFloatingAlert(null)}
                className="rounded-full p-1 hover:bg-black/5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      <main className="flex-grow py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {docLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-[color:var(--t10-border)] shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--t10-navy)] text-white shadow animate-pulse">
                <span className="h-3 w-3 rounded-full border-2 border-white" />
              </span>
              <p className="mt-4 text-xs font-bold text-[color:var(--t10-navy)] tracking-wider uppercase">Loading Command Centre...</p>
            </div>
          ) : (
            <>
              {onboardingCompleted ? (
                <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--t10-emerald)] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Command Centre — {role} preview
                    </p>
                    {role !== "Free" && role !== "Cancelled" && (
                      <span className="rounded-full bg-[color:var(--t10-mint)] px-2.5 py-0.5 text-xs font-semibold text-[color:var(--t10-navy)]">
                        Human credits: {credits}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 border-t border-[color:var(--t10-border)] pt-3">
                    {NAV_ITEMS.filter((n) => n.show).map(({ to, label, Icon, exact }) => {
                      const active = exact ? pathname === to : pathname.startsWith(to);
                      return (
                        <Link
                          key={to}
                          to={to}
                          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all ${active ? "bg-[color:var(--t10-navy)] text-white shadow-sm font-semibold" : "text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-mint)]"}`}
                        >
                          <Icon className="h-4 w-4" /> {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-center shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" /> Complete Onboarding to Unlock Command Centre
                  </p>
                </div>
              )}
              <div className="mt-6">
                <Outlet />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
