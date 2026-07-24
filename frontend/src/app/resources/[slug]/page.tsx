import Link from "next/link";
import { SiteShell, Section } from "@/components/site/SiteShell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { RESOURCES, type Resource } from "@/data/think10";
import { Prose } from "@/components/site/Prose";


import { notFound } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
  const resource = RESOURCES.find((r) => r.slug === params.slug);
  if (!resource) return notFound();
  return (
    <SiteShell>
      <Section>
        <Link href="/resources"
          className="text-xs font-semibold uppercase tracking-wider text-[color:var(--t10-emerald)]"
        >
          ← All resources
        </Link>
        <div className="mt-4 max-w-3xl">
          <span className="rounded-full bg-[color:var(--t10-mint)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--t10-navy)]">
            {resource.category}
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--t10-navy)] sm:text-4xl">
            {resource.title}
          </h1>
          <p className="mt-3 text-sm text-[color:var(--t10-grey)]">
            {resource.readTime} ·{" "}
            {new Date(resource.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {resource.author}
          </p>
          <p className="mt-1 text-xs text-[color:var(--t10-grey)]">{resource.reviewer}</p>
        </div>
        <Prose className="mt-8 max-w-3xl">
          <p className="lead">{resource.excerpt}</p>
          {resource.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Prose>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}

