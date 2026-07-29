import { createFileRoute } from "@tanstack/react-router";
import { Search, Building2, Clock, FileText, Lock } from "lucide-react";
import { useConsultantState } from "@/context/ConsultantStateContext";
import { useState } from "react";

export const Route = createFileRoute("/consultant/clients")({
  component: ConsultantClients,
});

function ConsultantClients() {
  const { bookings } = useConsultantState();
  
  // Extract unique clients from bookings with real user data
  const uniqueClients = Array.from(new Set(bookings.map((b) => b.userId || b.userEmail || b.id))).map((idKey) => {
    const clientBookings = bookings.filter((b) => (b.userId || b.userEmail || b.id) === idKey);
    const firstBooking = clientBookings[0];
    const name = firstBooking?.userName || firstBooking?.userEmail || (idKey ? `Client ${idKey.substring(0, 6)}` : "Client");
    const email = firstBooking?.userEmail || "No email logged";
    const challenge = firstBooking?.preCallAnswers?.challenge || firstBooking?.topic || "Advisory Client";

    return {
      id: idKey,
      name,
      email,
      company: challenge,
      bookings: clientBookings,
    };
  });

  const [activeClientId, setActiveClientId] = useState<string | null>(uniqueClients.length > 0 ? uniqueClients[0].id : null);

  const activeClient = uniqueClients.find(c => c.id === activeClientId);
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-display">Permitted Client History</h1>
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
            <h3 className="font-semibold text-neutral-900">My Clients ({uniqueClients.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-neutral-100">
              {uniqueClients.length === 0 && (
                <li className="p-4 text-center text-neutral-500 text-xs">No clients found yet.</li>
              )}
              {uniqueClients.map((client) => {
                const isActive = client.id === activeClientId;
                return (
                  <li 
                    key={client.id}
                    onClick={() => setActiveClientId(client.id)}
                    className={`p-4 cursor-pointer transition-colors ${isActive ? 'bg-[color:var(--t10-mint)] border-l-4 border-l-[color:var(--t10-emerald)]' : 'hover:bg-neutral-50 border-l-4 border-l-transparent'}`}
                  >
                    <h4 className={`font-bold text-sm ${isActive ? 'text-[color:var(--t10-emerald)]' : 'text-neutral-900'}`}>{client.name}</h4>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{client.email}</p>
                    <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-1 truncate">
                      <Building2 className="w-3 h-3 shrink-0" /> {client.company}
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
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-[color:var(--t10-navy)] flex items-center justify-center text-white font-bold text-xl uppercase">
                        {activeClient.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-neutral-900">{activeClient.name}</h2>
                        <p className="text-xs text-neutral-500">{activeClient.email}</p>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Active Engagement
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Total Sessions</p>
                    <p className="text-xl font-bold text-neutral-900">{activeClient.bookings.length}</p>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-xl font-bold text-emerald-600">Active Client</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
                  <h3 className="font-bold text-neutral-900 text-sm">Booking History & Pre-Call Data</h3>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Lock className="w-3 h-3 text-[color:var(--t10-emerald)]" /> Encrypted Access
                  </div>
                </div>
                
                <div className="p-0">
                  <ul className="divide-y divide-neutral-100">
                    {activeClient.bookings.map((b: any) => (
                      <li key={b.id} className="p-4 hover:bg-neutral-50 transition-colors space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 p-2 rounded-lg text-[color:var(--t10-emerald)]">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 text-sm">{b.topic || "Strategy Session"}</p>
                              <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" /> {b.when || b.startTime || "Scheduled"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-[color:var(--t10-emerald)] border border-emerald-200 uppercase">
                            {b.status}
                          </span>
                        </div>

                        {b.preCallAnswers && (b.preCallAnswers.challenge || b.preCallAnswers.questions) && (
                          <div className="mt-2 text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-1">
                            {b.preCallAnswers.challenge && (
                              <p><span className="font-bold text-neutral-700">Challenge:</span> {b.preCallAnswers.challenge}</p>
                            )}
                            {b.preCallAnswers.questions && (
                              <p><span className="font-bold text-neutral-700">Questions:</span> {b.preCallAnswers.questions}</p>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 text-center text-neutral-500 text-sm">
              Select a client from the left menu to review history and session context.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
