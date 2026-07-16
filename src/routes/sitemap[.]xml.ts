import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ADVISORY_AREAS, EXPERTS, RESOURCES } from "@/data/think10";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths: { path: string; changefreq?: string; priority?: string }[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/how-it-works" },
          { path: "/advisory-areas" },
          { path: "/zyne" },
          { path: "/experts" },
          { path: "/command-centre" },
          { path: "/plans" },
          { path: "/resources" },
          { path: "/about" },
          { path: "/contact" },
          { path: "/premium-advisory" },
          { path: "/book-discovery-call" },
          { path: "/privacy" },
          { path: "/terms" },
          { path: "/recording-confidentiality" },
          { path: "/cookies" },
          ...ADVISORY_AREAS.map((a) => ({ path: `/advisory-areas/${a.slug}` })),
          ...EXPERTS.map((e) => ({ path: `/experts/${e.slug}` })),
          ...RESOURCES.map((r) => ({ path: `/resources/${r.slug}` })),
        ];
        const urls = paths
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>${e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : ""}${e.priority ? `\n    <priority>${e.priority}</priority>` : ""}\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
