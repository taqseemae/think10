import { createFileRoute } from "@tanstack/react-router";
import { useAdminState } from "@/context/AdminStateContext";
import {
  TrendingUp,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BrainCircuit,
  CreditCard,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: CommandCentre,
});

function CommandCentre() {
  const { adminRole, metrics, tasks, resolveTask } = useAdminState();

  // Filter tasks based on role (Super Admin sees all, otherwise matching ownerRole)
  const visibleTasks = adminRole === "Super Admin" || adminRole === "Founder / Executive" 
    ? tasks 
    : tasks.filter(t => t.ownerRole === adminRole);

  const pendingTasks = visibleTasks.filter(t => t.status !== "Resolved");
  const resolvedTasks = visibleTasks.filter(t => t.status === "Resolved");

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[color:var(--t10-navy)]">Command Centre</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Welcome back. You are viewing the <strong className="text-[color:var(--t10-emerald)]">{adminRole}</strong> cockpit.
        </p>
      </div>

      {/* Top Status Bar (Platform availability etc.) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard title="Platform Uptime" value="99.98%" status="good" icon={CheckCircle2} />
        <StatusCard title="Payment Gateway" value="Operational" status="good" icon={CreditCard} />
        <StatusCard title="AI / Zyne API" value="Operational" status="good" icon={BrainCircuit} />
        <StatusCard title="Critical Incidents" value="0 Active" status="good" icon={AlertTriangle} />
      </div>

      {/* Commercial & Service Scorecards */}
      {["Super Admin", "Founder / Executive", "Data / Analyst", "Finance"].includes(adminRole) && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[color:var(--t10-navy)] border-b border-neutral-200 pb-2">Commercial & Service Scorecards</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <MetricCard 
              title="Monthly Recurring Revenue" 
              value={`AED ${metrics.mrr.toLocaleString()}`} 
              trend="+12% MoM" 
              icon={TrendingUp} 
            />
            <MetricCard 
              title="Active Paid Subscriptions" 
              value={metrics.activePaidUsers.toLocaleString()} 
              trend="+24 this week" 
              icon={Users} 
            />
            <MetricCard 
              title="Pending Verification" 
              value={metrics.pendingVerifications.toString()} 
              trend="-2 since yesterday" 
              icon={Briefcase} 
            />
          </div>
        </div>
      )}

      {/* Role-based work queues (My Tasks) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[color:var(--t10-navy)] border-b border-neutral-200 pb-2">My Task & Approval Queue</h3>
        
        {pendingTasks.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-500 shadow-sm">
            <CheckCircle2 className="mx-auto h-8 w-8 text-neutral-300 mb-3" />
            <p>You have no pending tasks or approvals in your queue.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingTasks.map(task => (
              <div key={task.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                      {task.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${task.priority === "High" ? "bg-red-50 text-red-600" : task.priority === "Medium" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[color:var(--t10-navy)] leading-snug">
                    {task.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Assigned to: {task.ownerRole}
                  </p>
                </div>
                
                <div className="mt-5 flex gap-2">
                  <button 
                    onClick={() => resolveTask(task.id)}
                    className="flex-1 bg-[color:var(--t10-emerald)] text-white text-xs font-bold py-2 rounded-lg hover:bg-[color:var(--t10-green)] transition-colors"
                  >
                    Resolve / Approve
                  </button>
                  <button className="flex-1 border border-neutral-200 bg-white text-neutral-700 text-xs font-bold py-2 rounded-lg hover:bg-neutral-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {resolvedTasks.length > 0 && (
        <div className="pt-8">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Recently Resolved</h3>
          <ul className="space-y-2">
            {resolvedTasks.map(task => (
              <li key={task.id} className="flex items-center gap-3 text-sm text-neutral-500 bg-neutral-50 px-4 py-3 rounded-lg border border-neutral-100">
                <CheckCircle2 className="h-4 w-4 text-[color:var(--t10-emerald)]" />
                <span className="line-through">{task.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatusCard({ title, value, status, icon: Icon }: any) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-full ${status === 'good' ? 'bg-emerald-50 text-[color:var(--t10-emerald)]' : 'bg-red-50 text-red-500'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-neutral-500 font-medium">{title}</p>
        <p className="text-sm font-bold text-[color:var(--t10-navy)] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon }: any) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-5 opacity-5">
        <Icon className="h-16 w-16" />
      </div>
      <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">{title}</p>
      <h4 className="text-3xl font-black text-[color:var(--t10-navy)] mt-2">{value}</h4>
      <p className="text-xs font-medium text-[color:var(--t10-emerald)] mt-3 bg-[color:var(--t10-mint)] inline-block px-2 py-1 rounded">
        {trend}
      </p>
    </div>
  );
}
