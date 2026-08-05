import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell, Section, SectionHeading } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { FinalCTA } from "@/components/site/FinalCTA";
import { CTA } from "@/components/site/CTA";
import { ADVISORY_AREAS, EXPERTS, RESOURCES, type AdvisoryArea } from "@/data/think10";
import { CheckCircle2, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/advisory-areas/$slug")({
  component: AreaPage,
  loader: ({ params }) => {
    const area = ADVISORY_AREAS.find((a) => a.slug === params.slug);
    if (!area) throw notFound();
    return { area };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.area.title ?? "Advisory area";
    return {
      meta: [
        { title: `${t} | Think10 advisory` },
        { name: "description", content: loaderData?.area.short ?? "Think10 advisory area." },
        { property: "og:title", content: t },
        { property: "og:url", content: `/advisory-areas/${loaderData?.area.slug ?? ""}` },
      ],
      links: [{ rel: "canonical", href: `/advisory-areas/${loaderData?.area.slug ?? ""}` }],
    };
  },
});

function AreaPage() {
  const { area } = Route.useLoaderData() as { area: AdvisoryArea };
  const experts = EXPERTS.filter((e) => e.areas.includes(area.slug));
  const resources = RESOURCES.slice(0, 3);
  return (
    <SiteShell>
      <PageHeader eyebrow={`Advisory area`} title={area.title} intro={area.short}>
        <div className="flex flex-wrap gap-3">
          <CTA to="/zyne" icon>
            Ask Zyne about this
          </CTA>
          <CTA to="/experts" variant="outline">
            Find an expert
          </CTA>
        </div>
      </PageHeader>
      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--t10-navy)]">Common questions</h2>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--t10-grey)]">
              {area.questions.map((q) => (
                <li key={q} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--t10-emerald)]" /> {q}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--t10-navy)]">How Zyne helps</h2>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--t10-grey)]">
              {area.zyneHelps.map((q) => (
                <li key={q} className="flex gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[color:var(--t10-emerald)]" /> {q}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--t10-navy)]">
              When you need a human
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--t10-grey)]">
              {area.whenHuman.map((q) => (
                <li key={q} className="flex gap-2">
                  <Users className="mt-0.5 h-4 w-4 text-[color:var(--t10-emerald)]" /> {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {experts.length ? (
        <Section className="bg-[color:var(--t10-offwhite)]">
          <SectionHeading
            eyebrow="Experts in this area"
            title="Vetted advisors for this specialism."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((e) => (
              <Link
                key={e.slug}
                to="/experts/$slug"
                params={{ slug: e.slug }}
                className="flex items-start gap-3 rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 hover:shadow-md"
              >
                {e.photoURL ? (
                  <img src={e.photoURL} alt={e.name} className="h-10 w-10 rounded-full object-cover shadow-sm" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--t10-navy)] text-xs font-bold text-white uppercase">
                    {e.initials}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-[color:var(--t10-navy)]">{e.name}</p>
                  <p className="text-xs text-[color:var(--t10-grey)]">{e.role}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-[color:var(--t10-grey)]">{e.bio}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      <Section>
        <SectionHeading eyebrow="Resources" title="Reading for this area." />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {resources.map((r) => (
            <Link
              key={r.slug}
              to="/resources/$slug"
              params={{ slug: r.slug }}
              className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 hover:shadow-md"
            >
              <span className="rounded-full bg-[color:var(--t10-mint)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--t10-navy)]">
                {r.category}
              </span>
              <h3 className="mt-3 text-base font-semibold text-[color:var(--t10-navy)]">
                {r.title}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--t10-grey)]">{r.excerpt}</p>
            </Link>
          ))}
        </div>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}
