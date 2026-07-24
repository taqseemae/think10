import { ADVISORY_AREAS, EXPERTS, RESOURCES } from "@/data/think10";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://think10.ae";

export async function GET() {
  const paths = [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    { path: "/about", priority: "0.8", changefreq: "monthly" },
    { path: "/advisory", priority: "0.9", changefreq: "weekly" },
    { path: "/pricing", priority: "0.9", changefreq: "monthly" },
    { path: "/experts", priority: "0.8", changefreq: "weekly" },
    { path: "/resources", priority: "0.8", changefreq: "weekly" },
    { path: "/contact", priority: "0.7", changefreq: "monthly" },
    ...ADVISORY_AREAS.map((a) => ({ path: `/advisory/${a.slug}` })),
    ...EXPERTS.map((e) => ({ path: `/experts/${e.slug}` })),
    ...RESOURCES.map((r) => ({ path: `/resources/${r.slug}` })),
  ];

  const urls = paths
    .map(
      (e: any) =>
        `  <url>\n    <loc>${BASE_URL}${e.path}</loc>${
          e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : ""
        }${e.priority ? `\n    <priority>${e.priority}</priority>` : ""}\n  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
