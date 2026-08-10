import { createFileRoute } from "@tanstack/react-router";
import { Mic, Video, MonitorUp, PhoneOff, FileText, Settings, Loader2 } from "lucide-react";
import { useDashboardState } from "@/context/DashboardStateContext";
import { useConsultantState } from "@/context/ConsultantStateContext";
import { useState } from "react";

export const Route = createFileRoute("/consultant/consultations")({
  component: ConsultantConsultations,
});

function ConsultantConsultations() {
  const { bookings, refreshData } = useConsultantState();
  const { completeCall } = useDashboardState();
  const [activeTab, setActiveTab] = useState<"Brief" | "Notes" | "Action Plan">("Brief");
  const [notes, setNotes] = useState("");
  const [recordingFile, setRecordingFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // For demo, just grab the first CONFIRMED booking, or the first booking if none are confirmed
  const activeSession = bookings.find(b => b.status === "CONFIRMED") || bookings[0];

  const handleDraftReport = async () => {
    if (!activeSession) return;
    setIsGenerating(true);
    try {
      let finalLink = "";
      if (recordingFile) {
        const formData = new FormData();
        formData.append("video", recordingFile);
        
        // Ensure this goes to the correct backend port
        const res = await fetch("http://localhost:5000/api/upload-video", {
          method: "POST",
          body: formData
        });
        
        if (res.ok) {
          const data = await res.json();
          finalLink = data.url;
        } else {
          alert("Failed to upload the video. The report will be drafted without it.");
        }
      }

      await completeCall(activeSession.id, 5, "Consultant feedback", notes, activeSession.topic, finalLink);
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
      {/* Top Banner */}
      <div className="bg-neutral-900 rounded-xl p-4 flex justify-between items-center text-white shrink-0">
        <div>
          <h2 className="text-lg font-bold">{activeSession.topic || "Strategy Session"}</h2>
          <p className="text-neutral-400 text-sm flex items-center gap-2 mt-1">
            {activeSession.status === "COMPLETED" ? (
              <>Session Completed</>
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

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 bg-neutral-100 rounded-xl border border-neutral-200 overflow-hidden relative group flex flex-col items-center justify-center p-8 text-center">
            {activeSession.status === "COMPLETED" ? (
               activeSession.recordingUrl ? (
                 <video src={activeSession.recordingUrl} controls className="w-full h-full object-contain bg-black" />
               ) : (
                 <div className="text-neutral-500 flex flex-col items-center">
                   <Video className="w-12 h-12 mb-4 opacity-50" />
                   <p>No recording available for this session.</p>
                 </div>
               )
            ) : (
               <div className="max-w-md">
                 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Video className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-neutral-900 mb-2">Ready to join your session?</h3>
                 <p className="text-neutral-500 mb-8">
                   You are using Google Meet for this consultation. Click the button below to join the meeting.
                 </p>
                 {activeSession.meetLink ? (
                   <a 
                     href={activeSession.meetLink}
                     target="_blank"
                     rel="noreferrer"
                     className="inline-flex items-center gap-2 bg-[color:var(--t10-emerald)] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                   >
                     <Video className="w-5 h-5" /> Join Google Meet
                   </a>
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
                <h3 className="font-bold text-neutral-900 mb-2">Meeting Recording (MP4)</h3>
                <p className="text-xs text-neutral-500 mb-2">Upload the recorded MP4 file of the session here.</p>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  className="w-full border border-neutral-200 rounded-lg p-3 text-sm outline-none focus:border-[color:var(--t10-emerald)]"
                  onChange={(e) => setRecordingFile(e.target.files?.[0] || null)}
                />
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
