import { createFileRoute } from "@tanstack/react-router";
import { Settings, Save, Shield, Database, Bell, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdminPage,
});

function SettingsAdminPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <Settings className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            Platform Settings
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Configure global application settings, API keys, and environment variables.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-[color:var(--t10-navy)] text-white rounded-lg text-sm font-bold hover:bg-opacity-90 transition-colors">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {[
            { label: "General", icon: LayoutDashboard, active: true },
            { label: "Security & RBAC", icon: Shield, active: false },
            { label: "Database & APIs", icon: Database, active: false },
            { label: "Notifications", icon: Bell, active: false },
          ].map((tab, i) => (
            <button 
              key={i} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                tab.active ? "bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="font-bold text-[color:var(--t10-navy)]">General Platform Settings</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Platform Name</label>
                  <input type="text" defaultValue="Think10 Advisory" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--t10-emerald)]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Support Email</label>
                  <input type="email" defaultValue="support@think10.ae" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--t10-emerald)]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Maintenance Mode</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-12 h-6 bg-neutral-200 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                  </div>
                  <span className="text-sm text-neutral-600">Platform is currently live and operational.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden mt-6">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="font-bold text-[color:var(--t10-navy)]">API Configuration</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Gemini API Key (Zyne AI)</label>
                <input type="password" defaultValue="************************" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-400 focus:outline-none" readOnly />
                <p className="text-xs text-neutral-400 mt-1">Configured via environment variables.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">MongoDB URI</label>
                <input type="password" defaultValue="************************" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-400 focus:outline-none" readOnly />
                <p className="text-xs text-neutral-400 mt-1">Connected to Production Cluster.</p>
              </div>
            </div>
          </div>

          {/* Admin Profile block */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden mt-6">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <h3 className="font-bold text-[color:var(--t10-navy)]">Admin Profile & Security</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Admin Email</label>
                <input type="email" defaultValue="admin@think10.ae" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-neutral-50 text-neutral-500" readOnly />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Account Security</label>
                <p className="text-xs text-neutral-500 mb-3">
                  To keep your admin account fully secured, you can reset your password. 
                  A password reset link will be sent to the admin email address.
                </p>
                <button
                  onClick={async () => {
                    const { sendPasswordResetEmail } = await import('firebase/auth');
                    const { auth } = await import('@/lib/firebase');
                    try {
                      await sendPasswordResetEmail(auth, "admin@think10.ae");
                      alert("Password reset email sent to admin@think10.ae.");
                    } catch(err) {
                      alert("Error sending password reset email.");
                    }
                  }}
                  className="px-4 py-2 bg-neutral-100 text-[color:var(--t10-navy)] border border-neutral-200 rounded-lg text-sm font-bold hover:bg-neutral-200 transition-colors"
                >
                  Send Password Reset Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
