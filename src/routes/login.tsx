import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Phone,
  RefreshCw,
} from "lucide-react";
import type { ConfirmationResult } from "firebase/auth";

export const Route = createFileRoute("/login")({
  component: Page,
  head: () => ({
    meta: [{ title: "Log in | Think10" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: "/login" }],
  }),
});

type Tab = "email" | "phone";

// ── Firebase error code → human-readable message ─────────────────────────────
function parseFirebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/user-not-found": "No account found with this email.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/invalid-verification-code": "The OTP you entered is incorrect.",
    "auth/invalid-phone-number": "Please enter a valid phone number with country code (e.g. +971501234567).",
    "auth/quota-exceeded": "SMS quota exceeded. Please try email login.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email using a different sign-in method.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

function Page() {
  const { signInWithEmail, signInWithGoogle, sendPhoneOtp, confirmPhoneOtp, authLoading, currentUser } =
    useAuth();
  const navigate = useNavigate();

  // ── If already logged in, redirect immediately to dashboard ──────────────
  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate({ to: "/dashboard" });
    }
  }, [authLoading, currentUser, navigate]);

  const [tab, setTab] = useState<Tab>("email");

  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Show spinner while auth state is resolving ───────────────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--t10-offwhite)]">
        <div className="flex flex-col items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--t10-navy)] text-white shadow animate-pulse">
            <span className="h-3 w-3 rounded-full border-2 border-white" />
          </span>
          <p className="text-xs font-semibold text-[color:var(--t10-grey)] tracking-wider uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setErrorMsg("");
    if (!phone || !phone.startsWith("+")) {
      setErrorMsg("Enter phone number with country code, e.g. +971501234567");
      return;
    }
    setLoading(true);
    try {
      const confirmation = await sendPhoneOtp(phone, "recaptcha-container");
      confirmationRef.current = confirmation;
      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!otp || otp.length < 4) {
      setErrorMsg("Please enter the OTP received via SMS.");
      return;
    }
    if (!confirmationRef.current) {
      setErrorMsg("Session expired. Please resend OTP.");
      return;
    }
    setLoading(true);
    try {
      await confirmPhoneOtp(confirmationRef.current, otp);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--t10-offwhite)] t10-grid-bg flex flex-col justify-center items-center p-4">
      {/* Invisible reCAPTCHA container for phone OTP */}
      <div id="recaptcha-container" />

      {/* Main split-screen Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[color:var(--t10-border)] shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[580px] animate-fade-in">

        {/* Left Side: Form Panel */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[color:var(--t10-navy)] font-display">Login</h1>
              <p className="text-xs text-[color:var(--t10-grey)]">
                Enter your credentials or choose a sign-in method below.
              </p>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {errorMsg}
              </div>
            )}

            {/* Tab switcher */}
            <div className="flex rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 p-1 gap-1">
              {(["email", "phone"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setErrorMsg(""); setOtpSent(false); }}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                    tab === t
                      ? "bg-white shadow text-[color:var(--t10-navy)]"
                      : "text-[color:var(--t10-grey)] hover:text-[color:var(--t10-navy)]"
                  }`}
                >
                  {t === "email" ? "Email & Password" : "Phone OTP"}
                </button>
              ))}
            </div>

            {/* ── Email/Password Form ─────────────────────────── */}
            {tab === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
                <label className="block space-y-1.5">
                  <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">
                    Email
                  </span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all"
                    />
                  </div>
                </label>

                <label className="block space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">
                      Password
                    </span>
                    <button
                      type="button"
                      className="text-[10px] text-[color:var(--t10-grey)] hover:text-[color:var(--t10-navy)] font-semibold transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-10 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading || authLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--t10-navy)] py-2.5 font-bold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow text-sm cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" /> Sign In
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── Phone OTP Form ──────────────────────────────── */}
            {tab === "phone" && (
              <div className="space-y-4">
                {!otpSent ? (
                  <div className="space-y-4">
                    <label className="block space-y-1.5">
                      <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">
                        Phone Number
                      </span>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <input
                          id="login-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+971501234567"
                          autoComplete="tel"
                          className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-[color:var(--t10-grey)]">
                        Include country code e.g. +971 for UAE
                      </p>
                    </label>
                    <button
                      id="login-send-otp"
                      type="button"
                      disabled={loading}
                      onClick={handleSendOtp}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--t10-navy)] py-2.5 font-bold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow text-sm cursor-pointer"
                    >
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Send OTP"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <p className="text-xs text-[color:var(--t10-grey)]">
                      OTP sent to <strong>{phone}</strong>. Check your messages.
                    </p>
                    <label className="block space-y-1.5">
                      <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">
                        Enter OTP
                      </span>
                      <input
                        id="login-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 px-4 text-sm text-center tracking-[0.5em] text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all font-mono"
                      />
                    </label>
                    <button
                      id="login-verify-otp"
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--t10-navy)] py-2.5 font-bold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow text-sm cursor-pointer"
                    >
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify & Sign In"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(""); setErrorMsg(""); }}
                      className="w-full text-xs text-[color:var(--t10-grey)] hover:text-[color:var(--t10-navy)] cursor-pointer transition-colors"
                    >
                      ← Change phone number
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ── Divider ─────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              <hr className="flex-1 border-neutral-200" />
              <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">or</span>
              <hr className="flex-1 border-neutral-200" />
            </div>

            {/* ── Google Sign In ───────────────────────────────── */}
            <button
              id="login-google"
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-[color:var(--t10-border)] bg-white py-2.5 text-sm font-semibold text-[color:var(--t10-navy)] hover:bg-neutral-50 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>


          </div>
        </div>

        {/* Right Side: Brand Panel — Emerald green with Sign Up CTA */}
        <div className="relative hidden md:flex flex-col justify-between bg-[color:var(--t10-emerald)] p-10 md:max-w-xs lg:max-w-sm overflow-hidden">
          {/* Animated background circles */}
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/10 -mr-16 -mt-16 t10-animate-float-slow" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/5 -ml-10 -mb-10 t10-animate-float-reverse" />

          {/* Top: Logo & Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-white font-bold text-sm">
                T
              </span>
              <div>
                <p className="text-[13px] font-bold text-white tracking-tight leading-none">THINK10</p>
                <p className="text-[9px] font-semibold text-white/70 tracking-[0.18em] uppercase mt-0.5">Advisory Portal</p>
              </div>
            </div>
          </div>

          {/* Middle: CTA content */}
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white leading-snug">
              Grow Your Business
            </h2>
            <p className="mt-2 text-sm text-white/80 leading-relaxed">
              Meet vetted UAE business advisors and get AI-powered guidance to scale your operations.
            </p>

            <Link
              to="/signup"
              className="mt-6 inline-flex items-center justify-center rounded-xl border-2 border-white bg-transparent px-6 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-[color:var(--t10-emerald)] transition-all cursor-pointer"
            >
              Sign Up
            </Link>
          </div>

          {/* Bottom: tagline */}
          <div className="relative z-10">
            <p className="text-[9px] font-semibold text-white/50 tracking-[0.2em] uppercase">
              GCC Founders Command Center
            </p>
          </div>
        </div>
      </div>

      {/* Back to home link */}
      <Link
        to="/"
        className="mt-6 flex items-center gap-1.5 text-xs text-[color:var(--t10-grey)] hover:text-[color:var(--t10-navy)] font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Think10
      </Link>
    </div>
  );
}
