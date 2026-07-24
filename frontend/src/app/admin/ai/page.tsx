import { BrainCircuit, Cpu, MessageSquare, Zap, Activity } from "lucide-react";


function AIAdminPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-[color:var(--t10-emerald)]" />
          Zyne & AI Operations
        </h2>
        <p className="text-sm text-neutral-500 mt-1">Monitor Zyne AI token usage, API health, and generation metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Cpu className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-neutral-700">Token Usage</h3>
          </div>
          <p className="text-3xl font-black text-[color:var(--t10-navy)]">1.2M</p>
          <p className="text-xs text-neutral-500 mt-1">Tokens consumed this month</p>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><MessageSquare className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-neutral-700">Conversations</h3>
          </div>
          <p className="text-3xl font-black text-[color:var(--t10-navy)]">4,521</p>
          <p className="text-xs text-neutral-500 mt-1">Total Zyne interactions</p>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Zap className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-neutral-700">Avg Latency</h3>
          </div>
          <p className="text-3xl font-black text-[color:var(--t10-navy)]">1.4s</p>
          <p className="text-xs text-neutral-500 mt-1">Response time</p>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[color:var(--t10-mint)] rounded-lg text-[color:var(--t10-emerald)]"><Activity className="h-5 w-5" /></div>
            <h3 className="text-sm font-bold text-neutral-700">API Health</h3>
          </div>
          <p className="text-3xl font-black text-[color:var(--t10-emerald)]">100%</p>
          <p className="text-xs text-neutral-500 mt-1">Gemini API status</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[color:var(--t10-navy)] mb-4">Recent AI Generations</h3>
        <div className="space-y-4">
          {[
            { type: "Business Plan", user: "TechCorp Inc.", tokens: 450, time: "2 mins ago" },
            { type: "Market Analysis", user: "Global Trade LLC", tokens: 820, time: "15 mins ago" },
            { type: "Financial Forecast", user: "StartUp Node", tokens: 310, time: "1 hour ago" },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg bg-neutral-50">
              <div className="flex items-center gap-4">
                <BrainCircuit className="h-5 w-5 text-[color:var(--t10-emerald)]" />
                <div>
                  <p className="font-semibold text-neutral-900">{log.type}</p>
                  <p className="text-xs text-neutral-500">Generated for {log.user}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-700">{log.tokens} tokens</p>
                <p className="text-xs text-neutral-500">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIAdminPage;
