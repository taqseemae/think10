import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { SiteShell, Section } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { FinalCTA } from "@/components/site/FinalCTA";
import { ADVISORY_AREAS, type Expert } from "@/data/think10";
import { ShieldCheck, Search, Loader2 } from "lucide-react";
import { getPublicConsultantsFn } from "@/lib/server-actions";

export const Route = createFileRoute("/experts")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Vetted UAE experts | Think10" },
      {
        name: "description",
        content:
          "Book vetted UAE retail, e-commerce, marketplace, brand, finance and operations experts. 60-minute sessions or ongoing advisory.",
      },
      { property: "og:title", content: "Vetted UAE experts" },
      { property: "og:url", content: "/experts" },
    ],
    links: [{ rel: "canonical", href: "/experts" }],
  }),
});

function Page() {
  const [q, setQ] = useState("");
  const [area, setArea] = useState<string>("");
  const [lang, setLang] = useState<string>("");
  const [expertsList, setExpertsList] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicConsultantsFn()
      .then((data: any) => setExpertsList(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const languages = Array.from(new Set(expertsList.flatMap((e) => e.languages || [])));
  const results = useMemo(() => {
    return expertsList.filter((e) => {
      if (area && !e.areas.includes(area)) return false;
      if (lang && !e.languages.includes(lang)) return false;
      if (q) {
        const s = `${e.name} ${e.role} ${e.bio}`.toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [expertsList, q, area, lang]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Experts"
        title="Speak with someone who has solved the problem before."
        intro="Every expert has real UAE / GCC experience across retail, e-commerce, marketplaces, brand, finance and operations."
      />
      <Section>
        <div className="grid gap-3 rounded-2xl border border-[color:var(--t10-border)] bg-white p-4 md:grid-cols-[1.5fr_1fr_1fr]">
          <label className="flex items-center gap-2 rounded-md border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] px-3">
            <Search className="h-4 w-4 text-[color:var(--t10-grey)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search experts…"
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
          </label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2 text-sm"
          >
            <option value="">All advisory areas</option>
            {ADVISORY_AREAS.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.title}
              </option>
            ))}
          </select>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2 text-sm"
          >
            <option value="">Any language</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((e) => (
            <Link
              key={e.slug}
              to="/experts/$slug"
              params={{ slug: e.slug }}
              className="group flex flex-col rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                {e.photoURL ? (
                  <img src={e.photoURL} alt={e.name} className="h-12 w-12 rounded-full object-cover shadow-sm" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--t10-navy)] text-sm font-bold text-[color:var(--t10-offwhite)] shadow-sm uppercase">
                    {e.initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--t10-navy)]">
                    {e.name}
                  </p>
                  <p className="truncate text-xs text-[color:var(--t10-grey)]">{e.role}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-[color:var(--t10-grey)]">{e.bio}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {e.areas.slice(0, 3).map((a) => {
                  const area = ADVISORY_AREAS.find((x) => x.slug === a);
                  return area ? (
                    <span
                      key={a}
                      className="rounded-full bg-[color:var(--t10-mint)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--t10-navy)]"
                    >
                      {area.title.split(" ")[0]}
                    </span>
                  ) : null;
                })}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[color:var(--t10-border)] pt-3 text-xs text-[color:var(--t10-grey)]">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--t10-emerald)]" /> Verified
                </span>
                <span>{e.pricePlaceholder}</span>
              </div>
            </Link>
          ))}
          {results.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-[color:var(--t10-border)] bg-white p-8 text-center text-sm text-[color:var(--t10-grey)]">
              No experts match those filters yet.
            </p>
          ) : null}
        </div>
        <p className="mt-4 text-xs text-[color:var(--t10-grey)]">
          Sample profile data — for illustration only.
        </p>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}
