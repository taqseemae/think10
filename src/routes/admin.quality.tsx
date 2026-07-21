import { createFileRoute } from "@tanstack/react-router";
import { useAdminState } from "@/context/AdminStateContext";
import { ShieldAlert, Search, Filter, MessageSquare, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/quality")({
  component: QualityAdminPage,
});

function QualityAdminPage() {
  const { tickets } = useAdminState();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            Quality, Risk & Support
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Manage support tickets, handle compliance alerts, and monitor service quality.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              className="w-64 pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Open Tickets</p>
          <p className="text-2xl font-black text-[color:var(--t10-navy)] mt-1">{tickets.filter((t: any) => t.status === 'Open').length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Critical Priority</p>
          <p className="text-2xl font-black text-red-500 mt-1">{tickets.filter((t: any) => t.priority === 'High').length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Resolved Today</p>
          <p className="text-2xl font-black text-[color:var(--t10-emerald)] mt-1">{tickets.filter((t: any) => t.status === 'Closed').length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Avg Resolution</p>
          <p className="text-2xl font-black text-[color:var(--t10-navy)] mt-1">2.4 hrs</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Ticket Issue</th>
                <th className="px-6 py-4">Customer ID</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    <CheckCircle2 className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                    No support tickets found. Everything is running smoothly.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-neutral-400" />
                        {ticket.subject}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> Created: {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-neutral-500">
                      {ticket.userId}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ticket.priority === 'High' ? 'bg-red-50 text-red-600' :
                        ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {ticket.priority === 'High' && <AlertCircle className="h-3 w-3" />}
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' :
                        ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-neutral-700 border border-neutral-200 px-3 py-1.5 rounded bg-white hover:bg-neutral-50 transition-colors shadow-sm">
                        Review
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
