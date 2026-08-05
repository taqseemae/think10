import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useConsultantState } from "@/context/ConsultantStateContext";
import {
  Calendar,
  Clock,
  Video,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Star,
  ChevronRight,
  FileText,
  CircleDollarSign,
  RefreshCcw,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

export const Route = createFileRoute("/consultant/")({
  component: ConsultantDashboardHome,
});

function ConsultantDashboardHome() {
  const { currentUser, userDoc } = useAuth();
  const { metrics, bookings, refreshData, deleteBooking } = useConsultantState();

  const [onboardingStep, setOnboardingStep] = useState(1);
  const [title, setTitle] = useState(userDoc?.consultantProfile?.title || "");
  const [bio, setBio] = useState(userDoc?.consultantProfile?.bio || "");
  const [primaryArea, setPrimaryArea] = useState(userDoc?.consultantProfile?.primaryArea || "Supply Chain & Logistics");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(userDoc?.consultantProfile?.topics || []);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (userDoc?.consultantProfile) {
      setTitle(userDoc.consultantProfile.title || "");
      setBio(userDoc.consultantProfile.bio || "");
      setPrimaryArea(userDoc.consultantProfile.primaryArea || "Supply Chain & Logistics");
      setTags(userDoc.consultantProfile.topics || []);
    }
  }, [userDoc]);

  // Real display name from userDoc or Firebase auth
  const displayName =
    userDoc?.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Consultant";

  const firstName = displayName.split(" ")[0];

  // Get hour-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Helper to safely parse dates
  const safeDate = (dateStr: any) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Upcoming confirmed bookings sorted by date
  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((b: any) => b.status === "CONFIRMED" || b.status === "Confirmed")
      .filter((b: any) => safeDate(b.when || b.date) !== null)
      .sort((a: any, b: any) => {
        const da = safeDate(a.when || a.date);
        const db = safeDate(b.when || b.date);
        return (da ? da.getTime() : 0) - (db ? db.getTime() : 0);
      });
  }, [bookings]);

  const nextBooking = upcomingBookings[0];

  // Today's bookings count
  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b: any) => {
    const d = safeDate(b.when || b.date);
    if (!d) return false;
    // Format to local date string to match todayStr
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const bDate = `${d.getFullYear()}-${month}-${day}`;
    return bDate === todayStr;
  }).length;

  // Completed sessions this month
  const completedThisMonth = bookings.filter((b: any) => {
    const d = safeDate(b.when || b.date);
    if (!d) return false;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const bMonth = `${d.getFullYear()}-${month}`;
    const thisMonth = new Date().toISOString().substring(0, 7);
    return b.status === "COMPLETED" && bMonth === thisMonth;
  }).length;

  // Pending payout: completed * 450 AED
  const pendingPayout = metrics.completedSessions * 450;

  // Generate real 7-day calendar strip from today
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${d.getFullYear()}-${month}-${dayStr}`;
      
      const dayBookings = bookings.filter((b: any) => {
        const bd = safeDate(b.when || b.date);
        if (!bd) return false;
        const bMonth = String(bd.getMonth() + 1).padStart(2, '0');
        const bDay = String(bd.getDate()).padStart(2, '0');
        const bDate = `${bd.getFullYear()}-${bMonth}-${bDay}`;
        return bDate === dateStr && (b.status === "CONFIRMED" || b.status === "Confirmed");
      }).length;
      
      days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.getDate().toString(),
        status: i === 0 ? "Today" : dayBookings > 0 ? `${dayBookings} Session${dayBookings > 1 ? "s" : ""}` : "Available",
        active: i === 0,
        sessions: dayBookings,
        off: dayBookings === 0 && i !== 0,
      });
    }
    return days;
  }, [bookings]);

  // Pending reports (completed bookings without a report)
  const pendingReports = bookings.filter(
    (b: any) => b.status === "COMPLETED" && !b.report
  ).length;

  if (userDoc?.onboarding?.completed === false) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white rounded-3xl border border-[color:var(--t10-border)] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[color:var(--t10-navy)] p-6 md:p-8 text-white relative">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/5 -mr-8 -mt-8" />
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--t10-emerald)]">Consultant Setup</span>
              <h2 className="text-2xl font-bold font-display">Configure Your Expert Profile</h2>
              <p className="text-xs text-white/80">Complete these simple steps to activate your Think10 advisory account.</p>
            </div>
            {/* Step indicator */}
            <div className="mt-6 flex items-center justify-between gap-3 text-xs font-semibold text-white/60">
              <span>Step {onboardingStep} of 5</span>
              <div className="flex-1 max-w-[200px] h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[color:var(--t10-emerald)] transition-all duration-300"
                  style={{ width: `${(onboardingStep / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
                {errorMsg}
              </div>
            )}

            {/* STEP 1: Personal Details */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">Step 1: Public Identity</h3>
                  <p className="text-xs text-neutral-500">Provide the basic title and biography clients will see when booking.</p>
                </div>
                <div className="space-y-4 pt-2">
                  <label className="block space-y-1.5">
                    <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Full Name</span>
                    <input 
                      type="text" 
                      value={userDoc?.displayName || currentUser?.displayName || ""} 
                      disabled
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-500 cursor-not-allowed"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block text-xs font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">Professional Title / Role *</span>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Supply Chain & Logistics Advisor"
                      className="w-full rounded-xl border border-[color:var(--t10-border)] px-4 py-2.5 text-sm text-[color:var(--t10-navy)] focus:border-[color:var(--t10-navy)] focus:ring-1 focus:ring-[color:var(--t10-navy)] outline-none"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="block text-xs font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">Biography / Professional Bio *</span>
                    <textarea 
                      rows={5} 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your expertise, past credentials (e.g. Former VP at Noon), and what clients can expect during a session."
                      className="w-full rounded-xl border border-[color:var(--t10-border)] px-4 py-2.5 text-sm text-[color:var(--t10-navy)] focus:border-[color:var(--t10-navy)] focus:ring-1 focus:ring-[color:var(--t10-navy)] outline-none resize-none"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 font-semibold">
                      <span>Minimum 50 characters</span>
                      <span>{bio.length} characters</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 2: Areas of Expertise */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">Step 2: Advisory Domains</h3>
                  <p className="text-xs text-neutral-500">Specify your primary category and tags so clients can find you easily.</p>
                </div>
                <div className="space-y-4 pt-2">
                  <label className="block space-y-1.5">
                    <span className="block text-xs font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">Primary Advisory Area *</span>
                    <select
                      value={primaryArea}
                      onChange={(e) => setPrimaryArea(e.target.value)}
                      className="w-full rounded-xl border border-[color:var(--t10-border)] bg-white px-4 py-2.5 text-sm text-[color:var(--t10-navy)] focus:border-[color:var(--t10-navy)] outline-none"
                    >
                      <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                      <option value="E-commerce Strategy">E-commerce Strategy</option>
                      <option value="Financial Planning">Financial Planning</option>
                      <option value="Marketing & Growth">Marketing & Growth</option>
                    </select>
                  </label>
                  
                  <div className="space-y-1.5">
                    <span className="block text-xs font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">Consultation Tags / Topics</span>
                    <div className="flex flex-wrap gap-2 rounded-xl border border-[color:var(--t10-border)] p-3 bg-neutral-50 min-h-[50px]">
                      {tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--t10-mint)] px-3 py-1 text-xs font-semibold text-[color:var(--t10-emerald)]">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => setTags(tags.filter(t => t !== tag))}
                            className="hover:text-[color:var(--t10-navy)] font-bold"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                      {tags.length === 0 && <span className="text-xs text-neutral-400">No tags added yet.</span>}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="e.g. Last-mile, 3PL contracts"
                        className="flex-1 rounded-xl border border-[color:var(--t10-border)] px-4 py-2 text-xs outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                              setTags([...tags, tagInput.trim()]);
                              setTagInput("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                            setTags([...tags, tagInput.trim()]);
                            setTagInput("");
                          }
                        }}
                        className="rounded-xl bg-[color:var(--t10-navy)] px-4 text-white text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Setup Availability */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">Step 3: Initial Schedule</h3>
                  <p className="text-xs text-neutral-500">Configure your standard advisory slots. Clients will be able to book sessions during these times.</p>
                </div>
                
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[color:var(--t10-emerald)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[color:var(--t10-navy)]">Apply Standard Work Hours</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">We will initialize your schedule as Monday to Friday, 9:00 AM to 6:00 PM (Gulf Standard Time, UTC+4).</p>
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-400 pt-2 border-t border-neutral-200">
                    You can fully customize these days, times, and buffer limits under the "My Availability" tab once your dashboard is unlocked.
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Document Verification Upload */}
            {onboardingStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">Step 4: Verification Documents</h3>
                  <p className="text-xs text-neutral-500">Upload your official credentials for Think10 quality review & admin approval.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="border border-dashed border-neutral-300 rounded-2xl p-4 bg-neutral-50 flex flex-col items-center justify-center text-center space-y-2">
                    <FileText className="w-8 h-8 text-[color:var(--t10-emerald)]" />
                    <div>
                      <h4 className="text-xs font-bold text-[color:var(--t10-navy)]">Emirates ID / National Passport *</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">PDF or JPEG, max 5MB</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[color:var(--t10-emerald)] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ Document Attached
                    </span>
                  </div>

                  <div className="border border-dashed border-neutral-300 rounded-2xl p-4 bg-neutral-50 flex flex-col items-center justify-center text-center space-y-2">
                    <FileText className="w-8 h-8 text-[color:var(--t10-navy)]" />
                    <div>
                      <h4 className="text-xs font-bold text-[color:var(--t10-navy)]">Trade License / Professional Cert *</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">PDF or JPEG, max 5MB</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[color:var(--t10-emerald)] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ Document Attached
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Your credentials will be securely reviewed by Think10 quality administrators before your consultant profile is published.</span>
                </div>
              </div>
            )}

            {/* STEP 5: Verification Fee & Submission */}
            {onboardingStep === 5 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">Step 5: Setup & Verification Fee</h3>
                  <p className="text-xs text-neutral-500">Pay your one-time onboarding & credential verification fee to submit your application.</p>
                </div>
                
                <div className="border border-[color:var(--t10-border)] rounded-2xl p-5 space-y-4 bg-neutral-50/50">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-[color:var(--t10-navy)]">Consultant Setup & Verification Package</h4>
                      <p className="text-xs text-neutral-500">Includes ID background check, calendar setup & marketplace listing</p>
                    </div>
                    <span className="text-base font-bold text-[color:var(--t10-navy)]">AED 500</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <span className="font-bold text-neutral-400 uppercase">Title</span>
                    <span className="col-span-2 font-semibold text-[color:var(--t10-navy)]">{title}</span>
                    
                    <span className="font-bold text-neutral-400 uppercase">Domain</span>
                    <span className="col-span-2 font-semibold text-[color:var(--t10-navy)]">{primaryArea}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-[color:var(--t10-border)]">
              {onboardingStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                  className="px-5 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              
              {onboardingStep < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    if (onboardingStep === 1) {
                      if (!title.trim() || !bio.trim()) {
                        setErrorMsg("Please fill in both the title and biography.");
                        return;
                      }
                      if (bio.length < 50) {
                        setErrorMsg("Biography must be at least 50 characters long.");
                        return;
                      }
                    }
                    setOnboardingStep(prev => prev + 1);
                  }}
                  className="px-6 py-2.5 bg-[color:var(--t10-navy)] text-white rounded-xl text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    setSubmitting(true);
                    setErrorMsg("");
                    try {
                      const uid = currentUser?.uid;
                      if (!uid) {
                        throw new Error("User session not found. Please refresh the page and try again.");
                      }

                      // Refresh the Firebase ID token and set cookie
                      try {
                        const freshToken = await currentUser.getIdToken(true);
                        const isSecure = window.location.protocol === 'https:';
                        const secureFlag = isSecure ? '; Secure' : '';
                        document.cookie = `auth_token=${freshToken}; path=/; max-age=3600${secureFlag}; SameSite=Strict`;
                      } catch (tokenErr) {
                        console.error("Failed to refresh token:", tokenErr);
                        throw new Error("Authentication expired. Please log out and log in again.");
                      }

                      const {
                        updateConsultantProfileFn,
                        setConsultantAvailabilityFn,
                        submitConsultantVerificationFn
                      } = await import("@/lib/server-actions");
                      
                      // 1. Save Profile
                      await updateConsultantProfileFn({
                        data: {
                          uid,
                          profile: { title, bio, primaryArea, topics: tags }
                        }
                      });
                      
                      // 2. Set Availability
                      await setConsultantAvailabilityFn({
                        data: {
                          consultantId: uid,
                          consultantName: userDoc?.displayName || currentUser?.displayName || "",
                          consultantEmail: userDoc?.email || currentUser?.email || "",
                          weeklySchedule: {
                            monday: [{ start: "09:00", end: "18:00" }],
                            tuesday: [{ start: "09:00", end: "18:00" }],
                            wednesday: [{ start: "09:00", end: "18:00" }],
                            thursday: [{ start: "09:00", end: "18:00" }],
                            friday: [{ start: "09:00", end: "18:00" }],
                            saturday: [],
                            sunday: [],
                          },
                          timezone: "Asia/Dubai",
                          sessionDurationMinutes: 60,
                          bufferMinutes: 15,
                          blockedDates: [],
                        }
                      });

                      // 3. Submit Verification Docs & Setup Fee Payment (Mock 500 AED)
                      await submitConsultantVerificationFn({
                        data: {
                          uid,
                          verificationDocs: {
                            emiratesId: "EmiratesID_Verified_Doc.pdf",
                            tradeLicense: "TradeLicense_Verified_Doc.pdf",
                            passport: "Passport_Copy.pdf",
                          },
                          setupFeePaid: true,
                        }
                      });

                      // 4. Reload page
                      window.location.reload();
                    } catch (err: any) {
                      setErrorMsg(err.message || "Failed to complete onboarding. Please try again.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[color:var(--t10-emerald)] hover:bg-[color:var(--t10-emerald)]/90 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow disabled:opacity-50"
                >
                  {submitting ? "Submitting Application..." : "Pay Setup Fee (500 AED) & Submit"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If the user has completed onboarding but is not yet approved by admin, block full access.
  if (userDoc?.approved !== true && userDoc?.email?.toLowerCase() !== "admin.think10@gmail.com" && currentUser?.email?.toLowerCase() !== "admin.think10@gmail.com") {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-3xl border border-[color:var(--t10-border)] shadow-xl overflow-hidden p-8 md:p-12 text-center flex flex-col items-center">
          <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold font-display text-[color:var(--t10-navy)] mb-3">Verification Pending Approval</h2>
          <p className="text-neutral-500 max-w-lg mb-8">
            Thank you for completing the onboarding process! Your credentials and uploaded documents are currently under review by the Think10 Admin team.
          </p>
          
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-left w-full max-w-md space-y-4">
            <h3 className="font-bold text-[color:var(--t10-navy)] text-sm border-b border-neutral-200 pb-3">What happens next?</h3>
            <ul className="space-y-3 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[color:var(--t10-emerald)] shrink-0 mt-0.5" />
                <span>Our quality team verifies your submitted identity and trade documents.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[color:var(--t10-emerald)] shrink-0 mt-0.5" />
                <span>We ensure your professional bio and tags meet platform standards.</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Once approved (usually within 24-48 hours), this dashboard will be unlocked and your public profile will go live.</span>
              </li>
            </ul>
          </div>
          
          <button 
            onClick={refreshData}
            className="mt-8 px-6 py-2.5 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCcw className="w-4 h-4" /> Check Status Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {greeting}, {firstName}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            {todayBookings > 0
              ? `You have ${todayBookings} session${todayBookings > 1 ? "s" : ""} scheduled today.`
              : "No sessions today — your schedule is clear."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors flex items-center gap-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Link
            to="/consultant/bookings"
            className="px-4 py-2 bg-[color:var(--t10-navy)] text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Manage Schedule
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Next Consultation or No Upcoming Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[color:var(--t10-emerald)] shadow-sm overflow-hidden">
          <div className="bg-[color:var(--t10-emerald)]/10 px-6 py-3 border-b border-[color:var(--t10-emerald)]/20 flex justify-between items-center">
            <span className="text-xs font-bold text-[color:var(--t10-emerald)] uppercase tracking-wider flex items-center gap-2">
              {nextBooking ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--t10-emerald)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--t10-emerald)]"></span>
                  </span>
                  Next Upcoming Session
                </>
              ) : (
                "No Upcoming Sessions"
              )}
            </span>
            {nextBooking && safeDate(nextBooking.when || nextBooking.date) && (
              <span className="text-xs text-[color:var(--t10-grey)]">
                {safeDate(nextBooking.when || nextBooking.date)!.toLocaleDateString("en-AE", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          <div className="p-6">
            {nextBooking ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">
                      {nextBooking.topic || "Advisory Session"}
                    </h3>
                    <p className="text-neutral-500 flex items-center gap-2 mt-2 font-medium">
                      <User className="w-4 h-4 text-[color:var(--t10-emerald)]" /> Client: {nextBooking.userName || nextBooking.userEmail || "Client User"}
                    </p>
                    {safeDate(nextBooking.when || nextBooking.date) && (
                      <p className="text-neutral-500 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />{" "}
                        {safeDate(nextBooking.when || nextBooking.date)!.toLocaleString("en-AE", {
                          weekday: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {nextBooking.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={nextBooking.meetLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[color:var(--t10-emerald)] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[color:var(--t10-emerald)]/90 transition-colors flex justify-center items-center gap-2"
                  >
                    <Video className="w-4 h-4" /> Join Call Room
                  </a>
                  <Link
                    to="/consultant/bookings"
                    className="flex-1 bg-white border border-neutral-200 text-neutral-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors flex justify-center items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> View Details
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm("Permanently delete this test session?")) {
                        deleteBooking(nextBooking.id);
                      }
                    }}
                    className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex justify-center items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No upcoming confirmed sessions.</p>
                <p className="text-neutral-400 text-xs mt-1">
                  New bookings from customers will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Required / Alerts */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-bold text-neutral-900">Action Required</h3>
          </div>
          <div className="flex-1 p-0 overflow-y-auto">
            <ul className="divide-y divide-neutral-100">
              {pendingReports > 0 && (
                <li className="p-4 hover:bg-neutral-50 cursor-pointer flex gap-4 transition-colors">
                  <div className="mt-0.5 bg-amber-100 p-1.5 rounded-full text-amber-600 h-fit">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {pendingReports} Session Report{pendingReports > 1 ? "s" : ""} Pending
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Complete post-session reports for your clients.
                    </p>
                    <p className="text-xs font-semibold text-amber-600 mt-2">Action required</p>
                  </div>
                </li>
              )}
              {pendingReports === 0 && upcomingBookings.length === 0 && (
                <li className="p-4 flex gap-4 text-neutral-400">
                  <CheckCircle2 className="w-5 h-5 text-[color:var(--t10-emerald)] mt-0.5 shrink-0" />
                  <p className="text-sm">All clear — no pending actions.</p>
                </li>
              )}
              {upcomingBookings.length > 0 && (
                <li className="p-4 hover:bg-neutral-50 cursor-pointer flex gap-4 transition-colors">
                  <div className="mt-0.5 bg-blue-100 p-1.5 rounded-full text-blue-600 h-fit">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Prepare for upcoming sessions
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {upcomingBookings.length} session{upcomingBookings.length > 1 ? "s" : ""} scheduled.
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Today's Sessions</h4>
            <Calendar className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">{todayBookings}</span>
            <span className="text-sm text-neutral-500">booked</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Quality Score</h4>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">
              {metrics.rating > 0 ? metrics.rating.toFixed(1) : "—"}
            </span>
            {metrics.rating > 0 && (
              <span className="text-sm text-[color:var(--t10-emerald)] flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {metrics.rating >= 4.5 ? "Top 10%" : "Good"}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Completed</h4>
            <CheckCircle2 className="w-5 h-5 text-[color:var(--t10-emerald)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">{metrics.completedSessions}</span>
            <span className="text-sm text-neutral-500">sessions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Pending Payout</h4>
            <CircleDollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">
              AED {pendingPayout.toLocaleString()}
            </span>
            <span className="text-sm text-neutral-500">est.</span>
          </div>
        </div>
      </div>

      {/* Live 7-Day Calendar Strip */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
          <h3 className="font-bold text-neutral-900">Your Week Ahead</h3>
          <Link
            to="/consultant/bookings"
            className="text-sm text-[color:var(--t10-emerald)] font-medium hover:underline flex items-center"
          >
            View full calendar <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-7 gap-4">
          {weekDays.map((col, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                col.active
                  ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-emerald)]/5 ring-1 ring-[color:var(--t10-emerald)]"
                  : col.sessions > 0
                    ? "border-blue-200 bg-blue-50"
                    : "border-neutral-100 bg-neutral-50 text-neutral-400"
              }`}
            >
              <span className={`text-xs font-semibold uppercase ${col.active ? "text-[color:var(--t10-emerald)]" : col.sessions > 0 ? "text-blue-600" : ""}`}>
                {col.day}
              </span>
              <span className={`text-2xl font-bold mt-1 ${col.active ? "text-[color:var(--t10-navy)]" : col.sessions > 0 ? "text-blue-800" : ""}`}>
                {col.date}
              </span>
              <span className={`text-[10px] mt-2 font-medium text-center ${col.active ? "text-[color:var(--t10-emerald)]" : col.sessions > 0 ? "text-blue-600" : "text-neutral-400"}`}>
                {col.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
