import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useDashboardState, type HealthScores } from "@/context/DashboardStateContext";
import { useAuth } from "@/context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { ZyneChat } from "@/components/site/ZyneChat";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Calendar,
  ClipboardList,
  FolderOpen,
  LineChart,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  FileText,
  CreditCard,
  Shield,
  Clock,
  Info,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/")({ component: Overview });

function Overview() {
  const {
    role,
    setRole,
    onboardingCompleted,
    setOnboardingCompleted,
    onboardingStep,
    setOnboardingStep,
    profile,
    updateProfileField,
    healthScores,
    updateHealthScores,
    calculateOverallHealthScore,
    bookings,
    actionItems,
    toggleActionItem,
    credits,
    documents,
  } = useDashboardState();

  const { currentUser, userDoc } = useAuth();
  const navigate = useNavigate();

  // Onboarding Wizard Local States
  const [agreePolicies, setAgreePolicies] = useState(false);
  const [emailVerifSent, setEmailVerifSent] = useState(false);
  const [emailVerifError, setEmailVerifError] = useState("");
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [checkoutCard, setCheckoutCard] = useState({ number: "", expiry: "", cvc: "" });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [enterpriseForm, setEnterpriseForm] = useState({ needs: "", teamSize: "1-5 members", phone: "" });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Health Assessment local slider scores
  const [localHealth, setLocalHealth] = useState({ ...healthScores });

  const HEALTH_DIMENSIONS = [
    { key: "valueProp", label: "Value Prop & Innovation", desc: "Clarity of GCC market positioning and unique product angles." },
    { key: "marketFit", label: "Product Market Fit", desc: "Consistency of purchase patterns and organic search demand." },
    { key: "unitEconomics", label: "Unit Economics & Profitability", desc: "Profit margins after marketplace fees and advertising costs." },
    { key: "channelEfficiency", label: "Channel Efficiency", desc: "Conversion rates and listing health on Amazon UAE/noon." },
    { key: "operations", label: "Operations & Fulfillment", desc: "Turnaround times, warehouse systems, and customer reviews." },
    { key: "teamOrg", label: "Team & Org Structure", desc: "Hiring alignment, compensation structures, and core skills." },
    { key: "marketingRoi", label: "Marketing ROI & Attribution", desc: "Attributable sales efficiency on Meta, TikTok, and Google Ads." },
    { key: "cashFlow", label: "Cash Flow & runway", desc: "Coherence of invoice collections, payables, and runway margins." },
    { key: "supplyChain", label: "Supply Chain & Sourcing", desc: "Lead time reliability, local stock sizing, and customs clearance." },
    { key: "systems", label: "Systems & AI Automation", desc: "Adoption of structured SOPs, reporting hubs, and AI shortcuts." },
  ];

  // Find lowest scores for Priority Areas
  const getPriorityGaps = () => {
    const sorted = HEALTH_DIMENSIONS.map((dim) => ({
      label: dim.label,
      score: localHealth[dim.key as keyof HealthScores] || 0,
    })).sort((a, b) => a.score - b.score);
    return sorted.slice(0, 2);
  };
  const priorityGaps = getPriorityGaps();

  // Handle onboarding step submit
  const nextStep = async () => {
    if (onboardingStep === 1) {
      if (!agreePolicies) return;
      // Email must be verified to proceed
      await currentUser?.reload();
      if (currentUser && !currentUser.emailVerified) {
        setEmailVerifError("Please verify your email first. Check your inbox and click the verification link, then click Continue.");
        return;
      }
      setEmailVerifError("");
      setOnboardingStep(2);
    } else if (onboardingStep === 2) {
      // Save profile
      Object.entries(profileForm).forEach(([k, v]) => {
        updateProfileField(k as any, v);
      });
      setOnboardingStep(3);
    } else if (onboardingStep === 3) {
      // Save health assessment
      updateHealthScores(localHealth);
      setIsAnalyzing(true);
      setAnalysisStep(1);

      setTimeout(() => {
        setAnalysisStep(2);
      }, 900);

      setTimeout(() => {
        setAnalysisStep(3);
      }, 1800);

      setTimeout(() => {
        setIsAnalyzing(false);
        setOnboardingStep(4);
      }, 2700);
    } else if (onboardingStep === 4) {
      // Choice of plan, moves to checkout
      setOnboardingStep(5);
    }
  };

  const handleCheckout = () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      if (role === "Enterprise") {
        updateProfileField("teamSize", enterpriseForm.teamSize);
      }
      setOnboardingCompleted(true);
    }, 1200);
  };

  const handleQuickChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = data.get("quick_query") as string;
    if (q) {
      navigate({
        to: "/dashboard/zyne",
        search: { q } as any,
      });
    }
  };

  // Compute Next Best Action dynamically
  const getNextBestAction = () => {
    const activeBooking = bookings.find((b) => b.status === "CONFIRMED");
    const overdueTask = actionItems.find((t) => !t.done && new Date(t.deadline) < new Date());
    const overallScore = calculateOverallHealthScore();

    if (activeBooking) {
      return {
        title: "Prepare for your strategy call",
        description: `Your strategy session with ${activeBooking.expertName} is scheduled. Complete the pre-call queries and attach context files.`,
        ctaLabel: "Open preparation panel",
        action: () => navigate({ to: "/dashboard/sessions" }),
        accent: "emerald",
      };
    } else if (overdueTask) {
      return {
        title: "Action items overdue",
        description: `Task: "${overdueTask.title}" is overdue (Deadline: ${overdueTask.deadline}). Re-schedule or complete this item.`,
        ctaLabel: "Resolve task list",
        action: () => navigate({ to: "/dashboard/action-plans" }),
        accent: "yellow",
      };
    } else if (overallScore < 60) {
      return {
        title: "Diagnose Business Gaps",
        description: "Your business health score is currently low (below 60%). Re-take the assessment or review Zyne's structured pricing recommendations.",
        ctaLabel: "Improve health score",
        action: () => navigate({ to: "/dashboard/business-profile" }),
        accent: "red",
      };
    } else if (role === "Free") {
      return {
        title: "Upgrade to Paid Plan",
        description: "Free preview contains limited Zyne VA capabilities. Upgrade to Hybrid or Premium to get human expert credits and unlimited Zyne VC consulting.",
        ctaLabel: "Compare member plans",
        action: () => navigate({ to: "/dashboard/billing" }),
        accent: "navy",
      };
    }

    return {
      title: "Continue business strategy",
      description: "No urgent actions. Start a fresh conversation with Zyne VC to audit your supplier logistics or review cash runway.",
      ctaLabel: "Consult with Zyne",
      action: () => navigate({ to: "/dashboard/zyne" }),
      accent: "emerald",
    };
  };

  const nba = getNextBestAction();

  // If Zyne is calculating scores & priority areas
  if (isAnalyzing) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[color:var(--t10-border)] bg-white p-8 shadow-xl md:p-12 text-center animate-fade-in space-y-6">
        <div className="flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-dashed border-[color:var(--t10-emerald)] animate-spin">
            <Sparkles className="h-8 w-8 text-[color:var(--t10-emerald)] animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[color:var(--t10-navy)]">Zyne AI Analyzing Gaps...</h2>
          <p className="text-xs text-[color:var(--t10-grey)]">
            We are analyzing your business profile and health check inputs to generate personalized focus priorities.
          </p>
        </div>

        {/* Step Items */}
        <div className="max-w-xs mx-auto text-left space-y-3 pt-4 border-t border-[color:var(--t10-border)]">
          <div className="flex items-center gap-3 text-xs">
            <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${analysisStep >= 1 ? "bg-[color:var(--t10-emerald)] text-white" : "bg-neutral-100 text-neutral-400"}`}>
              {analysisStep > 1 ? "✓" : "1"}
            </div>
            <span className={analysisStep >= 1 ? "font-semibold text-[color:var(--t10-navy)]" : "text-neutral-400"}>
              Calibrating GCC market positioning...
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${analysisStep >= 2 ? "bg-[color:var(--t10-emerald)] text-white" : "bg-neutral-100 text-neutral-400"}`}>
              {analysisStep > 2 ? "✓" : "2"}
            </div>
            <span className={analysisStep >= 2 ? "font-semibold text-[color:var(--t10-navy)]" : "text-neutral-400"}>
              Evaluating unit economics & margins...
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${analysisStep >= 3 ? "bg-[color:var(--t10-emerald)] text-white" : "bg-neutral-100 text-neutral-400"}`}>
              {analysisStep > 3 ? "✓" : "3"}
            </div>
            <span className={analysisStep >= 3 ? "font-semibold text-[color:var(--t10-navy)]" : "text-neutral-400"}>
              Generating personalized priority home...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If Onboarding is incomplete
  if (!onboardingCompleted) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-xl md:p-10 animate-fade-in">
        {/* Wizard Headers */}
        <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--t10-emerald)]">
              Guided Onboarding
            </span>
            <h1 className="mt-1 text-2xl font-bold text-[color:var(--t10-navy)]">
              Welcome to Think10
            </h1>
          </div>
          <span className="rounded-full bg-[color:var(--t10-mint)] px-3 py-1 text-xs font-bold text-[color:var(--t10-navy)]">
            Step {onboardingStep} of 5
          </span>
        </div>

        {/* Step Progress indicators */}
        <div className="mt-6 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= onboardingStep ? "bg-[color:var(--t10-emerald)]" : "bg-[color:var(--t10-border)]"}`}
            />
          ))}
        </div>

        {/* Step 1: Verification & Policies */}
        {onboardingStep === 1 && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--t10-navy)]">
                Verify contact details & consent policies
              </h2>
              <p className="mt-1 text-sm text-[color:var(--t10-grey)]">
                A verification link has been sent to <strong>{currentUser?.email}</strong>. Click it to confirm your email, then continue.
              </p>
            </div>

            <div className="space-y-4">
              {/* Email verification status */}
              {currentUser?.emailVerified ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-semibold text-emerald-700">Email verified ✓</span>
                </div>
              ) : (
                <div className="rounded-xl border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] p-4 space-y-3">
                  <p className="text-xs text-[color:var(--t10-grey)]">
                    Haven't received the email? Check spam, or resend below.
                  </p>
                  <button
                    type="button"
                    disabled={emailVerifSent}
                    onClick={async () => {
                      if (currentUser) {
                        try {
                          await sendEmailVerification(currentUser);
                          setEmailVerifSent(true);
                          setEmailVerifError("");
                        } catch (e: any) {
                          setEmailVerifError("Could not send email: " + (e?.message ?? "Try again later."));
                        }
                      }
                    }}
                    className="rounded-lg border border-[color:var(--t10-navy)] px-4 py-2 text-xs font-semibold text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-navy)] hover:text-white transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {emailVerifSent ? "Email sent ✓ — check your inbox" : "Resend verification email"}
                  </button>
                  {emailVerifError && (
                    <p className="text-xs font-semibold text-red-500">{emailVerifError}</p>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] p-4 space-y-3 mt-2">
                <p className="text-xs font-semibold text-[color:var(--t10-navy)] uppercase tracking-wider">
                  Think10 Consent & Privacy Clauses
                </p>
                <div className="text-xs text-[color:var(--t10-grey)] leading-relaxed space-y-2">
                  <p>
                    • <strong>AI Processing</strong>: Zyne processes your business P&L sheets and parameters to structure recommendations. No data is shared externally.
                  </p>
                  <p>
                    • <strong>Auditable Consultations</strong>: Session recordings with human advisors are saved only in your workspace. You can revoke advisor access at any time.
                  </p>
                </div>
                <label className="flex items-center gap-2 pt-2 border-t border-[color:var(--t10-border)]">
                  <input
                    type="checkbox"
                    checked={agreePolicies}
                    onChange={(e) => setAgreePolicies(e.target.checked)}
                    className="h-4 w-4 accent-[color:var(--t10-emerald)]"
                  />
                  <span className="text-xs font-medium text-[color:var(--t10-navy)]">
                    I agree to the data processing & session recording policies.
                  </span>
                </label>
              </div>
            </div>

            <button
              onClick={nextStep}
              disabled={!agreePolicies}
              className="mt-6 flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--t10-navy)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-all cursor-pointer"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Create Business Profile */}
        {onboardingStep === 2 && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--t10-navy)]">
                Build your business profile
              </h2>
              <p className="mt-1 text-sm text-[color:var(--t10-grey)]">
                Provide basic parameters so Zyne VC can calibrate recommendations.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[color:var(--t10-navy)] uppercase">
                  Business name
                </span>
                <input
                  type="text"
                  value={profileForm.businessName}
                  onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                  className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[color:var(--t10-navy)] uppercase">
                  Industry / Category
                </span>
                <select
                  value={profileForm.industry}
                  onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                  className="w-full rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="Beauty & personal care">Beauty & personal care</option>
                  <option value="Fashion & Apparels">Fashion & Apparels</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="FMCG & Goods">FMCG & Goods</option>
                  <option value="Software & Tech">Software & Tech</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[color:var(--t10-navy)] uppercase">
                  Business Stage
                </span>
                <select
                  value={profileForm.stage}
                  onChange={(e) => setProfileForm({ ...profileForm, stage: e.target.value })}
                  className="w-full rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2 text-sm"
                >
                  <option value="Idea stage">Idea stage / Planning</option>
                  <option value="Operating 1 year">Operating under 1 year</option>
                  <option value="Operating 2 years">Operating 2 years</option>
                  <option value="Scaling GCC (3+ years)">Scaling GCC (3+ years)</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[color:var(--t10-navy)] uppercase">
                  Annual Revenue (est.)
                </span>
                <input
                  type="text"
                  value={profileForm.revenue}
                  onChange={(e) => setProfileForm({ ...profileForm, revenue: e.target.value })}
                  className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2 text-sm"
                />
              </label>
              <div className="col-span-full border-t border-[color:var(--t10-border)] pt-4">
                <p className="text-xs font-bold text-[color:var(--t10-navy)] uppercase mb-2">
                  Active Channels
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-[color:var(--t10-navy)]">
                  {["Shopify", "Amazon UAE", "noon", "Wholesale", "Retail Store"].map((c) => (
                    <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileForm.channels.includes(c)}
                        onChange={(e) => {
                          const list = e.target.checked
                            ? [...profileForm.channels, c]
                            : profileForm.channels.filter((x) => x !== c);
                          setProfileForm({ ...profileForm, channels: list });
                        }}
                        className="h-3.5 w-3.5 accent-[color:var(--t10-emerald)]"
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Goals Multi-Select */}
              <div className="col-span-full border-t border-[color:var(--t10-border)] pt-4">
                <p className="text-xs font-bold text-[color:var(--t10-navy)] uppercase mb-2">
                  Business Goals (Select all that apply)
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Increase conversion rate",
                    "Launch DTC subscription app",
                    "Reduce logistics costs",
                    "Expand into KSA",
                    "Audit Amazon PPC costs",
                    "Secure local GCC retail distributors"
                  ].map((goal) => {
                    const isSelected = profileForm.goals?.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => {
                          const updatedGoals = isSelected
                            ? profileForm.goals?.filter((g) => g !== goal)
                            : [...(profileForm.goals || []), goal];
                          setProfileForm({ ...profileForm, goals: updatedGoals });
                        }}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${isSelected ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] text-[color:var(--t10-navy)] font-semibold shadow-sm" : "border-[color:var(--t10-border)] hover:border-neutral-400 text-[color:var(--t10-grey)] bg-white"}`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="mt-6 flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--t10-navy)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-all"
            >
              Next: Business Health check <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 3: Business Health Assessment */}
        {onboardingStep === 3 && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--t10-navy)]">
                Business Health Assessment
              </h2>
              <p className="mt-1 text-sm text-[color:var(--t10-grey)]">
                Provide quick mock ratings (1-10) for these 10 core dimensions.
              </p>
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 border-y border-[color:var(--t10-border)] py-4">
              {HEALTH_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="rounded-lg border border-[color:var(--t10-border)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[color:var(--t10-navy)] uppercase">
                      {dim.label}
                    </span>
                    <span className="rounded bg-[color:var(--t10-mint)] px-2 py-0.5 text-xs font-bold text-[color:var(--t10-navy)]">
                      {localHealth[dim.key as keyof HealthScores]} / 10
                    </span>
                  </div>
                  <p className="text-[11px] text-[color:var(--t10-grey)] mt-0.5 leading-tight">
                    {dim.desc}
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={localHealth[dim.key as keyof HealthScores]}
                    onChange={(e) =>
                      setLocalHealth({ ...localHealth, [dim.key]: parseInt(e.target.value) })
                    }
                    className="mt-2 w-full accent-[color:var(--t10-emerald)]"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={nextStep}
              className="mt-6 flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--t10-navy)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-all"
            >
              Analyze Business Gaps <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 4: Plan Selection */}
        {onboardingStep === 4 && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--t10-navy)]">
                Choose your advisory membership
              </h2>
              <p className="mt-1 text-sm text-[color:var(--t10-grey)]">
                Zyne has completed its analysis and identified your top priority gaps.
              </p>
              
              {/* Display priority gaps */}
              <div className="mt-4 p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex gap-3 text-xs text-rose-900 animate-pulse">
                <Info className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px] text-rose-700">Zyne Identified Focus Gaps:</p>
                  <p className="mt-1 leading-relaxed">
                    Based on your health assessment, your primary advisory priorities are <strong>{priorityGaps[0]?.label}</strong> (Score: {priorityGaps[0]?.score}/10) and <strong>{priorityGaps[1]?.label}</strong> (Score: {priorityGaps[1]?.score}/10).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Free Plan */}
              <div
                onClick={() => setRole("Free")}
                className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${role === "Free" ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] shadow-md" : "border-[color:var(--t10-border)] hover:border-neutral-400 bg-white"}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[color:var(--t10-navy)]">Free / Explorer</p>
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-[color:var(--t10-navy)] uppercase">Explore</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-[color:var(--t10-navy)]">AED 0 <span className="text-xs font-normal text-[color:var(--t10-grey)]">/ mo</span></p>
                  <ul className="mt-3 text-[11px] text-[color:var(--t10-grey)] space-y-1">
                    <li>• Limited Zyne VA</li>
                    <li>• 5 message tokens / session</li>
                    <li>• Advisor discovery tools</li>
                  </ul>
                </div>
              </div>

              {/* Zyne Paid */}
              <div
                onClick={() => setRole("ZynePaid")}
                className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${role === "ZynePaid" ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] shadow-md" : "border-[color:var(--t10-border)] hover:border-neutral-400 bg-white"}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[color:var(--t10-navy)]">Zyne Advisory</p>
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 uppercase">AI Only</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-[color:var(--t10-navy)]">AED 290 <span className="text-xs font-normal text-[color:var(--t10-grey)]">/ mo</span></p>
                  <ul className="mt-3 text-[11px] text-[color:var(--t10-grey)] space-y-1">
                    <li>• Unlimited AI VC consults</li>
                    <li>• Custom cost & margin sheets</li>
                    <li>• Pay-per-call expert booking</li>
                  </ul>
                </div>
              </div>

              {/* Hybrid Plan */}
              <div
                onClick={() => setRole("Hybrid")}
                className={`cursor-pointer rounded-2xl border p-4 transition-all relative flex flex-col justify-between ${role === "Hybrid" ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] shadow-md" : "border-[color:var(--t10-border)] hover:border-neutral-400 bg-white"}`}
              >
                <span className="absolute -top-2.5 right-3 rounded-full bg-[color:var(--t10-emerald)] px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                  Recommended
                </span>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[color:var(--t10-navy)]">Hybrid Advisory</p>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">AI + Human</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-[color:var(--t10-navy)]">AED 950 <span className="text-xs font-normal text-[color:var(--t10-grey)]">/ mo</span></p>
                  <ul className="mt-3 text-[11px] text-[color:var(--t10-grey)] space-y-1">
                    <li>• Everything in Zyne Paid</li>
                    <li>• <strong>2 human expert credits</strong> / mo</li>
                    <li>• Command Centre file sharing</li>
                  </ul>
                </div>
              </div>

              {/* Premium Plan */}
              <div
                onClick={() => setRole("Premium")}
                className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${role === "Premium" ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] shadow-md" : "border-[color:var(--t10-border)] hover:border-neutral-400 bg-white"}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[color:var(--t10-navy)]">Premium Advisory</p>
                    <span className="rounded bg-purple-50 px-2 py-0.5 text-[9px] font-bold text-purple-700 uppercase">Premium</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-[color:var(--t10-navy)]">AED 2,500 <span className="text-xs font-normal text-[color:var(--t10-grey)]">/ mo</span></p>
                  <ul className="mt-3 text-[11px] text-[color:var(--t10-grey)] space-y-1">
                    <li>• Unlimited AI VC consults</li>
                    <li>• <strong>5 human expert credits</strong> / mo</li>
                    <li>• Priority support & templates</li>
                  </ul>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div
                onClick={() => setRole("Enterprise")}
                className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${role === "Enterprise" ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] shadow-md" : "border-[color:var(--t10-border)] hover:border-neutral-400 bg-white"}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[color:var(--t10-navy)]">Enterprise Enquiry</p>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase font-mono">Custom</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-[color:var(--t10-navy)]">Custom Price</p>
                  <ul className="mt-3 text-[11px] text-[color:var(--t10-grey)] space-y-1">
                    <li>• Dedicated GCC advisor lead</li>
                    <li>• Discovery call & proposal</li>
                    <li>• Multi-brand management</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              onClick={nextStep}
              className="mt-6 flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--t10-navy)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-all"
            >
              Continue to checkout <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 5: Checkout or Enterprise Lead Form */}
        {onboardingStep === 5 && (
          <div className="mt-8 space-y-6 animate-fade-in">
            {role === "Enterprise" ? (
              // Enterprise Lead Form
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--t10-navy)]">
                    Enterprise custom business enquiry
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--t10-grey)]">
                    Please provide some details about your custom needs. Our GCC Advisory Lead will schedule a discovery call with you.
                  </p>
                </div>
                <div className="max-w-md space-y-4">
                  <label className="block text-sm">
                    <span className="mb-1 block font-bold text-[10px] text-neutral-400 uppercase">
                      Primary Enterprise Requirements
                    </span>
                    <textarea
                      rows={3}
                      value={enterpriseForm.needs}
                      onChange={(e) => setEnterpriseForm({ ...enterpriseForm, needs: e.target.value })}
                      placeholder="Describe your custom GCC goals, specific cross-border concerns or wholesale listing logistics..."
                      className="w-full rounded-md border border-[color:var(--t10-border)] p-2.5 text-xs outline-none focus:border-[color:var(--t10-emerald)] bg-white"
                      required
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block text-sm">
                      <span className="mb-1 block font-bold text-[10px] text-neutral-400 uppercase">
                        Team Size
                      </span>
                      <select
                        value={enterpriseForm.teamSize}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, teamSize: e.target.value })}
                        className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2 text-xs bg-white"
                      >
                        <option value="1-5 members">1-5 members</option>
                        <option value="6-20 members">6-20 members</option>
                        <option value="21-50 members">21-50 members</option>
                        <option value="50+ members">50+ members</option>
                      </select>
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-bold text-[10px] text-neutral-400 uppercase">
                        Contact Phone
                      </span>
                      <input
                        type="tel"
                        value={enterpriseForm.phone}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, phone: e.target.value })}
                        placeholder="+971 50 123 4567"
                        className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2 text-xs bg-white"
                        required
                      />
                    </label>
                  </div>
                  <div className="flex gap-2 rounded bg-amber-50/50 border border-amber-100 p-3 text-xs text-amber-800">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>
                      This submits your inquiry directly to our Dubai-based Enterprise Team. A coordinator will reach out in 1 business day.
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="flex items-center justify-center rounded-lg border border-[color:var(--t10-border)] px-5 py-2.5 text-sm font-semibold text-[color:var(--t10-navy)] hover:bg-neutral-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || !enterpriseForm.needs || !enterpriseForm.phone}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[color:var(--t10-emerald)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--t10-green)] disabled:opacity-50 transition-all shadow"
                  >
                    {checkoutLoading ? "Submitting Custom Lead..." : "Submit Enquiry & Unlock Dashboard"}
                  </button>
                </div>
              </div>
            ) : role === "Free" ? (
              // Free tier activation
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--t10-navy)]">
                    Confirm Free Explorer Access
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--t10-grey)]">
                    You have chosen the <strong>Free / Explorer</strong> tier. You will have access to:
                  </p>
                </div>

                <div className="max-w-md rounded-xl border border-[color:var(--t10-border)] p-4 bg-[color:var(--t10-offwhite)] space-y-2">
                  <p className="text-xs text-[color:var(--t10-navy)] leading-relaxed">• <strong>5 message tokens</strong> to consult with Zyne Virtual Assistant.</p>
                  <p className="text-xs text-[color:var(--t10-navy)] leading-relaxed">• Vetted consultant directories for advisor discovery.</p>
                  <p className="text-xs text-[color:var(--t10-navy)] leading-relaxed">• Basic Business Profile and Health Audit logs.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="flex items-center justify-center rounded-lg border border-[color:var(--t10-border)] px-5 py-2.5 text-sm font-semibold text-[color:var(--t10-navy)] hover:bg-neutral-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[color:var(--t10-navy)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow"
                  >
                    {checkoutLoading ? "Activating Explorer..." : "Activate Free Tier"}
                  </button>
                </div>
              </div>
            ) : (
              // Paid Plan Checkout
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--t10-navy)]">
                    Secure Checkout
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--t10-grey)]">
                    Mock payment for your selected plan:{" "}
                    <span className="font-bold text-[color:var(--t10-navy)]">{role}</span>.
                  </p>
                </div>
                <div className="max-w-md space-y-4">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[color:var(--t10-navy)]">
                      Card Number (Simulate: enter any)
                    </span>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={checkoutCard.number}
                      onChange={(e) => setCheckoutCard({ ...checkoutCard, number: e.target.value })}
                      className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2 text-sm bg-white"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium text-[color:var(--t10-navy)]">
                        Expiry Date
                      </span>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={checkoutCard.expiry}
                        onChange={(e) => setCheckoutCard({ ...checkoutCard, expiry: e.target.value })}
                        className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2 text-sm bg-white"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium text-[color:var(--t10-navy)]">CVC</span>
                      <input
                        type="text"
                        placeholder="123"
                        value={checkoutCard.cvc}
                        onChange={(e) => setCheckoutCard({ ...checkoutCard, cvc: e.target.value })}
                        className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2 text-sm bg-white"
                      />
                    </label>
                  </div>
                  <div className="flex gap-2 rounded bg-blue-50/50 border border-blue-100 p-3 text-xs text-blue-800">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>
                      This is a simulated secure check. No real currency will be charged to your card.
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="flex items-center justify-center rounded-lg border border-[color:var(--t10-border)] px-5 py-2.5 text-sm font-semibold text-[color:var(--t10-navy)] hover:bg-neutral-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[color:var(--t10-emerald)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--t10-green)] disabled:opacity-50 transition-all shadow"
                  >
                    {checkoutLoading ? "Activating Entitlements..." : "Activate Membership"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // If Onboarding is COMPLETE: render dashboard overview
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Welcome & Business Banner */}
      <div className="rounded-2xl border border-[color:var(--t10-border)] bg-[color:var(--t10-navy)] p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[color:var(--t10-emerald)]/10 blur-xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest text-[color:var(--t10-emerald)] font-bold">
            {role} Membership Active
          </p>
          <h2 className="mt-1 text-2xl font-bold font-display">
            Welcome back, {currentUser?.displayName || userDoc?.displayName || "Founder"}
          </h2>
          <p className="mt-1 text-sm text-[color:var(--t10-mint)]/70">
            {profile.businessName || "Your Business"} 
            {profile.stage ? ` · ${profile.stage}` : ""} 
            {profile.channels && profile.channels.length > 0 ? ` · Channels: ${profile.channels.join(", ")}` : ""}
          </p>
        </div>
      </div>

      {/* 2. Main content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Next Best Action (NBA) */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--t10-grey)]">
                <Clock className="h-4 w-4 text-[color:var(--t10-emerald)]" /> Next recommended action
              </span>
              <span className="rounded bg-[color:var(--t10-mint)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">
                Priority: High
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-[color:var(--t10-navy)]">{nba.title}</h3>
            <p className="mt-1 text-sm text-[color:var(--t10-grey)] leading-relaxed">
              {nba.description}
            </p>
            <button
              onClick={nba.action}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[color:var(--t10-emerald)] px-4 py-2 text-xs font-bold text-white hover:bg-[color:var(--t10-green)] transition-all shadow-sm"
            >
              {nba.ctaLabel} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mini Zyne Ask Box */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-[color:var(--t10-navy)] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[color:var(--t10-emerald)]" /> Quick consultation with Zyne VC
            </h3>
            <form onSubmit={handleQuickChatSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                name="quick_query"
                placeholder="Ask Zyne about market pricing, cost margins, logistics..."
                className="flex-1 rounded-lg border border-[color:var(--t10-border)] bg-white px-3 py-2 text-sm text-[color:var(--t10-navy)] outline-none focus:border-[color:var(--t10-emerald)]"
              />
              <button
                type="submit"
                className="rounded-lg bg-[color:var(--t10-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                Send
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Price DTC vs noon", "FBA fee audit", "Ramadan planning"].map((q) => (
                <Link
                  key={q}
                  to="/dashboard/zyne"
                  search={{ q } as any}
                  className="rounded-full border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--t10-grey)] hover:bg-[color:var(--t10-mint)] hover:text-[color:var(--t10-navy)]"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming Booking Call box */}
          {bookings.filter((b) => b.status === "CONFIRMED").map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 rounded bg-[color:var(--t10-emerald)] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                  Upcoming call
                </span>
                <p className="text-sm font-bold text-[color:var(--t10-navy)]">
                  {b.expertName} <span className="text-xs font-normal text-[color:var(--t10-grey)]">— {b.expertRole}</span>
                </p>
                <p className="text-xs text-[color:var(--t10-grey)]">
                  Topic: <strong>{b.topic}</strong> · {b.when}
                </p>
              </div>
              <Link
                to="/dashboard/sessions"
                className="rounded-lg bg-[color:var(--t10-navy)] px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
              >
                Join Consultation Room
              </Link>
            </div>
          ))}
        </div>

        {/* Right side widgets */}
        <div className="space-y-6">
          {/* Health Score snapshot */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">
              Business Health Snapshot
            </h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-dashed border-[color:var(--t10-mint)]">
                <span className="text-2xl font-bold text-[color:var(--t10-navy)]">
                  {calculateOverallHealthScore()}%
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-bold text-[color:var(--t10-navy)] uppercase tracking-wide">
                  Top Priority Gaps:
                </p>
                <ul className="text-xs text-[color:var(--t10-grey)] space-y-1 leading-normal">
                  <li>• Marketing ROI (Score: {healthScores.marketingRoi}/10)</li>
                  <li>• Cash Flow runway (Score: {healthScores.cashFlow}/10)</li>
                </ul>
              </div>
            </div>
            <Link
              to="/dashboard/business-profile"
              className="mt-4 block rounded-lg border border-[color:var(--t10-navy)] py-2 text-center text-xs font-bold text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-navy)] hover:text-white transition-all"
            >
              Analyze Dimension Gaps
            </Link>
          </div>

          {/* Action Plans quick check list */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">
                Action Plan Progress
              </h3>
              <Link
                to="/dashboard/action-plans"
                className="text-xs font-semibold text-[color:var(--t10-emerald)]"
              >
                Full board
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-[color:var(--t10-border)]">
              {actionItems.slice(0, 3).map((item) => (
                <li key={item.id} className="flex items-center gap-2.5 py-2.5">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleActionItem(item.id)}
                    className="h-4 w-4 rounded border-gray-300 accent-[color:var(--t10-emerald)]"
                  />
                  <span className={`text-xs flex-1 truncate ${item.done ? "text-[color:var(--t10-grey)] line-through" : "text-[color:var(--t10-navy)]"}`}>
                    {item.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Entitlements & Credits Card */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">
              Entitlements
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-[color:var(--t10-offwhite)] p-3 border border-[color:var(--t10-border)]">
                <span className="text-[10px] uppercase font-bold text-[color:var(--t10-grey)]">
                  Expert Credits
                </span>
                <p className="mt-1 text-2xl font-bold text-[color:var(--t10-navy)]">{credits}</p>
              </div>
              <div className="rounded-xl bg-[color:var(--t10-offwhite)] p-3 border border-[color:var(--t10-border)]">
                <span className="text-[10px] uppercase font-bold text-[color:var(--t10-grey)]">
                  Shared Docs
                </span>
                <p className="mt-1 text-2xl font-bold text-[color:var(--t10-navy)]">
                  {documents.length}
                </p>
              </div>
            </div>
            <Link
              to="/dashboard/billing"
              className="block rounded-lg bg-[color:var(--t10-navy)] py-2 text-center text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
            >
              Add Credits & Invoices
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
