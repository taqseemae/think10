import { SiteShell, Section, SectionHeading } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { DashboardVisual } from "@/components/site/DashboardVisual";
import { FinalCTA } from "@/components/site/FinalCTA";
import { CTA } from "@/components/site/CTA";
import { Target, MessageSquare, FileText, Calendar, LineChart, Users } from "lucide-react";


function Page() {
  const modules = [
    {
      icon: MessageSquare,
      t: "Zyne chats",
      b: "Every conversation with Zyne, searchable, tagged and linked to your goals.",
    },
    {
      icon: Calendar,
      t: "Expert sessions",
      b: "Booking, prep briefs, recordings and summaries in one place.",
    },
    {
      icon: FileText,
      t: "Documents",
      b: "Contracts, briefs, pricing models — with AI-generated summaries.",
    },
    { icon: Target, t: "Goals & actions", b: "A living plan with owners, deadlines and progress." },
    {
      icon: LineChart,
      t: "Progress",
      b: "See momentum over weeks and months, not just to-do lists.",
    },
    { icon: Users, t: "Advisors", b: "Your bench of experts and the last time you spoke to each." },
  ];
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Command Centre"
        title="Every conversation becomes a working business plan."
        intro="A single workspace where Zyne, your experts, decisions, documents and progress all live together."
      >
        <CTA to="/dashboard">Open demo dashboard</CTA>
      </PageHeader>
      <Section dark>
        <DashboardVisual />
      </Section>
      <Section>
        <SectionHeading eyebrow="Modules" title="Built for founders operating a real business." />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div
              key={m.t}
              className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6"
            >
              <m.icon className="h-6 w-6 text-[color:var(--t10-emerald)]" />
              <h3 className="mt-4 text-base font-semibold text-[color:var(--t10-navy)]">{m.t}</h3>
              <p className="mt-1.5 text-sm text-[color:var(--t10-grey)]">{m.b}</p>
            </div>
          ))}
        </div>
      </Section>
      <FinalCTA />
    </SiteShell>
  );
}

export default Page;
