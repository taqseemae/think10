import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Section, SectionHeading } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { ZyneChat } from "@/components/site/ZyneChat";
import { FinalCTA } from "@/components/site/FinalCTA";
import { ShieldCheck, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/zyne")({
  component: ZynePage,
  head: () => ({
    meta: [
      { title: "Meet Zyne | AI business advisor for UAE founders" },
      {
        name: "description",
        content:
          "Zyne is a business advisor, not a chatbot. It diagnoses, plans, prepares and follows through — and knows when to hand off to a human expert.",
      },
      { property: "og:title", content: "Meet Zyne" },
      { property: "og:url", content: "/zyne" },
    ],
    links: [{ rel: "canonical", href: "/zyne" }],
  }),
});

function ZynePage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Meet Zyne"
        title="Your AI business advisor for UAE retail and e-commerce."
        intro="Zyne is not a general chatbot. It's trained to diagnose, plan, prepare and follow through — with UAE market context and clear handoff to human experts when it matters."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-[color:var(--t10-navy)]">Use cases</h2>
            <ul className="mt-4 space-y-3 text-sm text-[color:var(--t10-grey)]">
              {[
                "Structure a feasibility or launch brief",
                "Diagnose a drop in conversion or margin",
                "Build a 90-day operating plan",
                "Prepare for an expert session",
                "Draft investor or buyer collateral",
                "Run a pricing or unit-economics check",
              ].map((x) => (
                <li key={x} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--t10-emerald)]" /> {x}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-2xl font-semibold text-[color:var(--t10-navy)]">
              Boundaries
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-[color:var(--t10-grey)]">
              {[
                "Zyne is not a licensed financial, legal or tax advisor.",
                "Zyne will not finalise pricing, sign contracts or negotiate on your behalf.",
                "When judgement or accountability matters, Zyne hands off to a human expert.",
              ].map((x) => (
                <li key={x} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-[color:var(--t10-emerald)]" /> {x}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-2xl font-semibold text-[color:var(--t10-navy)]">Privacy</h2>
            <p className="mt-3 text-sm text-[color:var(--t10-grey)]">
              Conversations are private to you and your workspace. See our{" "}
              <a href="/privacy" className="text-[color:var(--t10-emerald)] underline">
                Privacy policy
              </a>{" "}
              and{" "}
              <a
                href="/recording-confidentiality"
                className="text-[color:var(--t10-emerald)] underline"
              >
                Recording &amp; Confidentiality
              </a>{" "}
              pages.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--t10-border)] bg-white px-3 py-1.5 text-xs text-[color:var(--t10-grey)]">
              <ShieldCheck className="h-4 w-4 text-[color:var(--t10-emerald)]" /> Confidential by
              design
            </div>
          </div>
          <div className="lg:pl-6">
            <ZyneChat />
          </div>
        </div>
      </Section>

      <Section className="bg-[color:var(--t10-offwhite)]">
        <SectionHeading
          eyebrow="Example conversation"
          title="What a Zyne session actually looks like."
        />
        <div className="mt-8 space-y-4 rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 text-sm text-[color:var(--t10-navy)]">
          <p>
            <strong>You:</strong> My noon conversion is under 1% on my hero SKU. What's going on?
          </p>
          <p>
            <strong>Zyne:</strong> Three likely drivers: listing quality, price competitiveness and
            fulfilment badge. Share the SKU URL — I'll do a structured audit and tell you which
            lever matters most.
          </p>
          <p>
            <strong>You:</strong> [shares link]
          </p>
          <p>
            <strong>Zyne:</strong> Top-3 issues: A+ content missing, price 12% above best-in-class,
            no noon Express badge. Estimated conversion lift 1.4–2.1% with fixes. Want me to draft
            the listing brief and route this to Layla (Marketplace Strategist) for a 60-min call?
          </p>
          <p className="text-xs text-[color:var(--t10-grey)]">
            <Sparkles className="inline h-3.5 w-3.5" /> Illustrative prototype output.
          </p>
        </div>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}
