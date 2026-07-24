import { SiteShell, Section, SectionHeading } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { FinalCTA } from "@/components/site/FinalCTA";
import { CTA } from "@/components/site/CTA";
import { PLANS, FAQS } from "@/data/think10";
import { Check } from "lucide-react";


function Page() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Plans & pricing"
        title="Start light. Scale when you're ready."
        intro="Zyne is free during preview. Add human expertise session-by-session or on continuity."
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col rounded-2xl border p-6 ${p.highlight ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)]/40 shadow-md" : "border-[color:var(--t10-border)] bg-white"}`}
            >
              {p.highlight ? (
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--t10-emerald)]">
                  Most popular
                </p>
              ) : null}
              <h3 className="text-lg font-semibold text-[color:var(--t10-navy)]">{p.name}</h3>
              <p className="mt-1 text-xs text-[color:var(--t10-grey)]">{p.tagline}</p>
              <p className="mt-4 text-2xl font-semibold text-[color:var(--t10-navy)]">{p.price}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-[color:var(--t10-grey)]">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[color:var(--t10-emerald)]" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <CTA
                  to={p.href}
                  variant={p.highlight ? "primary" : "outline"}
                  className="w-full justify-center"
                >
                  {p.cta}
                </CTA>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[color:var(--t10-grey)]">
          Final pricing to be confirmed. Preview access is invite-only.
        </p>
      </Section>

      <Section className="bg-[color:var(--t10-offwhite)]">
        <SectionHeading eyebrow="FAQs" title="Common questions." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {FAQS.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5"
            >
              <p className="text-sm font-semibold text-[color:var(--t10-navy)]">{f.q}</p>
              <p className="mt-2 text-sm text-[color:var(--t10-grey)]">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}

export default Page;
