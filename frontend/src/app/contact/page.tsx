"use client";

import { SiteShell, Section } from "@/components/site/SiteShell";
import { PageHeader } from "@/components/site/PageHeader";
import { useState } from "react";
import { Mail, MessageSquare, MapPin, CheckCircle2 } from "lucide-react";


function Page() {
  const [sent, setSent] = useState(false);
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk."
        intro="Tell us where you are and what you're solving. We'll route you to Zyne, an expert or the team."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <form
            className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            {sent ? (
              <div className="flex items-start gap-3 rounded-md border border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)] p-4 text-sm text-[color:var(--t10-navy)]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[color:var(--t10-emerald)]" />
                <div>
                  <p className="font-semibold">Thanks — this is a prototype.</p>
                  <p className="mt-1 text-xs">
                    In the live product we'd reply within one business day and offer a discovery
                    call.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <Field label="Your name">
                  <input required maxLength={100} className="input" />
                </Field>
                <Field label="Email">
                  <input required type="email" maxLength={200} className="input" />
                </Field>
                <Field label="Business name">
                  <input maxLength={120} className="input" />
                </Field>
                <Field label="Stage">
                  <select className="input">
                    <option>Pre-launch</option>
                    <option>Launched, under 1 year</option>
                    <option>Operating 1–3 years</option>
                    <option>Scaling / 3+ years</option>
                  </select>
                </Field>
                <Field label="What are you trying to solve?">
                  <textarea rows={5} required maxLength={1000} className="input" />
                </Field>
                <button
                  type="submit"
                  className="rounded-md bg-[color:var(--t10-emerald)] px-5 py-3 text-sm font-semibold text-white hover:bg-[color:var(--t10-green)]"
                >
                  Send message
                </button>
              </div>
            )}
          </form>
          <aside className="space-y-6">
            <ContactRow
              icon={<Mail className="h-5 w-5" />}
              title="Email"
              value="info@think10.ae (placeholder)"
            />
            <ContactRow
              icon={<MessageSquare className="h-5 w-5" />}
              title="Zyne"
              value="Ask a question 24/7 — no signup required for preview."
            />
            <ContactRow icon={<MapPin className="h-5 w-5" />} title="Based in" value="Dubai, UAE" />
          </aside>
        </div>
      </Section>
      <style>{`.input{width:100%;border:1px solid var(--t10-border);border-radius:8px;padding:10px 12px;font-size:14px;background:white;} .input:focus{outline:2px solid var(--t10-emerald);outline-offset:1px;}`}</style>
    </SiteShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[color:var(--t10-navy)]">{label}</span>
      {children}
    </label>
  );
}
function ContactRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5">
      <div className="flex items-center gap-2 text-[color:var(--t10-emerald)]">
        {icon}
        <span className="text-sm font-semibold text-[color:var(--t10-navy)]">{title}</span>
      </div>
      <p className="mt-2 text-sm text-[color:var(--t10-grey)]">{value}</p>
    </div>
  );
}

export default Page;
