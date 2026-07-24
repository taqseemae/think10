import { createFileRoute } from "@tanstack/react-router";
import { Search, Building2, Clock, FileText, Lock } from "lucide-react";
import { useConsultantState } from "@/context/ConsultantStateContext";
import { useState } from "react";

export const Route = createFileRoute("/consultant/clients")({
  component: ConsultantClients,
});

function ConsultantClients() {
  const { bookings } = useConsultantState();
  
  // Extract unique clients from bookings
  const uniqueClients = Array.from(new Set(bookings.map(b => b.userId))).map(userId => {
    const clientBookings = bookings.filter(b => b.userId === userId);
    return {
      id: userId,
      name: "Client " + userId.substring(0, 5),
      company: "Client Business",
      bookings: clientBookings,
    };
  });

  const [activeClientId, setActiveClientId] = useState<string | null>(uniqueClients.length > 0 ? uniqueClients[0].id : null);

  const activeClient = uniqueClients.find(c => c.id === activeClientId);
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Permitted Client History</h1>
          <p className="text-neutral-500 text-sm mt-1">Review business context and past sessions for your assigned clients.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-sm focus:border-[color:var(--t10-emerald)] focus:outline-none focus:ring-1 focus:ring-[color:var(--t10-emerald)] shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Client List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="bg-neutral-50 p-4 border-b border-neutral-200">
            <h3 className="font-semibold text-neutral-900">My Clients</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-neutral-100">
              {uniqueClients.length === 0 && (
                <li className="p-4 text-center text-neutral-500">No clients yet.</li>
              )}
              {uniqueClients.map((client) => {
                const isActive = client.id === activeClientId;
                return (
                  <li 
                    key={client.id}
                    onClick={() => setActiveClientId(client.id)}
                    className={`p-4 cursor-pointer transition-colors ${isActive ? 'bg-[color:var(--t10-mint)] border-l-4 border-l-[color:var(--t10-emerald)]' : 'hover:bg-neutral-50 border-l-4 border-l-transparent'}`}
                  >
                    <h4 className={`font-bold ${isActive ? 'text-[color:var(--t10-emerald)]' : 'text-neutral-900'}`}>{client.name}</h4>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3" /> {client.company}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Client Detail View */}
        <div className="lg:col-span-2 space-y-6">
          {activeClient ? (
            <>
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-[color:var(--t10-navy)] flex items-center justify-center text-white font-bold text-xl">
                        {activeClient.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-neutral-900">{activeClient.name}</h2>
                        <p className="text-sm text-neutral-500">{activeClient.company} • Independent</p>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Active Engagement
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Total Sessions</p>
                    <p className="text-xl font-bold text-neutral-900">{activeClient.bookings.length}</p>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-xl font-bold text-neutral-900">Active</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
                  <h3 className="font-bold text-neutral-900">Booking History</h3>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Lock className="w-3 h-3" /> Access logged
                  </div>
                </div>
                
                <div className="p-0">
                  <ul className="divide-y divide-neutral-100">
                    {activeClient.bookings.map(b => (
                      <li key={b.id} className="p-4 hover:bg-neutral-50 transition-colors flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 text-sm">{b.topic || "Strategy Session"}</p>
                            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {b.when ? new Date(b.when).toLocaleString() : "TBD"}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-[color:var(--t10-emerald)]">{b.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 text-center text-neutral-500">
              Select a client to view details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
