import { createFileRoute } from "@tanstack/react-router";
import { useAdminState, type AdminRole } from "@/context/AdminStateContext";
import { Users, Search, MoreVertical, ShieldCheck, Mail, Building2, CheckCircle2, Edit, X, Save } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdminPage,
});

const ADMIN_ROLES: AdminRole[] = [
  "Super Admin",
  "Founder / Executive",
  "Operations Manager",
  "Consultant Verification",
  "Quality & Compliance",
  "Finance",
  "Customer Support",
  "Enterprise Sales / CRM",
  "Marketing / Content",
  "AI Operations",
  "Data / Analyst"
];

function UsersAdminPage() {
  const { users, suspendUser, updateUserRole, updateUserAdminRole, updateUserProfile } = useAdminState();
  const [editingUser, setEditingUser] = useState<any | null>(null);
  
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editAdminRole, setEditAdminRole] = useState("");

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEditName(user.displayName || "");
    setEditEmail(user.email || "");
    setEditRole(user.plan?.role || "Free");
    setEditAdminRole(user.adminRole || "");
  };

  const handleSave = async () => {
    if (!editingUser) return;
    
    // Save details
    await updateUserProfile(editingUser.uid, editName, editEmail);
    
    // Save roles
    if (editRole !== (editingUser.plan?.role || "Free")) {
      await updateUserRole(editingUser.uid, editRole);
    }
    
    if (editAdminRole !== (editingUser.adminRole || "")) {
      await updateUserAdminRole(editingUser.uid, editAdminRole || null);
    }
    
    setEditingUser(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <Users className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            System Users & Roles
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Manage all registered users, edit their profiles, and assign administrative roles.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-64 pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[color:var(--t10-emerald)] transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Plan Role</th>
                <th className="px-6 py-4">Admin Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No users found in the database.
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        user.plan?.role === 'Premium' ? 'bg-purple-100 text-purple-700' :
                        user.plan?.role === 'Hybrid' ? 'bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]' :
                        user.plan?.role === 'ZynePaid' ? 'bg-blue-100 text-blue-700' :
                        user.plan?.role === 'Consultant' ? 'bg-amber-100 text-amber-700' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {user.plan?.role || "Free"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.adminRole ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                          <ShieldCheck className="h-3 w-3" /> {user.adminRole}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.plan?.status === "Suspended" ? (
                        <span className="text-xs font-medium text-red-600">Suspended</span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="h-3 w-3" /> Edit
                        </button>
                        
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-3">
              <h3 className="text-base font-bold text-[color:var(--t10-navy)]">Edit User: {editingUser.email}</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-xs">
                <span className="mb-1 block font-semibold text-neutral-500">Display Name</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-[color:var(--t10-emerald)]"
                />
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-semibold text-neutral-500">Plan / App Role</span>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-[color:var(--t10-emerald)]"
                >
                  <option value="Free">Free</option>
                  <option value="ZynePaid">ZynePaid</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Consultant">Consultant</option>
                  <option value="ConsultantPending">Consultant (Pending)</option>
                </select>
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-semibold text-neutral-500">Admin Panel Role</span>
                <select
                  value={editAdminRole}
                  onChange={(e) => setEditAdminRole(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-[color:var(--t10-emerald)]"
                >
                  <option value="">No Admin Access</option>
                  {ADMIN_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400 mt-1">Assigning an admin role gives this user access to the Admin portal.</p>
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-[color:var(--t10-border)]">
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-[color:var(--t10-emerald)] px-4 py-2 text-xs font-bold text-white hover:bg-[color:var(--t10-green)] transition-colors shadow-sm"
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
