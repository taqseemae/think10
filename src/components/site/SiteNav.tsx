import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowUpRight, User } from "lucide-react";
import { NAV } from "@/data/think10";
import { useDashboardState } from "@/context/DashboardStateContext";
import { useAuth } from "@/context/AuthContext";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, logout } = useDashboardState();
  const { userDoc, currentUser } = useAuth();

  const displayName = userDoc?.displayName || currentUser?.displayName || userDoc?.profile?.businessName || "My Dashboard";
  
  // Determine correct dashboard route based on role
  let dashboardRoute = "/dashboard";
  if (userDoc?.adminRole) {
    dashboardRoute = "/admin";
  } else if (userDoc?.plan?.role === "Consultant" || userDoc?.plan?.role === "ConsultantPending") {
    dashboardRoute = "/consultant";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--t10-border)] bg-white/90 backdrop-blur">
      <div className="t10-container flex h-[72px] items-center justify-between gap-4">
        <a href="/#top" className="flex items-center gap-3" aria-label="Think10 home">
          <img src="/logo/t10-brand-logo.svg?v=2" alt="Think10 Premium Advisory" className="h-8 w-auto" />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[15px] font-medium text-[color:var(--t10-navy)]/85">
            {NAV.map((item) => (
              <li key={item.to}>
                <a
                  href={item.to}
                  className="transition-colors hover:text-[color:var(--t10-emerald)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isLoggedIn ? (
            <>
              <Link
                to={dashboardRoute}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-medium text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-mint)] transition-colors"
              >
                <div className="bg-[color:var(--t10-emerald)]/10 p-1.5 rounded-full text-[color:var(--t10-emerald)]">
                  <User className="h-4 w-4" />
                </div>
                <span className="truncate max-w-[120px]">{displayName}</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-full border border-[color:var(--t10-emerald)] px-5 py-2 text-[15px] font-semibold text-[color:var(--t10-emerald)] hover:bg-[color:var(--t10-mint)] transition-colors cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-4 py-2 text-[15px] font-medium text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-mint)]"
              >
                Log in
              </Link>
              <a
                href="/#contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--t10-emerald)] px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--t10-green)]"
              >
                Book Discovery Call
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden rounded-md p-2 text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-mint)]"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[color:var(--t10-border)] bg-white lg:hidden">
          <div className="t10-container flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <a
                key={item.to}
                href={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-mint)]"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[color:var(--t10-border)] pt-3">
              {isLoggedIn ? (
                <>
                  <Link
                    to={dashboardRoute}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-mint)]"
                  >
                    <User className="h-4 w-4 text-[color:var(--t10-emerald)]" />
                    <span className="truncate">{displayName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="rounded-full border border-[color:var(--t10-emerald)] px-3 py-2 text-center text-sm font-semibold text-[color:var(--t10-emerald)] hover:bg-[color:var(--t10-mint)] cursor-pointer"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-[color:var(--t10-navy)]"
                  >
                    Log in
                  </Link>
                  <a
                    href="/#contact"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-[color:var(--t10-emerald)] px-3 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Book Discovery Call
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
