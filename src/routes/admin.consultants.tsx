import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Search, Filter, MoreVertical, BadgeCheck, FileText, Star } from "lucide-react";

export const Route = createFileRoute("/admin/consultants")({
  component: ConsultantsAdminPage,
});

function ConsultantsAdminPage() {
  const mockConsultants = [
    { id: "c1", name: "Sarah Jenkins", role: "Strategy Consultant", status: "Verified", rating: 4.9, sessions: 124, pendingDocs: 0 },
    { id: "c2", name: "Dr. Ahmed Rahman", role: "Financial Advisor", status: "Pending Verification", rating: 0, sessions: 0, pendingDocs: 2 },
    { id: "c3", name: "Elena Rostova", role: "Growth Specialist", status: "Verified", rating: 4.7, sessions: 89, pendingDocs: 0 },
    { id: "c4", name: "Michael Chen", role: "AI Transformation", status: "Suspended", rating: 4.1, sessions: 42, pendingDocs: 1 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            Consultant Network
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Manage advisor verifications, compliance documents, and performance metrics.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search consultants..." 
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
                <th className="px-6 py-4">Advisor Profile</th>
                <th className="px-6 py-4">Status & Compliance</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Activity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {mockConsultants.map((consultant) => (
                <tr key={consultant.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold border border-neutral-200">
                        {consultant.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">{consultant.name}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">{consultant.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        consultant.status === 'Verified' ? 'bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]' :
                        consultant.status === 'Pending Verification' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {consultant.status === 'Verified' && <BadgeCheck className="h-3 w-3" />}
                        {consultant.status}
                      </span>
                      {consultant.pendingDocs > 0 && (
                        <span className="text-[10px] text-red-500 font-semibold flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded">
                          <FileText className="h-3 w-3" /> {consultant.pendingDocs} docs missing
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-neutral-900">{consultant.rating > 0 ? consultant.rating.toFixed(1) : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-neutral-700">{consultant.sessions} Sessions Delivered</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-neutral-400 hover:text-neutral-900 transition-colors p-1">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
