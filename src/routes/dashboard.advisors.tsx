import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDashboardState } from "@/context/DashboardStateContext";
import { EXPERTS, ADVISORY_AREAS, type Expert } from "@/data/think10";
import { useState, useMemo } from "react";
import { BookingCalendarModal } from "@/components/BookingCalendarModal";
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
  const { credits, createBooking, role, fetchBookings } = useDashboardState();
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

  // Handle booking success from the new modal
  const handleBookingSuccess = (bookingId: string, meetLink: string) => {
    // Refresh the local bookings state from server so it appears in "My Bookings"
    fetchBookings();
    
    // Slight delay so user sees the confirmation screen in modal, then redirect
    setTimeout(() => {
      setSelectedExpert(null);
      navigate({ to: "/dashboard/sessions" });
    }, 3000);
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
                  onClick={() => setSelectedExpert(e)}
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

      {/* New Calendly-Style Booking Modal */}
      {selectedExpert && (
        <BookingCalendarModal
          expert={selectedExpert}
          onClose={() => setSelectedExpert(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

