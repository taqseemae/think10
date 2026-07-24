import { SiteShell, Section, SectionHeading } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { FinalCTA } from "@/components/site/FinalCTA";


function Page() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="About"
        title="Built for the founders we spend our days with."
        intro="Think10 exists because most UAE founders don't need another course or coach — they need clear thinking, on demand, backed by people who've done it."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--t10-navy)]">
              Why we built Think10
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--t10-grey)]">
              For over a decade, we've advised retail, e-commerce and product businesses across the
              UAE and wider GCC — from founder-led launches to nine-figure retail groups. The same
              questions come up on repeat: pricing, marketplaces, cash flow, hiring, expansion.
              Founders were making expensive decisions with fragmented information.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--t10-grey)]">
              Think10 is the answer we wish existed when we started. An always-on AI advisor (Zyne)
              trained on real UAE operating reality, a vetted bench of human experts for the calls
              that matter, and a Command Centre that keeps your business context in one place.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--t10-navy)]">
              Who Think10 is for
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--t10-grey)]">
              <li>• Founders launching a retail, e-commerce or product business in the UAE.</li>
              <li>• Operators running an existing brand and looking to scale profitably.</li>
              <li>
                • Teams expanding across the GCC or into new channels (Amazon UAE, noon, wholesale).
              </li>
              <li>
                • Primarily built for UAE women founders aged 25–60; open to all founders in
                category.
              </li>
            </ul>
            <h2 className="mt-8 text-xl font-semibold text-[color:var(--t10-navy)]">
              What we're not
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--t10-grey)]">
              Not a course. Not a coaching program. Not a generic consultancy. Think10 is a system
              you use in the flow of running your business.
            </p>
          </div>
        </div>
      </Section>
      <Section className="bg-[color:var(--t10-offwhite)]">
        <SectionHeading eyebrow="Our principles" title="How we operate." align="center" />
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            { t: "Judgement over noise", d: "We surface the decision, not more content." },
            {
              t: "UAE-specific truth",
              d: "Everything is grounded in real UAE / GCC operating reality.",
            },
            {
              t: "Confidentiality by default",
              d: "Your business, your data. Experts are under NDA.",
            },
          ].map((p) => (
            <div
              key={p.t}
              className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6"
            >
              <h3 className="text-base font-semibold text-[color:var(--t10-navy)]">{p.t}</h3>
              <p className="mt-2 text-sm text-[color:var(--t10-grey)]">{p.d}</p>
            </div>
          ))}
        </div>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}

export default Page;
