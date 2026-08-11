import { createFileRoute } from "@tanstack/react-router";
import { Video, FileText, Calendar, Clock, Download } from "lucide-react";
import { useAdminState } from "@/context/AdminStateContext";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/admin/recordings")({
  component: AdminRecordings,
});

function AdminRecordings() {
  const { bookings } = useAdminState();

  // Filter bookings that have a recording URL or transcript
  const recordedSessions = bookings.filter(b => b.recordingUrl || b.transcript || (b.status === "COMPLETED" && b.report));

  const downloadMeetingPDF = (booking: any) => {
    if (!booking.report) return;
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(20);
    doc.text(`Think10 Strategy Session Report`, 20, yPos);
    yPos += 15;
    
    doc.setFontSize(14);
    doc.text(`Topic: ${booking.topic}`, 20, yPos);
    yPos += 10;
    doc.text(`Advisor: ${booking.expertName || "Advisor"}`, 20, yPos);
    yPos += 10;
    doc.text(`Client: ${booking.userName || booking.userEmail || "Client"}`, 20, yPos);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[color:var(--t10-navy)]">Recordings & Transcripts</h1>
          <p className="text-neutral-500 text-sm mt-1">Audit all platform sessions, AI generated notes, and video recordings.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-neutral-200">
          {recordedSessions.length === 0 ? (
            <li className="p-12 text-center text-neutral-500">
              <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-neutral-400" />
              </div>
              <p>No recorded sessions found yet.</p>
            </li>
          ) : recordedSessions.map((booking: any) => {
            const dateStr = booking.when ? new Date(booking.when).toDateString() : "TBD";
            const timeStr = booking.when ? new Date(booking.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";

            return (
              <li key={booking.id} className="p-6 transition-colors hover:bg-neutral-50 flex flex-col md:flex-row gap-6">
                <div className="flex items-center md:items-start gap-4 md:w-48 shrink-0">
                  <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-1">
                    <div className="flex flex-col bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-center min-w-[72px]">
                      <span className="text-xs font-bold text-neutral-500 uppercase">{dateStr.substring(4, 7)}</span>
                      <span className="text-xl font-bold text-[color:var(--t10-navy)] leading-none my-0.5">{dateStr.substring(8, 10)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[color:var(--t10-navy)] mt-1">{timeStr}</p>
                      <p className="text-xs text-neutral-500">60 mins</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-[color:var(--t10-navy)] truncate">{booking.topic || "Strategy Session"}</h4>
                    <p className="text-sm text-neutral-500 font-medium mt-1">Advisor: {booking.expertName || "Advisor"} | Client: {booking.userName || booking.userEmail || "Client User"}</p>
                  </div>

                  {booking.recordingUrl && (
                    <div className="rounded-xl overflow-hidden bg-black border border-neutral-800 max-w-lg">
                      <video src={booking.recordingUrl} controls className="w-full h-auto max-h-[300px] object-contain" />
                    </div>
                  )}

                  {booking.transcript && (
                    <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 text-sm font-mono text-neutral-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      <div className="font-bold mb-2 flex items-center gap-2 sticky top-0 bg-neutral-50 pb-2 border-b border-neutral-200">
                        <FileText className="w-4 h-4" /> Transcript
                      </div>
                      {booking.transcript}
                    </div>
                  )}

                  {booking.report ? (
                    <div className="rounded-xl bg-[color:var(--t10-mint)]/40 p-4 border border-emerald-100 space-y-3">
                      <h5 className="font-bold text-[color:var(--t10-navy)] text-sm">Consultant Report Summary</h5>
                      <p className="text-neutral-700 text-sm">{booking.report.summary}</p>
                      <button
                        onClick={() => downloadMeetingPDF(booking)}
                        className="flex items-center gap-2 rounded bg-white border border-emerald-200 px-4 py-2 text-sm font-bold text-[color:var(--t10-emerald)] hover:bg-emerald-50 w-max"
                      >
                        <Download className="h-4 w-4" /> Download PDF Report
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-neutral-100 p-4 border border-neutral-200 text-sm text-neutral-500">
                      The advisor is currently drafting the consultation report.
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
