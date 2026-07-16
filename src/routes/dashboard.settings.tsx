import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { useState, useRef, useEffect } from "react";
import {
  linkWithPhoneNumber,
  updatePassword,
  RecaptchaVerifier,
  type ConfirmationResult,
  PhoneAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth";
import { Key, Phone, ShieldCheck, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({ component: Page });

function Page() {
  const { currentUser, refreshUserDoc } = useAuth();
  
  // Status/Messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Phone Link State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Initialize Recaptcha
  useEffect(() => {
    if (typeof window !== "undefined" && auth && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-settings-container",
          {
            size: "invisible",
            callback: () => {
              // reCAPTCHA solved
            },
          }
        );
      } catch (err) {
        console.error("Recaptcha initialization failed:", err);
      }
    }
  }, []);

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  // Reauthenticate helper (needed for sensitive actions like changing password)
  const reauthenticate = async () => {
    if (!currentUser || !currentUser.email) return false;
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (err: any) {
      setErrorMsg("Incorrect current password.");
      return false;
    }
  };

  // ── LINK PHONE NUMBER ──────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!phoneNumber) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }
    if (!recaptchaVerifierRef.current) {
      setErrorMsg("Recaptcha verifier is not ready. Try refreshing.");
      return;
    }

    setLoading(true);
    try {
      if (currentUser) {
        const confirmation = await linkWithPhoneNumber(
          currentUser,
          phoneNumber,
          recaptchaVerifierRef.current
        );
        confirmationResultRef.current = confirmation;
        setOtpSent(true);
        setSuccessMsg("Verification code sent to your phone number.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-phone-number") {
        setErrorMsg("Invalid phone number format. Use international format (e.g., +971501234567).");
      } else if (err.code === "auth/provider-already-linked") {
        setErrorMsg("This phone number is already linked to another account.");
      } else {
        setErrorMsg(err.message || "Failed to send verification code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!otpCode) {
      setErrorMsg("Please enter the verification code.");
      return;
    }
    if (!confirmationResultRef.current) {
      setErrorMsg("No verification session found. Send OTP again.");
      return;
    }

    setLoading(true);
    try {
      await confirmationResultRef.current.confirm(otpCode);
      setOtpSent(false);
      setOtpCode("");
      setPhoneNumber("");
      setSuccessMsg("Phone number successfully linked! You can now sign in using this phone number.");
      await refreshUserDoc();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Incorrect OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── UPDATE PASSWORD ────────────────────────────────────────────────────────
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!newPassword || !confirmPassword) {
      setErrorMsg("Please fill out all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (currentUser) {
        // If user logged in via password, reauthenticate first
        const isEmailUser = currentUser.providerData.some(
          (p) => p.providerId === "password"
        );

        if (isEmailUser) {
          if (!currentPassword) {
            setErrorMsg("Please enter your current password to make changes.");
            setLoading(false);
            return;
          }
          const authenticated = await reauthenticate();
          if (!authenticated) {
            setLoading(false);
            return;
          }
        }

        await updatePassword(currentUser, newPassword);
        setSuccessMsg("Password successfully updated!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordFields(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const linkedProviders = currentUser?.providerData.map((p) => p.providerId) || [];
  const isGoogleLinked = linkedProviders.includes("google.com");
  const isPhoneLinked = linkedProviders.includes("phone");
  const isEmailLinked = linkedProviders.includes("password");

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[color:var(--t10-navy)]">Account Settings</h2>
        <p className="mt-1 text-sm text-[color:var(--t10-grey)]">
          Manage your account credentials, verify your contact details, and secure your Think10 workspace.
        </p>

        {/* Global Notifications */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-6 space-y-6 divide-y divide-[color:var(--t10-border)]">
          
          {/* Active Methods Info */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Sign-in Methods</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${isGoogleLinked ? "border-emerald-200 bg-emerald-50/50" : "border-neutral-200 bg-neutral-50/50"}`}>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <div className="text-left">
                  <p className="text-xs font-bold text-[color:var(--t10-navy)]">Google Account</p>
                  <p className="text-[10px] text-neutral-500">{isGoogleLinked ? "Linked ✓" : "Not Linked"}</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center gap-3 ${isEmailLinked ? "border-emerald-200 bg-emerald-50/50" : "border-neutral-200 bg-neutral-50/50"}`}>
                <Mail className="h-5 w-5 text-neutral-600 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-[color:var(--t10-navy)]">Email & Password</p>
                  <p className="text-[10px] text-neutral-500">{isEmailLinked ? "Linked ✓" : "Not Linked"}</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center gap-3 ${isPhoneLinked ? "border-emerald-200 bg-emerald-50/50" : "border-neutral-200 bg-neutral-50/50"}`}>
                <Phone className="h-5 w-5 text-neutral-600 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-[color:var(--t10-navy)]">Phone Number</p>
                  <p className="text-[10px] text-neutral-500">
                    {isPhoneLinked ? (currentUser?.phoneNumber || "Linked ✓") : "Not Verified / Linked"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Link/Verification Form */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold text-[color:var(--t10-navy)]">Verify & Link Phone Number</h3>
            <p className="text-xs text-[color:var(--t10-grey)] mt-0.5">
              Secure your account by verifying your mobile number. Once linked, you can log in with Phone OTP.
            </p>

            <div id="recaptcha-settings-container" />

            {isPhoneLinked ? (
              <div className="mt-4 flex items-center gap-2.5 text-xs text-neutral-600 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span>Your phone number is verified and linked to this account: <strong>{currentUser?.phoneNumber}</strong></span>
              </div>
            ) : (
              <div className="mt-4 max-w-md">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="flex gap-2">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="flex-1 rounded-xl border border-[color:var(--t10-border)] px-4 py-2.5 text-sm outline-none focus:border-[color:var(--t10-navy)]"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl bg-[color:var(--t10-navy)] px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Send Verification OTP
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit OTP code"
                        maxLength={6}
                        className="flex-1 rounded-xl border border-[color:var(--t10-border)] px-4 py-2.5 text-sm tracking-[0.2em] font-mono outline-none focus:border-[color:var(--t10-navy)]"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-[color:var(--t10-emerald)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Confirm Code
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-[color:var(--t10-navy)] font-semibold hover:underline cursor-pointer"
                    >
                      Change phone number
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Password Update Form */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold text-[color:var(--t10-navy)]">Security & Password</h3>
            <p className="text-xs text-[color:var(--t10-grey)] mt-0.5">
              Change your password to keep your Command Center access secure.
            </p>

            {!showPasswordFields ? (
              <button
                type="button"
                onClick={() => setShowPasswordFields(true)}
                className="mt-4 rounded-xl border border-[color:var(--t10-border)] bg-white px-5 py-2.5 text-sm font-bold text-[color:var(--t10-navy)] hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
              >
                <Key className="h-4 w-4" /> Change Password
              </button>
            ) : (
              <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4 max-w-md">
                {isEmailLinked && (
                  <label className="block space-y-1">
                    <span className="block text-xs font-bold text-neutral-400 uppercase">Current Password</span>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[color:var(--t10-border)] px-4 py-2.5 text-sm outline-none focus:border-[color:var(--t10-navy)]"
                    />
                  </label>
                )}
                
                <label className="block space-y-1">
                  <span className="block text-xs font-bold text-neutral-400 uppercase">New Password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-[color:var(--t10-border)] px-4 py-2.5 text-sm outline-none focus:border-[color:var(--t10-navy)]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="block text-xs font-bold text-neutral-400 uppercase">Confirm New Password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[color:var(--t10-border)] px-4 py-2.5 text-sm outline-none focus:border-[color:var(--t10-navy)]"
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-[color:var(--t10-navy)] px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(false)}
                    className="rounded-xl border border-[color:var(--t10-border)] bg-white px-5 py-2.5 text-sm font-bold text-[color:var(--t10-navy)] hover:bg-neutral-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
