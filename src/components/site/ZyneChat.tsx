import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, ArrowRight, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Message = { role: "user" | "zyne"; content: string; meta?: string };

// ── Pre-login: Rule-based Virtual Assistant (website info only) ────────────────
const THINK10_INFO: Record<string, string> = {
  pricing: "Think10 offers 4 advisory plans:\n• Free/Explorer — AED 0/mo (limited Zyne VA)\n• Zyne Advisory — AED 290/mo (unlimited AI consulting)\n• Hybrid Advisory — AED 950/mo (AI + 2 human expert credits)\n• Premium Advisory — AED 2,500/mo (AI + 5 human expert credits)\nEnterprise plans are custom-priced. Sign up to get started!",
  experts: "Think10's vetted expert network includes GCC market specialists across e-commerce, finance, operations, Amazon UAE/noon, supply chain, and digital marketing. After signing up, browse and book 60-min strategy sessions directly from your dashboard.",
  zyne: "Zyne VC is Think10's AI virtual consultant, trained on GCC retail and e-commerce best practices. After signing up and selecting a paid plan, Zyne analyzes your business profile and provides structured diagnostics, action plans, and recommendations.",
  onboarding: "Getting started is simple:\n1. Sign up and verify your email\n2. Complete your business profile\n3. Take the 10-dimension Business Health Assessment\n4. Choose an advisory plan\n5. Start consulting with Zyne VC or book a human expert",
  dubai: "Think10 is built specifically for Dubai and GCC market founders — covering Amazon UAE, noon, Shopify UAE, Carrefour, B2B wholesale, and cross-border retail from UAE to KSA and beyond.",
  contact: "You can reach the Think10 team by signing up and using the support section in your dashboard. For enterprise enquiries, select the Enterprise plan during signup and our GCC Advisory Lead will contact you within 1 business day.",
};

function preLoginRespond(input: string): Message {
  const text = input.toLowerCase();
  let answer = "";

  if (text.includes("price") || text.includes("cost") || text.includes("plan") || text.includes("aed") || text.includes("fee")) {
    answer = THINK10_INFO.pricing;
  } else if (text.includes("expert") || text.includes("consult") || text.includes("book") || text.includes("advisor")) {
    answer = THINK10_INFO.experts;
  } else if (text.includes("zyne") || text.includes("ai") || text.includes("virtual")) {
    answer = THINK10_INFO.zyne;
  } else if (text.includes("start") || text.includes("onboard") || text.includes("signup") || text.includes("sign up") || text.includes("register")) {
    answer = THINK10_INFO.onboarding;
  } else if (text.includes("dubai") || text.includes("uae") || text.includes("gcc") || text.includes("amazon") || text.includes("noon") || text.includes("market")) {
    answer = THINK10_INFO.dubai;
  } else if (text.includes("contact") || text.includes("support") || text.includes("help") || text.includes("reach") || text.includes("enterprise")) {
    answer = THINK10_INFO.contact;
  } else {
    answer = "Hi! I'm Zyne, Think10's virtual assistant. I can tell you about our advisory plans, our expert network, and how the platform works.\n\nTry asking:\n• \"What are your pricing plans?\"\n• \"What experts do you have?\"\n• \"How does Zyne VC work?\"\n• \"How do I get started?\"\n\nTo unlock full AI consulting for your Dubai business, sign up and upgrade to a paid plan.";
  }

  return { role: "zyne", content: answer, meta: "Think10 Virtual Assistant" };
}

// ── Post-login: Gemini-powered Dubai/ecommerce business consultant ─────────────
async function postLoginRespond(input: string, history: Message[], businessContext?: string): Promise<Message> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE" || apiKey === "") {
    return {
      role: "zyne",
      content: "Gemini API Key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.",
      meta: "Configuration error"
    };
  }

  try {
    const systemPrompt = `You are Zyne VC, Think10's expert AI business consultant specializing exclusively in Dubai and GCC retail and e-commerce.

Your expertise covers:
- Amazon UAE and noon.com marketplace strategy (listings, PPC, ACOS optimization)
- UAE retail and Shopify DTC (conversion, AOV, LTV)
- GCC market entry (Dubai, Abu Dhabi, KSA, Qatar)
- UAE import regulations, customs, VAT, and logistics
- UAE-specific consumer behavior and seasonal trends (Ramadan, DSF, White Friday)
- B2B wholesale and distributor channels in UAE
- Cash flow, unit economics, and margin optimization for GCC brands
- Supply chain and 3PL in UAE (Aramex, Fetchr, Shipa)

${businessContext ? `Client Business Context: ${businessContext}` : ""}

Rules:
- ONLY discuss Dubai/GCC retail and e-commerce topics.
- If asked about unrelated topics, politely redirect to GCC business matters.
- Be direct, practical, and actionable.
- Keep responses to 2-4 paragraphs unless a detailed plan is requested.
- Suggest escalating to a human Think10 expert when the situation requires deep judgment.`;

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

    return { role: "zyne", content: text, meta: "Zyne VC — GCC Business Consultant" };
  } catch (err: any) {
    console.error("Gemini Error:", err);
    return { role: "zyne", content: `I encountered an error: ${err.message}. Please try again.` };
  }
}


const PRE_LOGIN_SUGGESTIONS = [
  "What are Think10's pricing plans?",
  "What experts do you have?",
  "How does Zyne VC work?",
];

const POST_LOGIN_SUGGESTIONS = [
  "Which products should I prioritise for Amazon UAE?",
  "How should I price for DTC and wholesale in Dubai?",
  "Plan a Ramadan launch calendar for me",
];

export function ZyneChat({
  initialQuestion,
  compact = false,
  businessContext,
}: {
  initialQuestion?: string;
  compact?: boolean;
  businessContext?: string;
}) {
  // Safely try to get auth — component may render outside AuthProvider on landing page
  let currentUser: any = null;
  try {
    const auth = useAuth();
    currentUser = auth.currentUser;
  } catch {
    // Not inside AuthProvider — pre-login mode
  }

  const isLoggedIn = !!currentUser;
  const SUGGESTIONS = isLoggedIn ? POST_LOGIN_SUGGESTIONS : PRE_LOGIN_SUGGESTIONS;

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!initialQuestion) return [];
    return [{ role: "user", content: initialQuestion }];
  });

  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Handle initial question on mount
  useEffect(() => {
    if (initialQuestion && messages.length === 1) {
      setThinking(true);
      const doRespond = async () => {
        let ans: Message;
        if (isLoggedIn) {
          ans = await postLoginRespond(initialQuestion, [], businessContext);
        } else {
          ans = preLoginRespond(initialQuestion);
        }
        setMessages((m) => [...m, ans]);
        setThinking(false);
      };
      doRespond();
    }
  }, [initialQuestion]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t) return;

    const currentMessages = [...messages];
    setMessages((m) => [...m, { role: "user", content: t }]);
    setInput("");
    setThinking(true);

    let ans: Message;
    if (isLoggedIn) {
      ans = await postLoginRespond(t, currentMessages, businessContext);
    } else {
      ans = preLoginRespond(t);
    }

    setMessages((m) => [...m, ans]);
    setThinking(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--t10-border)] bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] bg-[color:var(--t10-navy)] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--t10-emerald)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Zyne</p>
            <p className="text-[11px] text-white/70">
              {isLoggedIn ? "GCC Business Consultant · Live AI" : "Think10 Virtual Assistant"}
            </p>
          </div>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
          isLoggedIn 
            ? "border-[color:var(--t10-emerald)]/40 text-[color:var(--t10-emerald)]" 
            : "border-white/20 text-white/70"
        }`}>
          {isLoggedIn ? "Zyne VC" : "Pre-login"}
        </span>
      </div>

      {/* Messages */}
      <div className={`space-y-3 overflow-y-auto bg-[color:var(--t10-offwhite)] px-4 py-4 ${compact ? "max-h-[320px]" : "max-h-[420px]"}`}>
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[color:var(--t10-border)] bg-white p-4 text-sm text-[color:var(--t10-grey)]">
            {isLoggedIn
              ? "Ask Zyne VC about your Dubai/GCC business — Amazon UAE launch, pricing, Ramadan campaigns, supply chain, cash flow, and more."
              : (
                <span>
                  Hi! I'm Zyne, Think10's virtual assistant. Ask me about our advisory plans, expert network, or how the platform works.{" "}
                  <span className="inline-flex items-center gap-1 font-semibold text-[color:var(--t10-navy)]">
                    <Lock className="h-3 w-3" />
                    Sign in to unlock full GCC business consulting.
                  </span>
                </span>
              )}
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

      {/* Input area */}
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
            placeholder={isLoggedIn ? "Ask Zyne VC about your Dubai business…" : "Ask about Think10's plans or services…"}
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
          {isLoggedIn
            ? <>Escalate to a human expert any time <ArrowRight className="h-3 w-3" /></>
            : <>Sign in to unlock Zyne VC business consulting <ArrowRight className="h-3 w-3" /></>
          }
        </p>
      </div>
    </div>
  );
}
