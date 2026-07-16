import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import { CookieBanner } from "./CookieBanner";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CookieBanner />
    </div>
  );
}

export function Section({
  children,
  dark = false,
  className = "",
  id,
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`${dark ? "t10-dark" : ""} relative py-16 sm:py-24 ${className}`}>
      <div className="t10-container relative">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--t10-emerald)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--t10-emerald)]" />
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  dark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        className={`text-3xl font-semibold sm:text-4xl lg:text-5xl ${dark ? "text-white" : "text-[color:var(--t10-navy)]"}`}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={`mt-4 text-base sm:text-lg ${dark ? "text-[color:var(--t10-mint)]/80" : "text-[color:var(--t10-grey)]"}`}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}
