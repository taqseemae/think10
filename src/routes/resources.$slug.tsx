import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell, Section } from "@/components/site/SiteShell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { RESOURCES, type Resource } from "@/data/think10";
import { Prose } from "@/components/site/Prose";

export const Route = createFileRoute("/resources/$slug")({
  component: Page,
  loader: ({ params }) => {
    const r = RESOURCES.find((x) => x.slug === params.slug);
    if (!r) throw notFound();
    return { resource: r };
  },
  head: ({ loaderData }) => {
    const r = loaderData?.resource;
    return {
      meta: [
        { title: `${r?.title ?? "Resource"} | Think10` },
        { name: "description", content: r?.excerpt ?? "Think10 resource" },
        { property: "og:title", content: r?.title ?? "" },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/resources/${r?.slug ?? ""}` },
      ],
      links: [{ rel: "canonical", href: `/resources/${r?.slug ?? ""}` }],
      scripts: r
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: r.title,
                description: r.excerpt,
                datePublished: r.date,
                author: { "@type": "Organization", name: r.author },
              }),
            },
          ]
        : [],
    };
  },
});

function Page() {
  const { resource } = Route.useLoaderData() as { resource: Resource };
  return (
    <SiteShell>
      <Section>
        <Link
          to="/resources"
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
