import { Star, TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck, Award, FileText } from "lucide-react";


function ConsultantPerformance() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Performance & Quality</h1>
        <p className="text-neutral-500 text-sm mt-1">Monitor your Advisor Quality Score, attendance, and client reviews.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Quality Score */}
        <div className="md:col-span-1 bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-6">Advisor Quality Score</h3>
          
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-neutral-100" />
              <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="440" strokeDashoffset="44" className="text-[color:var(--t10-emerald)]" />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-4xl font-bold text-neutral-900">92</span>
              <span className="text-sm text-neutral-500 block">/ 100</span>
            </div>
          </div>
          
          <div className="mt-6 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-[color:var(--t10-emerald)] ring-1 ring-inset ring-[color:var(--t10-emerald)]/20">
            <ShieldCheck className="w-4 h-4 mr-1.5" /> Excellent Standing
          </div>
        </div>

        {/* Breakdown Metrics */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-neutral-900">Client Rating</h4>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neutral-900">4.9</span>
                <span className="text-sm text-neutral-500">avg</span>
              </div>
              <p className="text-xs text-[color:var(--t10-emerald)] flex items-center mt-2"><TrendingUp className="w-3 h-3 mr-1"/> Based on 34 reviews</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-neutral-900">Attendance</h4>
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neutral-900">100%</span>
                <span className="text-sm text-neutral-500">on-time</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">0 missed sessions</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-neutral-900">Repeat Booking Rate</h4>
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neutral-900">42%</span>
              </div>
              <p className="text-xs text-[color:var(--t10-emerald)] flex items-center mt-2">Above platform average (28%)</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-neutral-900">Report Timeliness</h4>
              <FileText className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neutral-900">95%</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">Approved within 24h target</p>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Reviews */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="font-bold text-neutral-900">Recent Public Reviews</h3>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-neutral-100">
              <li className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-xs text-neutral-500">2 days ago</span>
                </div>
                <p className="text-sm text-neutral-800">"Dr. Amina provided incredibly sharp insights into our logistics operations. The action plan generated after our call gave us a clear roadmap for the next 90 days."</p>
              </li>
              <li className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-xs text-neutral-500">1 week ago</span>
                </div>
                <p className="text-sm text-neutral-800">"Very professional and deeply knowledgeable about the GCC e-commerce landscape."</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Warnings & Learning */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-bold text-neutral-900">Warnings & Required Action</h3>
          </div>
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-50 p-4 rounded-full text-[color:var(--t10-emerald)] mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-neutral-900 mb-1">No Active Warnings</h4>
            <p className="text-sm text-neutral-500 max-w-sm">Your account is in good standing. There are no quality flags, policy violations, or required training modules at this time.</p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default ConsultantPerformance;
