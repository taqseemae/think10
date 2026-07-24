"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ConsultantStateProvider } from "@/context/ConsultantStateContext";
import {
  LayoutDashboard,
  CalendarRange,
  MonitorPlay,
  Users,
  BarChart2,
  CircleDollarSign,
  UserCircle,
  Settings,
  LogOut,
  Bell,
  Search,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  RefreshCw,
  User,
  Building,
  ArrowRight,
  Briefcase,
  ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";


type Mode = "login" | "signup";
type LoginTab = "email" | "phone";

const Think10Logo = ({ className = "h-8 w-auto text-[color:var(--t10-navy)]" }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 831.89 183.45">
    <g fill="currentColor">
      <path d="M0,6.61h134.13v29.09H0V6.61ZM50.33,6.61h33.47v173.14h-33.47V6.61Z"/>
      <path d="M144.05,6.61h33.01v173.14h-33.01V6.61ZM177.06,116.5l-3.69-26.55c0-4,.58-8.46,1.73-13.39,1.15-4.92,3.31-9.66,6.46-14.2,3.15-4.54,7.65-8.27,13.5-11.2,5.85-2.92,13.47-4.39,22.85-4.39,8.31,0,15.7,1.7,22.16,5.08,6.46,3.39,11.54,8.97,15.24,16.74,3.69,7.77,5.54,18.28,5.54,31.51v79.65h-33.01v-76.64c0-5.08-.39-9.73-1.15-13.97-.77-4.23-2.5-7.58-5.19-10.04-2.7-2.46-6.97-3.69-12.81-3.69-4.62,0-9.39,1.31-14.31,3.92-4.93,2.62-9.04,6.89-12.35,12.81-3.31,5.93-4.96,14.05-4.96,24.36Z"/>
      <path d="M284.64,50.47h33.01v129.28h-33.01V50.47ZM317.65,31.02l-31.02,11.29-11.29-31.02,31.02-11.29,11.29,31.02Z"/>
      <path d="M334.73,50.47h33.01v19.85c1.69-4.16,4.19-8,7.5-11.54,3.31-3.54,7.69-6.42,13.16-8.66,5.46-2.23,12.2-3.35,20.2-3.35s15.7,1.7,22.16,5.08c6.46,3.39,11.54,8.97,15.24,16.74,3.69,7.77,5.54,18.28,5.54,31.51v79.65h-33.01v-76.64c0-5.08-.39-9.73-1.15-13.97-.77-4.23-2.5-7.58-5.19-10.04-2.69-2.46-6.97-3.69-12.81-3.69-4.62,0-9.39,1.31-14.31,3.92-4.93,2.62-9.04,6.89-12.35,12.81-3.31,5.93-4.96,14.05-4.96,24.36v63.25h-33.01V50.47Z"/>
      <path d="M467.01,6.61h33.01v173.14h-33.01V6.61ZM576.21,50.47l-79.41,100.19-16.39-27.93,57.02-72.26h38.78ZM501.41,102.19h33.01l44.79,77.57h-36.01l-41.78-77.57Z"/>
    </g>
    <g fill="#ffffff">
      <path d="M582.65,6.61v29.09h29.04V6.61h-29.04ZM645.16,35.7h-33.47v114.97h-49.27l16.79,29.09h104.73v-29.09h-38.78V35.7ZM798.44,39.16c-5.62-7.69-12.7-13.74-21.24-18.12-8.54-4.39-18.66-6.58-30.36-6.58s-21.86,2.19-30.47,6.58c-8.62,4.39-15.74,10.43-21.35,18.12-5.62,7.7-9.78,16.66-12.47,26.89-2.7,10.24-4.04,21.12-4.04,32.67,0,15.7,2.42,29.94,7.27,42.71,4.85,12.78,12.31,22.97,22.39,30.59,10.08,7.62,22.97,11.43,38.67,11.43s28.36-3.81,38.44-11.43c10.08-7.62,17.55-17.81,22.39-30.59,4.85-12.77,7.27-27.01,7.27-42.71,0-11.54-1.35-22.43-4.04-32.67-2.7-10.23-6.85-19.2-12.47-26.89ZM776.85,124.93c-2.16,8.23-5.66,14.97-10.5,20.2-4.85,5.23-11.35,7.85-19.51,7.85s-14.7-2.62-19.62-7.85c-4.93-5.23-8.47-11.97-10.62-20.2-2.16-8.23-3.23-16.97-3.23-26.2s1.07-17.74,3.23-25.97c2.15-8.23,5.69-14.93,10.62-20.08,4.92-5.15,11.46-7.73,19.62-7.73s14.66,2.58,19.51,7.73c4.85,5.16,8.35,11.85,10.5,20.08,2.15,8.24,3.23,16.89,3.23,25.97s-1.08,17.97-3.23,26.2ZM821.48,23.11c-.41-.44-.92-.84-1.55-1.2,1.26-.18,2.2-.62,2.83-1.32.63-.7.95-1.59.95-2.66,0-.85-.21-1.6-.63-2.26-.42-.66-.97-1.12-1.67-1.37-.69-.26-1.81-.39-3.34-.39h-6.09v14.33h2.89v-5.98h.59c.66,0,1.15.05,1.46.16.31.11.6.31.87.6.27.29.78.99,1.52,2.11l2.09,3.12h3.46l-1.75-2.8c-.69-1.11-1.24-1.89-1.65-2.33ZM817.03,19.97h-2.14v-3.64h2.26c1.17,0,1.88.02,2.11.05.47.08.83.27,1.09.56.26.3.39.69.39,1.17,0,.43-.1.79-.29,1.08-.2.29-.47.49-.81.61-.35.12-1.21.18-2.6.18ZM817.43,6.61c-7.97,0-14.46,6.49-14.46,14.46s6.49,14.46,14.46,14.46,14.46-6.49,14.46-14.46-6.49-14.46-14.46-14.46ZM817.43,33.05c-6.6,0-11.98-5.37-11.98-11.98s5.37-11.98,11.98-11.98,11.98,5.37,11.98,11.98-5.37,11.98-11.98,11.98Z"/>
    </g>
  </svg>
);

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

function ConsultantLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, userDoc, authLoading, docLoading, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authLoading || docLoading) return;
    if (currentUser) {
      if (userDoc?.plan?.role !== "Consultant" && !userDoc?.adminRole && currentUser.email !== "admin@think10.ae") {
         router.push("/");
      }
    }
  }, [currentUser, userDoc, authLoading, docLoading, router]);

  if (authLoading || docLoading) {
    return <div className="p-8 text-center">Loading Consultant Workspace...</div>;
  }

  if (!currentUser) {
    return <ConsultantAuthView />;
  }

  if (userDoc?.plan?.role !== "Consultant" && !userDoc?.adminRole && currentUser.email !== "admin@think10.ae") {
    return null;
  }

  const NAV_ITEMS = [
    { to: "/consultant", icon: LayoutDashboard, label: "Home" },
    { to: "/consultant/bookings", icon: CalendarRange, label: "Bookings" },
    { to: "/consultant/consultations", icon: MonitorPlay, label: "Consultations" },
    { to: "/consultant/clients", icon: Users, label: "Clients" },
    { to: "/consultant/performance", icon: BarChart2, label: "Performance" },
    { to: "/consultant/earnings", icon: CircleDollarSign, label: "Earnings" },
    { to: "/consultant/profile", icon: UserCircle, label: "Profile" },
    { to: "/consultant/settings", icon: Settings, label: "Help & Settings" },
  ];

  return (
    <div className="flex h-screen w-full bg-neutral-100 font-sans text-neutral-900">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-neutral-200 bg-white shadow-sm shrink-0 h-full overflow-y-auto z-10 relative">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-neutral-200">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo/t10-brand-logo.svg?v=2" alt="Think10" className="h-6 w-auto" />
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold border border-neutral-200 rounded px-1.5 py-0.5 ml-1">Consultant</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 [&.active]:bg-[color:var(--t10-mint)] [&.active]:text-[color:var(--t10-emerald)] transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <button 
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-neutral-500 hover:text-neutral-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <LayoutDashboard className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest hidden md:block">Workspace</h1>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search clients or sessions..." 
                className="h-8 w-64 rounded-md border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-xs focus:border-[color:var(--t10-emerald)] focus:outline-none focus:ring-1 focus:ring-[color:var(--t10-emerald)]"
              />
            </div>
            
            <button className="relative p-2 text-neutral-400 hover:text-neutral-700">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[color:var(--t10-navy)] flex items-center justify-center text-white text-xs font-bold">
                DA
              </div>
              <div className="hidden flex-col md:flex">
                <span className="text-xs font-semibold leading-none text-neutral-900">Dr. Amina H.</span>
                <span className="text-[10px] leading-none text-[color:var(--t10-emerald)]">Available</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-white md:hidden">
            <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
              <span className="text-sm font-bold text-[color:var(--t10-navy)]">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-neutral-500">
                Close
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 [&.active]:bg-[color:var(--t10-mint)] [&.active]:text-[color:var(--t10-emerald)]"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto bg-neutral-50/50 p-4 md:p-8 relative">
          <ConsultantStateProvider>
            {children}
          </ConsultantStateProvider>
        </div>
      </main>
    </div>
  );
}

function ConsultantAuthView() {
  const {
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    sendPhoneOtp,
    confirmPhoneOtp,
  } = useAuth() as any;

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

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginTab, setLoginTab] = useState<LoginTab>("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const confirmationRef = (useAuth() as any).confirmationRef || { current: null }; // Mock ref if missing

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupCompany, setSignupCompany] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [agree, setAgree] = useState(true);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!loginEmail || !loginPassword) { setErrorMsg("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword, "Consultant");
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithGoogle("Consultant");
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
      await confirmPhoneOtp(confirmationRef.current, otp, "Consultant");
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!signupName || !signupEmail || !signupPassword) { setErrorMsg("Please fill in all required fields."); return; }
    if (signupPassword.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }
    if (!agree) { setErrorMsg("You must agree to the data processing policy."); return; }
    setLoading(true);
    try {
      await signUpWithEmail(signupEmail, signupPassword, signupName, signupCompany, "Consultant");
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

  const handleGoogleSignUp = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithGoogle("Consultant");
    } catch (err: any) {
      setErrorMsg(parseFirebaseError(err.code));
    } finally { setLoading(false); }
  };

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
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[color:var(--t10-border)] shadow-2xl overflow-hidden min-h-[580px]">
        <div className="flex flex-col md:flex-row h-full">

          <div className="flex-1 relative overflow-hidden">
            <div
              className="flex h-full transition-transform duration-[380ms] ease-in-out"
              style={{ transform: mode === "login" ? "translateX(0%)" : "translateX(-50%)", width: "200%" }}
            >
              <div className="w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-5 shrink-0">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-[color:var(--t10-navy)] font-display flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[color:var(--t10-emerald)]" /> Consultant Login
                  </h1>
                  <p className="text-xs text-[color:var(--t10-grey)]">Enter your credentials to access your dashboard.</p>
                </div>

                {mode === "login" && errorMsg && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{errorMsg}</div>
                )}

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
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="name@consultancy.com"
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

              <div className="w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-4 shrink-0">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-[color:var(--t10-navy)] font-display flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[color:var(--t10-emerald)]" /> Apply as Consultant
                  </h1>
                  <p className="text-xs text-[color:var(--t10-grey)]">Join our elite network of business advisors.</p>
                </div>

                {mode === "signup" && errorMsg && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{errorMsg}</div>
                )}

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
                      <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Ahmed Al Mansoori" autoComplete="name" className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all" />
                    </div>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Email *</span>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                      <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@consultancy.com" autoComplete="email" className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all" />
                    </div>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Company/Title <span className="font-normal normal-case text-neutral-300">optional</span></span>
                    <div className="relative">
                      <Building className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                      <input type="text" value={signupCompany} onChange={(e) => setSignupCompany(e.target.value)} placeholder="Independent Advisor" autoComplete="organization" className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all" />
                    </div>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block font-bold text-[10px] text-neutral-400 tracking-wider uppercase">Password *</span>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                      <input type={showSignupPw ? "text" : "password"} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" className="w-full rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 py-2.5 pl-9 pr-10 text-sm text-[color:var(--t10-navy)] placeholder:text-neutral-300 outline-none focus:border-[color:var(--t10-navy)] focus:ring-2 focus:ring-[color:var(--t10-navy)]/10 transition-all" />
                      <button type="button" onClick={() => setShowSignupPw(!showSignupPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                        {showSignupPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 accent-[color:var(--t10-navy)] cursor-pointer" />
                    <span className="text-[11px] text-[color:var(--t10-grey)] leading-snug">I agree to the consultant terms & policies.</span>
                  </label>
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--t10-emerald)] py-2.5 font-bold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow text-sm cursor-pointer">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <> Submit Application <ArrowRight className="h-4 w-4" /> </>}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div
            className="relative hidden md:flex flex-col justify-between p-10 md:max-w-xs lg:max-w-sm overflow-hidden bg-[color:var(--t10-green)] text-white"
          >
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/20 -mr-16 -mt-16 t10-animate-float-slow" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/10 -ml-10 -mb-10 t10-animate-float-reverse" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <Think10Logo className="h-8 w-auto text-[color:var(--t10-navy)]" />
              </div>
            </div>

            <div className="relative z-10">
              {mode === "login" ? (
                <div
                  className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
                >
                  <h2 className="text-2xl font-bold text-white leading-snug font-display">Become an Advisor</h2>
                  <p className="mt-2 text-sm text-white/80 leading-relaxed font-medium">
                    Join our network of elite advisors in the UAE. Share your expertise and earn money.
                  </p>
                  <button
                    onClick={() => switchMode("signup")}
                    className="mt-6 inline-flex items-center justify-center rounded-xl border-2 border-white bg-transparent px-6 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-[color:var(--t10-navy)] transition-all cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              ) : (
                <div
                  className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
                >
                  <h2 className="text-2xl font-bold text-white leading-snug font-display">Already an Advisor?</h2>
                  <p className="mt-2 text-sm text-white/80 leading-relaxed font-medium">
                    Log in to view your schedule and manage your clients.
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

            <div className="relative z-10">
              <p className="text-[9px] font-semibold text-white/50 tracking-[0.2em] uppercase">GCC Elite Advisor Network</p>
            </div>
          </div>
        </div>
      </div>

      <Link href="/"
        className="mt-6 flex items-center gap-1.5 text-xs text-[color:var(--t10-grey)] hover:text-[color:var(--t10-navy)] font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Think10
      </Link>
    </div>
  );
}

export default ConsultantLayout;
