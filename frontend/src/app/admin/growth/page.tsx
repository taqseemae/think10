import { TrendingUp, BarChart3, LineChart, Users, MousePointerClick, Eye } from "lucide-react";


function GrowthAdminPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[color:var(--t10-emerald)]" />
          Growth & Content
        </h2>
        <p className="text-sm text-neutral-500 mt-1">Monitor marketing ROI, user acquisition funnel, and content engagement.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[color:var(--t10-emerald)]" />
                Acquisition Funnel
              </h3>
              <select className="text-xs border border-neutral-200 rounded p-1">
                <option>Last 30 Days</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {[
                { step: "Website Visitors", count: "45,210", percent: "100%", color: "bg-blue-100", icon: Eye },
                { step: "Sign Ups (Free)", count: "4,120", percent: "9.1%", color: "bg-indigo-100", icon: Users },
                { step: "Onboarding Completed", count: "2,840", percent: "6.2%", color: "bg-purple-100", icon: MousePointerClick },
                { step: "Paid Conversions", count: "412", percent: "0.9%", color: "bg-[color:var(--t10-mint)]", icon: TrendingUp },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${item.color} flex-shrink-0`}>
                    <item.icon className="h-5 w-5 text-neutral-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-semibold text-sm text-neutral-700">{item.step}</span>
                      <span className="font-bold text-neutral-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div className="bg-[color:var(--t10-emerald)] h-2 rounded-full" style={{ width: item.percent }}></div>
                    </div>
                  </div>
                  <div className="w-12 text-right text-xs font-bold text-neutral-400">
                    {item.percent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm text-center">
            <h3 className="font-bold text-neutral-500 uppercase tracking-wider text-xs mb-2">Customer Acquisition Cost</h3>
            <p className="text-4xl font-black text-[color:var(--t10-navy)]">AED 340</p>
            <p className="text-xs text-emerald-500 font-bold mt-2">-12% vs last month</p>
          </div>
          
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm text-center">
            <h3 className="font-bold text-neutral-500 uppercase tracking-wider text-xs mb-2">Customer Lifetime Value</h3>
            <p className="text-4xl font-black text-[color:var(--t10-navy)]">AED 14,500</p>
            <p className="text-xs text-emerald-500 font-bold mt-2">+5% vs last month</p>
          </div>
          
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-[color:var(--t10-navy)] flex items-center gap-2 mb-4">
              <LineChart className="h-5 w-5 text-[color:var(--t10-emerald)]" />
              Top Traffic Sources
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Organic Search</span>
                <span className="font-bold text-neutral-900">45%</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">LinkedIn Ads</span>
                <span className="font-bold text-neutral-900">30%</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Direct</span>
                <span className="font-bold text-neutral-900">15%</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Referrals</span>
                <span className="font-bold text-neutral-900">10%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GrowthAdminPage;
