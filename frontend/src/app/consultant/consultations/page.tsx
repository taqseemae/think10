import { Mic, Video, MonitorUp, PhoneOff, MessageSquare, FileText, CheckSquare, Settings, AlertCircle } from "lucide-react";


function ConsultantConsultations() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-neutral-900 rounded-xl p-4 flex justify-between items-center text-white shrink-0">
        <div>
          <h2 className="text-lg font-bold">E-commerce Supply Chain Optimization</h2>
          <p className="text-neutral-400 text-sm flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Recording Active (Consent Given) • 12:45 Elapsed
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl font-bold">47:15</p>
          <p className="text-xs text-neutral-400">Remaining</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 bg-black rounded-xl border border-neutral-800 overflow-hidden relative group flex items-center justify-center">
            {/* Mock Video Grid */}
            <div className="absolute inset-0 grid grid-cols-2 gap-1 bg-neutral-900">
              <div className="bg-neutral-800 flex items-center justify-center relative">
                <div className="h-24 w-24 rounded-full bg-neutral-700 flex items-center justify-center">
                  <span className="text-3xl text-neutral-500 font-bold">AM</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-sm">
                  Ahmed Al Mansoori (Client)
                </div>
              </div>
              <div className="bg-neutral-800 flex items-center justify-center relative">
                <div className="h-24 w-24 rounded-full bg-[color:var(--t10-navy)] flex items-center justify-center">
                  <span className="text-3xl text-white font-bold">YOU</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-sm">
                  Dr. Amina H. (Consultant)
                </div>
              </div>
            </div>

            {/* Floating Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-neutral-900/80 backdrop-blur-md p-2 rounded-2xl border border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white transition-colors">
                <MonitorUp className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-px h-8 bg-neutral-600 mx-1"></div>
              <button className="p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors">
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm min-h-0 overflow-hidden shrink-0">
          
          {/* Panel Tabs */}
          <div className="flex border-b border-neutral-200 shrink-0">
            <button className="flex-1 py-3 text-sm font-semibold border-b-2 border-[color:var(--t10-emerald)] text-[color:var(--t10-emerald)]">
              Brief
            </button>
            <button className="flex-1 py-3 text-sm font-semibold text-neutral-500 hover:text-neutral-700">
              Notes & AI
            </button>
            <button className="flex-1 py-3 text-sm font-semibold text-neutral-500 hover:text-neutral-700">
              Action Plan
            </button>
          </div>

          {/* Panel Content (Brief Tab) */}
          <div className="flex-1 p-5 overflow-y-auto">
            <h3 className="font-bold text-neutral-900 mb-4">Customer Context</h3>
            
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Company Stage</h4>
                <p className="text-neutral-800">Series A • Retail/Logistics • 50-100 employees</p>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Stated Problem</h4>
                <p className="text-neutral-800">Last-mile delivery costs have increased by 22% in the UAE market over the last two quarters. Need strategic advice on renegotiating 3PL contracts or building in-house micro-fulfillment.</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Provided Documents</h4>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900 text-xs">Q2_Logistics_Spend.pdf</p>
                      <p className="text-[10px] text-neutral-500">2.4 MB • Permitted view</p>
                    </div>
                  </div>
                  <button className="text-xs font-medium text-[color:var(--t10-emerald)]">View</button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4" /> AI Copilot Suggestion
                </h4>
                <p className="text-xs text-amber-700">
                  Client previously sought advice on <b>Inventory Management</b>. It may be relevant to ask if inventory distribution is contributing to last-mile inefficiencies.
                </p>
              </div>
            </div>

          </div>

          <div className="p-4 border-t border-neutral-200 shrink-0">
            <button className="w-full bg-neutral-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors">
              Draft Post-Call Report
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ConsultantConsultations;
