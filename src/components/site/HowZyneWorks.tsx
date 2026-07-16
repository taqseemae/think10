import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const SCRIPT = [
  {
    q: "I'm launching a candle brand in Dubai. Marketplace or my own store first?",
    thinking: [
      "Reading brand context",
      "Pulling UAE candle category data",
      "Modelling channel economics",
    ],
    answer: {
      headline: "Start with a Shopify DTC pilot for 60 days, then list on noon.",
      bullets: [
        "UAE candle category on Amazon is saturated on price — you'll bleed margin without a review moat.",
        "noon rewards local brands with Express — worth earning, not launching cold.",
        "DTC gives you owned data + a story that survives marketplace repricing wars.",
      ],
      handoff: "Book Noor Al Mansoori — Brand & Product Strategist",
    },
  },
  {
    q: "My meta ads CAC is 3x my AOV. Kill spend or fix the funnel?",
    thinking: [
      "Auditing funnel structure",
      "Benchmarking UAE beauty CACs",
      "Checking creative fatigue signals",
    ],
    answer: {
      headline: "Don't kill spend — your AOV is the real problem. Fix that first.",
      bullets: [
        "Bundle 2–3 SKUs into a launch set: pushes AOV 40–60% in beauty category.",
        "Move discount from % off to gift-with-purchase — protects margin, lifts CVR.",
        "Only after AOV moves, restructure ads by intent stage (prospecting vs retargeting).",
      ],
      handoff: "Book Layla Hassan — E-commerce Strategist",
    },
  },
  {
    q: "Should I open a second store in Yas Mall next quarter?",
    thinking: [
      "Modelling rent-to-sales",
      "Checking Abu Dhabi footfall data",
      "Comparing to your Dubai unit",
    ],
    answer: {
      headline: "Not yet. Test with a 60-day pop-up before committing to a 3-year lease.",
      bullets: [
        "Your Dubai store is only 11 months in — you don't have a stable baseline to plan a second on.",
        "Yas Mall foot traffic ≠ your customer profile. Pop-up gives you real conversion data.",
        "Renegotiate the second-store lease with pop-up data in hand — better terms guaranteed.",
      ],
      handoff: "Book Omar Khalil — Retail & Wholesale Advisor",
    },
  },
] as const;

type Phase = "typing" | "thinking" | "answer";

export function HowZyneWorks() {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState("");
  const [thinkStep, setThinkStep] = useState(0);

  const item = SCRIPT[i];

  // typing
  useEffect(() => {
    if (phase !== "typing") return;
    setTyped("");
    let idx = 0;
    const id = setInterval(() => {
      idx += 1;
      setTyped(item.q.slice(0, idx));
      if (idx >= item.q.length) {
        clearInterval(id);
        setTimeout(() => setPhase("thinking"), 500);
      }
    }, 22);
    return () => clearInterval(id);
  }, [phase, item.q]);

  // thinking
  useEffect(() => {
    if (phase !== "thinking") return;
    setThinkStep(0);
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      if (step >= item.thinking.length) {
        clearInterval(id);
        setTimeout(() => setPhase("answer"), 400);
      } else {
        setThinkStep(step);
      }
    }, 650);
    return () => clearInterval(id);
  }, [phase, item.thinking]);

  // answer -> next
  useEffect(() => {
    if (phase !== "answer") return;
    const id = setTimeout(() => {
      setI((v) => (v + 1) % SCRIPT.length);
      setPhase("typing");
    }, 5200);
    return () => clearTimeout(id);
  }, [phase]);

  return (
    <section className="relative overflow-hidden bg-[color:var(--t10-offwhite)]">
      <div className="t10-container grid gap-12 py-24 sm:py-32 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <p className="t10-mono text-xs uppercase tracking-[0.3em] text-[color:var(--t10-emerald)]">
            / How Zyne works
          </p>
          <h2 className="mt-6 text-5xl leading-[0.95] tracking-tight text-[color:var(--t10-navy)] sm:text-7xl">
            <span className="t10-serif italic">Not a chatbot.</span>
            <br />
            <span className="font-semibold">A business brain.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg text-[color:var(--t10-grey)]">
            Watch a real founder question move through Zyne — from typed input, to UAE-context
            diagnosis, to a decisive answer and a human handoff.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {SCRIPT.map((_, k) => (
              <button
                key={k}
                onClick={() => {
                  setI(k);
                  setPhase("typing");
                }}
                className={`h-1.5 w-10 border-0 ${k === i ? "bg-[color:var(--t10-emerald)]" : "bg-[color:var(--t10-border)]"}`}
                aria-label={`Show scenario ${k + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 border-2 border-[color:var(--t10-navy)]" aria-hidden />
          <div className="relative border-2 border-[color:var(--t10-navy)] bg-white p-6 shadow-[8px_8px_0_0_var(--t10-navy)]">
            <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--t10-navy)]">
                  <Sparkles className="h-3.5 w-3.5 text-[color:var(--t10-green)]" />
                </span>
                <p className="text-sm font-semibold text-[color:var(--t10-navy)]">Zyne</p>
                <span className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-grey)]">
                  / UAE mode
                </span>
              </div>
              <span className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-emerald)]">
                {phase === "typing" ? "listening" : phase === "thinking" ? "thinking" : "answering"}
              </span>
            </div>

            {/* You */}
            <div className="mt-5">
              <p className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-grey)]">
                You
              </p>
              <p className="mt-1.5 text-lg text-[color:var(--t10-navy)]">
                {typed}
                {phase === "typing" ? (
                  <span className="t10-caret text-[color:var(--t10-emerald)]">▍</span>
                ) : null}
              </p>
            </div>

            {/* Zyne */}
            <div className="mt-6 min-h-[300px]">
              <p className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-emerald)]">
                Zyne
              </p>
              <AnimatePresence mode="wait">
                {phase === "thinking" ? (
                  <motion.div
                    key={`t-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 space-y-2"
                  >
                    {item.thinking.map((t, k) => (
                      <div
                        key={t}
                        className={`flex items-center gap-3 transition-opacity ${k <= thinkStep ? "opacity-100" : "opacity-30"}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${k < thinkStep ? "bg-[color:var(--t10-emerald)]" : k === thinkStep ? "animate-pulse bg-[color:var(--t10-emerald)]" : "bg-[color:var(--t10-border)]"}`}
                        />
                        <span className="t10-mono text-sm text-[color:var(--t10-navy)]">{t}…</span>
                      </div>
                    ))}
                  </motion.div>
                ) : phase === "answer" ? (
                  <motion.div
                    key={`a-${i}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3"
                  >
                    <p className="text-xl font-semibold leading-snug text-[color:var(--t10-navy)]">
                      {item.answer.headline}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {item.answer.bullets.map((b, k) => (
                        <motion.li
                          key={b}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + k * 0.15 }}
                          className="flex gap-3 text-sm text-[color:var(--t10-grey)]"
                        >
                          <span className="t10-mono mt-0.5 text-[color:var(--t10-emerald)]">
                            0{k + 1}
                          </span>
                          <span>{b}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mt-5 flex items-center justify-between border-t border-dashed border-[color:var(--t10-border)] pt-4"
                    >
                      <span className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-grey)]">
                        Handoff suggested
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--t10-navy)]">
                        {item.answer.handoff} <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </motion.div>
                  </motion.div>
                ) : (
                  <p className="mt-3 t10-mono text-sm text-[color:var(--t10-grey)]">
                    Waiting for your question…
                  </p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
