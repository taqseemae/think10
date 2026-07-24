import type { ReactNode } from "react";
import { Eyebrow } from "./SiteShell";

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)]">
      <div className="t10-grid-bg absolute inset-0 opacity-40" aria-hidden />
      <div className="t10-container relative py-16 sm:py-20">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--t10-navy)] sm:text-5xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-4 max-w-2xl text-lg text-[color:var(--t10-grey)]">{intro}</p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
