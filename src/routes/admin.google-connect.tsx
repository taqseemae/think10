import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ExternalLink, RefreshCw, ShieldCheck, Calendar } from "lucide-react";
import {
  getGoogleConnectionStatusFn,
  getGoogleAuthUrlFn,
} from "@/lib/server-actions";

export const Route = createFileRoute("/admin/google-connect")({
  component: GoogleConnectPage,
});

function GoogleConnectPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUrl, setAuthUrl] = useState("");

  // Check URL for success/error params from OAuth callback
  const urlParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const oauthSuccess = urlParams.get("google_connected") === "true";
  const oauthError = urlParams.get("error");

  useEffect(() => {
    async function check() {
      try {
        setLoading(true);
        const [status, urlResult] = await Promise.all([
          getGoogleConnectionStatusFn(),
          getGoogleAuthUrlFn(),
        ]);
        setConnected(status.connected);
        setAuthUrl(urlResult.url);
      } catch (err) {
        console.error(err);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  const handleConnect = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[color:var(--t10-navy)]">Google Calendar Connection</h2>
        <p className="text-sm text-[color:var(--t10-grey)] mt-1">
          Connect a Google account to enable automatic Google Meet link generation and Calendar invites for all bookings.
        </p>
      </div>

      {/* OAuth Success/Error Banner */}
      {oauthSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">
            Google account connected successfully! All new bookings will now generate real Google Meet links.
          </p>
        </div>
      )}
      {oauthError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm font-semibold text-red-800">
            Google authorization failed: {oauthError}. Please try again.
          </p>
        </div>
      )}

      {/* Connection Status Card */}
      <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 space-y-5 shadow-sm">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${connected ? "bg-emerald-100" : "bg-neutral-100"}`}>
              <Calendar className={`h-5 w-5 ${connected ? "text-emerald-600" : "text-neutral-400"}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-[color:var(--t10-navy)]">Google Calendar API</p>
              {loading ? (
                <p className="text-xs text-[color:var(--t10-grey)]">Checking connection...</p>
              ) : connected ? (
                <p className="text-xs text-emerald-600 font-semibold">✓ Connected & Authorized</p>
              ) : (
                <p className="text-xs text-red-500 font-semibold">✗ Not Connected</p>
              )}
            </div>
          </div>
          {!loading && (
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${connected ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
              {connected ? "Active" : "Inactive"}
            </span>
          )}
        </div>

        {/* What This Enables */}
        <div className="rounded-xl bg-[color:var(--t10-offwhite)] border border-[color:var(--t10-border)] p-4 space-y-2">
          <p className="text-xs font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">What This Enables</p>
          {[
            "Real Google Meet links generated for every booking",
            "Calendar invites sent to both client and consultant",
            "Automatic 24-hour and 30-minute meeting reminders",
            "Cancel/reschedule updates synced to Google Calendar",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs text-[color:var(--t10-grey)]">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Connect Button */}
        <div className="flex gap-3">
          <button
            onClick={handleConnect}
            disabled={loading || !authUrl}
            className="flex items-center gap-2 rounded-lg bg-[color:var(--t10-emerald)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[color:var(--t10-green)] disabled:opacity-50 transition-all shadow"
          >
            <ExternalLink className="h-4 w-4" />
            {connected ? "Reconnect Google Account" : "Connect Google Account"}
          </button>
          {connected && (
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-lg border border-[color:var(--t10-border)] px-4 py-2.5 text-sm font-semibold text-[color:var(--t10-navy)] hover:bg-neutral-50 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </button>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
          <p className="text-sm font-bold text-amber-800">Important Setup Note</p>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          The Google account you connect here will be the "host" of all booking events. It will appear as the organizer in Google Calendar invites. We recommend using a dedicated <strong>bookings@think10.ae</strong> Google Workspace account rather than a personal account.
        </p>
        <p className="text-xs text-amber-700 leading-relaxed">
          For production, make sure <code className="bg-amber-100 px-1 rounded">https://think10.ae/auth/google/callback</code> is added as an authorized redirect URI in your Google Cloud Console.
        </p>
        <p className="text-xs text-amber-700 leading-relaxed">
          For local development, make sure <code className="bg-amber-100 px-1 rounded">http://localhost:8080/auth/google/callback</code> is added as an authorized redirect URI in your Google Cloud Console OAuth credentials.
        </p>
      </div>
    </div>
  );
}
