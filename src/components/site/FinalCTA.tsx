import { Section, SectionHeading } from "./SiteShell";
import { CTA } from "./CTA";

export function FinalCTA() {
  return (
    <Section dark className="overflow-hidden">
      <div className="absolute inset-0 t10-mint-glow opacity-70" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <SectionHeading
          dark
          align="center"
          eyebrow="Ready when you are"
          title="Bring us the business problem you cannot solve alone."
          intro="Start with a conversation. Zyne responds in seconds; a human expert is one click away."
        />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CTA to="/zyne" variant="primary" icon>
            Ask Zyne Now
          </CTA>
          <CTA
            to="/book-discovery-call"
            variant="outline"
            className="border-white/40 text-white hover:bg-white hover:text-[color:var(--t10-navy)]"
          >
            Book a Discovery Call
          </CTA>
        </div>
        <p className="mt-4 text-sm text-[color:var(--t10-mint)]/70">
          Confidential. Practical. Built around your business.
        </p>
      </div>
    </Section>
  );
}
