"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteShell, Section } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { FinalCTA } from "@/components/site/FinalCTA";
import { RESOURCES } from "@/data/think10";
import { Search } from "lucide-react";


function Page() {
  const categories = Array.from(new Set(RESOURCES.map((r) => r.category)));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const list = useMemo(
    () =>
      RESOURCES.filter(
        (r) =>
          (cat ? r.category === cat : true) &&
          (q ? (r.title + r.excerpt).toLowerCase().includes(q.toLowerCase()) : true),
      ),
    [q, cat],
  );
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Resources"
        title="Founder-grade guides. No fluff."
        intro="Written for UAE retail, e-commerce, marketplace and product founders."
      />
      <Section>
        <div className="grid gap-3 rounded-2xl border border-[color:var(--t10-border)] bg-white p-4 md:grid-cols-[1.5fr_1fr]">
          <label className="flex items-center gap-2 rounded-md border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] px-3">
            <Search className="h-4 w-4 text-[color:var(--t10-grey)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search resources…"
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
          </label>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <Link
              key={r.slug}
              href={`/resources/${r.slug}`}
              className="flex flex-col rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 hover:shadow-md"
            >
              <span className="w-fit rounded-full bg-[color:var(--t10-mint)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--t10-navy)]">
                {r.category}
              </span>
              <h3 className="mt-3 text-base font-semibold text-[color:var(--t10-navy)]">
                {r.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-[color:var(--t10-grey)]">{r.excerpt}</p>
              <p className="mt-4 text-xs text-[color:var(--t10-grey)]">
                {r.readTime} ·{" "}
                {new Date(r.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}

export default Page;
