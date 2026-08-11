import { createFileRoute } from "@tanstack/react-router";
import { useAdminState } from "@/context/AdminStateContext";
import { CalendarCheck, Search, Filter, MoreHorizontal, Video, Clock, CheckCircle, Ban, Trash2, Download, X, BookOpen, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { useState } from "react";
import { GenericCallModal } from "@/components/GenericCallModal";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsAdminPage,
});

function BookingsAdminPage() {
  const { bookings, updateBookingStatus, cancelBooking, deleteBooking, deleteMultipleBookings } = useAdminState();
  const [activeCallSession, setActiveCallSession] = useState<any | null>(null);
  const [selectedReportBooking, setSelectedReportBooking] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === bookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bookings.map((b: any) => b.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Permanently delete ${selectedIds.length} selected booking record(s)?`)) {
      await deleteMultipleBookings(selectedIds);
      setSelectedIds([]);
    }
  };

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
    doc.text(`Expert: ${booking.expertName || "Advisor"}`, 20, yPos);
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            Bookings & Delivery
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Monitor upcoming advisory sessions, manage expert schedules, and review delivery quality.</p>
        </div>
        
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow"
            >
              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.length})
            </button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search sessions..." 
              className="w-64 pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[color:var(--t10-emerald)] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === bookings.length && bookings.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-neutral-300 text-[color:var(--t10-emerald)] focus:ring-[color:var(--t10-emerald)] h-4 w-4"
                  />
                </th>
                <th className="px-6 py-4">Session Details</th>
                <th className="px-6 py-4">Expert / Advisor</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No bookings found in the system.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const isSelected = selectedIds.includes(booking.id);
                  return (
                    <tr key={booking.id} className={`transition-colors ${isSelected ? "bg-red-50/40" : "hover:bg-neutral-50"}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(booking.id)}
                          className="rounded border-neutral-300 text-[color:var(--t10-emerald)] focus:ring-[color:var(--t10-emerald)] h-4 w-4"
                        />
                      </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{booking.topic || "General Advisory"}</div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                        <Video className="h-3 w-3" /> {booking.sessionType || "Video Call"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{booking.expertName}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{booking.expertRole}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-700 font-medium">
                        <Clock className="h-4 w-4 text-[color:var(--t10-emerald)]" />
                        {booking.when}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'CONFIRMED' ? 'bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]' :
                        booking.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600' :
                        booking.status === 'CANCELLED' ? 'bg-neutral-100 text-neutral-500' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => setActiveCallSession(booking)}
                            className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          >
                            <Video className="w-3 h-3" /> Audit Call
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm("Permanently delete this booking record from database?")) {
                              deleteBooking(booking.id || (booking as any)._id);
                            }
                          }}
                          className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-neutral-400 hover:text-neutral-900 transition-colors p-1">
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {booking.status !== "COMPLETED" && (
                              <DropdownMenuItem
                                onClick={() => updateBookingStatus(booking.id, "COMPLETED")}
                                className="cursor-pointer text-[color:var(--t10-emerald)] font-medium flex items-center"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Completed
                              </DropdownMenuItem>
                            )}
                            {booking.status === "COMPLETED" && (booking.report || booking.recordingUrl) && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => setSelectedReportBooking(booking)}
                                  className="cursor-pointer text-[color:var(--t10-navy)] font-medium flex items-center"
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Report & Recording
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => downloadMeetingPDF(booking)}
                                  className="cursor-pointer text-blue-600 font-medium flex items-center"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Report PDF
                                </DropdownMenuItem>
                              </>
                            )}
                            {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to cancel this booking?")) {
                                    cancelBooking(booking.id);
                                  }
                                }}
                                className="cursor-pointer text-amber-600 font-medium flex items-center"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Cancel Session
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeCallSession && (
        <GenericCallModal
          expertName={activeCallSession.expertName || "Expert"}
          expertRole={activeCallSession.expertRole || "Advisor"}
          topic={activeCallSession.topic || "Strategy Session"}
          onClose={() => setActiveCallSession(null)}
        />
      )}

      {/* STRATEGY CONSULTATION REPORT DIALOG */}
      {selectedReportBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-xl w-full rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[color:var(--t10-emerald)] uppercase tracking-wider">
                  Advisor Consultation Report
                </span>
                <h3 className="text-base font-bold text-[color:var(--t10-navy)]">
                  Meeting Recap: {selectedReportBooking.expertName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportBooking(null)}
                className="rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedReportBooking.report && (
              <div className="space-y-4 text-xs">
                {/* Summary */}
                <div className="space-y-1">
                  <span className="font-bold text-[color:var(--t10-grey)] uppercase tracking-wider text-[10px]">
                    Executive Summary
                  </span>
                  <p className="text-[color:var(--t10-navy)] leading-relaxed font-medium bg-[color:var(--t10-offwhite)] rounded-lg p-3">
                    {selectedReportBooking.report.summary}
                  </p>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <span className="font-bold text-[color:var(--t10-grey)] uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-[color:var(--t10-emerald)]" /> Advisor Strategic Guidance
                  </span>
                  <ul className="space-y-1.5 pl-1.5">
                    {selectedReportBooking.report.recommendations.map((rec: string, rIdx: number) => (
                      <li key={rIdx} className="flex items-start gap-1.5 leading-relaxed text-[color:var(--t10-navy)]">
                        <span className="text-[color:var(--t10-emerald)] font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div className="space-y-2 rounded-xl bg-[color:var(--t10-mint)]/40 p-4 border border-emerald-100">
                  <span className="font-bold text-[color:var(--t10-navy)] uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-[color:var(--t10-emerald)]" /> Action Plan Tasks Generated
                  </span>
                  <ul className="space-y-1.5">
                    {selectedReportBooking.report.actionItems.map((act: string, aIdx: number) => (
                      <li key={aIdx} className="flex items-start gap-1.5 text-[color:var(--t10-navy)]">
                        <span className="text-[color:var(--t10-emerald)] font-bold mt-0.5">✓</span>
                        <span>{act} (Added directly to Action Plans)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Media options */}
                {selectedReportBooking.recordingUrl && (
                  <div className="mt-4 border-t border-[color:var(--t10-border)] pt-4 space-y-3">
                    <span className="font-bold text-[color:var(--t10-navy)] uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Video className="h-4 w-4 text-[color:var(--t10-emerald)]" /> Session Recording
                    </span>
                    <div className="rounded-xl overflow-hidden bg-black border border-neutral-800">
                      <video 
                        src={selectedReportBooking.recordingUrl} 
                        controls 
                        className="w-full h-auto max-h-[300px] object-contain"
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-4 border-t border-[color:var(--t10-border)] pt-4 text-xs font-semibold text-[color:var(--t10-navy)]">
                  <button onClick={() => downloadMeetingPDF(selectedReportBooking)} className="flex items-center gap-2 rounded bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300 w-full justify-center">
                    <Download className="h-4 w-4" /> Export Report Details (.pdf)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
