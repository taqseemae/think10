import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { AdminStateProvider, useAdminState, type AdminRole } from "@/context/AdminStateContext";
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
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayoutWrapper,
});

const ADMIN_ROLES: AdminRole[] = [
  "Super Admin",
  "Founder / Executive",
  "Operations Manager",
  "Consultant Verification",
  "Quality & Compliance",
  "Finance",
  "Customer Support",
  "Enterprise Sales / CRM",
  "Marketing / Content",
  "AI Operations",
  "Data / Analyst"
];

function AdminLayoutWrapper() {
  return (
    <AdminStateProvider>
      <AdminLayout />
    </AdminStateProvider>
  );
}

function AdminLayout() {
  const { adminRole, setAdminRole } = useAdminState();
  const navigate = useNavigate();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

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
    { to: "/admin/settings", icon: Settings, label: "Reports & Settings" },
  ];

  return (
    <div className="flex h-screen w-full bg-neutral-100 font-sans text-neutral-900">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-neutral-200 bg-white shadow-sm shrink-0 h-full overflow-y-auto z-10 relative">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-neutral-200">
          <Link to="/" className="text-xl font-bold tracking-tight text-[color:var(--t10-navy)] flex items-center gap-2">
            THINK<span className="text-[color:var(--t10-emerald)]">10</span>
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
            <div className="text-xs text-neutral-400">
              Environment: <span className="font-mono text-[color:var(--t10-emerald)]">Production</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Role: {adminRole}
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </button>
              
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-neutral-200 bg-white p-2 shadow-xl z-50">
                  <div className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Simulate RBAC View
                  </div>
                  {ADMIN_ROLES.map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        setAdminRole(role);
                        setShowRoleDropdown(false);
                      }}
                      className={`block w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${role === adminRole ? "bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)] font-bold" : "text-neutral-700 hover:bg-neutral-50"}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
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
