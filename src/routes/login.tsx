import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  RefreshCw,
  User,
  Building,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import type { ConfirmationResult } from "firebase/auth";
import { sendEmailVerification } from "firebase/auth";

export const Route = createFileRoute("/login")({
  component: Page,
  head: () => ({
    meta: [{ title: "Sign In | Think10" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: "/login" }],
  }),
});

type Mode = "login" | "signup";
type LoginTab = "email" | "phone";

function parseFirebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/user-not-found": "No account found with this email.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/invalid-verification-code": "The OTP you entered is incorrect.",
    "auth/invalid-phone-number": "Please enter a valid phone number (e.g. +971501234567).",
    "auth/quota-exceeded": "SMS quota exceeded. Please try email login.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email using a different method.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

function Page() {
  const {
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    sendPhoneOtp,
    confirmPhoneOtp,
    authLoading,
    currentUser,
  } = useAuth();
  const navigate = useNavigate();

  // ── Mode: login or signup ─────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("login");
  const [animating, setAnimating] = useState(false);

  const switchMode = (next: Mode) => {
    if (next === mode || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setMode(next);
      setErrorMsg("");
      setAnimating(false);
    }, 350);
  };

  // ── Redirect if already logged in ─────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate({ to: "/dashboard" });
    }
  }, [authLoading, currentUser, navigate]);

  // ── Shared state ──────────────────────────────────────────────────────────
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Login state ───────────────────────────────────────────────────────────
  const [loginTab, setLoginTab] = useState<LoginTab>("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // ── Phone OTP state ───────────────────────────────────────────────────────
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  // ── Signup state ──────────────────────────────────────────────────────────
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupCompany, setSignupCompany] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [agree, setAgree] = useState(true);

  // ── Spinner while Firebase resolves ──────────────────────────────────────
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

  // ── Login handlers ────────────────────────────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!loginEmail || !loginPassword) { setErrorMsg("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    setErrorMsg("");
    if (!phone) { setErrorMsg("Enter your phone number first."); return; }
    setLoading(true);
    try {
      confirmationRef.current = await sendPhoneOtp(phone, "recaptcha-container");
      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg("");
    if (!otp || !confirmationRef.current) { setErrorMsg("Enter the OTP code."); return; }
    setLoading(true);
    try {
      await confirmPhoneOtp(confirmationRef.current, otp);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

  // ── Signup handler ────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!signupName || !signupEmail || !signupPassword) { setErrorMsg("Please fill in all required fields."); return; }
    if (signupPassword.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }
    if (!agree) { setErrorMsg("You must agree to the data processing policy."); return; }
    setLoading(true);
    try {
      await signUpWithEmail(signupEmail, signupPassword, signupName, signupCompany);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

  const handleGoogleSignUp = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

  // ── Google SVG ────────────────────────────────────────────────────────────
  const GoogleIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[color:var(--t10-offwhite)] t10-grid-bg flex flex-col justify-center items-center p-4">
      {/* ── Auth Card ──────────────────────────────────────────────────────── */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[color:var(--t10-border)] shadow-2xl overflow-hidden min-h-[580px]">
        <div className="flex flex-col md:flex-row h-full">

          {/* ── LEFT: Form Panel ─────────────────────────────────────────── */}
          <div className="flex-1 relative overflow-hidden">
            {/* Sliding wrapper: login & signup side by side, slide via translateX */}
            <div
              className="flex h-full transition-transform duration-[380ms] ease-in-out"
              style={{ transform: mode === "login" ? "translateX(0%)" : "translateX(-50%)", width: "200%" }}
            >
              {/* ── LOGIN FORM ────────────────────────────────────── */}
              <div className="w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-5 shrink-0">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-[color:var(--t10-navy)] font-display">Login</h1>
                  <p className="text-xs text-[color:var(--t10-grey)]">Enter your credentials to access your dashboard.</p>
                </div>

                {mode === "login" && errorMsg && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{errorMsg}</div>
                )}

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-[color:var(--t10-border)] bg-white py-2.5 text-sm font-semibold text-[color:var(--t10-navy)] hover:bg-neutral-50 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon /> Continue with Google
                </button>

                <div className="flex items-center gap-3">
                  <hr className="flex-1 border-neutral-200" />
                  <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">or</span>
                  <hr className="flex-1 border-neutral-200" />
                </div>

                {/* Tabs */}
                <div className="flex rounded-xl border border-[color:var(--t10-border)] overflow-hidden">
                  {(["email", "phone"] as LoginTab[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLoginTab(t)}
                      className={`flex-1 py-2 text-xs font-semibold transition-all cursor-pointer ${loginTab === t ? "bg-[color:var(--t10-navy)] text-white" : "text-[color:var(--t10-grey)] hover:bg-neutral-50"}`}
                    >
                      {t === "email" ? "Email & Password" : "Phone OTP"}
                    </button>
                  ))}
                </div>

                {loginTab === "email" ? (
                  <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
                    <label className="block space-y-1.5">
                      <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Email</span>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="name@company.com"
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
                          id="login-password"
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
                      id="login-submit"
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--t10-navy)] py-2.5 font-bold text-white hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow text-sm cursor-pointer"
                    >
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "LOGIN"}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div id="recaptcha-container" />
                    <label className="block space-y-1.5">
                      <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Phone Number</span>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <input
                          id="login-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+971 50 123 4567"
                          className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all"
                        />
                      </div>
                    </label>
                    {!otpSent ? (
                      <button onClick={handleSendOtp} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--t10-navy)] py-2.5 font-bold text-white hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow text-sm cursor-pointer">
                        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Send OTP"}
                      </button>
                    ) : (
                      <>
                        <label className="block space-y-1.5">
                          <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">OTP Code</span>
                          <input
                            id="login-otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6-digit code"
                            maxLength={6}
                            className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 px-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all tracking-[0.3em] font-mono"
                          />
                        </label>
                        <button onClick={handleVerifyOtp} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--t10-emerald)] py-2.5 font-bold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow text-sm cursor-pointer">
                          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify & Login"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ── SIGNUP FORM ───────────────────────────────────── */}
              <div className="w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-4 shrink-0">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-[color:var(--t10-navy)] font-display">Create account</h1>
                  <p className="text-xs text-[color:var(--t10-grey)]">Join Think10 — free to start, no credit card needed.</p>
                </div>

                {mode === "signup" && errorMsg && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{errorMsg}</div>
                )}

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-[color:var(--t10-border)] bg-white py-2.5 text-sm font-semibold text-[color:var(--t10-navy)] hover:bg-neutral-50 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon /> Continue with Google
                </button>

                <div className="flex items-center gap-3">
                  <hr className="flex-1 border-neutral-200" />
                  <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">or</span>
                  <hr className="flex-1 border-neutral-200" />
                </div>

                <form onSubmit={handleSignup} className="space-y-3" noValidate>
                  <label className="block space-y-1.5">
                    <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Full Name *</span>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                      <input id="signup-name" type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Ahmed Al Mansoori" autoComplete="name" className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all" />
                    </div>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Email *</span>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                      <input id="signup-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all" />
                    </div>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Company <span className="font-normal normal-case text-neutral-300">optional</span></span>
                    <div className="relative">
                      <Building className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                      <input id="signup-company" type="text" value={signupCompany} onChange={(e) => setSignupCompany(e.target.value)} placeholder="Your company name" autoComplete="organization" className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all" />
                    </div>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Password *</span>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                      <input id="signup-password" type={showSignupPw ? "text" : "password"} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-10 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all" />
                      <button type="button" onClick={() => setShowSignupPw(!showSignupPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                        {showSignupPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input id="signup-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 accent-[color:var(--t10-navy)] cursor-pointer" />
                    <span className="text-[11px] text-[color:var(--t10-grey)] leading-snug">I agree to the data processing & session recording policies.</span>
                  </label>
                  <button id="signup-submit" type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--t10-emerald)] py-2.5 font-bold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow text-sm cursor-pointer">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <> Create Account <ArrowRight className="h-4 w-4" /> </>}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Brand Panel — flips between Login CTA and Signup CTA ── */}
          <div
            className="relative hidden md:flex flex-col justify-between p-10 md:max-w-xs lg:max-w-sm overflow-hidden bg-[color:var(--t10-emerald)]"
          >
            {/* Animated circles */}
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/10 -mr-16 -mt-16 t10-animate-float-slow" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/5 -ml-10 -mb-10 t10-animate-float-reverse" />

            {/* Logo */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-white font-bold text-sm">T</span>
                <div>
                  <p className="text-[13px] font-bold text-white tracking-tight leading-none">THINK10</p>
                  <p className="text-[9px] font-semibold text-white/70 tracking-[0.18em] uppercase mt-0.5">Advisory Portal</p>
                </div>
              </div>
            </div>

            {/* CTA — transitions between signup and login */}
            <div className="relative z-10">
              {mode === "login" ? (
                <div
                  className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
                >
                  <h2 className="text-2xl font-bold text-white leading-snug">Grow Your Business</h2>
                  <p className="mt-2 text-sm text-white/80 leading-relaxed">
                    Meet vetted UAE business advisors and get AI-powered guidance to scale your operations.
                  </p>
                  <button
                    onClick={() => switchMode("signup")}
                    className="mt-6 inline-flex items-center justify-center rounded-xl border-2 border-white bg-transparent px-6 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-[color:var(--t10-emerald)] transition-all cursor-pointer"
                  >
                    Sign Up Free
                  </button>
                </div>
              ) : (
                <div
                  className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
                >
                  <h2 className="text-2xl font-bold text-white leading-snug">Already have an account?</h2>
                  <p className="mt-2 text-sm text-white/80 leading-relaxed">
                    Sign in to your Think10 Command Centre and continue where you left off.
                  </p>
                  <button
                    onClick={() => switchMode("login")}
                    className="mt-6 inline-flex items-center justify-center rounded-xl border-2 border-white bg-transparent px-6 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-[color:var(--t10-navy)] transition-all cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="relative z-10">
              <p className="text-[9px] font-semibold text-white/50 tracking-[0.2em] uppercase">GCC Founders Command Center</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back link */}
      <a
        href="/"
        className="mt-6 flex items-center gap-1.5 text-xs text-[color:var(--t10-grey)] hover:text-[color:var(--t10-navy)] font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Think10
      </a>
    </div>
  );
}
