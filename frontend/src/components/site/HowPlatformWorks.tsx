"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { MessageCircle, Compass, Users, Rocket } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: MessageCircle,
    title: "You ask a real question.",
    body: 'Type it exactly like you\'d tell a co-founder. "My noon conversion is 0.7% — what do I fix first?" No forms, no dropdowns.',
    tag: "Any channel, any stage",
  },
  {
    n: "02",
    icon: Compass,
    title: "Zyne diagnoses in UAE context.",
    body: "Trained on retail, e-commerce and marketplace playbooks specific to the UAE and wider GCC. It structures the real problem, not the surface one.",
    tag: "Not a generic chatbot",
  },
  {
    n: "03",
    icon: Users,
    title: "A vetted expert takes the judgement call.",
    body: "When the decision needs human accountability — pricing, buyer meetings, hiring, capital — Zyne hands you off to a matched UAE specialist with the brief pre-written.",
    tag: "Human where it matters",
  },
  {
    n: "04",
    icon: Rocket,
    title: "The plan executes itself in your Command Centre.",
    body: "Decisions, owners, deadlines and documents live in one workspace. Zyne follows up until the action is done, then briefs the next session.",
    tag: "Compounds every week",
  },
] as const;

export function HowPlatformWorks() {
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const progressHeight = useTransform(smooth, (v) => `${v * 100}%`);

  return (
    <section className="relative bg-[color:var(--t10-navy)] text-white t10-grain">
      <div className="t10-container relative py-24 sm:py-32">
        <div className="max-w-3xl">
          <p className="t10-mono text-xs uppercase tracking-[0.3em] text-[color:var(--t10-green)]">
            / How the platform works
          </p>
          <h2 className="mt-6 text-5xl leading-[0.95] tracking-tight sm:text-7xl">
            <span className="t10-serif italic text-white/90">Four steps</span>
            <br />
            <span className="font-semibold">from question to action.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            Scroll through the loop every UAE founder runs on Think10 — from the first typed
            question to a decision that ships.
          </p>
        </div>
      </div>

      <div ref={wrap} className="relative">
        {STEPS.map((s, i) => (
          <StepPanel key={s.n} step={s} index={i} total={STEPS.length} />
        ))}

        {/* progress rail */}
        <div className="pointer-events-none absolute left-6 top-0 hidden h-full w-px bg-white/10 md:block">
          <motion.div
            style={{ height: progressHeight }}
            className="w-px bg-[color:var(--t10-green)]"
          />
        </div>
      </div>
    </section>
  );
}

function StepPanel({
  step,
  index,
  total,
}: {
  step: (typeof STEPS)[number];
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.15, 1, 1, 0.2]);
  const Icon = step.icon;
  return (
    <div ref={ref} className="sticky top-0 flex min-h-screen items-center">
      <div className="t10-container grid w-full gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:pl-16">
        <motion.div style={{ opacity }} className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <span className="t10-mono text-sm text-[color:var(--t10-green)]">{step.n}</span>
            <span className="h-px flex-1 bg-white/15" />
            <span className="t10-mono text-[10px] uppercase tracking-widest text-white/50">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <h3 className="mt-6 text-4xl leading-tight tracking-tight sm:text-5xl">
            <span className="t10-serif italic text-[color:var(--t10-green)]">
              {step.title.split(" ")[0]}
            </span>{" "}
            <span className="font-semibold">{step.title.split(" ").slice(1).join(" ")}</span>
          </h3>
          <p className="mt-5 max-w-lg text-lg text-white/70">{step.body}</p>
          <span className="t10-mono mt-6 inline-flex w-fit items-center gap-2 border border-white/15 px-3 py-1 text-[11px] uppercase tracking-widest text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--t10-green)]" /> {step.tag}
          </span>
        </motion.div>

        <motion.div style={{ y, opacity }} className="relative">
          <div className="relative aspect-[4/5] w-full max-w-lg overflow-hidden border border-white/10 bg-white/[0.03] p-6 md:aspect-square md:ml-auto">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(0,201,139,0.5),transparent_60%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <Icon className="h-10 w-10 text-[color:var(--t10-green)]" strokeWidth={1.4} />
                <span className="t10-serif text-[9rem] leading-none italic text-white/[0.06]">
                  {step.n}
                </span>
              </div>
              <StepArt index={index} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StepArt({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="rounded-none border border-white/10 bg-black/30 p-4 font-mono text-sm text-white/85">
        <p className="text-[10px] uppercase tracking-widest text-white/40">Founder input</p>
        <p className="mt-3">&gt; my noon hero SKU conversion dropped to 0.7% this month.</p>
        <p className="mt-1">
          &gt; margin is thin. what do I fix first?<span className="t10-caret ml-0.5">▍</span>
        </p>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="space-y-2 text-sm">
        {[
          { k: "Listing quality", v: 42, warn: true },
          { k: "Price vs. best-in-class", v: 88 },
          { k: "noon Express eligibility", v: 12, warn: true },
          { k: "Review velocity", v: 34, warn: true },
        ].map((r) => (
          <div key={r.k} className="border border-white/10 bg-black/25 p-3">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/50">
              <span>{r.k}</span>
              <span className={r.warn ? "text-[color:var(--t10-green)]" : "text-white/40"}>
                {r.v}%
              </span>
            </div>
            <div className="mt-2 h-1 bg-white/10">
              <div className="h-full bg-[color:var(--t10-green)]" style={{ width: `${r.v}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="space-y-3 text-sm">
        {[
          { n: "LH", name: "Layla H.", role: "Marketplace Strategist", match: 96 },
          { n: "PM", name: "Priya M.", role: "Finance & Pricing", match: 82 },
        ].map((e) => (
          <div key={e.n} className="flex items-center gap-3 border border-white/10 bg-black/25 p-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--t10-green)] text-xs font-semibold text-[color:var(--t10-navy)]">
              {e.n}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{e.name}</p>
              <p className="truncate text-[11px] text-white/60">{e.role}</p>
            </div>
            <span className="t10-mono text-[11px] text-[color:var(--t10-green)]">
              {e.match}% match
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2 text-sm">
      {[
        { t: "Rebuild A+ content on hero SKU", d: "Owner: Marketing · Fri" },
        { t: "Apply for noon Express", d: "Owner: Ops · this week" },
        { t: "Reprice within 8% of leader", d: "Owner: Founder · today" },
      ].map((a) => (
        <div key={a.t} className="flex items-start gap-3 border border-white/10 bg-black/25 p-3">
          <span className="mt-1 h-3 w-3 border border-[color:var(--t10-green)]" />
          <div className="min-w-0">
            <p className="text-sm text-white">{a.t}</p>
            <p className="t10-mono text-[11px] text-white/50">{a.d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
