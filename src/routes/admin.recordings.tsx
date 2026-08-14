import { createFileRoute } from "@tanstack/react-router";
import { useAdminState } from "@/context/AdminStateContext";
import { Video, Download, FileText, Calendar, BookOpen, User, PlayCircle } from "lucide-react";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/admin/recordings")({
  component: AdminRecordingsPage,
});

function AdminRecordingsPage() {
  const { bookings } = useAdminState();
  
  // Filter bookings that have a report or recording
  const recordedSessions = bookings.filter(
    (b: any) => b.report || b.recordingUrl
  );

  const downloadMeetingPDF = (booking: any) => {
    if (!booking.report) {
      alert("The AI Strategy Report (PDF) is not generated yet for this session. The consultant needs to complete their review first.");
      return;
    }
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(20);
    doc.text(`Think10 Strategy Session Report`, 20, yPos);
    yPos += 15;
    
    doc.setFontSize(14);
    doc.text(`Topic: ${booking.topic}`, 20, yPos);
    yPos += 10;
    doc.text(`Consultant: ${booking.expertName || "Advisor"}`, 20, yPos);
    yPos += 10;
    doc.text(`Date: ${booking.when}`, 20, yPos);
    yPos += 15;
    
    doc.setFontSize(16);
    doc.text(`Executive Summary`, 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    const splitSummary = doc.splitTextToSize(booking.report.summary || "", 170);
    doc.text(splitSummary, 20, yPos);
    yPos += (splitSummary.length * 7) + 10;
    
    doc.setFontSize(16);
    doc.text(`Recommendations`, 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    booking.report.recommendations?.forEach((rec: string, idx: number) => {
      const splitRec = doc.splitTextToSize(`${idx + 1}. ${rec}`, 170);
      doc.text(splitRec, 20, yPos);
      yPos += (splitRec.length * 7) + 5;
    });
    yPos += 5;
    
    doc.setFontSize(16);
    doc.text(`Action Items`, 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    booking.report.actionItems?.forEach((act: string, idx: number) => {
      const splitAct = doc.splitTextToSize(`[ ] ${act}`, 170);
      doc.text(splitAct, 20, yPos);
      yPos += (splitAct.length * 7) + 5;
    });
    
    doc.save(`Think10_Report_${booking.id}.pdf`);
  };

  // downloadTranscript removed: using Nylas media API directly now

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <Video className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            Platform Recordings Archive
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Access all HD video recordings, AI-generated reports, and transcripts across all platform consultations.</p>
        </div>
      </div>

      {recordedSessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Video className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-neutral-900">No Recordings Found</h3>
          <p className="mt-2 text-sm text-neutral-500 max-w-md mx-auto">
            Once a strategy session is completed, its recording and AI transcript will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recordedSessions.map((session: any) => (
            <div key={session.id} className="rounded-2xl border border-[color:var(--t10-border)] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              
              {/* Video Thumbnail Area */}
              <div className="relative aspect-video bg-neutral-900 flex items-center justify-center border-b border-[color:var(--t10-border)]">
                {session.recordingUrl ? (
                  <video 
                    src={`/api/nylas-media/${session.id}`} 
                    controls 
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 text-neutral-500">
                    <Video className="h-8 w-8 opacity-50" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Audio / Report Only</span>
                  </div>
                )}
                
                {/* Overlay Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="rounded bg-black/60 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {session.when}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4 border-b border-neutral-100 pb-3">
                  <h3 className="font-bold text-[color:var(--t10-navy)] line-clamp-1" title={session.topic}>{session.topic}</h3>
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs text-[color:var(--t10-grey)] flex items-center gap-1.5">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-blue-100 text-[8px] font-bold text-blue-700 shrink-0">
                        {(session.expertName || session.consultantName || "Advisor").split(" ").map((s: string) => s[0]).join("")}
                      </span>
                      <span className="font-semibold text-neutral-600">Advisor:</span> {session.expertName || session.consultantName || "Think10 Advisor"}
                    </p>
                    {session.userName && (
                      <p className="text-xs text-[color:var(--t10-grey)] flex items-center gap-1.5">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-[8px] font-bold text-emerald-700 shrink-0">
                          {session.userName.split(" ").map((s: string) => s[0]).join("")}
                        </span>
                        <span className="font-semibold text-neutral-600">Client:</span> {session.userName}
                      </p>
                    )}
                  </div>
                </div>

                {/* AI Summary Snippet */}
                {session.report?.summary && (
                  <div className="rounded-lg bg-[color:var(--t10-offwhite)] p-3 mb-4 flex-1">
                    <p className="text-[10px] font-bold text-[color:var(--t10-grey)] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Executive Summary
                    </p>
                    <p className="text-xs text-[color:var(--t10-navy)] line-clamp-3 leading-relaxed">
                      {session.report.summary}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  {session.recordingUrl && (
                    <a
                      href={`/api/nylas-media/${session.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--t10-emerald)]/10 px-3 py-2 text-[11px] font-bold text-[color:var(--t10-emerald)] hover:bg-[color:var(--t10-emerald)]/20 transition-colors"
                    >
                      <PlayCircle className="h-4 w-4" /> Open Full Video
                    </a>
                  )}
                  
                  {session.report ? (
                    <button
                      onClick={() => downloadMeetingPDF(session)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-[color:var(--t10-border)] bg-white px-2 py-2 text-[11px] font-bold text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-lightgrey)] transition-colors"
                      title="Download Report (PDF)"
                    >
                      <Download className="h-3.5 w-3.5" /> Report PDF
                    </button>
                  ) : (
                    <button
                      onClick={() => downloadMeetingPDF(session)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-[color:var(--t10-border)] bg-neutral-50 px-2 py-2 text-[11px] font-bold text-neutral-400 hover:bg-neutral-100 transition-colors"
                      title="Report Not Ready"
                    >
                      <Download className="h-3.5 w-3.5" /> Report PDF
                    </button>
                  )}
                  
                  <a
                    href={`/api/nylas-media/${session.id}?type=transcript`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-[color:var(--t10-border)] bg-white px-2 py-2 text-[11px] font-bold text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-lightgrey)] transition-colors"
                    title="Download Transcript (TXT/JSON)"
                  >
                    <FileText className="h-3.5 w-3.5" /> Transcript
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
