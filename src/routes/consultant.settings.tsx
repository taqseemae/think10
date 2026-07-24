import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, ShieldAlert, Settings as SettingsIcon, Globe, Lock, FileText, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/consultant/settings")({
  component: ConsultantSettings,
});

function ConsultantSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Help & Settings</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage preferences, security, and access support.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Support & Tickets */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2"><LifeBuoy className="w-5 h-5 text-[color:var(--t10-navy)]" /> Support Centre</h3>
              <button className="text-sm font-medium text-[color:var(--t10-emerald)] hover:underline">New Ticket</button>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-neutral-100">
                <li className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
                        In Progress
                      </span>
                      <p className="font-medium text-neutral-900 text-sm">Dispute regarding booking BK-93820 no-show policy</p>
                      <p className="text-xs text-neutral-500 mt-1">Ticket #TK-442 • Updated 2 hours ago</p>
                    </div>
                    <button className="text-xs font-medium text-neutral-500 hover:text-neutral-900">View</button>
                  </div>
                </li>
                <li className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 mb-2">
                        Resolved
                      </span>
                      <p className="font-medium text-neutral-900 text-sm">Calendar sync authorization error</p>
                      <p className="text-xs text-neutral-500 mt-1">Ticket #TK-391 • Closed Jul 15, 2026</p>
                    </div>
                    <button className="text-xs font-medium text-neutral-500 hover:text-neutral-900">View</button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-neutral-400" /> Preferences</h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900 text-sm">Timezone</p>
                  <p className="text-xs text-neutral-500 mt-1">All bookings will be displayed in this timezone.</p>
                </div>
                <select className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm focus:border-[color:var(--t10-emerald)] focus:outline-none bg-white">
                  <option>Gulf Standard Time (GST)</option>
                  <option>Coordinated Universal Time (UTC)</option>
                  <option>Eastern Standard Time (EST)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900 text-sm">Email Notifications</p>
                  <p className="text-xs text-neutral-500 mt-1">Receive booking requests and reports via email.</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle1" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-[color:var(--t10-emerald)] right-0" />
                  <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-[color:var(--t10-emerald)] cursor-pointer"></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
                <div>
                  <p className="font-medium text-neutral-900 text-sm">SMS Alerts (Urgent)</p>
                  <p className="text-xs text-neutral-500 mt-1">Receive SMS for immediate session starts and cancellations.</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle2" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-[color:var(--t10-emerald)] right-0" />
                  <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-5 rounded-full bg-[color:var(--t10-emerald)] cursor-pointer"></label>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Security & Policies */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
            <h3 className="font-bold text-neutral-900 flex items-center gap-2 mb-4"><Lock className="w-5 h-5 text-neutral-400" /> Security</h3>
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-colors flex justify-between items-center">
                Change Password <ExternalLink className="w-4 h-4 text-neutral-400" />
              </button>
              <button className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-colors flex justify-between items-center">
                Two-Factor Auth (2FA) <span className="text-xs text-[color:var(--t10-emerald)] font-bold bg-emerald-50 px-2 py-0.5 rounded">Enabled</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-colors flex justify-between items-center">
                Active Sessions <span className="text-xs text-neutral-500">2 devices</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
            <h3 className="font-bold text-neutral-900 flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-neutral-400" /> Policies & Agreements</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[color:var(--t10-emerald)] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Consultant Agreement (v1.2)
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[color:var(--t10-emerald)] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Code of Conduct
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-[color:var(--t10-emerald)] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Privacy Policy
                </a>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
