import { 
  Calendar, 
  Clock, 
  Video, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Star,
  ChevronRight,
  FileText,
  CircleDollarSign
} from "lucide-react";


function ConsultantDashboardHome() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Good morning, Amina</h1>
          <p className="text-neutral-500 text-sm mt-1">Here is what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
            Update Availability
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Consultation Card (High Priority) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[color:var(--t10-emerald)] shadow-sm overflow-hidden">
          <div className="bg-[color:var(--t10-emerald)]/10 px-6 py-3 border-b border-[color:var(--t10-emerald)]/20 flex justify-between items-center">
            <span className="text-xs font-bold text-[color:var(--t10-emerald)] uppercase tracking-wider flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--t10-emerald)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--t10-emerald)]"></span>
              </span>
              Starting in 45 mins
            </span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Market Entry Strategy - E-commerce</h3>
                <p className="text-neutral-500 flex items-center gap-2 mt-2">
                  <Video className="w-4 h-4" /> Client: Sarah J. (Retail Holdings)
                </p>
                <p className="text-neutral-500 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" /> 10:30 AM - 11:30 AM GST
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Preparation Required
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-[color:var(--t10-emerald)] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[color:var(--t10-emerald)]/90 transition-colors flex justify-center items-center gap-2">
                Join Call Room
              </button>
              <button className="flex-1 bg-white border border-neutral-200 text-neutral-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors flex justify-center items-center gap-2">
                <FileText className="w-4 h-4" /> View Client Brief
              </button>
            </div>
          </div>
        </div>

        {/* Action Required / Alerts */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-bold text-neutral-900">Action Required</h3>
          </div>
          <div className="flex-1 p-0 overflow-y-auto">
            <ul className="divide-y divide-neutral-100">
              <li className="p-4 hover:bg-neutral-50 cursor-pointer flex gap-4 transition-colors">
                <div className="mt-0.5 bg-amber-100 p-1.5 rounded-full text-amber-600 h-fit">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Approve Session Report</p>
                  <p className="text-xs text-neutral-500 mt-1">Pending from yesterday's session with Ahmed M.</p>
                  <p className="text-xs font-semibold text-amber-600 mt-2">Due in 2 hours</p>
                </div>
              </li>
              <li className="p-4 hover:bg-neutral-50 cursor-pointer flex gap-4 transition-colors">
                <div className="mt-0.5 bg-red-100 p-1.5 rounded-full text-red-600 h-fit">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Identity Document Expiring</p>
                  <p className="text-xs text-neutral-500 mt-1">Please upload a new trade license or ID.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Summary */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Today's Sessions</h4>
            <Calendar className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">3</span>
            <span className="text-sm text-neutral-500">booked</span>
          </div>
        </div>

        {/* Performance Snapshot */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Quality Score</h4>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">4.9</span>
            <span className="text-sm text-[color:var(--t10-emerald)] flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> Top 10%</span>
          </div>
        </div>
        
        {/* Attendance */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Attendance</h4>
            <CheckCircle2 className="w-5 h-5 text-[color:var(--t10-emerald)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">100%</span>
            <span className="text-sm text-neutral-500">on-time</span>
          </div>
        </div>

        {/* Earnings Snapshot */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-neutral-500">Pending Payout</h4>
            <CircleDollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">$1,450</span>
            <span className="text-sm text-neutral-500">Due Aug 1</span>
          </div>
        </div>
      </div>
      
      {/* 7-Day Calendar Strip */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
          <h3 className="font-bold text-neutral-900">Your Week Ahead</h3>
          <button className="text-sm text-[color:var(--t10-emerald)] font-medium hover:underline flex items-center">
            View full calendar <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-7 gap-4">
          {[
            { day: 'Mon', date: '24', status: '3 Sessions', active: true },
            { day: 'Tue', date: '25', status: '2 Sessions', active: false },
            { day: 'Wed', date: '26', status: 'Off', active: false, off: true },
            { day: 'Thu', date: '27', status: '4 Sessions', active: false },
            { day: 'Fri', date: '28', status: '1 Session', active: false },
            { day: 'Sat', date: '29', status: 'Available', active: false },
            { day: 'Sun', date: '30', status: 'Off', active: false, off: true },
          ].map((col, i) => (
            <div 
              key={i} 
              className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                col.active 
                  ? 'border-[color:var(--t10-emerald)] bg-[color:var(--t10-emerald)]/5 ring-1 ring-[color:var(--t10-emerald)]' 
                  : col.off 
                    ? 'border-neutral-100 bg-neutral-50 text-neutral-400' 
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <span className={`text-xs font-semibold uppercase ${col.active ? 'text-[color:var(--t10-emerald)]' : ''}`}>{col.day}</span>
              <span className={`text-2xl font-bold mt-1 ${col.active ? 'text-[color:var(--t10-navy)]' : ''}`}>{col.date}</span>
              <span className={`text-[10px] mt-2 font-medium ${col.active ? 'text-[color:var(--t10-emerald)]' : 'text-neutral-500'}`}>{col.status}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default ConsultantDashboardHome;
