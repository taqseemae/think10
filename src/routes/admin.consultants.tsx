import { createFileRoute } from "@tanstack/react-router";
import { useAdminState } from "@/context/AdminStateContext";
import { Briefcase, Search, Filter, BadgeCheck, Star } from "lucide-react";

export const Route = createFileRoute("/admin/consultants")({
  component: ConsultantsAdminPage,
});

function ConsultantsAdminPage() {
  const { users, suspendUser } = useAdminState();
  const consultants = users.filter(u => u.plan?.role === "Consultant");

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
              {consultants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No verified consultants found.
                  </td>
                </tr>
              ) : (
                consultants.map((consultant) => (
                  <tr key={consultant.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[color:var(--t10-navy)] flex items-center justify-center text-white font-bold border border-neutral-200">
                          {consultant.displayName?.charAt(0) || consultant.email?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">{consultant.displayName || consultant.email}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">{consultant.profile?.businessName || "Independent"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          consultant.plan?.status === 'Suspended' ? 'bg-red-100 text-red-700' :
                          'bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]'
                        }`}>
                          {consultant.plan?.status !== 'Suspended' && <BadgeCheck className="h-3 w-3" />}
                          {consultant.plan?.status === 'Suspended' ? 'Suspended' : 'Verified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-neutral-900">4.8</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-700">Active</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {consultant.plan?.status === "Suspended" ? (
                          <button
                            onClick={() => suspendUser(consultant.uid, false)}
                            className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-colors"
                          >
                            Unsuspend
                          </button>
                        ) : (
                          <button
                            onClick={() => suspendUser(consultant.uid, true)}
                            className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
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
