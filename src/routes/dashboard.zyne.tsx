import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useDashboardState } from "@/context/DashboardStateContext";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Bookmark,
  Calendar,
  Check,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Mic,
  MicOff,
  X,
  FileUp,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown
} from "lucide-react";

export const Route = createFileRoute("/dashboard/zyne")({
  validateSearch: z.object({
    q: z.string().optional(),
  }),
  component: Page,
});

const SUGGESTIONS = [
  "Which products should I prioritise for my Amazon UAE launch?",
  "How should I price for DTC and wholesale in Dubai?",
  "Plan a Ramadan launch calendar for me",
  "How do I audit my unit economics & extend cash runway?",
];

interface AttachedFile {
  name: string;
  size: string;
  type: string;
}

function Page() {
  const { q } = Route.useSearch();
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

  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savedActionsMap, setSavedActionsMap] = useState<Record<string, boolean>>({});
  const [savedReportMap, setSavedReportMap] = useState<Record<string, boolean>>({});

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState("Zyne Pro (GPT-4o)");

  // Voice Input / Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // File Attachments State
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  // Auto-scroll chat
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, thinking]);

  // Handle query parameter on load
  useEffect(() => {
    if (q) {
      const existing = conversations.find(
        (c) => c.messages.length > 0 && c.messages[0].content === q
      );
      if (existing) {
        setActiveConversationId(existing.id);
      } else {
        startNewChat(q);
      }
      navigate({ search: { q: undefined } as any });
    }
  }, [q]);

  // Init Web Speech Recognition API if supported
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

        recognition.onerror = (event: any) => {
          console.warn("[Voice API Error]:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech start error:", err);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newAttachments: AttachedFile[] = files.map((f) => {
      const sizeKB = (f.size / 1024).toFixed(1);
      const sizeStr = f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeKB} KB`;
      return {
        name: f.name,
        size: sizeStr,
        type: f.type,
      };
    });

    setAttachedFiles((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const activeChat = conversations.find((c) => c.id === activeConversationId);

  const handleSend = async (text: string) => {
    let t = text.trim();
    if (!t && attachedFiles.length === 0) return;

    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map((f) => f.name).join(", ");
      t = t ? `${t}\n\n[Attached Files: ${fileNames}]` : `[Attached Files: ${fileNames}]`;
    }

    let currentChatId = activeConversationId;
    if (!currentChatId) {
      setThinking(true);
      setInput("");
      setAttachedFiles([]);
      await startNewChat(t);
      setThinking(false);
      return;
    }

    setInput("");
    setAttachedFiles([]);
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
        "2026-07-28",
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
    <div className="absolute inset-0 z-50 bg-white flex overflow-hidden">
      {/* ChatGPT Style Sidebar (History) */}
      <div 
        className={`${isSidebarOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0'} flex-shrink-0 bg-[#f9f9f9] flex flex-col border-r border-neutral-200 transition-all duration-300 overflow-hidden relative`}
      >
        <div className="p-3 sticky top-0 bg-[#f9f9f9] z-10 flex items-center justify-between">
           <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-neutral-500 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <PanelLeftClose className="h-5 w-5" />
           </button>
           <button
            onClick={() => startNewChat()}
            className="flex-1 ml-2 flex items-center justify-between gap-2 rounded-md hover:bg-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors cursor-pointer"
          >
             New Chat
             <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-xs font-bold text-neutral-400 px-2 py-2">Today</p>
          {conversations.map((c) => {
            const active = c.id === activeConversationId;
            return (
              <div
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                  active
                    ? "bg-neutral-200 text-neutral-900 font-medium"
                    : "text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <span className="truncate flex-1 pr-1">{c.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 rounded transition-all cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {role === "Free" && (
          <div className="p-4 border-t border-neutral-200 bg-[#f9f9f9]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[color:var(--t10-emerald)]" />
              <span className="text-sm font-semibold text-[color:var(--t10-navy)]">Upgrade Plan</span>
            </div>
            <p className="text-xs text-neutral-500 mb-2">Get unlimited Zyne access & full context auditing.</p>
            <div className="flex justify-between text-[10px] font-bold text-neutral-400 mb-1">
              <span>Usage</span>
              <span>{messageAllowanceUsed} / 5</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden mb-3">
              <div
                className="h-full bg-[color:var(--t10-emerald)] transition-all duration-300"
                style={{ width: `${(messageAllowanceUsed / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative bg-white">
        {/* Top Header - Model Selector */}
        <div className="h-14 flex items-center px-4 shrink-0 bg-white sticky top-0 z-10 border-b border-neutral-100/50">
          <Link
            to="/dashboard"
            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer mr-2"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer mr-2"
              title="Open sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          )}
          
          <div className="group relative cursor-pointer z-50">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-lg font-bold text-neutral-700">
              {selectedModel} <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-neutral-200 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-2 space-y-1">
                <button onClick={() => setSelectedModel("Zyne Pro (GPT-4o)")} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-neutral-100 cursor-pointer">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-neutral-800">Zyne Pro (GPT-4o)</p>
                    <p className="text-xs text-neutral-500">Most capable, best for complex audits</p>
                  </div>
                  {selectedModel === "Zyne Pro (GPT-4o)" && <Check className="h-4 w-4 text-neutral-800" />}
                </button>
                <button onClick={() => setSelectedModel("Zyne Core (GPT-4o mini)")} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-neutral-100 cursor-pointer">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-neutral-800">Zyne Core (GPT-4o mini)</p>
                    <p className="text-xs text-neutral-500">Faster responses for simple queries</p>
                  </div>
                  {selectedModel === "Zyne Core (GPT-4o mini)" && <Check className="h-4 w-4 text-neutral-800" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {!activeChat ? (
             <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4 pb-32">
                <div className="h-16 w-16 rounded-full bg-[color:var(--t10-navy)] text-white flex items-center justify-center shadow-md mb-6">
                  <Sparkles className="h-8 w-8 text-[color:var(--t10-emerald)]" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-8 text-center">How can I help you today?</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-left p-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors group cursor-pointer"
                    >
                      <p className="text-sm text-neutral-600 font-medium group-hover:text-neutral-900">{s}</p>
                    </button>
                  ))}
                </div>
             </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-8 pb-32">
              {activeChat.messages.map((m, idx) => {
                const isUser = m.role === "user";
                const isSavedActions = savedActionsMap[`${activeChat.id}_${idx}`];
                const isSavedReport = savedReportMap[`${activeChat.id}_${idx}`];

                return (
                  <div key={idx} className={`flex gap-4 w-full ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && (
                       <div className="h-8 w-8 rounded-full bg-[color:var(--t10-navy)] flex items-center justify-center shrink-0 border border-neutral-200">
                          <Bot className="h-4 w-4 text-[color:var(--t10-emerald)]" />
                       </div>
                    )}
                    
                    <div className={`max-w-[80%] ${isUser ? "" : "pt-1"}`}>
                       {isUser ? (
                         <div className="bg-[#f4f4f4] text-neutral-900 px-5 py-3 rounded-3xl text-[15px] leading-relaxed">
                            {m.content}
                         </div>
                       ) : (
                         <div className="text-neutral-800 text-[15px] leading-relaxed space-y-6">
                            {m.sections ? (
                               <div className="space-y-6">
                                  {m.sections.understanding && (
                                     <p>{m.sections.understanding}</p>
                                  )}
                                  
                                  {m.sections.recommendation && (
                                     <div className="whitespace-pre-wrap">{m.sections.recommendation}</div>
                                  )}

                                  {(m.sections.assumptions || m.sections.risks) && (
                                    <div className="grid sm:grid-cols-2 gap-4 my-6 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                                      {m.sections.assumptions && (
                                        <div>
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Key Constraints</h4>
                                          <p className="text-sm text-neutral-600">{m.sections.assumptions}</p>
                                        </div>
                                      )}
                                      {m.sections.risks && (
                                        <div>
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1 mb-2">
                                            <AlertTriangle className="h-3 w-3" /> System Gaps
                                          </h4>
                                          <p className="text-sm text-neutral-600">{m.sections.risks}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {m.sections.nextActions && m.sections.nextActions.length > 0 && (
                                    <div className="space-y-3">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Suggested Actions</h4>
                                      <ul className="space-y-2">
                                        {m.sections.nextActions.map((act, aIdx) => (
                                          <li key={aIdx} className="flex items-start gap-3 text-sm">
                                            <span className="text-neutral-400 mt-1">•</span>
                                            <span>{act}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* AI Action Buttons */}
                                  <div className="flex flex-wrap gap-2 pt-4">
                                    <button
                                      onClick={() => handleSaveToActionPlan(idx, m.sections?.nextActions || [])}
                                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                                        isSavedActions
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                                      }`}
                                    >
                                      <Bookmark className="h-4 w-4" /> 
                                      {isSavedActions ? "Saved to Action Plan" : "Save Actions to Plan"}
                                    </button>
                                    <button
                                      onClick={() => handleSaveAsReport(idx, m.sections?.recommendation || "")}
                                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                                        isSavedReport
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                                      }`}
                                    >
                                      <FileText className="h-4 w-4" /> 
                                      {isSavedReport ? "Saved as Report" : "Save Diagnostic Report"}
                                    </button>
                                    <Link
                                      to="/dashboard/advisors"
                                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors"
                                    >
                                      <Calendar className="h-4 w-4" /> Book Expert Call
                                    </Link>
                                  </div>
                               </div>
                            ) : (
                               <p className="whitespace-pre-wrap">{m.content}</p>
                            )}
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}

              {thinking && (
                <div className="flex gap-4 justify-start w-full">
                  <div className="h-8 w-8 rounded-full bg-[color:var(--t10-navy)] flex items-center justify-center shrink-0 border border-neutral-200">
                    <Bot className="h-4 w-4 text-[color:var(--t10-emerald)] animate-pulse" />
                  </div>
                  <div className="pt-2 flex items-center gap-1.5 h-8">
                     <span className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                     <span className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                     <span className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* ChatGPT Style Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-4">
          <div className="max-w-3xl mx-auto w-full relative">
            
            {/* Attachment Previews */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-3">
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl bg-neutral-100 border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm relative group"
                  >
                    <FileUp className="h-4 w-4 text-[color:var(--t10-emerald)]" />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="absolute -top-1.5 -right-1.5 bg-neutral-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden Input for Files */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept=".pdf,.csv,.xlsx,.docx,.txt,.png,.jpg,.jpeg"
              className="hidden"
            />

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="relative flex items-end rounded-[26px] border border-neutral-300 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] focus-within:border-neutral-400 focus-within:shadow-[0_2px_20px_-3px_rgba(0,0,0,0.1)] transition-all overflow-hidden pl-3 pr-2 py-2"
            >
              {/* Left Action Buttons */}
              <div className="flex items-center pb-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                  title="Attach File"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Text Area */}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening..."
                    : role === "Free" && messageAllowanceUsed >= 5
                    ? "Message limit reached. Upgrade to continue."
                    : "Message Zyne"
                }
                disabled={role === "Free" && messageAllowanceUsed >= 5}
                className="flex-1 bg-transparent text-[15px] text-neutral-900 outline-none placeholder:text-neutral-500 px-2 pb-1.5 pt-1.5 min-h-[40px]"
              />

              {/* Right Action Buttons */}
              <div className="flex items-center gap-1 pb-1">
                <button
                  type="button"
                  onClick={toggleVoiceListening}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isListening
                      ? "bg-red-100 text-red-600 animate-pulse"
                      : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                  }`}
                  title={isListening ? "Stop Voice" : "Voice Input"}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  type="submit"
                  disabled={(role === "Free" && messageAllowanceUsed >= 5) || (!input.trim() && attachedFiles.length === 0)}
                  className={`flex h-8 w-8 mb-0.5 items-center justify-center rounded-full transition-all shadow-sm ${
                     (!input.trim() && attachedFiles.length === 0)
                       ? "bg-[#f4f4f4] text-neutral-400 cursor-not-allowed"
                       : "bg-black text-white hover:bg-neutral-800 cursor-pointer"
                  }`}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
            
            <p className="text-center text-[11px] text-neutral-400 mt-3 font-medium">
              Zyne can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
