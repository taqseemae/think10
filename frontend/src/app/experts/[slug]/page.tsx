"use client";

import { SiteShell, Section } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { FinalCTA } from "@/components/site/FinalCTA";
import { CTA } from "@/components/site/CTA";
import { EXPERTS, ADVISORY_AREAS, type Expert } from "@/data/think10";
import { ShieldCheck, MapPin, Languages, CheckCircle2 } from "lucide-react";
import { useState } from "react";


import { notFound } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
  const expert = EXPERTS.find((e) => e.slug === params.slug);
  if (!expert) return notFound();
  const [booked, setBooked] = useState<string | null>(null);
  return (
    <SiteShell>
      <PageHeader eyebrow="Expert profile" title={expert.name} intro={expert.role} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--t10-emerald)]">
              Sample profile
            </p>
            <p className="mt-4 text-base leading-relaxed text-[color:var(--t10-grey)]">
              {expert.bio}
            </p>

            <h2 className="mt-8 text-lg font-semibold text-[color:var(--t10-navy)]">Experience</h2>
            <p className="mt-2 text-sm text-[color:var(--t10-grey)]">
              {expert.experienceYears}+ years across UAE / GCC retail and e-commerce.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-[color:var(--t10-navy)]">
              Advisory areas
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {expert.areas.map((a) => {
                const area = ADVISORY_AREAS.find((x) => x.slug === a);
                return area ? (
                  <span
                    key={a}
                    className="rounded-full bg-[color:var(--t10-mint)] px-2.5 py-1 text-xs font-medium text-[color:var(--t10-navy)]"
                  >
                    {area.title}
                  </span>
                ) : null;
              })}
            </div>

            <h2 className="mt-8 text-lg font-semibold text-[color:var(--t10-navy)]">
              Session types
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--t10-grey)]">
              {expert.sessionTypes.map((s) => (
                <li key={s} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--t10-emerald)]" /> {s}
                </li>
              ))}
            </ul>

            <h2 className="mt-8 text-lg font-semibold text-[color:var(--t10-navy)]">Preparation</h2>
            <p className="mt-2 text-sm text-[color:var(--t10-grey)]">
              Zyne will draft a pre-session brief with your context, goals and questions before your
              call — so the 60 minutes go into decisions, not catch-up.
            </p>
          </div>

          <aside className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[color:var(--t10-grey)]">
              <ShieldCheck className="h-4 w-4 text-[color:var(--t10-emerald)]" /> Verified expert
            </div>
            <p className="mt-3 text-2xl font-semibold text-[color:var(--t10-navy)]">
              {expert.pricePlaceholder}
            </p>
            <p className="mt-1 text-xs text-[color:var(--t10-grey)]">
              60-minute strategy call. Final pricing to be confirmed.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-[color:var(--t10-grey)]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {expert.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Languages className="h-3.5 w-3.5" />
                {expert.languages.join(", ")}
              </span>
            </div>
            <h3 className="mt-6 text-sm font-semibold text-[color:var(--t10-navy)]">
              Mock availability
            </h3>
            <div className="mt-2 grid gap-2">
              {expert.availability.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setBooked(slot)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${booked === slot ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] text-[color:var(--t10-navy)]" : "border-[color:var(--t10-border)] hover:border-[color:var(--t10-emerald)]"}`}
                >
                  {slot}
                </button>
              ))}
            </div>
            {booked ? (
              <div className="mt-4 rounded-md border border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] p-3 text-sm text-[color:var(--t10-navy)]">
                <p className="font-semibold">Slot held — prototype</p>
                <p className="mt-1 text-xs">
                  You'd get a confirmation email and pre-session brief from Zyne.
                </p>
              </div>
            ) : null}
            <div className="mt-4">
              <CTA to="/book-discovery-call" variant="primary" className="w-full justify-center">
                Request this expert
              </CTA>
            </div>
          </aside>
        </div>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}

