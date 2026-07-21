import { createFileRoute } from "@tanstack/react-router";
import { CircleDollarSign, TrendingUp, Download, DollarSign, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import { useAdminState } from "@/context/AdminStateContext";

export const Route = createFileRoute("/admin/finance")({
  component: FinanceAdminPage,
});

function FinanceAdminPage() {
  const { metrics } = useAdminState();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--t10-navy)] flex items-center gap-2">
            <CircleDollarSign className="h-6 w-6 text-[color:var(--t10-emerald)]" />
            Revenue & Finance
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Track MRR, monitor transactions, and manage advisor payouts.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-[color:var(--t10-emerald)] text-white rounded-lg text-sm font-bold hover:bg-[color:var(--t10-green)] transition-colors">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[color:var(--t10-mint)] rounded-xl text-[color:var(--t10-emerald)]">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3" /> +12.5%
            </span>
          </div>
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Total MRR</h3>
          <p className="text-4xl font-black text-[color:var(--t10-navy)]">AED {metrics.mrr.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3" /> +8.2%
            </span>
          </div>
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Gross Volume</h3>
          <p className="text-4xl font-black text-[color:var(--t10-navy)]">AED 1,245,000</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <FileText className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
              <ArrowDownRight className="h-3 w-3" /> -2.1%
            </span>
          </div>
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Pending Payouts</h3>
          <p className="text-4xl font-black text-[color:var(--t10-navy)]">AED 45,200</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[color:var(--t10-navy)] mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {[
                { id: "TXN-001", desc: "Premium Plan - Annual", customer: "TechCorp Inc.", date: "Today, 10:45 AM", amount: "AED 12,000", status: "Succeeded" },
                { id: "TXN-002", desc: "ZynePaid Plan - Monthly", customer: "Global Trade LLC", date: "Today, 09:12 AM", amount: "AED 500", status: "Succeeded" },
                { id: "TXN-003", desc: "Advisory Session (1 hr)", customer: "StartUp Node", date: "Yesterday, 14:30 PM", amount: "AED 1,200", status: "Pending" },
                { id: "TXN-004", desc: "Premium Plan - Annual", customer: "Alpha Holdings", date: "Yesterday, 11:00 AM", amount: "AED 12,000", status: "Failed" },
              ].map((txn) => (
                <tr key={txn.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-neutral-500">{txn.id}</td>
                  <td className="px-6 py-4 font-medium text-neutral-900">{txn.desc}</td>
                  <td className="px-6 py-4 text-neutral-600">{txn.customer}</td>
                  <td className="px-6 py-4 text-neutral-500">{txn.date}</td>
                  <td className="px-6 py-4 font-bold text-neutral-900">{txn.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      txn.status === 'Succeeded' ? 'bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]' :
                      txn.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
