import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Filter, Clock, Users, ArrowUpRight, CheckCircle2, XCircle, Video, FileText, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { useConsultantState } from "@/context/ConsultantStateContext";
import { useState } from "react";
import { GenericCallModal } from "@/components/GenericCallModal";
import { RescheduleModal } from "@/components/RescheduleModal";

export const Route = createFileRoute("/consultant/bookings")({
  component: ConsultantBookings,
});

function ConsultantBookings() {
  const { bookings, updateBookingStatus, cancelBooking, rescheduleBooking } = useConsultantState();
  const [activeCallSession, setActiveCallSession] = useState<any | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<any | null>(null);

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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Bookings & Availability</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your schedule, incoming requests, and upcoming sessions.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          <a href="#" className="border-[color:var(--t10-emerald)] text-[color:var(--t10-emerald)] whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
            All Sessions ({bookings.length})
          </a>
        </nav>
      </div>

      {/* Booking List */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-neutral-200">
          
          {bookings.length === 0 ? (
            <li className="p-12 text-center text-neutral-500">
              <p>No bookings found.</p>
            </li>
          ) : bookings.map((booking: any) => {
            const dateStr = booking.when ? new Date(booking.when).toDateString() : "TBD";
            const timeStr = booking.when ? new Date(booking.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";

            return (
              <li key={booking.id} className="p-6 transition-colors hover:bg-neutral-50">
                <div className="flex flex-col sm:flex-row gap-6">
                  
                  {/* Date/Time Column */}
                  <div className="flex items-center sm:items-start gap-4 sm:w-48 shrink-0">
                    <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-1">
                      <div className="flex flex-col bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-center min-w-[72px]">
                        <span className="text-xs font-bold text-neutral-500 uppercase">{dateStr.substring(4, 7)}</span>
                        <span className="text-xl font-bold text-neutral-900 leading-none my-0.5">{dateStr.substring(8, 10)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 mt-1">{timeStr}</p>
                        <p className="text-xs text-neutral-500">60 mins</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' : 'bg-neutral-100 text-neutral-600'}`}>
                        {booking.status}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">#{(booking.id || "").toString().slice(-6).toUpperCase()}</span>
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900 truncate">{booking.topic || "Strategy Session"}</h4>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <p className="flex items-center text-neutral-500 font-medium">
                        <Users className="w-4 h-4 mr-2 text-neutral-400" />
                        {booking.userName || booking.userEmail || "Client User"}
                      </p>
                      <p className="flex items-center text-neutral-500">
                        <Clock className="w-4 h-4 mr-2 text-neutral-400" />
                        Client timezone: GST
                      </p>
                    </div>
                    {booking.meetLink && (
                      <div className="mt-2 flex gap-4">
                        <a
                          href={booking.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-[color:var(--t10-emerald)] hover:underline flex items-center gap-1"
                        >
                          <Video className="w-4 h-4" /> Join Google Meet
                        </a>
                        <Link
                          to="/consultant/consultations"
                          className="text-sm font-medium text-[color:var(--t10-navy)] hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" /> Take Notes & Draft Report
                        </Link>
                      </div>
                    )}
                    
                    {booking.status === "COMPLETED" && booking.report && (
                      <div className="mt-4 p-4 border border-neutral-200 rounded-lg bg-neutral-50 text-sm">
                        <h5 className="font-bold text-neutral-900 mb-2">AI Session Report</h5>
                        <p className="text-neutral-700 mb-4">{booking.report.summary}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadMeetingPDF(booking)}
                            className="flex items-center gap-2 rounded bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300"
                          >
                            <Download className="h-4 w-4" /> Export Report (.pdf)
                          </button>
                          {booking.recordingUrl && (
                            <a
                              href={booking.recordingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded bg-[color:var(--t10-navy)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                            >
                              <Video className="h-4 w-4" /> Play Recording
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-center sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 border-neutral-100 pt-4 sm:pt-0">
                    {booking.status === "CONFIRMED" && (
                      <>
                        <button 
                          onClick={() => setRescheduleTarget(booking)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-medium text-[color:var(--t10-emerald)] hover:bg-emerald-100 transition-colors">
                          Reschedule
                        </button>
                        <button 
                          onClick={() => cancelBooking(booking.id)}
                          className="w-full sm:w-auto px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors">
                          Cancel Session
                        </button>
                      </>
                    )}
                    {booking.status !== "COMPLETED" && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, "COMPLETED")}
                        className="w-full sm:w-auto px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-[color:var(--t10-emerald)] hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1">
                        Mark Completed <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                </div>
              </li>
            );
          })}
          
        </ul>
        
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-center">
          <button className="text-sm font-medium text-[color:var(--t10-navy)] hover:underline">
            Load More Bookings
          </button>
        </div>
      </div>

      {rescheduleTarget && (
        <RescheduleModal
          bookingId={rescheduleTarget.id}
          expertSlug={rescheduleTarget.expertSlug || rescheduleTarget.consultantId || "consultant"}
          expertName={rescheduleTarget.expertName || "Advisor"}
          onClose={() => setRescheduleTarget(null)}
          onRescheduleConfirm={(id, newSlot) => {
            const newEnd = new Date(new Date(newSlot).getTime() + 60 * 60 * 1000).toISOString();
            rescheduleBooking(id, newSlot, newEnd);
          }}
        />
      )}

      {activeCallSession && (
        <GenericCallModal
          expertName="Client User" // In consultant view, the other person is the client
          expertRole="Client"
          topic={activeCallSession.topic || "Strategy Session"}
          onClose={() => setActiveCallSession(null)}
          onComplete={(rating, feedback) => {
             updateBookingStatus(activeCallSession.id, "COMPLETED");
             setActiveCallSession(null);
          }}
        />
      )}
    </div>
  );
}
