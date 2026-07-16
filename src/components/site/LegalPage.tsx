import type { ReactNode } from "react";
import { SiteShell, Section } from "./SiteShell";
import { PageHeader } from "./PageHeader";
import { Prose } from "./Prose";

export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <SiteShell>
      <PageHeader eyebrow={`Last updated · ${updated}`} title={title} intro={intro} />
      <Section>
        <Prose>{children}</Prose>
      </Section>
    </SiteShell>
  );
}
