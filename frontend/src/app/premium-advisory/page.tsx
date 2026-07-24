import { SiteShell, Section } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { FinalCTA } from "@/components/site/FinalCTA";
import { CTA } from "@/components/site/CTA";
import { CheckCircle2 } from "lucide-react";


function Page() {
  const includes = [
    "Dedicated lead advisor matched to your business",
    "On-call expert bench across all 8 advisory areas",
    "Board-style monthly business review",
    "Custom Command Centre workspace for your team",
    "Direct WhatsApp access during UAE business hours",
    "Quarterly strategy offsite (virtual or in-person)",
  ];
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Premium Advisory"
        title="For founders scaling past AED 5M."
        intro="A senior advisor and a bench of experts, on retainer, working alongside you month after month."
      >
        <div className="flex flex-wrap gap-3">
          <CTA to="/contact">Apply for Premium</CTA>
        </div>
      </PageHeader>
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--t10-navy)]">What's included</h2>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--t10-grey)]">
              {includes.map((i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--t10-emerald)]" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-[color:var(--t10-mint)]/40 p-6">
            <h2 className="text-xl font-semibold text-[color:var(--t10-navy)]">
              Is Premium right for you?
            </h2>
            <p className="mt-2 text-sm text-[color:var(--t10-grey)]">
              Premium is best for founders operating AED 5M+ businesses, entering a new market,
              preparing to raise, or navigating a major structural decision.
            </p>
            <p className="mt-4 text-xs text-[color:var(--t10-grey)]">
              By application only. Onboarding includes a diagnostic sprint with Zyne and your lead
              advisor.
            </p>
          </div>
        </div>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}

export default Page;
