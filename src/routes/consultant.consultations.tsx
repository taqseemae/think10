import { createFileRoute } from "@tanstack/react-router";
import { Mic, Video, MonitorUp, PhoneOff, FileText, Settings, Loader2, RefreshCw } from "lucide-react";
import { useDashboardState } from "@/context/DashboardStateContext";
import { useConsultantState } from "@/context/ConsultantStateContext";
import { useState, useEffect } from "react";
import { fetchNylasDataFn, callBotNowFn } from "@/lib/server-actions";

export const Route = createFileRoute("/consultant/consultations")({
  component: ConsultantConsultations,
});

function ConsultantConsultations() {
  const { bookings, refreshData } = useConsultantState();
  const { completeCall } = useDashboardState();
  const [activeTab, setActiveTab] = useState<"Brief" | "Notes" | "Action Plan">("Brief");
  const [notes, setNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isCallingBot, setIsCallingBot] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Pick selected session, or default to most recent CONFIRMED, or first booking
  const selectedBooking = bookings.find(b => b.id === selectedSessionId);
  const activeSession = selectedBooking || [...bookings]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .find(b => b.status === "CONFIRMED") || bookings[0];

  // Auto-poll every 8s when a session is active so botStatus banner updates automatically
  useEffect(() => {
    if (!activeSession || activeSession.status === "COMPLETED") return;
    const interval = setInterval(() => {
      refreshData();
    }, 8000);
    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.status]);

  const handleJoinMeeting = async () => {
    if (!activeSession?.meetLink) {
      alert("❌ No meeting link found on this booking! Please make sure a Zoom link is set.");
      return;
    }
    window.open(activeSession.meetLink, "_blank");
  };

  const handleFetchNylasData = async () => {
    if (!activeSession?.nylasBotId) {
      alert("Bot is scheduled but hasn't joined yet, or Bot ID is missing.");
      return;
    }
    setIsFetchingData(true);
    try {
      const data = await fetchNylasDataFn({ data: { bookingId: activeSession.id, botId: activeSession.nylasBotId } });
      if (data) {
        alert(`Nylas Bot Status: ${data.status}\nMedia: ${data.media?.recording_url ? 'Ready' : 'Not Ready'}\nTranscript: ${data.media?.transcript_url ? 'Ready' : 'Not Ready'}`);
        refreshData();
      } else {
        alert("Failed to fetch Nylas data.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleCallBotNow = async () => {
    if (!activeSession?.meetLink) {
      alert("No meeting link available to call the bot into.");
      return;
    }
    setIsCallingBot(true);
    try {
      await callBotNowFn({ data: { bookingId: activeSession.id, meetLink: activeSession.meetLink } });
      alert("AI Notetaker has been called! It should join the meeting shortly.");
      refreshData();
    } catch (e) {
      console.error(e);
      alert("Failed to call AI Notetaker.");
    } finally {
      setIsCallingBot(false);
    }
  };

  const handleDraftReport = async () => {
    if (!activeSession) return;
    setIsGenerating(true);
    try {
      let finalLink = activeSession.recordingUrl || "";
      let fullTranscript = notes;

      if (activeSession.nylasBotId) {
        const data = await fetchNylasDataFn({ data: { bookingId: activeSession.id, botId: activeSession.nylasBotId } });
        if (data?.media?.recording_url) finalLink = data.media.recording_url;
        if (data?.media?.transcript_url) {
           let transcriptContent = data.media.summary || data.media.transcript_url;
           fullTranscript = `Consultant Notes:\n${notes}\n\nAutomated Transcript/Summary:\n${transcriptContent}`;
        }
      }

      await completeCall(activeSession.id, 5, "Consultant feedback", fullTranscript, activeSession.topic, finalLink);
      refreshData();
      alert("Report Drafted successfully! The client can now view and download the PDF.");
    } catch(e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeSession) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-neutral-500">
        No active consultations found.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Top Banner & Session Selector */}
      <div className="bg-neutral-900 rounded-xl p-4 flex flex-wrap justify-between items-center text-white shrink-0 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{activeSession.topic || "Strategy Session"}</h2>
            {bookings.length > 1 && (
              <select
                value={activeSession.id}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="bg-neutral-800 text-xs font-semibold text-white border border-neutral-700 rounded px-2.5 py-1 outline-none cursor-pointer"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.topic || "Session"} ({b.status})
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-neutral-400 text-sm flex items-center gap-2 mt-1">
            {activeSession.status === "COMPLETED" ? (
              <span className="text-emerald-400 font-semibold">✓ Completed Session Record</span>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Session is Active
              </>
            )}
          </p>
        </div>
        {activeSession.status !== "COMPLETED" && (
          <div className="text-right">
            <p className="font-mono text-xl font-bold">60:00</p>
            <p className="text-xs text-neutral-400">Allocated</p>
          </div>
        )}
      </div>

      {/* Bot Status Banners */}
      {(activeSession.botStatus === "in_waiting_room" || activeSession.botStatus === "waiting_for_entry" || activeSession.botStatus === "waiting") && activeSession.meetLink && (
        <div className="bg-orange-500 text-white rounded-xl p-4 flex items-center justify-between shrink-0 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-bold text-sm">AI Notetaker is connecting to the Zoom meeting!</p>
              <p className="text-xs text-orange-100">Please join your Zoom call to let the session begin.</p>
            </div>
          </div>
          <button
            onClick={() => window.open(activeSession.meetLink, "_blank")}
            className="bg-white text-orange-600 font-bold text-xs px-4 py-2 rounded-lg hover:bg-orange-50 transition shrink-0"
          >
            Open Zoom Call →
          </button>
        </div>
      )}

      {(activeSession.botStatus === "connecting" || activeSession.botStatus === "dispatched") && (
        <div className="bg-blue-600 text-white rounded-xl px-4 py-3 flex items-center justify-between shrink-0 text-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-semibold">AI Notetaker is connecting to Zoom...</span>
          </div>
          {activeSession.meetLink && (
            <button
              onClick={() => window.open(activeSession.meetLink, "_blank")}
              className="bg-white text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-50 transition shrink-0"
            >
              Join Zoom Call Now →
            </button>
          )}
        </div>
      )}

      {(activeSession.botStatus === "in_call" || activeSession.botStatus === "attending" || activeSession.botStatus === "recording_active") && (
        <div className="bg-emerald-600 text-white rounded-xl px-4 py-2 flex items-center gap-2 shrink-0 text-sm">
          <span>🎙️</span>
          <span className="font-semibold">AI Notetaker is recording this Zoom session.</span>
        </div>
      )}

      {(activeSession.botStatus === "failed_entry" || activeSession.botStatus === "kicked") && (
        <div className="bg-rose-600 text-white rounded-xl px-4 py-3 flex items-center justify-between shrink-0 text-sm">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>AI Notetaker could not enter the Zoom room. Click "Call Bot Now" to retry.</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        
        {/* Main Video & Media Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 bg-neutral-100 rounded-xl border border-neutral-200 overflow-hidden relative group flex flex-col items-center justify-center p-6 text-center">
            {activeSession.status === "COMPLETED" ? (
               <div className="w-full h-full flex flex-col justify-between space-y-4">
                 {activeSession.recordingUrl ? (
                   <div className="flex-1 rounded-xl overflow-hidden bg-black relative flex items-center justify-center">
                     <video src={activeSession.recordingUrl} controls className="w-full h-full max-h-[360px] object-contain" />
                   </div>
                 ) : (
                   <div className="flex-1 text-neutral-500 flex flex-col items-center justify-center bg-white rounded-xl border border-neutral-200">
                     <Video className="w-12 h-12 mb-3 text-neutral-400" />
                     <p className="font-semibold text-neutral-700">Completed Session Record</p>
                     <p className="text-xs text-neutral-400 mt-1">Recording is being processed or available in report.</p>
                   </div>
                 )}

                 {/* Download Bar for Completed Session */}
                 <div className="bg-white border border-neutral-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                   <div className="flex items-center gap-2 font-bold text-neutral-800">
                     <FileText className="w-4 h-4 text-emerald-600" />
                     <span>Session Artifacts & Downloads</span>
                   </div>
                   <div className="flex gap-2">
                     {activeSession.recordingUrl && (
                       <a
                         href={activeSession.recordingUrl}
                         target="_blank"
                         rel="noreferrer"
                         className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-1"
                       >
                         Download MP4 Video
                       </a>
                     )}
                     <button
                       onClick={() => {
                         const text = activeSession.transcript || activeSession.report?.summary || "No transcript content available.";
                         const blob = new Blob([`Think10 Strategy Consultation Transcript\nTopic: ${activeSession.topic}\nDate: ${activeSession.when}\n\n${text}`], { type: "text/plain;charset=utf-8" });
                         const url = URL.createObjectURL(blob);
                         const a = document.createElement("a");
                         a.href = url;
                         a.download = `Think10_Transcript_${activeSession.id}.txt`;
                         document.body.appendChild(a);
                         a.click();
                         document.body.removeChild(a);
                         URL.revokeObjectURL(url);
                       }}
                       className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg font-bold hover:bg-neutral-800 transition flex items-center gap-1"
                     >
                       Download TXT Transcript
                     </button>
                   </div>
                 </div>
               </div>
            ) : (
                 <div className="max-w-md">
                 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Video className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-neutral-900 mb-2">Ready to join your session?</h3>
                 <p className="text-neutral-500 mb-4">
                   You are using Zoom Meeting for this consultation. Click the button below to join the meeting.
                 </p>
                 <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg mb-8 flex items-start gap-2 text-left">
                   <div className="mt-0.5">ℹ️</div>
                   <div>The <strong>Think10Bot</strong> will automatically join the Zoom meeting.</div>
                 </div>
                 {activeSession.meetLink ? (
                   <button 
                     onClick={handleJoinMeeting}
                     className="inline-flex items-center gap-2 bg-[color:var(--t10-emerald)] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                   >
                     <Video className="w-5 h-5" />
                     Join Zoom Meeting
                   </button>
                 ) : (
                   <p className="text-red-500 font-medium">No meeting link provided.</p>
                 )}
               </div>
            )}
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm min-h-0 overflow-hidden shrink-0">
          
          {/* Panel Tabs */}
          <div className="flex border-b border-neutral-200 shrink-0">
            <button 
              onClick={() => setActiveTab("Brief")}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === "Brief" ? "border-[color:var(--t10-emerald)] text-[color:var(--t10-emerald)]" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}>
              Brief
            </button>
            <button 
              onClick={() => setActiveTab("Notes")}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === "Notes" ? "border-[color:var(--t10-emerald)] text-[color:var(--t10-emerald)]" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}>
              Notes & AI
            </button>
            <button 
              onClick={() => setActiveTab("Action Plan")}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === "Action Plan" ? "border-[color:var(--t10-emerald)] text-[color:var(--t10-emerald)]" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}>
              Action Plan
            </button>
          </div>

          {/* Panel Content (Brief Tab) */}
          <div className="flex-1 p-5 overflow-y-auto">
            {activeTab === "Brief" && (
              <>
                <h3 className="font-bold text-neutral-900 mb-4">Customer Context</h3>
                <div className="space-y-6 text-sm">
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Topic</h4>
                    <p className="text-neutral-800">{activeSession.topic}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Challenge</h4>
                    <p className="text-neutral-800">{activeSession.preCallAnswers?.challenge || "Not provided"}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Provided Documents</h4>
                    {activeSession.preCallFiles?.length ? (
                      activeSession.preCallFiles.map((file: string, i: number) => (
                        <div key={i} className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-neutral-400" />
                            <div>
                              <p className="font-medium text-neutral-900 text-xs">{file}</p>
                              <p className="text-[10px] text-neutral-500">Permitted view</p>
                            </div>
                          </div>
                          <button className="text-xs font-medium text-[color:var(--t10-emerald)]">View</button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-400">No documents provided</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Notes" && (
              <div className="flex flex-col h-full">
                <h3 className="font-bold text-neutral-900 mb-2">Consultant Notes</h3>
                <p className="text-xs text-neutral-500 mb-4">These notes will be used by Gemini AI to draft the final report and action plan.</p>
                <textarea 
                  className="flex-1 w-full border border-neutral-200 rounded-lg p-3 text-sm outline-none focus:border-[color:var(--t10-emerald)] resize-none mb-4"
                  placeholder="Take notes during the call..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
                <h3 className="font-bold text-neutral-900 mb-2">Automated Recording</h3>
                <p className="text-xs text-neutral-500 mb-4">
                  The AI Notetaker automatically joins at the scheduled time. If you started early, use the button below to call it now.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCallBotNow}
                    disabled={isCallingBot}
                    className="flex-1 bg-[color:var(--t10-emerald)] text-white hover:bg-[color:var(--t10-green)] rounded-lg p-3 text-sm font-medium flex justify-center items-center gap-2 transition-colors"
                  >
                    {isCallingBot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                    Call Bot Now
                  </button>
                  {activeSession.nylasBotId && (
                    <button
                      onClick={handleFetchNylasData}
                      disabled={isFetchingData}
                      className="flex-1 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 rounded-lg p-3 text-sm font-medium flex justify-center items-center gap-2 transition-colors"
                    >
                      {isFetchingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Check Status
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Action Plan" && (
              <div>
                <h3 className="font-bold text-neutral-900 mb-4">AI Suggested Actions</h3>
                <p className="text-xs text-neutral-500 mb-4">These will be generated automatically when you draft the post-call report.</p>
                <div className="p-4 border border-dashed border-neutral-300 rounded-lg text-center text-neutral-400 text-sm">
                  Waiting for session completion...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-neutral-200 shrink-0">
            <button 
              onClick={handleDraftReport}
              disabled={isGenerating || !notes}
              className="w-full bg-neutral-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Draft Post-Call Report"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
