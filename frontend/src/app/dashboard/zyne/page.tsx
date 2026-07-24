"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDashboardState } from "@/context/DashboardStateContext";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  Sparkles,
  Send,
  ArrowRight,
  Plus,
  Trash2,
  Bookmark,
  Calendar,
  Check,
  FileText,
  AlertTriangle,
  BookOpen,
  Info,
} from "lucide-react";


const SUGGESTIONS = [
  "Which products should I prioritise for my Amazon UAE launch?",
  "How should I price for DTC and wholesale?",
  "Plan a Ramadan launch calendar for me",
  "How do I fix my cash flow and extend runway?",
];

function Page() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const {
    role,
    conversations,
    activeConversationId,
    setActiveConversationId,
    startNewChat,
    sendChatMessage,
    deleteConversation,
    messageAllowanceUsed,
    addActionItem,
    uploadDocument,
  } = useDashboardState();

  const router = useRouter();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const [savedActionsMap, setSavedActionsMap] = useState<Record<string, boolean>>({});
  const [savedReportMap, setSavedReportMap] = useState<Record<string, boolean>>({});

  // Auto-scroll chat
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, thinking]);

  // Handle query parameter on load
  useEffect(() => {
    if (q) {
      // Look for a chat that has this initial message
      const existing = conversations.find(
        (c) => c.messages.length > 0 && c.messages[0].content === q
      );
      if (existing) {
        setActiveConversationId(existing.id);
      } else {
        startNewChat(q);
      }
      // Clear search param
      // Clear search param by replacing URL
      router.replace("/dashboard/zyne");
    }
  }, [q]);

  const activeChat = conversations.find((c) => c.id === activeConversationId);

  const handleSend = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    
    let currentChatId = activeConversationId;
    if (!currentChatId) {
      setThinking(true);
      setInput("");
      await startNewChat(t);
      setThinking(false);
      return;
    }

    setInput("");
    setThinking(true);
    await sendChatMessage(t);
    setThinking(false);
  };

  const handleSaveToActionPlan = (msgIndex: number, actions: string[]) => {
    const key = `${activeConversationId}_${msgIndex}`;
    if (savedActionsMap[key]) return;

    actions.forEach((a) => {
      addActionItem(
        a,
        "Founder",
        "2026-07-28", // default deadline
        "Zyne",
        activeConversationId || undefined,
        "Imported from Zyne VC consultation recommendations."
      );
    });

    setSavedActionsMap((prev) => ({ ...prev, [key]: true }));
  };

  const handleSaveAsReport = (msgIndex: number, recommendation: string) => {
    const key = `${activeConversationId}_${msgIndex}`;
    if (savedReportMap[key]) return;

    const reportName = `Zyne_Diagnostic_${Date.now().toString().slice(-4)}.pdf`;
    uploadDocument(reportName, "124 KB", "Finance");

    setSavedReportMap((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-[250px_1fr]">
      {/* Sidebar - Conversations list */}
      <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-4 shadow-sm h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <button
            onClick={() => startNewChat()}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--t10-navy)] py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New Conversation
          </button>
          
          <div className="space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
            <p className="text-[10px] font-bold text-[color:var(--t10-grey)] uppercase tracking-wider px-2">
              Recent Diagnosis
            </p>
            {conversations.map((c) => {
              const active = c.id === activeConversationId;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium cursor-pointer transition-all ${active ? "bg-[color:var(--t10-mint)] text-[color:var(--t10-navy)]" : "text-[color:var(--t10-grey)] hover:bg-neutral-100 hover:text-[color:var(--t10-navy)]"}`}
                >
                  <span className="truncate flex-1 pr-1">{c.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 rounded transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {conversations.length === 0 && (
              <p className="text-xs text-[color:var(--t10-grey)] italic px-2 py-2">
                No chats yet.
              </p>
            )}
          </div>
        </div>

        {/* Message Meter for Free */}
        {role === "Free" && (
          <div className="border-t border-[color:var(--t10-border)] pt-3 text-center space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-[color:var(--t10-grey)]">
              <span>Free VA Queries</span>
              <span>{messageAllowanceUsed} / 5</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-[color:var(--t10-emerald)] transition-all duration-300"
                style={{ width: `${(messageAllowanceUsed / 5) * 100}%` }}
              />
            </div>
            <Link href="/dashboard/billing"
              className="block text-[10px] font-bold text-[color:var(--t10-emerald)] hover:underline"
            >
              Upgrade to Zyne VC
            </Link>
          </div>
        )}
      </div>

      {/* Main Chat Workspace */}
      <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white shadow-sm flex flex-col justify-between h-[520px] overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] bg-[color:var(--t10-navy)] px-5 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--t10-emerald)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight flex items-center gap-1.5">
                Zyne{" "}
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase text-white/80">
                  {role === "Free" ? "Virtual Assistant" : "Virtual Consultant"}
                </span>
              </p>
              <p className="text-[10px] text-white/70">
                {role === "Free"
                  ? "Standard platform navigation guide"
                  : "Context-aware business intelligence engine"}
              </p>
            </div>
          </div>
          {role !== "Free" && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[color:var(--t10-emerald)]">
              Context loaded
            </span>
          )}
        </div>

        {/* Message body */}
        <div className="flex-1 overflow-y-auto bg-[color:var(--t10-offwhite)] p-5 space-y-4">
          {!activeChat ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 animate-fade-in">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)] animate-bounce">
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[color:var(--t10-navy)]">
                  Consult with Zyne
                </h3>
                <p className="text-xs text-[color:var(--t10-grey)] leading-relaxed mt-1">
                  Ask Zyne VC structured questions about your UAE logistics channels, pricing tiers,
                  or Ramadan revenue planning.
                </p>
              </div>
              <div className="grid gap-2 w-full pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="w-full text-left rounded-lg border border-[color:var(--t10-border)] bg-white px-3 py-2 text-xs text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-mint)] hover:border-[color:var(--t10-emerald)] transition-all font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeChat.messages.map((m, idx) => {
                const isUser = m.role === "user";
                const isSavedActions = savedActionsMap[`${activeChat.id}_${idx}`];
                const isSavedReport = savedReportMap[`${activeChat.id}_${idx}`];

                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[90%] rounded-2xl p-4 text-xs shadow-sm space-y-3 ${isUser ? "bg-[color:var(--t10-navy)] text-white" : "border border-[color:var(--t10-border)] bg-white text-[color:var(--t10-navy)]"}`}
                    >
                      {!isUser && m.sections ? (
                        /* Structured VC Answer UI */
                        <div className="space-y-4">
                          {/* 1. Understanding context */}
                          <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-2.5 flex items-start gap-2">
                            <Info className="h-4 w-4 text-[color:var(--t10-grey)] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--t10-grey)]">
                                Zyne Context Loaded
                              </span>
                              <p className="text-[11px] text-[color:var(--t10-grey)] leading-normal">
                                {m.sections.understanding}
                              </p>
                            </div>
                          </div>

                          {/* 2. Structured Recommendation */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--t10-emerald)]">
                              Recommendation & Diagnosis
                            </span>
                            <p className="text-xs leading-relaxed text-[color:var(--t10-navy)] font-medium whitespace-pre-line">
                              {m.sections.recommendation}
                            </p>
                          </div>

                          {/* 3. Assumptions & Risks Grid */}
                          <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-neutral-100 text-[11px]">
                            <div className="space-y-1">
                              <span className="font-bold text-[color:var(--t10-grey)] uppercase tracking-wide">
                                Key Constraints
                              </span>
                              <p className="text-[color:var(--t10-grey)] leading-normal">
                                {m.sections.assumptions}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="font-bold text-red-700 uppercase tracking-wide flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> System Gaps
                              </span>
                              <p className="text-[color:var(--t10-grey)] leading-normal">
                                {m.sections.risks}
                              </p>
                            </div>
                          </div>

                          {/* 4. Action checklist */}
                          {m.sections.nextActions && m.sections.nextActions.length > 0 && (
                            <div className="rounded-lg border border-emerald-100 bg-[color:var(--t10-mint)]/40 p-3 space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--t10-navy)]">
                                Automated Next Action Tasks
                              </span>
                              <ul className="space-y-1.5">
                                {m.sections.nextActions.map((act, aIdx) => (
                                  <li key={aIdx} className="flex items-start gap-1.5 text-[11px] text-[color:var(--t10-navy)]">
                                    <span className="text-[color:var(--t10-emerald)] font-bold mt-0.5">•</span>
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 5. Sources references */}
                          {m.sections.sources && m.sections.sources.length > 0 && (
                            <div className="text-[10px] text-[color:var(--t10-grey)] flex items-center gap-1.5 pt-1.5 border-t border-neutral-100">
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>
                                Referenced Sources:{" "}
                                <strong className="text-[color:var(--t10-navy)]">
                                  {m.sections.sources.join(", ")}
                                </strong>
                              </span>
                            </div>
                          )}

                          {/* Action Sub-Buttons */}
                          <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                            <button
                              onClick={() =>
                                handleSaveToActionPlan(idx, m.sections?.nextActions || [])
                              }
                              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-bold border transition-all ${isSavedActions ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-[color:var(--t10-navy)] hover:bg-[color:var(--t10-navy)] hover:text-white"}`}
                            >
                              {isSavedActions ? (
                                <>
                                  <Check className="h-3.5 w-3.5" /> Saved to Actions
                                </>
                              ) : (
                                <>
                                  <Bookmark className="h-3.5 w-3.5" /> Save Actions to Plan
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleSaveAsReport(idx, m.sections?.recommendation || "")}
                              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-bold border transition-all ${isSavedReport ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-[color:var(--t10-navy)] hover:bg-[color:var(--t10-navy)] hover:text-white"}`}
                            >
                              {isSavedReport ? (
                                <>
                                  <Check className="h-3.5 w-3.5" /> Report Saved
                                </>
                              ) : (
                                <>
                                  <FileText className="h-3.5 w-3.5" /> Save as Diagnostic Report
                                </>
                              )}
                            </button>
                            {process.env.NEXT_PUBLIC_CALENDLY_URL ? (
                              <a
                                href={process.env.NEXT_PUBLIC_CALENDLY_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-md border border-[color:var(--t10-navy)] px-2.5 py-1.5 text-[10px] font-bold hover:bg-[color:var(--t10-navy)] hover:text-white transition-all"
                              >
                                <Calendar className="h-3.5 w-3.5" /> Book Marketplace Expert
                              </a>
                            ) : (
                              <Link href="/dashboard/advisors"
                                className="inline-flex items-center gap-1 rounded-md border border-[color:var(--t10-navy)] px-2.5 py-1.5 text-[10px] font-bold hover:bg-[color:var(--t10-navy)] hover:text-white transition-all"
                              >
                                <Calendar className="h-3.5 w-3.5" /> Book Marketplace Expert
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Standard message */
                        <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {thinking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white px-4 py-3 text-xs text-[color:var(--t10-grey)]">
                    Zyne is diagnostic auditing context...
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="border-t border-[color:var(--t10-border)] bg-white px-5 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                role === "Free" && messageAllowanceUsed >= 5
                  ? "Message limit reached. Upgrade plan."
                  : "Ask Zyne VC a business or diagnostic query..."
              }
              disabled={role === "Free" && messageAllowanceUsed >= 5}
              className="flex-1 rounded-lg border border-[color:var(--t10-border)] bg-white px-4 py-2 text-xs text-[color:var(--t10-navy)] outline-none focus:border-[color:var(--t10-emerald)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={(role === "Free" && messageAllowanceUsed >= 5) || !input.trim()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--t10-emerald)] text-white hover:bg-[color:var(--t10-green)] disabled:opacity-50 transition-colors shadow"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 flex items-center gap-1 text-[10px] text-[color:var(--t10-grey)] font-medium">
            Zyne VC can instantly suggest tasks & generate PDF briefs.{" "}
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    </div>
  );
}

export default Page;
