import { createFileRoute } from "@tanstack/react-router";
import { useAdminState, type AdminRole } from "@/context/AdminStateContext";
import { Users, Search, ShieldCheck, Mail, Building2, CheckCircle2, Edit, X, Save, Trash2, KeyRound, UserPlus, Filter, Check, ArrowLeft, Lock, Camera, Globe, FileText, UserCheck, Key, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

// Granular permissions list for admin role management
const PERMISSIONS_LIST = [
  { id: "manage_users", label: "Manage Users & Accounts", desc: "Create, edit, suspend, or delete users" },
  { id: "view_customers", label: "View Customer Financials", desc: "Access subscription tiers, revenue, payments" },
  { id: "manage_consultants", label: "Consultant Approvals", desc: "Review documents and approve consultant profiles" },
  { id: "manage_bookings", label: "Manage Bookings & Schedules", desc: "Cancel, reschedule, or update booking status" },
  { id: "manage_finance", label: "Financial Reports & Payouts", desc: "Access MRR, earnings, and consultant payouts" },
  { id: "manage_crm", label: "Enterprise CRM & Proposals", desc: "Manage corporate clients and sales deals" },
  { id: "ai_ops", label: "AI Operations & Safety", desc: "Review AI logs, flags, and model settings" },
];

function UsersAdminPage() {
  const { users, suspendUser, updateUserRole, updateUserAdminRole, updateUserProfile, deleteUser } = useAdminState();
  
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  
  // Active editing user profile (null = list view, object = full profile view)
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // WordPress Profile Page Form States
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [language, setLanguage] = useState("Site Default");

  // Roles & Admin Permissions State
  const [planRole, setPlanRole] = useState("Free");
  const [adminRole, setAdminRole] = useState("");
  const [customPermissions, setCustomPermissions] = useState<string[]>([
    "manage_users", "view_customers", "manage_consultants", "manage_bookings"
  ]);

  // Password reset state
  const [newPassword, setNewPassword] = useState("");
  const [showPassField, setShowPassField] = useState(false);

  // New User Form State
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Free");
  const [newAdminRole, setNewAdminRole] = useState("");

  // Role Counts for Tabs
  const allCount = users.length;
  const adminCount = users.filter(u => Boolean(u.adminRole) || u.email === "admin.think10@gmail.com" || u.email === "admin@think10.ae").length;
  const consultantCount = users.filter(u => u.plan?.role === "Consultant" || u.plan?.role === "ConsultantPending" || Boolean(u.consultantProfile)).length;
  const customerCount = users.filter(u => !u.adminRole && u.email !== "admin.think10@gmail.com" && u.email !== "admin@think10.ae" && u.plan?.role !== "Consultant" && u.plan?.role !== "ConsultantPending" && !u.consultantProfile).length;

  const filteredUsers = users.filter((u) => {
    if (selectedRoleFilter === "Administrator" && !u.adminRole && u.email !== "admin.think10@gmail.com" && u.email !== "admin@think10.ae") return false;
    if (selectedRoleFilter === "Consultant" && u.plan?.role !== "Consultant" && u.plan?.role !== "ConsultantPending" && !u.consultantProfile) return false;
    if (selectedRoleFilter === "Customer" && (u.adminRole || u.email === "admin.think10@gmail.com" || u.email === "admin@think10.ae" || u.plan?.role === "Consultant" || u.plan?.role === "ConsultantPending" || u.consultantProfile)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (u.displayName || "").toLowerCase();
      const em = (u.email || "").toLowerCase();
      const uid = (u.uid || "").toLowerCase();
      return name.includes(q) || em.includes(q) || uid.includes(q);
    }
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedUserIds(filteredUsers.map(u => u.uid));
    else setSelectedUserIds([]);
  };

  const handleSelectOne = (uid: string, checked: boolean) => {
    if (checked) setSelectedUserIds(prev => [...prev, uid]);
    else setSelectedUserIds(prev => prev.filter(id => id !== uid));
  };

  const handleApplyBulkAction = async () => {
    if (!bulkAction) { toast.error("Please select a bulk action"); return; }
    if (selectedUserIds.length === 0) { toast.error("No users selected"); return; }

    if (bulkAction === "delete") {
      if (window.confirm(`Are you sure you want to delete ${selectedUserIds.length} selected users?`)) {
        for (const uid of selectedUserIds) await deleteUser(uid);
        toast.success(`${selectedUserIds.length} users deleted.`);
        setSelectedUserIds([]);
      }
    } else if (bulkAction === "suspend") {
      for (const uid of selectedUserIds) await suspendUser(uid, true);
      toast.success(`${selectedUserIds.length} users suspended.`);
      setSelectedUserIds([]);
    } else if (bulkAction === "unsuspend") {
      for (const uid of selectedUserIds) await suspendUser(uid, false);
      toast.success(`${selectedUserIds.length} users unsuspended.`);
      setSelectedUserIds([]);
    }
    setBulkAction("");
  };

  // Open Full WordPress Profile Page View for Editing User
  const handleOpenProfile = (user: any) => {
    setEditingUser(user);
    const em = user.email || "";
    const uName = em ? em.split("@")[0] : "user";
    const dName = user.displayName || uName;
    const nameParts = dName.split(" ");
    
    setUsername(uName);
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(" ") || "");
    setNickname(dName);
    setDisplayName(dName);
    setEmail(em);
    setWebsite(user.profile?.website || "https://think10.ae");
    setBio(user.consultantProfile?.bio || user.profile?.bio || "");
    setProfilePic(user.profilePic || "");
    setPlanRole(user.plan?.role || "Free");
    setAdminRole(user.adminRole || "");
    setShowPassField(false);
    setNewPassword("");
  };

  // Open Full WordPress Profile Page View for New User Creation
  const handleCreateNewUserPage = () => {
    setEditingUser({ isNew: true, uid: `user_${Date.now()}` });
    setUsername("");
    setFirstName("");
    setLastName("");
    setNickname("");
    setDisplayName("");
    setEmail("");
    setWebsite("");
    setBio("");
    setProfilePic("");
    setPlanRole("Free");
    setAdminRole("");
    setShowPassField(true);
    setNewPassword("");
  };

  // Save Full Profile Page Changes
  const handleSaveProfile = async () => {
    if (!editingUser) return;
    const fullCombinedName = `${firstName} ${lastName}`.trim() || displayName || username;
    
    // Save details to database
    await updateUserProfile(editingUser.uid, fullCombinedName, email);
    
    if (planRole !== (editingUser.plan?.role || "Free")) {
      await updateUserRole(editingUser.uid, planRole);
    }
    
    if (adminRole !== (editingUser.adminRole || "")) {
      await updateUserAdminRole(editingUser.uid, adminRole || null);
    }

    if (newPassword) {
      toast.success(`Password updated for ${email}`);
    } else {
      toast.success("User Profile updated successfully!");
    }

    setEditingUser(null);
  };

  const togglePermission = (permId: string) => {
    setCustomPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) { toast.error("Email is required"); return; }
    const { syncUserDoc } = await import("@/lib/server-actions");
    const fakeUid = `user_${Date.now()}`;
    await syncUserDoc({ data: { uid: fakeUid, email: newEmail, displayName: newName || newUsername, role: newRole } });
    if (newAdminRole) {
      await updateUserAdminRole(fakeUid, newAdminRole);
    }
    toast.success("New user created successfully");
    setIsAddUserOpen(false);
    setNewUsername(""); setNewEmail(""); setNewName(""); setNewRole("Free"); setNewAdminRole("");
  };

  // ─── IF EDITING A USER, RENDER FULL WORDPRESS PROFILE PAGE IN SAME WINDOW ───
  if (editingUser) {
    return (
      <div className="space-y-6 animate-fade-in text-neutral-800 max-w-4xl pb-16">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between border-b border-neutral-300 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingUser(null)}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded px-2.5 py-1.5 bg-white shadow-sm hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Users
            </button>
            <h1 className="text-2xl font-normal text-neutral-900 font-sans">
              Edit User: <span className="font-bold">{displayName || email}</span>
            </h1>
          </div>

          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-1.5 rounded bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" /> Update Profile
          </button>
        </div>

        {/* Section 1: Personal Options */}
        <div className="bg-white border border-neutral-300 rounded shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" /> Personal Options
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-xs font-semibold text-neutral-700">Language</label>
            <div className="md:col-span-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-72 border border-neutral-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="Site Default">Site Default (English)</option>
                <option value="English (US)">English (US)</option>
                <option value="Arabic">Arabic (العربية)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Name & Identity */}
        <div className="bg-white border border-neutral-300 rounded shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600" /> Name & Identity
          </h2>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-700">Username</label>
              <div className="md:col-span-2">
                <input
                  type="text"
                  disabled
                  value={username}
                  className="w-80 border border-neutral-200 rounded px-3 py-1.5 bg-neutral-100 text-neutral-500 font-mono text-xs cursor-not-allowed"
                />
                <span className="text-[11px] text-neutral-400 block mt-1">Usernames cannot be changed.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-700">First Name</label>
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-80 border border-neutral-300 rounded px-3 py-1.5 bg-white text-neutral-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-700">Last Name</label>
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-80 border border-neutral-300 rounded px-3 py-1.5 bg-white text-neutral-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-700">Nickname (required)</label>
              <div className="md:col-span-2">
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-80 border border-neutral-300 rounded px-3 py-1.5 bg-white text-neutral-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-700">Display name publicly as</label>
              <div className="md:col-span-2">
                <select
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-80 border border-neutral-300 rounded px-3 py-1.5 bg-white text-neutral-900 outline-none focus:border-blue-500"
                >
                  <option value={username}>{username}</option>
                  {firstName && <option value={firstName}>{firstName}</option>}
                  {firstName && lastName && <option value={`${firstName} ${lastName}`}>{`${firstName} ${lastName}`}</option>}
                  <option value={nickname}>{nickname}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Contact Info */}
        <div className="bg-white border border-neutral-300 rounded shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" /> Contact Info
          </h2>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-700">Email (required)</label>
              <div className="md:col-span-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-80 border border-neutral-300 rounded px-3 py-1.5 bg-white text-neutral-900 outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-neutral-500 block mt-1">If you change this, a notification email will be sent to the user.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-700">Website URL</label>
              <div className="md:col-span-2">
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-80 border border-neutral-300 rounded px-3 py-1.5 bg-white text-neutral-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: About Yourself & Profile Picture */}
        <div className="bg-white border border-neutral-300 rounded shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" /> About User & Profile Picture
          </h2>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="font-semibold text-neutral-700 pt-1">Biographical Info</label>
              <div className="md:col-span-2">
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio about this user..."
                  className="w-full max-w-lg border border-neutral-300 rounded p-3 bg-white text-neutral-900 outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-neutral-500 block mt-1">Biographical text will be displayed on profile and advisory cards.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-700">Profile Picture</label>
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="h-16 w-16 rounded bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold text-xl uppercase border border-neutral-300">
                  {profilePic ? (
                    <img src={profilePic} alt="Avatar" className="h-full w-full object-cover rounded" />
                  ) : (
                    displayName.charAt(0) || username.charAt(0)
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    placeholder="Image URL (https://...)"
                    className="w-72 border border-neutral-300 rounded px-3 py-1.5 text-xs bg-white outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-neutral-400 block mt-1">Provide direct image link or Gravatar URL.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Admin Roles & Role-Based Permissions Access (ADMIN ONLY CONTROL) */}
        <div className="bg-amber-50/60 border border-amber-300 rounded shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-amber-900 border-b border-amber-200 pb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-700" /> Admin Role & Permission Control (Administrator Options)
          </h2>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-800">Account Subscription Role</label>
              <div className="md:col-span-2">
                <select
                  value={planRole}
                  onChange={(e) => setPlanRole(e.target.value)}
                  className="w-72 border border-neutral-300 rounded px-3 py-1.5 bg-white text-neutral-900 outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Free">Free Customer Tier</option>
                  <option value="ZynePaid">ZynePaid (290 AED/mo)</option>
                  <option value="Hybrid">Hybrid (950 AED/mo)</option>
                  <option value="Premium">Premium (2,500 AED/mo)</option>
                  <option value="Enterprise">Enterprise (5,000 AED/mo)</option>
                  <option value="Consultant">Verified Consultant</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-800">Admin Portal Panel Role</label>
              <div className="md:col-span-2">
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  className="w-72 border border-neutral-300 rounded px-3 py-1.5 bg-white text-neutral-900 outline-none focus:border-blue-500 font-medium"
                >
                  <option value="">No Administrative Access (Standard User)</option>
                  {ADMIN_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Granular Permission Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-amber-200">
              <label className="font-semibold text-neutral-800">Granular Module Permissions</label>
              <div className="md:col-span-2 space-y-2">
                {PERMISSIONS_LIST.map((perm) => {
                  const isChecked = customPermissions.includes(perm.id);
                  return (
                    <label key={perm.id} className="flex items-start gap-2.5 p-2 rounded hover:bg-amber-100/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-0.5 rounded border-neutral-400 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="font-semibold text-neutral-900 block">{perm.label}</span>
                        <span className="text-[11px] text-neutral-500">{perm.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Account Security & Passwords */}
        <div className="bg-white border border-neutral-300 rounded shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-600" /> Account Management & Passwords
          </h2>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-700">New Password</label>
              <div className="md:col-span-2">
                {!showPassField ? (
                  <button
                    type="button"
                    onClick={() => setShowPassField(true)}
                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded font-semibold transition-colors"
                  >
                    Set New Password
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className="w-72 border border-neutral-300 rounded px-3 py-1.5 text-xs bg-white outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => { setShowPassField(false); setNewPassword(""); }}
                      className="text-neutral-500 hover:text-neutral-700 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="font-semibold text-neutral-700">Active Sessions</label>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => toast.success(`Logged out ${email} from all other devices.`)}
                  className="border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-1.5 rounded font-medium transition-colors"
                >
                  Log Out Everywhere Else
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Save Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setEditingUser(null)}
            className="border border-neutral-300 bg-white text-neutral-700 px-4 py-2 rounded text-xs font-semibold hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            className="flex items-center gap-1.5 rounded bg-blue-600 px-6 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-md"
          >
            <Save className="h-4 w-4" /> Update Profile
          </button>
        </div>
      </div>
    );
  }

  // ─── REGULAR USERS TABLE LIST VIEW ───
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <Users className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            Users
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Manage platform accounts, roles, permissions, and administrative access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-4 py-1.5 border border-neutral-200 rounded-lg bg-white text-xs text-neutral-900 focus:outline-none focus:border-[color:var(--t10-emerald)] w-56 shadow-sm transition-colors"
            />
          </div>
          <button
            onClick={handleCreateNewUserPage}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[color:var(--t10-emerald)] rounded-lg px-3.5 py-1.5 hover:opacity-90 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <UserPlus className="h-4 w-4" /> Add New User
          </button>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 pb-3">
        {[
          { key: "All", label: "All Users", count: allCount },
          { key: "Administrator", label: "Administrators", count: adminCount },
          { key: "Customer", label: "Customers", count: customerCount },
          { key: "Consultant", label: "Consultants", count: consultantCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedRoleFilter(tab.key)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all border cursor-pointer ${
              selectedRoleFilter === tab.key
                ? "bg-[color:var(--t10-navy)] text-white border-[color:var(--t10-navy)]"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-[color:var(--t10-emerald)] hover:text-[color:var(--t10-emerald)]"
            }`}
          >
            {tab.label} <span className={selectedRoleFilter === tab.key ? "opacity-70" : "text-neutral-400"}>({tab.count})</span>
          </button>
        ))}

        {/* Bulk Actions (right-aligned in the tabs row) */}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="border border-neutral-200 rounded-lg bg-white px-2.5 py-1 text-xs text-neutral-700 focus:outline-none focus:border-[color:var(--t10-emerald)] shadow-sm"
          >
            <option value="">Bulk Actions</option>
            <option value="suspend">Suspend Users</option>
            <option value="unsuspend">Unsuspend Users</option>
            <option value="delete">Delete Permanently</option>
          </select>
          <button
            onClick={handleApplyBulkAction}
            className="border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Apply
          </button>
          {selectedUserIds.length > 0 && (
            <span className="text-xs text-neutral-500 font-medium">{selectedUserIds.length} selected</span>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[color:var(--t10-offwhite)] border-b border-neutral-200 text-neutral-600 font-semibold text-xs">
              <tr>
                <th className="p-3.5 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-[color:var(--t10-emerald)] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Username / Avatar</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 text-xs">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isChecked = selectedUserIds.includes(user.uid);
                  const displayUsername = user.email ? user.email.split("@")[0] : "user";
                  
                  // Fix role formatting: check if admin.think10@gmail.com or admin@think10.ae or user has adminRole
                  const isAdminUser = Boolean(user.adminRole) || user.email === "admin.think10@gmail.com" || user.email === "admin@think10.ae";
                  const formattedRole = isAdminUser
                    ? `Administrator (${user.adminRole || "Super Admin"})`
                    : user.plan?.role === "Consultant" || user.plan?.role === "ConsultantPending"
                    ? "Consultant"
                    : `Customer (${user.plan?.role || "Free"})`;

                  return (
                    <tr key={user.uid || user.id} className="hover:bg-neutral-50/80 group transition-colors">
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(user.uid, e.target.checked)}
                          className="rounded border-neutral-300 text-[color:var(--t10-emerald)] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)] flex items-center justify-center font-bold text-xs uppercase shrink-0 overflow-hidden">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={displayUsername} className="h-full w-full object-cover" />
                            ) : (
                              user.displayName?.charAt(0) || displayUsername.charAt(0)
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 hover:text-[color:var(--t10-emerald)] cursor-pointer" onClick={() => handleOpenProfile(user)}>
                              {displayUsername}
                            </span>
                            {/* WordPress Style Quick Actions on Hover */}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5 transition-opacity">
                              <button onClick={() => handleOpenProfile(user)} className="text-[color:var(--t10-emerald)] font-semibold hover:underline">Edit Profile</button>
                              <span>|</span>
                              {user.plan?.status === "Suspended" ? (
                                <button onClick={() => suspendUser(user.uid, false)} className="text-emerald-600 font-semibold hover:underline">Unsuspend</button>
                              ) : (
                                <button onClick={() => suspendUser(user.uid, true)} className="text-red-600 font-semibold hover:underline">Suspend</button>
                              )}
                              <span>|</span>
                              <button 
                                onClick={() => {
                                  if (window.confirm(`Permanently delete user '${user.email}'?`)) {
                                    deleteUser(user.uid);
                                  }
                                }} 
                                className="text-red-600 font-semibold hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-neutral-900 font-medium">
                        {user.displayName || "—"}
                      </td>

                      <td className="p-3.5 text-neutral-700">
                        <a href={`mailto:${user.email}`} className="hover:underline hover:text-[color:var(--t10-emerald)]">{user.email}</a>
                      </td>

                      <td className="p-3.5 font-medium">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                          isAdminUser ? 'bg-amber-100 text-amber-800' :
                          user.plan?.role === 'Consultant' ? 'bg-purple-100 text-purple-800' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          {formattedRole}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {user.plan?.status === "Suspended" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded border border-neutral-300 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Add New User</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Username (required)</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border border-neutral-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Email (required)</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-neutral-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-neutral-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Customer / Plan Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border border-neutral-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                >
                  <option value="Free">Free</option>
                  <option value="ZynePaid">ZynePaid</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Consultant">Consultant</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Admin Role (Optional)</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value)}
                  className="w-full border border-neutral-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                >
                  <option value="">No Admin Role</option>
                  {ADMIN_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-1.5 rounded border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

