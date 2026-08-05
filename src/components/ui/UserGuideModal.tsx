import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Users,
  Calendar,
  ClipboardList,
  Folder,
  FileText,
  CreditCard,
  X,
  ChevronRight,
  ChevronLeft,
  Bot,
  UserCheck,
  CheckCircle2,
  HelpCircle,
  Compass,
  Rocket,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

interface UserGuideModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  autoOpenFirstTime?: boolean;
}

const TOUR_STEPS = [
  {
    id: "welcome",
    stepNum: 1,
    title: "Welcome to Think10 Command Centre",
    badge: "Step 1 of 5 • Introduction",
    icon: Rocket,
    color: "from-emerald-500 to-teal-700",
    description:
      "Think10 is your hybrid business advisory platform. We combine 24/7 Virtual AI Consulting with Vetted Human Experts across the GCC.",
    points: [
      "24/7 Instant AI advice for market entry, pricing, & cost auditing.",
      "Vetted Human Business Advisors available for 1-on-1 strategy sessions.",
      "10-Dimension Health Audit tracking your unit economics & supply chain.",
    ],
    ctaText: "Next: Explore Zyne AI",
  },
  {
    id: "zyne",
    stepNum: 2,
    title: "Zyne VC — 24/7 AI Virtual Consultant",
    badge: "Step 2 of 5 • AI Advisory",
    icon: Bot,
    color: "from-blue-600 to-indigo-800",
    description:
      "Meet Zyne, your dedicated AI consultant trained on GCC commercial laws, Amazon UAE/noon margin structures, customs clearance, and unit economics.",
    points: [
      "Ask anything about DTC pricing, logistics, or competitor strategies.",
      "Clean, focused workspace for your business questions without clutter.",
      "Generate action plan items directly from AI diagnosis conversations.",
    ],
    ctaTo: "/dashboard/zyne",
    ctaText: "Next: Book Human Experts",
  },
  {
    id: "advisors",
    stepNum: 3,
    title: "Book Verified Human Business Experts",
    badge: "Step 3 of 5 • Human Advisory",
    icon: UserCheck,
    color: "from-emerald-600 to-green-700",
    description:
      "When you need human expertise, book 1-on-1 video calls with verified GCC leaders across E-Commerce, Marketing, Legal, and Operations.",
    points: [
      "Browse advisor credentials, ratings, and available time slots.",
      "Use your monthly included Human Credits or pay-per-call.",
      "Access session recordings and transcripts inside your Document Vault.",
    ],
    ctaTo: "/dashboard/advisors",
    ctaText: "Next: Action Plans & Health",
  },
  {
    id: "action-plans",
    stepNum: 4,
    title: "Action Plans & Business Health Score",
    badge: "Step 4 of 5 • Execution & Metrics",
    icon: ClipboardList,
    color: "from-amber-500 to-orange-600",
    description:
      "Turn AI recommendations and expert advice into structured execution checklists with deadlines and tracking.",
    points: [
      "Track your overall business health percentage across 10 dimensions.",
      "Prioritize overdue or critical bottleneck tasks automatically.",
      "Sync tasks seamlessly from Zyne AI strategy sessions.",
    ],
    ctaTo: "/dashboard/action-plans",
    ctaText: "Next: Document Vault & Billing",
  },
  {
    id: "vault",
    stepNum: 5,
    title: "Document Vault & Plan Entitlements",
    badge: "Step 5 of 5 • Storage & Credits",
    icon: ShieldCheck,
    color: "from-purple-600 to-pink-700",
    description:
      "Store P&L spreadsheets, financial models, strategy decks, and session transcripts in a single secure environment.",
    points: [
      "Manage your subscription tier, add expert credits, and download invoices.",
      "Share select financial documents securely with booked advisors.",
      "Access 24/7 support & platform resources anytime.",
    ],
    ctaTo: "/dashboard",
    ctaText: "Complete Tour & Start Exploring",
  },
];

export function UserGuideModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  autoOpenFirstTime = true,
}: UserGuideModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Auto-open on first time visit if not seen
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setInternalIsOpen(propIsOpen);
      return;
    }
    if (autoOpenFirstTime && typeof window !== "undefined") {
      const hasSeen = localStorage.getItem("t10_seen_auto_tour");
      if (!hasSeen) {
        setInternalIsOpen(true);
      }
    }
  }, [propIsOpen, autoOpenFirstTime]);

  const handleClose = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      localStorage.setItem("t10_seen_auto_tour", "true");
    }
    setInternalIsOpen(false);
    if (propOnClose) propOnClose();
  };

  if (!internalIsOpen) return null;

  const currentStep = TOUR_STEPS[activeStepIndex];
  const Icon = currentStep.icon;
  const isLastStep = activeStepIndex === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Progress Bar Top */}
        <div className="w-full bg-neutral-100 h-1.5 flex">
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ${
                idx <= activeStepIndex ? "bg-[color:var(--t10-emerald)]" : "bg-transparent"
              }`}
            />
          ))}
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[color:var(--t10-emerald)] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--t10-navy)]">
              Interactive Notion Product Tour
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-400">
              {activeStepIndex + 1} / {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleClose}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Step Hero Visual Card */}
          <div className={`rounded-2xl bg-gradient-to-r ${currentStep.color} p-6 text-white shadow-lg space-y-3 relative overflow-hidden`}>
            <div className="absolute -right-6 -bottom-6 opacity-15">
              <Icon className="h-36 w-36 text-white" />
            </div>

            <div className="relative z-10 space-y-2">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                {currentStep.badge}
              </span>
              <h2 className="text-2xl font-bold font-display leading-tight">
                {currentStep.title}
              </h2>
            </div>
          </div>

          {/* Description & Key Feature Bullet Points */}
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 leading-relaxed font-normal">
              {currentStep.description}
            </p>

            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5 space-y-3">
              <p className="text-xs font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">
                Key Platform Capabilities:
              </p>
              <ul className="space-y-2.5">
                {currentStep.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-700 font-medium">
                    <div className="h-4 w-4 rounded-full bg-[color:var(--t10-mint)] border border-emerald-300 flex items-center justify-center text-[color:var(--t10-emerald)] shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex justify-center gap-2 py-2 bg-neutral-50 border-t border-neutral-100">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeStepIndex === idx ? "w-6 bg-[color:var(--t10-emerald)]" : "w-2 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-neutral-100 bg-white">
          <label className="flex items-center gap-2 text-xs text-neutral-500 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-3.5 w-3.5 accent-[color:var(--t10-emerald)]"
            />
            <span>Don't show auto-tour again</span>
          </label>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeStepIndex === 0}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>

            {isLastStep ? (
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[color:var(--t10-emerald)] text-white text-xs font-bold hover:bg-[color:var(--t10-green)] transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" /> Finish Tour & Start
              </button>
            ) : (
              <button
                onClick={() => setActiveStepIndex((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[color:var(--t10-navy)] text-white text-xs font-bold hover:bg-neutral-800 transition-all shadow-md cursor-pointer"
              >
                Next Step <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
