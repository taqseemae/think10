import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, MessageCircle, RefreshCcw } from 'lucide-react';
import { generateZyneResponseFn } from '@/lib/server-ai';
import { useAuth } from '@/context/AuthContext';
import { useDashboardState } from '@/context/DashboardStateContext';
import { updateZyneTokens } from '@/lib/firestore';

type Message = {
  role: 'user' | 'model';
  text: string;
};

function FormattedMessageText({ text }: { text: string }) {
  if (!text) return null;
  // Clean markdown headers like ##, ### and raw triple asterisks
  const sanitized = text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{3}([^*]+)\*{3}/g, '$1');

  const paragraphs = sanitized.split(/\n\n+/);

  const renderContentWithLinks = (input: string) => {
    // Regex matches markdown links [text](url) OR raw URLs (https?://[^\s]+)
    const linkRegex = /(\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+)/g;
    const parts = input.split(linkRegex);

    return parts.map((part, i) => {
      let label = "";
      let url = "";

      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (match) {
          label = match[1];
          url = match[2];
        }
      } else if (/^https?:\/\/[^\s]+$/.test(part.trim())) {
        url = part.trim();
        label = part.trim();
      }

      if (url) {
        const isSignUp = url.includes('/signup') || url.includes('/login') || label.toLowerCase().includes('sign up');
        const displayLabel = (label.startsWith('http') && isSignUp) ? 'Sign Up for Think10' : label;

        if (isSignUp) {
          return (
            <span key={i} className="block my-2.5">
              <a
                href={url}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--t10-emerald)] text-white text-xs font-bold shadow-md hover:bg-emerald-600 transition-all cursor-pointer no-underline"
              >
                {displayLabel} →
              </a>
            </span>
          );
        }

        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:var(--t10-emerald)] font-bold underline hover:text-emerald-700 transition-colors mx-1 inline-flex items-center gap-0.5"
          >
            {displayLabel}
          </a>
        );
      }

      // Handle **bold**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return <strong key={bIdx} className="font-bold text-neutral-900">{bPart.slice(2, -2)}</strong>;
        }
        return bPart;
      });
    });
  };

  return (
    <div className="space-y-3">
      {paragraphs.map((p, pIdx) => {
        const lines = p.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim());
              const cleanLine = isBullet ? line.trim().replace(/^[•\-\d+\.]\s*/, '') : line;

              if (isBullet) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-[color:var(--t10-emerald)] font-bold select-none">•</span>
                    <span className="flex-1 font-medium">{renderContentWithLinks(cleanLine)}</span>
                  </div>
                );
              }

              return <p key={lIdx} className="leading-relaxed">{renderContentWithLinks(cleanLine)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

const GUEST_QUICK_QUESTIONS = [
  "What is Think10 Advisory?",
  "What plans & pricing are available?",
  "What vetted human experts can I book?",
  "How does Zyne AI work?",
];

const LOGGED_IN_QUICK_QUESTIONS = [
  "How do I get Prime badge on Amazon UAE?",
  "Best way to split supplier deposits?",
  "What DED license for a Dubai boutique?",
  "How to lower my CAC on Noon?",
];

export function ZyneFloatingWidget() {
  const { currentUser } = useAuth();
  const isLoggedIn = !!currentUser;
  
  // Conditionally use context only if logged in to avoid breaking guest pages if provider is missing
  let zyneTokens = 0;
  let setZyneTokens = (t: number) => {};
  try {
    const ctx = useDashboardState();
    zyneTokens = ctx.zyneTokens;
    setZyneTokens = ctx.setZyneTokens;
  } catch(e) {}

  const guestGreeting = "Hi! I'm Zyne, your Think10 Virtual Assistant. Ask me anything about Think10 advisory plans, vetted human experts, or how our platform works!";
  const authGreeting = "Welcome back! I'm Zyne VC, your 24/7 GCC business advisor. Ask me anything about your e-commerce, Amazon UAE, noon, pricing, or supply chain strategy.";

  const initialGreeting = isLoggedIn ? authGreeting : guestGreeting;
  const storageKey = isLoggedIn && currentUser?.uid ? `t10_floating_chat_${currentUser.uid}` : "t10_floating_chat_guest";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return [{ role: 'model', text: initialGreeting }];
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync messages when user logs in/out or storage key changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch (e) {}
      }
      setMessages([{ role: 'model', text: initialGreeting }]);
    }
  }, [storageKey, isLoggedIn]);

  const saveMessages = (msgs: Message[]) => {
    setMessages(msgs);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(msgs));
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (isLoggedIn && zyneTokens <= 0) {
      const newMessages: Message[] = [
        ...messages, 
        { role: 'user', text: text.trim() },
        { role: 'model', text: "You have exhausted your Zyne AI Tokens. Please go to the Billing & Plan section to purchase more tokens." }
      ];
      saveMessages(newMessages);
      setInput('');
      return;
    }

    const userText = text.trim();
    const newMessages: Message[] = [...messages, { role: 'user', text: userText }];
    saveMessages(newMessages);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await generateZyneResponseFn({
        data: {
          messages: newMessages,
          isGuest: !isLoggedIn,
        },
      });

      if (response.success) {
        saveMessages([...newMessages, { role: 'model', text: response.text }]);
        if (isLoggedIn && currentUser) {
          setZyneTokens(zyneTokens - 1);
          updateZyneTokens(currentUser.uid, -1).catch(console.error);
        }
      } else {
        saveMessages([
          ...newMessages,
          { role: 'model', text: response.text || "I'm having trouble connecting right now. Please try again later." },
        ]);
      }
    } catch (error) {
      saveMessages([
        ...newMessages,
        { role: 'model', text: "I'm currently unavailable." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    const resetMsg: Message[] = [{ role: 'model', text: initialGreeting }];
    saveMessages(resetMsg);
  };

  const quickQuestions = isLoggedIn ? LOGGED_IN_QUICK_QUESTIONS : GUEST_QUICK_QUESTIONS;
  const headerTitle = isLoggedIn ? "Zyne VC" : "Zyne Assistant";
  const headerSubtitle = isLoggedIn ? "GCC Business Consultant" : "Think10 Virtual Assistant";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-4 flex w-[380px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl max-h-[600px] h-[600px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#111827] px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--t10-emerald)] text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{headerTitle}</h3>
                <p className="text-xs text-[color:var(--t10-emerald)] mt-0.5 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--t10-emerald)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--t10-emerald)]"></span>
                  </span>
                  {headerSubtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-neutral-400">
              <button onClick={resetChat} className="hover:text-white transition-colors" title="Reset Chat">
                <RefreshCcw className="h-4 w-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#fafafa]">
            <div className="p-4 space-y-5">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'model' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--t10-emerald)] text-white mt-1">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-[color:var(--t10-navy)] text-white'
                        : 'bg-white border border-neutral-200 text-[#1a202c]'
                    }`}
                  >
                    {m.role === 'user' ? (
                      m.text
                    ) : (
                      <FormattedMessageText text={m.text} />
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--t10-emerald)] text-white mt-1">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--t10-emerald)]"></div>
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--t10-emerald)] [animation-delay:0.2s]"></div>
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--t10-emerald)] [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions (Only show if only 1 message exists) */}
            {messages.length === 1 && !isTyping && (
              <div className="px-4 pb-4">
                <p className="text-[11px] font-mono tracking-widest text-neutral-400 mb-3 uppercase">
                  Quick Questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="rounded-full bg-[#dcfce7] px-3.5 py-1.5 text-sm font-medium text-[#166534] transition-colors hover:bg-[#bbf7d0]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-neutral-200 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-2 py-1.5 transition-colors focus-within:border-[color:var(--t10-navy)] focus-within:bg-white"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoggedIn && zyneTokens <= 0 ? "Out of tokens..." : "Ask Zyne AI anything..."}
                disabled={isTyping || (isLoggedIn && zyneTokens <= 0)}
                className="flex-1 bg-transparent px-3 py-2 text-[15px] outline-none placeholder:text-neutral-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping || (isLoggedIn && zyneTokens <= 0)}
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-white transition-colors hover:bg-[color:var(--t10-emerald)] disabled:bg-neutral-200 disabled:opacity-50"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button & Tooltip (Closed State) */}
      {!isOpen && (
        <div className="relative flex flex-col items-end">
          {/* Tooltip Bubble */}
          <div className="absolute bottom-[72px] right-2 w-[240px] rounded-2xl bg-white p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100 cursor-pointer transition-transform hover:-translate-y-1" onClick={() => setIsOpen(true)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--t10-emerald)] text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="font-bold text-[color:var(--t10-navy)] text-sm">{headerTitle}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--t10-emerald)]"></div>
                <span className="text-xs font-medium text-[color:var(--t10-emerald)]">online</span>
              </div>
            </div>
            <div className="rounded-xl bg-neutral-50 px-3 py-2.5 flex items-center gap-2 border border-neutral-100">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--t10-emerald)]/70"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--t10-emerald)]/50"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--t10-emerald)]/30"></div>
              </div>
              <span className="text-sm text-neutral-500">Ask me anything...</span>
            </div>
            {/* Tooltip Tail */}
            <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r border-neutral-100 bg-white"></div>
          </div>

          {/* Circle Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[color:var(--t10-emerald)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <MessageCircle className="h-7 w-7" fill="currentColor" strokeWidth={0} />
            <span className="absolute -top-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-red-500 text-[11px] font-bold text-white shadow-sm">
              1
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
