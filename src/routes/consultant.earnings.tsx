import { createFileRoute } from "@tanstack/react-router";
import { CircleDollarSign, Download, ArrowUpRight, ArrowDownRight, Landmark, FileText, Clock } from "lucide-react";

export const Route = createFileRoute("/consultant/earnings")({
  component: ConsultantEarnings,
});

function ConsultantEarnings() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Earnings & Payouts</h1>
          <p className="text-neutral-500 text-sm mt-1">Track your revenue, view upcoming payouts, and download statements.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors flex justify-center items-center gap-2">
            <Landmark className="w-4 h-4" /> Bank Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Earned */}
        <div className="bg-[color:var(--t10-navy)] text-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-medium text-neutral-400 mb-2">Total Earned (YTD)</h4>
            <span className="text-4xl font-bold">$24,850</span>
          </div>
          <div className="mt-6 flex items-center text-sm text-[color:var(--t10-mint)]">
            <ArrowUpRight className="w-4 h-4 mr-1" /> +12% vs last year
          </div>
        </div>

        {/* Pending Payout */}
        <div className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-neutral-900 mb-2 flex items-center justify-between">
              Next Payout
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                Processing
              </span>
            </h4>
            <span className="text-4xl font-bold text-neutral-900">$1,450</span>
          </div>
          <div className="mt-6 flex items-center text-sm text-neutral-500">
            <Clock className="w-4 h-4 mr-1.5" /> Scheduled for Aug 1, 2026
          </div>
        </div>

        {/* Current Balance (Unsettled) */}
        <div className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-neutral-900 mb-2">Current Period</h4>
            <span className="text-4xl font-bold text-neutral-900">$450</span>
            <p className="text-xs text-neutral-500 mt-1">Accumulated since last cutoff</p>
          </div>
          <div className="mt-6 w-full bg-neutral-100 rounded-full h-1.5">
            <div className="bg-[color:var(--t10-emerald)] h-1.5 rounded-full" style={{ width: '30%' }}></div>
          </div>
        </div>

      </div>

      {/* Ledger / Transactions */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
          <h3 className="font-bold text-neutral-900">Recent Transactions</h3>
          <button className="text-sm font-medium text-[color:var(--t10-emerald)] hover:underline flex items-center gap-1">
            <Download className="w-4 h-4" /> Download Statement
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-white border-b border-neutral-200 text-xs uppercase font-semibold text-neutral-500">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">Jul 22, 2026</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-neutral-900">Consultation: Market Entry Strategy</p>
                  <p className="text-xs text-neutral-500">Ref: BK-93821 • Gross: $250 • Comm: -$50</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                    Eligible
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-neutral-900">+$200.00</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-neutral-400 hover:text-[color:var(--t10-emerald)]"><FileText className="w-4 h-4"/></button>
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">Jul 15, 2026</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-neutral-900">Payout: July 1 - July 15</p>
                  <p className="text-xs text-neutral-500">Transfer to Bank ending in 4092</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-[color:var(--t10-emerald)] ring-1 ring-inset ring-[color:var(--t10-emerald)]/20">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-neutral-900">-$1,850.00</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-neutral-400 hover:text-[color:var(--t10-emerald)]"><Download className="w-4 h-4"/></button>
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">Jul 14, 2026</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-neutral-900">Consultation: Supply Chain Audit</p>
                  <p className="text-xs text-neutral-500">Ref: BK-93780 • Gross: $250 • Comm: -$50</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Processed
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-neutral-900">+$200.00</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-neutral-400 hover:text-[color:var(--t10-emerald)]"><FileText className="w-4 h-4"/></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
