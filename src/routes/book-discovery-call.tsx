import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Section } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/book-discovery-call")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Book a discovery call | Think10" },
      {
        name: "description",
        content: "Book a free 20-minute discovery call with the Think10 team.",
      },
      { property: "og:title", content: "Book a discovery call" },
      { property: "og:url", content: "/book-discovery-call" },
    ],
    links: [{ rel: "canonical", href: "/book-discovery-call" }],
  }),
});

function Page() {
  const slots = [
    "Mon 09:00",
    "Mon 14:00",
    "Tue 10:00",
    "Tue 16:00",
    "Wed 11:00",
    "Thu 15:00",
    "Fri 10:00",
  ];
  const [picked, setPicked] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Discovery call"
        title="A free 20-minute call. No pitch."
        intro="Tell us about your business. We'll show you how Zyne and our experts would work for you."
      />
      <Section>
        {confirmed ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-[color:var(--t10-emerald)]" />
            <h2 className="mt-3 text-xl font-semibold text-[color:var(--t10-navy)]">
              Call requested — prototype
            </h2>
            <p className="mt-2 text-sm text-[color:var(--t10-grey)]">
              In the live product you'd get a calendar invite and a short intake form from Zyne.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--t10-navy)]">Pick a slot</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPicked(s)}
                    className={`rounded-md border px-3 py-2 text-sm ${picked === s ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] text-[color:var(--t10-navy)]" : "border-[color:var(--t10-border)] bg-white hover:border-[color:var(--t10-emerald)]"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <form
              className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6"
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmed(true);
              }}
            >
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[color:var(--t10-navy)]">Name</span>
                <input
                  required
                  className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="mb-1 block font-medium text-[color:var(--t10-navy)]">Email</span>
                <input
                  required
                  type="email"
                  className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-3 block text-sm">
                <span className="mb-1 block font-medium text-[color:var(--t10-navy)]">
                  Business / stage
                </span>
                <input className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2 text-sm" />
              </label>
              <p className="mt-3 text-xs text-[color:var(--t10-grey)]">
                Selected slot:{" "}
                <strong className="text-[color:var(--t10-navy)]">{picked ?? "—"}</strong>
              </p>
              <button
                disabled={!picked}
                className="mt-4 w-full rounded-md bg-[color:var(--t10-emerald)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Confirm call
              </button>
            </form>
          </div>
        )}
      </Section>
    </SiteShell>
  );
}
