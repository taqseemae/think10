"use client";

import { useAdminState } from "@/context/AdminStateContext";
import { Users, Search, MoreVertical, ShieldCheck, Mail, Building2, CheckCircle2 } from "lucide-react";


function CustomersAdminPage() {
  const { users, suspendUser, updateUserRole } = useAdminState();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <Users className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            Customers & Members
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Manage all registered users, view their active plans, and monitor onboarding progress.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="w-64 pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[color:var(--t10-emerald)] transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Plan & Status</th>
                <th className="px-6 py-4">Onboarding</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No customers found in the database.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[color:var(--t10-mint)] flex items-center justify-center text-[color:var(--t10-emerald)] font-bold">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">{user.displayName || "Unknown User"}</div>
                          <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-700">
                        <Building2 className="h-4 w-4 text-neutral-400" />
                        {user.companyName || user.profile?.businessName || "Not Provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          user.plan?.role === 'Premium' ? 'bg-purple-100 text-purple-700' :
                          user.plan?.role === 'Hybrid' ? 'bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]' :
                          user.plan?.role === 'ZynePaid' ? 'bg-blue-100 text-blue-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {user.plan?.role || "Free"}
                        </span>
                        {user.adminRole && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                            <ShieldCheck className="h-3 w-3" /> {user.adminRole}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.onboarding?.completed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="h-4 w-4" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div> Step {user.onboarding?.step || 1}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.plan?.status === "Suspended" ? (
                          <button
                            onClick={() => suspendUser(user.uid, false)}
                            className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-colors"
                          >
                            Unsuspend
                          </button>
                        ) : (
                          <button
                            onClick={() => suspendUser(user.uid, true)}
                            className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                        {user.plan?.role !== "Premium" && (
                          <button
                            onClick={() => updateUserRole(user.uid, "Premium")}
                            className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 transition-colors"
                          >
                            Upgrade
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

export default CustomersAdminPage;
