import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  ArrowRight,
  Lock,
  Mic,
  MicOff,
  Paperclip,
  X,
  FileUp,
  Bot,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Message = { role: "user" | "zyne"; content: string; meta?: string };

interface AttachedFile {
  name: string;
  size: string;
}

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
  let currentUser: any = null;
  try {
    const auth = useAuth();
    currentUser = auth.currentUser;
  } catch {}

  const isLoggedIn = !!currentUser;
  const SUGGESTIONS = isLoggedIn ? POST_LOGIN_SUGGESTIONS : PRE_LOGIN_SUGGESTIONS;

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!initialQuestion) return [];
    return [{ role: "user", content: initialQuestion }];
  });

  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Dictation
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Attachments
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newFiles: AttachedFile[] = files.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const send = async (text: string) => {
    let t = text.trim();
    if (!t && attachedFiles.length === 0) return;

    if (attachedFiles.length > 0) {
      const fNames = attachedFiles.map((f) => f.name).join(", ");
      t = t ? `${t}\n\n[Attached Files: ${fNames}]` : `[Attached Files: ${fNames}]`;
    }

    const currentMessages = [...messages];
    setMessages((m) => [...m, { role: "user", content: t }]);
    setInput("");
    setAttachedFiles([]);
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
    <div className="overflow-hidden rounded-2xl border border-[color:var(--t10-border)] bg-white shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] bg-[color:var(--t10-navy)] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--t10-emerald)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight font-display">Zyne VC</p>
            <p className="text-[11px] text-white/70">
              {isLoggedIn ? "GCC Business Consultant · ChatGPT Mode" : "Think10 Virtual Assistant"}
            </p>
          </div>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
          isLoggedIn 
            ? "border-[color:var(--t10-emerald)]/40 text-[color:var(--t10-emerald)]" 
            : "border-white/20 text-white/70"
        }`}>
          {isLoggedIn ? "ChatGPT Engine" : "Pre-login"}
        </span>
      </div>

      {/* Messages */}
      <div className={`space-y-4 overflow-y-auto bg-neutral-50/60 px-4 py-4 ${compact ? "max-h-[340px]" : "max-h-[460px]"}`}>
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--t10-border)] bg-white p-5 text-xs text-[color:var(--t10-grey)] leading-relaxed">
            {isLoggedIn
              ? "Ask Zyne VC about your Dubai/GCC business — Amazon UAE launch, pricing, Ramadan campaigns, supply chain, cash flow, or attach documents."
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
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-xs shadow-xs ${
                m.role === "user"
                  ? "bg-[color:var(--t10-navy)] text-white rounded-tr-none"
                  : "border border-neutral-200 bg-white text-[color:var(--t10-navy)] rounded-tl-none"
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
              {m.meta ? (
                <p className="mt-2 text-[10px] text-[color:var(--t10-grey)] font-medium">{m.meta}</p>
              ) : null}
            </div>
          </div>
        ))}

        {thinking ? (
          <div className="flex justify-start">
            <div className="rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-xs text-[color:var(--t10-grey)] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--t10-emerald)] animate-ping" />
              Zyne is thinking…
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      {/* Input area - ChatGPT Style */}
      <div className="border-t border-neutral-100 bg-white px-4 py-3 space-y-2">
        {/* Attachment Badges */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {attachedFiles.map((file, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 border border-neutral-200 px-2.5 py-1 text-[11px] font-semibold text-neutral-700"
              >
                <FileUp className="h-3 w-3 text-[color:var(--t10-emerald)]" />
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept=".pdf,.csv,.xlsx,.docx,.txt,.png,.jpg,.jpeg"
          className="hidden"
        />

        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[10px] font-medium text-[color:var(--t10-navy)] hover:border-[color:var(--t10-emerald)] hover:bg-[color:var(--t10-mint)] transition-all cursor-pointer"
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
          className="relative flex items-center rounded-3xl border border-neutral-200 bg-neutral-50/80 px-3.5 py-2 shadow-inner focus-within:border-[color:var(--t10-navy)] focus-within:bg-white transition-all"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-neutral-400 hover:text-[color:var(--t10-navy)] rounded-full cursor-pointer mr-0.5"
            title="Attach Document"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleVoiceListening}
            className={`p-1.5 rounded-full cursor-pointer mr-1.5 ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "text-neutral-400 hover:text-[color:var(--t10-navy)]"
            }`}
            title="Voice Dictation"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? "Listening..."
                : isLoggedIn
                ? "Ask Zyne VC or attach documents…"
                : "Ask about Think10's plans…"
            }
            className="flex-1 bg-transparent text-xs text-[color:var(--t10-navy)] outline-none font-medium placeholder:text-neutral-400"
          />

          <button
            type="submit"
            disabled={!input.trim() && attachedFiles.length === 0}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--t10-navy)] text-white hover:bg-neutral-800 disabled:opacity-30 transition-all cursor-pointer shadow-xs ml-1"
          >
            <Send className="h-3.5 w-3.5 text-[color:var(--t10-emerald)]" />
          </button>
        </form>
      </div>
    </div>
  );
}
