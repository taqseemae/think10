import Link from "next/link";
import { SiteShell, Section } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { FinalCTA } from "@/components/site/FinalCTA";
import { ADVISORY_AREAS } from "@/data/think10";
import {
  ArrowRight,
  Rocket,
  Sparkles,
  ShoppingBag,
  Store,
  Megaphone,
  LineChart,
  Truck,
  Settings2,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Sparkle: Sparkles,
  ShoppingBag,
  Store,
  Megaphone,
  LineChart,
  Truck,
  Settings2,
};


function Page() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Advisory areas"
        title="Whatever is blocking your next stage, start here."
        intro="Zyne and our human experts cover the full operating surface of a UAE retail or e-commerce business."
      />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ADVISORY_AREAS.map((a) => {
            const Icon = ICONS[a.icon] ?? Sparkles;
            return (
              <Link
                key={a.slug}
                href={`/advisory-areas/${a.slug}`}
                className="group flex flex-col rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 transition-shadow hover:shadow-md"
              >
                <Icon className="h-6 w-6 text-[color:var(--t10-emerald)]" />
                <h2 className="mt-4 text-lg font-semibold text-[color:var(--t10-navy)]">
                  {a.title}
                </h2>
                <p className="mt-2 text-sm text-[color:var(--t10-grey)]">{a.short}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--t10-emerald)]">
                  Outcome
                </p>
                <p className="mt-1 text-sm text-[color:var(--t10-navy)]">{a.outcome}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--t10-navy)] group-hover:text-[color:var(--t10-emerald)]">
                  Explore area <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}

export default Page;
