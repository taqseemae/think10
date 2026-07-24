"use client";

import { useAdminState } from "@/context/AdminStateContext";
import { CalendarCheck, Search, Filter, MoreHorizontal, Video, Clock } from "lucide-react";


function BookingsAdminPage() {
  const { bookings } = useAdminState();

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
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No bookings found in the system.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
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
                      <button className="text-neutral-400 hover:text-neutral-900 transition-colors p-1">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BookingsAdminPage;
