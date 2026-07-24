import { CheckCircle2, Circle, MessageSquare, Calendar, Target, FileText } from "lucide-react";
import type { ReactNode } from "react";

export function DashboardVisual() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl backdrop-blur">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-[color:var(--t10-navy-2)] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">This week's priorities</h3>
            <span className="text-[11px] text-[color:var(--t10-mint)]/70">
              Auto-updated by Zyne
            </span>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { done: true, t: "Finalise 3 Amazon UAE hero SKUs" },
              { done: true, t: "Approve listing brief with Zyne" },
              { done: false, t: "60-min call with Layla — launch review" },
              { done: false, t: "Sign-off Ramadan campaign calendar" },
            ].map((p) => (
              <li key={p.t} className="flex items-start gap-2 text-white/85">
                {p.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--t10-green)]" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 text-white/40" />
                )}
                <span className={p.done ? "line-through opacity-70" : ""}>{p.t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-3">
          <StatRow
            icon={<MessageSquare className="h-4 w-4" />}
            label="Zyne chats"
            value="18"
            hint="+4 this week"
          />
          <StatRow
            icon={<Calendar className="h-4 w-4" />}
            label="Expert sessions"
            value="3"
            hint="Next: Thu 11:00"
          />
          <StatRow
            icon={<Target className="h-4 w-4" />}
            label="Active goals"
            value="5"
            hint="2 on track"
          />
          <StatRow
            icon={<FileText className="h-4 w-4" />}
            label="Documents"
            value="12"
            hint="Auto-summarised"
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <MiniCard
          title="Latest session summary"
          body="Layla — Amazon UAE launch readiness · 4 decisions, 6 actions"
        />
        <MiniCard title="Credits" body="8 of 12 used this month · Top-up available" />
        <MiniCard title="Progress" body="Launch plan · 62% complete" />
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[color:var(--t10-navy-2)] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--t10-emerald)]/15 text-[color:var(--t10-green)]">
          {icon}
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </div>
      </div>
      <span className="text-[11px] text-[color:var(--t10-mint)]/70">{hint}</span>
    </div>
  );
}

function MiniCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[color:var(--t10-navy-2)] p-4">
      <p className="text-[11px] uppercase tracking-wider text-white/50">{title}</p>
      <p className="mt-1 text-sm text-white/90">{body}</p>
    </div>
  );
}
