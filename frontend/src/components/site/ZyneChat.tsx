"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, ArrowRight } from "lucide-react";

type Message = { role: "user" | "zyne"; content: string; meta?: string };

const PRESETS: Record<string, string> = {
  amazon:
    "Based on a UAE beauty brand profile with 8 SKUs, I'd prioritise 3 hero SKUs for your Amazon UAE launch: highest margin, lowest return rate, strongest reviews on Shopify. Expected PPC ACOS 22–28% in the first 60 days. Next step: I'll draft your listing briefs and hand you off to Layla Hassan (Marketplace Strategist) for a 60-min launch review.",
  pricing:
    "For a DTC + wholesale product with 55% blended margin, your channel ladder likely needs 3 tiers: MSRP, distributor and marketplace. I'll structure the model against Amazon and noon fees. If you want a human sanity check, Priya Menon (Finance advisor) has slots Tuesday.",
  ramadan:
    "For a Ramadan launch, I'd plan 8 weeks of lead time: sourcing, creative, ads warm-up (D-30), soft launch (D-14), full launch on Ramadan D-3. I can generate a week-by-week calendar and flag inventory risk. Want me to draft it now?",
  default:
    "Tell me about your product, channel and stage. I'll structure a diagnosis and, if it needs deeper judgement, match you to a vetted UAE expert.",
};

async function respond(input: string, history: Message[]): Promise<Message> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE" || apiKey === "") {
    return {
      role: "zyne",
      content: "System Alert: Gemini API Key is not configured in .env",
      meta: "Configuration error"
    };
  }

  try {
    const systemPrompt = `You are Zyne, an AI business advisor for UAE retail and e-commerce. You provide quick, helpful business diagnostics and usually suggest escalating to a vetted human expert if it requires deep judgement. Keep responses concise (2-3 paragraphs max).`;

    const requestBody = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [
        ...history.map(msg => ({
          role: msg.role === "zyne" ? "model" : "user",
          parts: [{ text: msg.content }]
        })),
        { role: "user", parts: [{ text: input }] }
      ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Gemini API error");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response");

    return { role: "zyne", content: text, meta: "Live AI response" };
  } catch (err: any) {
    console.error("Gemini Error:", err);
    return { role: "zyne", content: `Error: ${err.message}` };
  }
}

const SUGGESTIONS = [
  "Which products should I prioritise for my Amazon UAE launch?",
  "How should I price for DTC and wholesale?",
  "Plan a Ramadan launch calendar for me",
];

export function ZyneChat({
  initialQuestion,
  compact = false,
}: {
  initialQuestion?: string;
  compact?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!initialQuestion) return [];
    return [{ role: "user", content: initialQuestion }];
  });

  // Handle initial question fetch on mount
  useEffect(() => {
    if (initialQuestion && messages.length === 1) {
      setThinking(true);
      respond(initialQuestion, []).then((ans) => {
        setMessages((m) => [...m, ans]);
        setThinking(false);
      });
    }
  }, [initialQuestion]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    
    // Capture current messages
    const currentMessages = [...messages];
    
    setMessages((m) => [...m, { role: "user", content: t }]);
    setInput("");
    setThinking(true);
    
    const ans = await respond(t, currentMessages);
    
    setMessages((m) => [...m, ans]);
    setThinking(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--t10-border)] bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] bg-[color:var(--t10-navy)] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--t10-emerald)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Zyne</p>
            <p className="text-[11px] text-white/70">AI business advisor · Prototype</p>
          </div>
        </div>
        <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70">
          Live demo
        </span>
      </div>

      <div
        className={`space-y-3 overflow-y-auto bg-[color:var(--t10-offwhite)] px-4 py-4 ${compact ? "max-h-[320px]" : "max-h-[420px]"}`}
      >
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[color:var(--t10-border)] bg-white p-4 text-sm text-[color:var(--t10-grey)]">
            Ask Zyne about your UAE business — launch, marketplaces, pricing, cash flow, operations
            or growth.
          </div>
        ) : null}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                m.role === "user"
                  ? "bg-[color:var(--t10-navy)] text-white"
                  : "border border-[color:var(--t10-border)] bg-white text-[color:var(--t10-navy)]"
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
              {m.meta ? (
                <p className="mt-2 text-[11px] text-[color:var(--t10-grey)]">{m.meta}</p>
              ) : null}
            </div>
          </div>
        ))}
        {thinking ? (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white px-3.5 py-2.5 text-sm text-[color:var(--t10-grey)]">
              Zyne is thinking…
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="border-t border-[color:var(--t10-border)] bg-white px-4 py-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-[color:var(--t10-border)] bg-[color:var(--t10-mint)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-green)]/20"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Zyne a business question…"
            className="flex-1 rounded-lg border border-[color:var(--t10-border)] bg-white px-3 py-2 text-sm text-[color:var(--t10-navy)] outline-none focus:border-[color:var(--t10-emerald)]"
            aria-label="Ask Zyne"
          />
          <button
            type="submit"
            aria-label="Send"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--t10-emerald)] text-white hover:bg-[color:var(--t10-green)]"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-2 flex items-center gap-1 text-[11px] text-[color:var(--t10-grey)]">
          Escalate to a human expert any time <ArrowRight className="h-3 w-3" />
        </p>
      </div>
    </div>
  );
}
