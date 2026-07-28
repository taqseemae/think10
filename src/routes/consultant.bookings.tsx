import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Filter, Clock, Users, ArrowUpRight, CheckCircle2, XCircle, Video } from "lucide-react";
import { useConsultantState } from "@/context/ConsultantStateContext";
import { useState } from "react";
import { GenericCallModal } from "@/components/GenericCallModal";

export const Route = createFileRoute("/consultant/bookings")({
  component: ConsultantBookings,
});

function ConsultantBookings() {
  const { bookings, updateBookingStatus, cancelBooking } = useConsultantState();
  const [activeCallSession, setActiveCallSession] = useState<any | null>(null);
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
          <button className="flex-1 sm:flex-none px-4 py-2 bg-[color:var(--t10-emerald)] text-white rounded-lg text-sm font-medium hover:bg-[color:var(--t10-emerald)]/90 transition-colors">
            Set Availability
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          <a href="#" className="border-[color:var(--t10-emerald)] text-[color:var(--t10-emerald)] whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
            Upcoming (12)
          </a>
          <a href="#" className="border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
            Requests (2)
          </a>
          <a href="#" className="border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
            Past & Completed
          </a>
          <a href="#" className="border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">
            Cancellations
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
              <li key={booking.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex flex-col sm:flex-row gap-6">
                  
                  {/* Date/Time Column */}
                  <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-1 sm:w-48 shrink-0">
                    <div className="flex flex-col bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-center min-w-[72px]">
                      <span className="text-xs font-bold text-neutral-500 uppercase">{dateStr.substring(4, 7)}</span>
                      <span className="text-xl font-bold text-neutral-900 leading-none my-0.5">{dateStr.substring(8, 10)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 mt-1">{timeStr}</p>
                      <p className="text-xs text-neutral-500">60 mins</p>
                    </div>
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' : 'bg-neutral-100 text-neutral-600'}`}>
                        {booking.status}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">#{booking.id.substring(booking.id.length - 6).toUpperCase()}</span>
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900 truncate">{booking.topic || "Strategy Session"}</h4>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <p className="flex items-center text-neutral-500">
                        <Users className="w-4 h-4 mr-2 text-neutral-400" />
                        Client User
                      </p>
                      <p className="flex items-center text-neutral-500">
                        <Clock className="w-4 h-4 mr-2 text-neutral-400" />
                        Client timezone: GST
                      </p>
                    </div>
                    {booking.meetLink && (
                      <div className="mt-2">
                        <button
                          onClick={() => setActiveCallSession(booking)}
                          className="text-sm font-medium text-[color:var(--t10-emerald)] hover:underline flex items-center gap-1"
                        >
                          <Video className="w-4 h-4" /> Join Secure Session
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-center sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 border-neutral-100 pt-4 sm:pt-0">
                    {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                      <button 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to cancel this booking?")) {
                            cancelBooking(booking.id);
                          }
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-red-600 hover:bg-neutral-50 transition-colors">
                        Cancel Session
                      </button>
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
