import { createFileRoute } from "@tanstack/react-router";
import { Building2, Search, Filter, Phone, Mail, Calendar, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/crm")({
  component: CrmAdminPage,
});

function CrmAdminPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            Enterprise CRM
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Manage B2B sales pipelines, track enterprise deals, and coordinate outreach.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search accounts..." 
              className="w-64 pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[color:var(--t10-emerald)] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {/* Deal Stages */}
        {['Lead In', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won'].map((stage, i) => (
          <div key={stage} className="min-w-[300px] flex-shrink-0 bg-neutral-100 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-neutral-700 uppercase tracking-wider text-xs">{stage}</h3>
              <span className="bg-neutral-200 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{i === 4 ? 1 : 2}</span>
            </div>
            
            {/* Mock Cards */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 cursor-pointer hover:border-[color:var(--t10-emerald)] transition-colors">
              <h4 className="font-bold text-[color:var(--t10-navy)] text-sm">Tech Innovators Corp</h4>
              <p className="text-xs text-neutral-500 mt-1">Enterprise Advisory Plan</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">AED 120,000</span>
                <div className="flex gap-1 text-neutral-400">
                  <Mail className="h-4 w-4 hover:text-[color:var(--t10-emerald)]" />
                  <Phone className="h-4 w-4 hover:text-[color:var(--t10-emerald)]" />
                  <Calendar className="h-4 w-4 hover:text-[color:var(--t10-emerald)]" />
                </div>
              </div>
            </div>
            
            {i !== 4 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 cursor-pointer hover:border-[color:var(--t10-emerald)] transition-colors">
                <h4 className="font-bold text-[color:var(--t10-navy)] text-sm">Global Ventures LLC</h4>
                <p className="text-xs text-neutral-500 mt-1">Zyne API Integration</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">AED 45,000</span>
                  <div className="flex gap-1 text-neutral-400">
                    <Mail className="h-4 w-4 hover:text-[color:var(--t10-emerald)]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
