import { useState, useEffect } from "react";
import { Video, Mic, MicOff, VideoOff, X, Share2, Send, CheckCircle, Star } from "lucide-react";
import { useDashboardState } from "@/context/DashboardStateContext";
import type { BookingSession } from "@/context/DashboardStateContext";

export function SecureCallModal({
  activeCallSession,
  onClose,
}: {
  activeCallSession: BookingSession | null;
  onClose: () => void;
}) {
  const { completeCall, triggerServiceRecovery } = useDashboardState();
  const [callStep, setCallStep] = useState<"DEVICE_CHECK" | "CONSENT" | "ACTIVE" | "FEEDBACK">("DEVICE_CHECK");

  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [audioLevel, setAudioLevel] = useState(30);
  const [consentRecord, setConsentRecord] = useState(true);
  const [consentTranscribe, setConsentTranscribe] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "expert"; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    if (activeCallSession) {
      setCallStep("DEVICE_CHECK");
      setCallDuration(0);
      setChatMessages([
        {
          sender: "expert",
          text: `Session initialized for '${activeCallSession.topic}'. Let's begin.`,
          time: "Just now",
        },
      ]);
    }
  }, [activeCallSession]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCallSession && callStep === "DEVICE_CHECK") {
      interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 60) + 10);
      }, 300);
    }
    return () => clearInterval(interval);
  }, [activeCallSession, callStep]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCallSession && callStep === "ACTIVE") {
      interval = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCallSession, callStep]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsgs = [...chatMessages, { sender: "user" as const, text: chatInput, time: "Now" }];
    setChatMessages(newMsgs);
    setChatInput("");
    setTimeout(() => {
      setChatMessages([
        ...newMsgs,
        {
          sender: "expert" as const,
          text: "Noted.",
          time: "Just now",
        },
      ]);
    }, 1500);
  };

  const handleSimulateCallTechFailure = () => {
    if (!activeCallSession) return;
    triggerServiceRecovery(activeCallSession.id, "TECH_FAILURE");
    onClose();
  };

  const handleSimulateAdvisorNoShow = () => {
    if (!activeCallSession) return;
    triggerServiceRecovery(activeCallSession.id, "NO_SHOW");
    onClose();
  };

  const handleCompleteCallSubmit = () => {
    if (!activeCallSession) return;
    completeCall(activeCallSession.id, rating, feedbackText);
    onClose();
    setFeedbackText("");
  };

  if (!activeCallSession) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[color:var(--t10-navy)] text-white overflow-y-auto flex flex-col justify-between animate-fade-in t10-dark t10-grain">
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Think10 Secure Session (Encrypted)</span>
        </div>
        <div className="flex items-center gap-3">
          {callStep === "ACTIVE" && (
            <span className="rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-xs font-mono font-bold text-red-400">
              REC · {formatDuration(callDuration)}
            </span>
          )}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to exit the call room?")) {
                onClose();
              }
            }}
            className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {callStep === "DEVICE_CHECK" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold">Consultation Room Setup</h3>
            <p className="text-xs text-neutral-400">Confirm camera, microphone levels, and GCC encryption variables before entering.</p>
          </div>
          <div className="relative aspect-video w-full rounded-2xl bg-neutral-900 border border-white/15 flex flex-col items-center justify-center text-center shadow-lg">
            {camActive ? (
              <div className="space-y-1 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--t10-emerald)] text-sm font-bold text-white mx-auto">SK</span>
                <p className="text-xs text-neutral-300 font-medium">Local Video Active</p>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <VideoOff className="h-8 w-8 text-neutral-500 mx-auto" />
                <p className="text-xs text-neutral-500 font-medium">Camera Disabled</p>
              </div>
            )}
            {micActive && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-[10px]">
                <Mic className="h-4 w-4 text-[color:var(--t10-emerald)]" />
                <div className="h-1.5 flex-1 rounded-full bg-neutral-700 overflow-hidden">
                  <div className="h-full bg-[color:var(--t10-emerald)] transition-all" style={{ width: `${audioLevel}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button onClick={() => setMicActive(!micActive)} className={`rounded-full p-3 transition-colors ${micActive ? "bg-white/10 hover:bg-white/20" : "bg-red-500 hover:bg-red-600"}`}>
              {micActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            <button onClick={() => setCamActive(!camActive)} className={`rounded-full p-3 transition-colors ${camActive ? "bg-white/10 hover:bg-white/20" : "bg-red-500 hover:bg-red-600"}`}>
              {camActive ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
          </div>
          <button onClick={() => setCallStep("CONSENT")} className="w-full rounded-lg bg-[color:var(--t10-emerald)] py-2.5 text-xs font-bold text-white hover:bg-[color:var(--t10-green)] transition-all shadow">
            Proceed to Permissions & Consent
          </button>
        </div>
      )}

      {callStep === "CONSENT" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold">Secure Recording Consents</h3>
            <p className="text-xs text-neutral-400">Adhere to UAE regional data protection laws (DIFC/DED standards). Confirm consent settings.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4 w-full">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consentRecord} onChange={(e) => setConsentRecord(e.target.checked)} className="h-4.5 w-4.5 accent-[color:var(--t10-emerald)] mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold">Record Strategy Call</p>
                <p className="text-neutral-400 leading-normal">Saves an encrypted recording inside your personal Command Centre. Shared only with you.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer border-t border-white/10 pt-4">
              <input type="checkbox" checked={consentTranscribe} onChange={(e) => setConsentTranscribe(e.target.checked)} className="h-4.5 w-4.5 accent-[color:var(--t10-emerald)] mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold">Zyne AI Transcription & Action generation</p>
                <p className="text-neutral-400 leading-normal">Permit Zyne VC to audit speech parameters, transcribing recommended action items for your dashboard.</p>
              </div>
            </label>
          </div>
          <button onClick={() => setCallStep("ACTIVE")} className="w-full rounded-lg bg-[color:var(--t10-emerald)] py-2.5 text-xs font-bold text-white hover:bg-[color:var(--t10-green)] transition-all shadow">
            Join Strategy Call Room
          </button>
        </div>
      )}

      {callStep === "ACTIVE" && (
        <div className="flex-1 grid gap-4 p-6 lg:grid-cols-[1.8fr_1fr]">
          <div className="flex flex-col justify-between space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 flex-1">
              <div className="relative rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden flex flex-col items-center justify-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-xl font-bold text-white">{activeCallSession.expertName.substring(0, 2).toUpperCase()}</span>
                <p className="mt-2 text-xs font-bold">{activeCallSession.expertName}</p>
                <p className="text-[10px] text-neutral-400">{activeCallSession.expertRole}</p>
                <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-neutral-300">Advisor Feed (Connected)</span>
              </div>
              <div className="relative rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden flex flex-col items-center justify-center text-center">
                {camActive ? (
                  <div className="space-y-1 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--t10-emerald)] text-xl font-bold text-white mx-auto">SK</span>
                    <p className="text-xs font-semibold text-neutral-200">Sarah (You)</p>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <VideoOff className="h-8 w-8 text-neutral-500 mx-auto" />
                    <p className="text-xs text-neutral-500 font-medium">Camera Off</p>
                  </div>
                )}
                <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-neutral-300">Local Feed</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setMicActive(!micActive)} className={`rounded-full p-2.5 transition-colors ${micActive ? "bg-white/15 hover:bg-white/25" : "bg-red-500 hover:bg-red-600"}`}>
                  {micActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </button>
                <button onClick={() => setCamActive(!camActive)} className={`rounded-full p-2.5 transition-colors ${camActive ? "bg-white/15 hover:bg-white/25" : "bg-red-500 hover:bg-red-600"}`}>
                  {camActive ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </button>
                <button className="rounded-full p-2.5 bg-white/15 hover:bg-white/25 transition-all"><Share2 className="h-4 w-4" /></button>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSimulateCallTechFailure} className="rounded bg-orange-600/30 border border-orange-500/40 px-3 py-1.5 text-[10px] font-bold text-orange-400 hover:bg-orange-500/30 transition-all">Simulate Connection Crash</button>
                <button onClick={handleSimulateAdvisorNoShow} className="rounded bg-red-600/30 border border-red-500/40 px-3 py-1.5 text-[10px] font-bold text-red-400 hover:bg-red-500/30 transition-all">Simulate Advisor No-Show</button>
              </div>
              <button onClick={() => setCallStep("FEEDBACK")} className="rounded-lg bg-[color:var(--t10-emerald)] px-4 py-2 text-xs font-bold text-white hover:bg-[color:var(--t10-green)] transition-all shadow">Finish Session & Generate Report</button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col justify-between h-[420px] lg:h-auto">
            <div className="p-3 border-b border-white/10"><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">Live Session Dialogue</p></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
              {chatMessages.map((msg, mIdx) => (
                <div key={mIdx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-xl px-3 py-2 text-[11px] max-w-[85%] ${msg.sender === "user" ? "bg-[color:var(--t10-emerald)] text-white" : "bg-white/10 text-neutral-200"}`}>{msg.text}</div>
                  <span className="text-[8px] text-neutral-500 mt-0.5">{msg.time}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-white/10 flex gap-1">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type call notes or queries..." className="flex-1 rounded bg-white/10 border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-[color:var(--t10-emerald)]" />
              <button type="submit" className="rounded bg-[color:var(--t10-emerald)] px-3 text-white"><Send className="h-3 w-3" /></button>
            </form>
          </div>
        </div>
      )}

      {callStep === "FEEDBACK" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto space-y-6">
          <div className="text-center space-y-1">
            <CheckCircle className="h-10 w-10 text-[color:var(--t10-emerald)] mx-auto animate-bounce" />
            <h3 className="text-lg font-bold">Session Completed!</h3>
            <p className="text-xs text-neutral-400">Rate your session to unlock meeting recordings and generated action item reports.</p>
          </div>
          <div className="w-full space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-neutral-300">Rate expert strategy</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="p-1 text-yellow-400 hover:scale-110 transition-transform">
                    <Star className={`h-6 w-6 ${rating >= star ? "fill-yellow-400" : "text-neutral-500"}`} />
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-xs">
              <span className="mb-1 block font-semibold text-neutral-300">Feedback Comments</span>
              <textarea rows={3} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} className="w-full rounded bg-white/10 border border-white/10 p-2 text-white outline-none focus:border-[color:var(--t10-emerald)]" />
            </label>
          </div>
          <button onClick={handleCompleteCallSubmit} className="w-full rounded-lg bg-[color:var(--t10-emerald)] py-2.5 text-xs font-bold text-white hover:bg-[color:var(--t10-green)] transition-all shadow">
            Submit Review & Generate Action Plan
          </button>
        </div>
      )}
    </div>
  );
}
