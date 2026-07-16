import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "t10-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(KEY)) setVisible(true);
  }, []);
  if (!visible) return null;
  const dismiss = (v: "accepted" | "declined") => {
    window.localStorage.setItem(KEY, v);
    setVisible(false);
  };
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md">
      <div className="rounded-xl border border-[color:var(--t10-border)] bg-white p-4 shadow-lg">
        <p className="text-sm text-[color:var(--t10-navy)]">
          We use essential cookies to run this site and optional analytics to improve it. See our{" "}
          <Link to="/cookies" className="underline">
            Cookies policy
          </Link>
          .
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => dismiss("declined")}
            className="rounded-md border border-[color:var(--t10-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--t10-navy)]"
          >
            Essential only
          </button>
          <button
            onClick={() => dismiss("accepted")}
            className="rounded-md bg-[color:var(--t10-emerald)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
