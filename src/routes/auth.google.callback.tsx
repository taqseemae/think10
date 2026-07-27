/**
 * Google OAuth2 Callback Handler
 * Route: /auth/google/callback
 * 
 * This page handles the redirect from Google after OAuth authorization.
 * It extracts the auth code from the URL, exchanges it for tokens,
 * and redirects to the Admin Google Connect page.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { exchangeGoogleCodeFn } from "@/lib/server-actions";

export const Route = createFileRoute("/auth/google/callback")({
  component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error || !code) {
      setErrorMsg(error || "No authorization code received from Google.");
      setStatus("error");
      setTimeout(() => navigate({ to: "/admin/google-connect", search: { error: error || "no_code" } as any }), 2500);
      return;
    }

    // Exchange code for tokens via server action
    exchangeGoogleCodeFn({ data: { code } })
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate({ to: "/admin/google-connect", search: { google_connected: "true" } as any }), 2000);
      })
      .catch((err) => {
        setErrorMsg(err?.message || "Token exchange failed.");
        setStatus("error");
        setTimeout(() => navigate({ to: "/admin/google-connect", search: { error: err?.message || "failed" } as any }), 2500);
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--t10-offwhite)]">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-[color:var(--t10-emerald)] mx-auto" />
            <p className="text-sm font-semibold text-[color:var(--t10-navy)]">Connecting Google Account...</p>
            <p className="text-xs text-[color:var(--t10-grey)]">Exchanging authorization code for access tokens.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <p className="text-base font-bold text-[color:var(--t10-navy)]">Google Account Connected!</p>
            <p className="text-xs text-[color:var(--t10-grey)]">Redirecting to admin panel...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-base font-bold text-[color:var(--t10-navy)]">Connection Failed</p>
            <p className="text-xs text-red-500">{errorMsg}</p>
            <p className="text-xs text-[color:var(--t10-grey)]">Redirecting back...</p>
          </>
        )}
      </div>
    </div>
  );
}
