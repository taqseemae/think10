import { Link } from "@tanstack/react-router";

type FooterLink = { label: string; href: string; external?: boolean };

const groups: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Advisory Areas", href: "/#advisory-areas" },
      { label: "Who It's For", href: "/#who-its-for" },
      { label: "Meet Zyne", href: "/#zyne" },
    ],
  },
  {
    title: "Access",
    links: [
      { label: "Our Experts", href: "/#experts" },
      { label: "Plans & Pricing", href: "/#plans" },
      { label: "Book Discovery Call", href: "/#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy", external: true },
      { label: "Terms", href: "/terms", external: true },
      { label: "Cookies", href: "/cookies", external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)]">
      <div className="t10-container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <a href="/#top" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--t10-emerald)] text-white">
                <span className="h-3 w-3 rounded-full border-2 border-white" />
              </span>
              <span className="leading-tight">
                <span className="block text-lg font-bold text-[color:var(--t10-navy)]">
                  Think10
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--t10-grey)]">
                  Premium Advisory
                </span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm text-[color:var(--t10-grey)]">
              AI + human business advisory for UAE retail, e-commerce, marketplace and product
              founders. Zyne for immediate guidance, vetted experts when it matters.
            </p>
            <p className="mt-4 text-xs text-[color:var(--t10-grey)]">
              Think10 is a business advisory system, not a licensed financial or legal service.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-sm font-semibold text-[color:var(--t10-navy)]">{g.title}</h3>
              <ul className="mt-4 space-y-2">
                {g.links.map((l) =>
                  l.external ? (
                    <li key={l.href}>
                      <Link
                        to={l.href}
                        className="text-sm text-[color:var(--t10-grey)] transition-colors hover:text-[color:var(--t10-navy)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="text-sm text-[color:var(--t10-grey)] transition-colors hover:text-[color:var(--t10-navy)]"
                      >
                        {l.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[color:var(--t10-border)] pt-6 text-xs text-[color:var(--t10-grey)] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Think10. All rights reserved.</p>
          <p>Made for UAE founders.</p>
        </div>
      </div>
    </footer>
  );
}
