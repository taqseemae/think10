import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDashboardState } from "@/context/DashboardStateContext";
import { EXPERTS, ADVISORY_AREAS, type Expert } from "@/data/think10";
import { useState, useMemo } from "react";
import {
  Search,
  ShieldCheck,
  MapPin,
  Languages,
  Check,
  Scale,
  Calendar,
  X,
  ChevronRight,
  Info,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/advisors")({
  component: AdvisorsPage,
});

function AdvisorsPage() {
  const { credits, createBooking, role } = useDashboardState();
  const navigate = useNavigate();

  // Search & Filter state
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");
  const [lang, setLang] = useState("");

  // Comparison State
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Booking Modal State
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [preCall, setPreCall] = useState({
    challenge: "",
    questions: "",
    additionalDocs: "",
  });

  const languages = Array.from(new Set(EXPERTS.flatMap((e) => e.languages)));

  // Filter experts list
  const filteredExperts = useMemo(() => {
    return EXPERTS.filter((e) => {
      if (area && !e.areas.includes(area)) return false;
      if (lang && !e.languages.includes(lang)) return false;
      if (q) {
        const s = `${e.name} ${e.role} ${e.bio}`.toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [q, area, lang]);

  // Handle comparison selection
  const handleToggleCompare = (slug: string) => {
    setCompareSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < 3 ? [...prev, slug] : prev
    );
  };

  const comparedExperts = useMemo(() => {
    return EXPERTS.filter((e) => compareSlugs.includes(e.slug));
  }, [compareSlugs]);

  // Handle Booking form submission
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpert || !selectedSlot || !sessionType) return;

    const success = createBooking(
      selectedExpert.slug,
      selectedSlot,
      sessionType,
      preCall.challenge.substr(0, 40) + "...",
      preCall,
      preCall.additionalDocs ? [preCall.additionalDocs] : []
    );

    if (success) {
      setSelectedExpert(null);
      setSelectedSlot("");
      setSessionType("");
      setPreCall({ challenge: "", questions: "", additionalDocs: "" });
      navigate({ to: "/dashboard/sessions" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[color:var(--t10-navy)]">Speak with UAE Experts</h2>
        <p className="text-sm text-[color:var(--t10-grey)]">
          Vetted practitioners with real GCC retail and e-commerce experience. Book using credits.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="grid gap-3 rounded-2xl border border-[color:var(--t10-border)] bg-white p-4 sm:grid-cols-[1.5fr_1fr_1fr]">
        <label className="flex items-center gap-2 rounded-md border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] px-3">
          <Search className="h-4 w-4 text-[color:var(--t10-grey)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search specialties, brand background..."
            className="w-full bg-transparent py-2 text-xs outline-none"
          />
        </label>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2 text-xs text-[color:var(--t10-navy)]"
        >
          <option value="">All Advisory Areas</option>
          {ADVISORY_AREAS.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.title}
            </option>
          ))}
        </select>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2 text-xs text-[color:var(--t10-navy)]"
        >
          <option value="">Any Language</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Experts Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredExperts.map((e) => {
          const isComparing = compareSlugs.includes(e.slug);
          return (
            <div
              key={e.slug}
              className="flex flex-col justify-between rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--t10-navy)] text-xs font-bold text-white uppercase">
                      {e.initials}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[color:var(--t10-navy)]">{e.name}</h4>
                      <p className="text-[11px] text-[color:var(--t10-grey)]">{e.role}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-1 cursor-pointer select-none rounded bg-[color:var(--t10-offwhite)] border border-[color:var(--t10-border)] px-2 py-1 text-[10px] font-semibold text-[color:var(--t10-navy)]">
                    <input
                      type="checkbox"
                      checked={isComparing}
                      onChange={() => handleToggleCompare(e.slug)}
                      className="h-3 w-3 accent-[color:var(--t10-emerald)]"
                    />
                    <span>Compare</span>
                  </label>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[color:var(--t10-grey)]">
                  {e.bio}
                </p>

                <div className="mt-4 flex flex-wrap gap-1">
                  {e.areas.map((a) => {
                    const found = ADVISORY_AREAS.find((x) => x.slug === a);
                    return found ? (
                      <span
                        key={a}
                        className="rounded-full bg-[color:var(--t10-mint)] px-2 py-0.5 text-[9px] font-semibold text-[color:var(--t10-navy)]"
                      >
                        {found.title.split(" ")[0]}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="mt-5 border-t border-[color:var(--t10-border)] pt-3">
                <div className="flex items-center justify-between text-[11px] text-[color:var(--t10-grey)] mb-3">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--t10-emerald)]" /> Verified
                  </span>
                  <span>{e.experienceYears} Years Exp</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedExpert(e);
                    if (e.sessionTypes.length > 0) setSessionType(e.sessionTypes[0]);
                  }}
                  className="w-full rounded-lg bg-[color:var(--t10-navy)] py-2 text-center text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  Schedule Session (1 Credit)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Bottom Sticky Bar */}
      {compareSlugs.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-4 rounded-full border border-emerald-200 bg-white/95 px-6 py-3 shadow-lg backdrop-blur-sm max-w-lg w-11/12 animate-slide-up">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[color:var(--t10-emerald)]" />
            <span className="text-xs font-bold text-[color:var(--t10-navy)]">
              Comparing {compareSlugs.length} experts
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCompareSlugs([])}
              className="text-xs font-semibold text-[color:var(--t10-grey)] hover:underline"
            >
              Clear
            </button>
            <button
              onClick={() => setShowCompareModal(true)}
              className="rounded-full bg-[color:var(--t10-emerald)] px-4 py-1.5 text-xs font-bold text-white hover:bg-[color:var(--t10-green)] transition-all shadow"
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-4xl w-full rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-3">
              <h3 className="text-base font-bold text-[color:var(--t10-navy)]">Expert Comparison</h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[color:var(--t10-border)]">
                    <th className="py-2.5 font-bold text-[color:var(--t10-grey)] uppercase">Parameters</th>
                    {comparedExperts.map((exp) => (
                      <th key={exp.slug} className="py-2.5 font-bold text-[color:var(--t10-navy)] w-1/3">
                        {exp.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--t10-border)] text-[color:var(--t10-navy)]">
                  <tr>
                    <td className="py-3 font-semibold text-[color:var(--t10-grey)]">Title</td>
                    {comparedExperts.map((exp) => (
                      <td key={exp.slug} className="py-3 font-medium">{exp.role}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[color:var(--t10-grey)]">UAE Experience</td>
                    {comparedExperts.map((exp) => (
                      <td key={exp.slug} className="py-3">{exp.experienceYears} Years</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[color:var(--t10-grey)]">Languages</td>
                    {comparedExperts.map((exp) => (
                      <td key={exp.slug} className="py-3">{exp.languages.join(", ")}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[color:var(--t10-grey)]">Location</td>
                    {comparedExperts.map((exp) => (
                      <td key={exp.slug} className="py-3">{exp.location}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[color:var(--t10-grey)]">Rate / Session</td>
                    {comparedExperts.map((exp) => (
                      <td key={exp.slug} className="py-3 font-bold text-[color:var(--t10-emerald)]">
                        {exp.pricePlaceholder}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[color:var(--t10-grey)]">Next Slot</td>
                    {comparedExperts.map((exp) => (
                      <td key={exp.slug} className="py-3 font-medium text-blue-800">
                        {exp.availability[0]}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 font-semibold text-[color:var(--t10-grey)]">Quick Action</td>
                    {comparedExperts.map((exp) => (
                      <td key={exp.slug} className="py-4">
                        <button
                          onClick={() => {
                            setShowCompareModal(false);
                            setSelectedExpert(exp);
                            if (exp.sessionTypes.length > 0) setSessionType(exp.sessionTypes[0]);
                          }}
                          className="rounded bg-[color:var(--t10-navy)] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-neutral-800 transition-colors"
                        >
                          Book Strategy Call
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Dialog */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto pr-2">
            <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[color:var(--t10-emerald)] uppercase tracking-wider">
                  Scheduling Strategy Session
                </span>
                <h3 className="text-base font-bold text-[color:var(--t10-navy)]">
                  With {selectedExpert.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExpert(null)}
                className="rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              {/* Session Type */}
              <label className="block">
                <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">Session type</span>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="w-full rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2"
                >
                  {selectedExpert.sessionTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              {/* Timezone banner */}
              <div className="flex gap-2 rounded bg-neutral-50 border border-neutral-100 p-2.5 text-[11px] text-[color:var(--t10-grey)]">
                <Clock className="h-4 w-4 shrink-0 text-[color:var(--t10-emerald)]" />
                <span>
                  Confirming Timezone: <strong>Asia/Dubai (GST, UTC+04:00)</strong>. Current local
                  time shown.
                </span>
              </div>

              {/* Slot selection */}
              <div>
                <span className="mb-1.5 block font-semibold text-[color:var(--t10-navy)]">
                  Select available slot
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedExpert.availability.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-md border p-2 text-center transition-all ${selectedSlot === slot ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] text-[color:var(--t10-navy)] font-semibold" : "border-[color:var(--t10-border)] hover:border-[color:var(--t10-emerald)] text-[color:var(--t10-grey)]"}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pre call questions */}
              <div className="space-y-3 pt-3 border-t border-[color:var(--t10-border)]">
                <p className="font-bold text-[color:var(--t10-navy)] uppercase tracking-wider text-[10px]">
                  Zyne Pre-Session Questionnaire
                </p>
                <label className="block">
                  <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">
                    What is the primary business challenge for this call?
                  </span>
                  <textarea
                    rows={2}
                    value={preCall.challenge}
                    onChange={(e) => setPreCall({ ...preCall, challenge: e.target.value })}
                    className="w-full rounded-md border border-[color:var(--t10-border)] p-2"
                    placeholder="e.g. Need to review Amazon launch P&L sheet and PPC ACOS margins."
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">
                    Specific questions you want the expert to address
                  </span>
                  <textarea
                    rows={2}
                    value={preCall.questions}
                    onChange={(e) => setPreCall({ ...preCall, questions: e.target.value })}
                    className="w-full rounded-md border border-[color:var(--t10-border)] p-2"
                    placeholder="1. What is an acceptable target ACOS? 2. FBA lead time in UAE."
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">
                    Simulate Attach Context Document
                  </span>
                  <select
                    value={preCall.additionalDocs}
                    onChange={(e) => setPreCall({ ...preCall, additionalDocs: e.target.value })}
                    className="w-full rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2 text-[11px]"
                  >
                    <option value="">No document attached</option>
                    <option value="Q3 P&L.pdf">Q3 P&L.pdf</option>
                    <option value="Brand guidelines v2.pdf">Brand guidelines v2.pdf</option>
                    <option value="Amazon UAE listing plan.xlsx">Amazon UAE listing plan.xlsx</option>
                  </select>
                </label>
              </div>

              {/* Price / credits checks */}
              <div className="rounded-xl border border-[color:var(--t10-border)] bg-neutral-50 p-3 space-y-1 mt-4">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[color:var(--t10-grey)] font-medium">Session Duration:</span>
                  <span className="font-bold text-[color:var(--t10-navy)]">60 Minutes</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[color:var(--t10-grey)] font-medium">Payment Cost:</span>
                  <span className="font-bold text-[color:var(--t10-navy)]">1 Membership Credit</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1.5 border-t border-neutral-200">
                  <span className="text-[color:var(--t10-grey)] font-semibold">Your Credit Balance:</span>
                  <span className={`font-bold ${credits > 0 ? "text-[color:var(--t10-navy)]" : "text-red-500"}`}>
                    {credits} Credits
                  </span>
                </div>
              </div>

              {role === "Free" && (
                <div className="flex gap-2 rounded bg-amber-50 border border-amber-200 p-2.5 text-[10px] text-amber-800 leading-tight">
                  <Info className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    Note: As a Free preview member, booking this call requires pay-per-session checkout (AED 450). We recommend upgrading to a Hybrid plan.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedSlot || (role !== "Free" && credits <= 0)}
                className="w-full rounded-lg bg-[color:var(--t10-emerald)] py-2.5 text-center text-xs font-bold text-white hover:bg-[color:var(--t10-green)] disabled:opacity-50 transition-all shadow"
              >
                Confirm booking & deduct credit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
