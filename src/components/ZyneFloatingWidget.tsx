import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, MessageCircle, RefreshCcw } from 'lucide-react';
import { generateZyneResponseFn } from '@/lib/server-ai';

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
  return (
    <div className="space-y-3">
      {paragraphs.map((p, pIdx) => {
        const lines = p.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim());
              const cleanLine = isBullet ? line.trim().replace(/^[•\-\d+\.]\s*/, '') : line;
              
              const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
              const formattedParts = parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i} className="font-bold text-neutral-900">{part.slice(2, -2)}</strong>;
                }
                return part;
              });

              if (isBullet) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-[color:var(--t10-emerald)] font-bold select-none">•</span>
                    <span className="flex-1 font-medium">{formattedParts}</span>
                  </div>
                );
              }

              return <p key={lIdx} className="leading-relaxed">{formattedParts}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

const QUICK_QUESTIONS = [
  "How do I get Prime badge on Amazon UAE?",
  "Best way to split supplier deposits?",
  "What DED license for a Dubai boutique?",
  "How to lower my CAC on Noon?",
];

export function ZyneFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hi! I'm Zyne AI, your 24/7 GCC retail advisor. Ask me anything about e-commerce, licensing, sourcing, or marketplace strategy.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userText = text.trim();
    const newMessages: Message[] = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await generateZyneResponseFn({
        data: {
          messages: newMessages,
          isGuest: true,
        },
      });

      if (response.success) {
        setMessages([...newMessages, { role: 'model', text: response.text }]);
      } else {
        setMessages([
          ...newMessages,
          { role: 'model', text: "I'm having trouble connecting right now. Please try again later." },
        ]);
      }
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: 'model', text: "I'm currently unavailable." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'model',
        text: "Hi! I'm Zyne AI, your 24/7 GCC retail advisor. Ask me anything about e-commerce, licensing, sourcing, or marketplace strategy.",
      },
    ]);
  };

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
                <h3 className="font-bold text-lg leading-tight">Zyne AI</h3>
                <p className="text-xs text-[color:var(--t10-emerald)] mt-0.5 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--t10-emerald)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--t10-emerald)]"></span>
                  </span>
                  Online — Instant Response
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
                  {QUICK_QUESTIONS.map((q, i) => (
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
                placeholder="Ask Zyne AI anything..."
                className="flex-1 bg-transparent px-3 py-2 text-[15px] outline-none placeholder:text-neutral-400"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
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
                <span className="font-bold text-[color:var(--t10-navy)] text-sm">Zyne AI</span>
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
