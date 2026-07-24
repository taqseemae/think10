import { SiteShell, Section, SectionHeading } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { FinalCTA } from "@/components/site/FinalCTA";
import { CTA } from "@/components/site/CTA";
import { Sparkles, Users, Target, ClipboardList, Calendar, FileCheck } from "lucide-react";


function HowItWorks() {
  const steps = [
    {
      icon: Sparkles,
      t: "1. Ask Zyne",
      b: "Start with any question. Zyne diagnoses, structures the real problem and drafts a working answer using UAE market context.",
      detail: [
        "Structured business briefs in minutes",
        "Suggested next questions and risks",
        "Handoff to the right advisor when needed",
      ],
    },
    {
      icon: ClipboardList,
      t: "2. Prepare",
      b: "If you're bringing in an expert, Zyne drafts a pre-session brief so the call starts from clarity, not from scratch.",
      detail: [
        "Session objectives and constraints",
        "Key numbers and context in one place",
        "Questions to bring to the call",
      ],
    },
    {
      icon: Users,
      t: "3. Match & consult",
      b: "We match you to a vetted UAE expert based on stage, category and problem. 60-minute strategy call by default.",
      detail: [
        "Verified experience in UAE / GCC",
        "Fluent in your business language",
        "Available online or in Dubai / Abu Dhabi",
      ],
    },
    {
      icon: FileCheck,
      t: "4. Follow up",
      b: "Every session becomes a summary, decisions and an action plan — all tracked in your Command Centre.",
      detail: [
        "Auto-summarised session notes",
        "Actions with owners and deadlines",
        "Zyne follows up until it's done",
      ],
    },
  ];
  return (
    <SiteShell>
      <PageHeader
        eyebrow="How it works"
        title="AI does the thinking. Experts do the judgement calls. You get the plan."
        intro="A repeatable rhythm that turns founder questions into decisions and action — without losing context between conversations."
      >
        <div className="flex flex-wrap gap-3">
          <CTA to="/zyne" icon>
            Start with Zyne
          </CTA>
          <CTA to="/experts" variant="outline">
            See experts
          </CTA>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          {steps.map((s) => (
            <div
              key={s.t}
              className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6"
            >
              <s.icon className="h-6 w-6 text-[color:var(--t10-emerald)]" />
              <h2 className="mt-4 text-xl font-semibold text-[color:var(--t10-navy)]">{s.t}</h2>
              <p className="mt-2 text-sm text-[color:var(--t10-grey)]">{s.b}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-[color:var(--t10-grey)]">
                {s.detail.map((d) => (
                  <li key={d} className="flex gap-2">
                    <Target className="mt-0.5 h-4 w-4 text-[color:var(--t10-emerald)]" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-[color:var(--t10-offwhite)]">
        <SectionHeading
          eyebrow="Continuity"
          title="Nothing gets lost between conversations."
          intro="Zyne remembers your business context across sessions, so every conversation compounds instead of restarting."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Calendar,
              t: "Session cadence",
              b: "Weekly, monthly or ad-hoc — you choose the rhythm.",
            },
            {
              icon: FileCheck,
              t: "Living plan",
              b: "Your action plan updates as decisions change.",
            },
            {
              icon: Sparkles,
              t: "Zyne between sessions",
              b: "Ask Zyne anything at 2am. Your expert sees the context next time.",
            },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6"
            >
              <x.icon className="h-6 w-6 text-[color:var(--t10-emerald)]" />
              <h3 className="mt-3 text-base font-semibold text-[color:var(--t10-navy)]">{x.t}</h3>
              <p className="mt-2 text-sm text-[color:var(--t10-grey)]">{x.b}</p>
            </div>
          ))}
        </div>
      </Section>

      <FinalCTA />
    </SiteShell>
  );
}

export default HowItWorks;
