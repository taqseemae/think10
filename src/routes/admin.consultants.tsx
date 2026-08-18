import { createFileRoute } from "@tanstack/react-router";
import { useAdminState } from "@/context/AdminStateContext";
import { Briefcase, Search, Filter, BadgeCheck, Star, FileText, Check, X, ShieldAlert, Award, DollarSign, CalendarCheck, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/consultants")({
  component: ConsultantsAdminPage,
});

function ConsultantsAdminPage() {
  const { users, bookings, suspendUser, approveConsultant, rejectConsultant } = useAdminState();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewingConsultant, setReviewingConsultant] = useState<any | null>(null);

  // Filter ONLY consultants (plan.role === 'Consultant' or 'ConsultantPending' or having consultantProfile)
  const consultants = users.filter((u) => {
    return u.plan?.role === "Consultant" || u.plan?.role === "ConsultantPending" || Boolean(u.consultantProfile);
  });

  const filteredConsultants = consultants.filter((c) => {
    // Status Filter
    if (statusFilter === "verified" && c.approvalStatus !== "APPROVED" && c.plan?.role !== "Consultant") return false;
    if (statusFilter === "pending" && c.approvalStatus !== "PENDING" && c.plan?.role !== "ConsultantPending") return false;
    if (statusFilter === "suspended" && c.plan?.status !== "Suspended") return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const name = (c.displayName || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const title = (c.consultantProfile?.title || "").toLowerCase();
    return name.includes(term) || email.includes(term) || title.includes(term);
  });

  // Calculate stats for a consultant
  const getConsultantStats = (consultant: any) => {
    const consultantBookings = bookings.filter((b) => b.consultantId === consultant.uid || b.consultantEmail === consultant.email || b.expertSlug === consultant.uid);
    const completed = consultantBookings.filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED");
    
    // Estimate total earnings (assuming 450 AED per session, 80% to consultant)
    const grossEarnings = completed.length * 450 * 0.8;
    
    // Setup fee status (500 AED setup fee)
    const setupFeePaid = consultant.setupFeePaid || true; // default true for dev demo

    return {
      totalBookings: consultantBookings.length,
      completedBookings: completed.length,
      grossEarningsAED: grossEarnings,
      setupFeePaid,
      rating: consultant.rating || 4.9,
      reviewsCount: consultant.reviewsCount || 12,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            Consultant Network & Verification
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Manage advisor compliance, approve pending applications, review documents, and monitor rating metrics.
          </p>
        </div>
        
        <div className="flex gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-[color:var(--t10-emerald)]"
          >
            <option value="all">All Consultants</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search consultants..." 
              className="w-64 pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[color:var(--t10-emerald)] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Advisor Profile</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4">Setup Fee & Earnings</th>
                <th className="px-6 py-4">Rating & Sessions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredConsultants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No consultants found.
                  </td>
                </tr>
              ) : (
                filteredConsultants.map((consultant) => {
                  const stats = getConsultantStats(consultant);
                  const isPending = consultant.approvalStatus === "PENDING" || consultant.plan?.role === "ConsultantPending" || consultant.approved === false;

                  return (
                    <tr key={consultant.id || consultant.uid} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[color:var(--t10-navy)] flex items-center justify-center text-white font-bold border border-neutral-200 shrink-0 overflow-hidden">
                            {consultant.photoURL ? (
                              <img src={consultant.photoURL} alt={consultant.displayName} className="h-full w-full object-cover" />
                            ) : (
                              consultant.displayName?.charAt(0) || consultant.email?.charAt(0) || "?"
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">{consultant.displayName || consultant.email}</div>
                            <div className="text-xs text-neutral-500">{consultant.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <div className="font-semibold text-neutral-800">{consultant.consultantProfile?.title || "Business Consultant"}</div>
                          <div className="text-[10px] text-neutral-500">{consultant.consultantProfile?.primaryArea || "Feasibility & Strategy"}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {consultant.plan?.status === "Suspended" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                            Suspended
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Approval Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]">
                            <BadgeCheck className="h-3.5 w-3.5" /> Verified Advisor
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <div className="font-bold text-emerald-700">
                            AED {stats.grossEarningsAED.toLocaleString()} Earned
                          </div>
                          <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                            Setup Fee: <span className="font-semibold text-emerald-600">Paid (500 AED)</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <div className="flex items-center gap-1 font-bold text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-neutral-900">{stats.rating}</span>
                            <span className="text-[10px] text-neutral-400">({stats.reviewsCount} reviews)</span>
                          </div>
                          <div className="text-[10px] text-neutral-600">
                            {stats.completedBookings} Completed Sessions
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setReviewingConsultant(consultant)}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" /> Review Docs
                          </button>

                          {consultant.plan?.status === "Suspended" ? (
                            <button
                              onClick={() => suspendUser(consultant.uid, false)}
                              className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              Unsuspend
                            </button>
                          ) : (
                            <button
                              onClick={() => suspendUser(consultant.uid, true)}
                              className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}
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

      {/* Review Documents & Approval Modal */}
      {reviewingConsultant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-lg w-full rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-[color:var(--t10-navy)]">Review Verification & Documents</h3>
                <p className="text-xs text-neutral-500">{reviewingConsultant.displayName || reviewingConsultant.email}</p>
              </div>
              <button
                onClick={() => setReviewingConsultant(null)}
                className="rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">Title / Domain:</span>
                <span className="font-bold text-neutral-900">{reviewingConsultant.consultantProfile?.title || "Business Consultant"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">Verification Fee:</span>
                <span className="font-bold text-emerald-600">AED 0 (Free Preview)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">Experience & Rate:</span>
                <span className="font-bold text-neutral-900">{reviewingConsultant.consultantProfile?.experienceYears || 10} Yrs Exp • {reviewingConsultant.consultantProfile?.pricePlaceholder || "AED 450"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">Current Approval Status:</span>
                <span className="font-bold text-amber-700">{reviewingConsultant.approvalStatus || "PENDING"}</span>
              </div>
            </div>

            {/* Verification Documents List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Uploaded Compliance & Resume Assets</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Resume / CV Document</p>
                      <p className="text-[10px] text-neutral-500">{reviewingConsultant.consultantProfile?.cvFileName || "Not Uploaded"}</p>
                    </div>
                  </div>
                  {reviewingConsultant.consultantProfile?.cvUrl ? (
                    <a href={reviewingConsultant.consultantProfile.cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[color:var(--t10-emerald)] hover:underline">View</a>
                  ) : <span className="text-xs font-bold text-neutral-400">Missing</span>}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Trade License / Certifications</p>
                      <p className="text-[10px] text-neutral-500">{reviewingConsultant.consultantProfile?.certFileName || "Not Uploaded"}</p>
                    </div>
                  </div>
                  {reviewingConsultant.consultantProfile?.certUrl ? (
                    <a href={reviewingConsultant.consultantProfile.certUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[color:var(--t10-emerald)] hover:underline">View</a>
                  ) : <span className="text-xs font-bold text-neutral-400">Missing</span>}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Emirates ID (Required)</p>
                      <p className="text-[10px] text-neutral-500">{reviewingConsultant.consultantProfile?.emiratesIdFileName || "Not Uploaded"}</p>
                    </div>
                  </div>
                  {reviewingConsultant.consultantProfile?.emiratesIdUrl ? (
                    <a href={reviewingConsultant.consultantProfile.emiratesIdUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[color:var(--t10-emerald)] hover:underline">View</a>
                  ) : <span className="text-xs font-bold text-red-500">Missing</span>}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Experience Letter</p>
                      <p className="text-[10px] text-neutral-500">{reviewingConsultant.consultantProfile?.expLetterFileName || "Not Uploaded"}</p>
                    </div>
                  </div>
                  {reviewingConsultant.consultantProfile?.expLetterUrl ? (
                    <a href={reviewingConsultant.consultantProfile.expLetterUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[color:var(--t10-emerald)] hover:underline">View</a>
                  ) : <span className="text-xs font-bold text-neutral-400">Optional</span>}
                </div>
              </div>
            </div>

            {/* Approval Decision Footer */}
            <div className="flex gap-3 justify-end pt-3 border-t border-neutral-200">
              <button
                onClick={async () => {
                  await rejectConsultant(reviewingConsultant.uid);
                  toast.success(`Consultant ${reviewingConsultant.email} rejected`);
                  setReviewingConsultant(null);
                }}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
              >
                Reject Application
              </button>
              <button
                onClick={async () => {
                  try {
                    await approveConsultant(reviewingConsultant.uid || reviewingConsultant.id);
                    toast.success(`Consultant ${reviewingConsultant.email} approved & published!`);
                    setReviewingConsultant(null);
                  } catch (err: any) {
                    console.error("Failed to approve consultant:", err);
                    alert("Failed to approve consultant: " + err.message);
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg bg-[color:var(--t10-emerald)] px-4 py-2 text-xs font-bold text-white hover:bg-[color:var(--t10-green)] transition-colors shadow-sm"
              >
                <Check className="h-4 w-4" /> Approve & Publish Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

