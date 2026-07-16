import { createFileRoute, Link } from "@tanstack/react-router";
import { useDashboardState, type HealthScores } from "@/context/DashboardStateContext";
import { useState } from "react";
import {
  Sparkles,
  User,
  Calendar,
  AlertTriangle,
  FolderOpen,
  LineChart,
  CheckCircle,
  HelpCircle,
  Clock,
  History,
  TrendingUp,
  FileText,
  Plus,
  Trash2,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/business-profile")({ component: Page });

const HEALTH_DIMENSIONS = [
  { key: "valueProp", label: "Value Prop & Innovation", desc: "GCC market differentiation and unique product value." },
  { key: "marketFit", label: "Product Market Fit", desc: "Purchase velocity and organic search demand." },
  { key: "unitEconomics", label: "Unit Economics & Pricing", desc: "Gross margins after fulfillment and ad spends." },
  { key: "channelEfficiency", label: "Channel Efficiency", desc: "Listing quality and conversion on UAE channels." },
  { key: "operations", label: "Operations & Fulfillment", desc: "Warehouse turnaround and review ratings." },
  { key: "teamOrg", label: "Team & Org Structure", desc: "Hiring alignment and core competencies." },
  { key: "marketingRoi", label: "Marketing ROI", desc: "Spend efficiency on Meta, TikTok, Google." },
  { key: "cashFlow", label: "Cash Flow & Runway", desc: "Receivables, payables, and burn rate management." },
  { key: "supplyChain", label: "Supply Chain & Sourcing", desc: "Lead time reliability and customs clearing." },
  { key: "systems", label: "Systems & AI Automation", desc: "Use of SOPs, automated reports, and AI helper tools." },
];

function Page() {
  const {
    profile,
    updateProfileField,
    profileAuditLogs,
    healthScores,
    updateHealthScores,
    healthAssessmentHistory,
    calculateOverallHealthScore,
  } = useDashboardState();

  const [activeTab, setActiveTab] = useState<"PROFILE" | "HEALTH" | "KPIS" | "AUDIT">("PROFILE");

  // Profile Form States
  const [nameInput, setNameInput] = useState(profile.businessName);
  const [stageInput, setStageInput] = useState(profile.stage);
  const [industryInput, setIndustryInput] = useState(profile.industry);
  const [revInput, setRevInput] = useState(profile.revenue);
  const [teamInput, setTeamInput] = useState(profile.teamSize);
  
  // Custom arrays
  const [goalsList, setGoalsList] = useState([...profile.goals]);
  const [newGoal, setNewGoal] = useState("");
  const [challengesList, setChallengesList] = useState([...profile.challenges]);
  const [newChallenge, setNewChallenge] = useState("");

  // Health Assessment local states
  const [localScores, setLocalScores] = useState({ ...healthScores });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileField("businessName", nameInput);
    updateProfileField("stage", stageInput);
    updateProfileField("industry", industryInput);
    updateProfileField("revenue", revInput);
    updateProfileField("teamSize", teamInput);
    updateProfileField("goals", goalsList);
    updateProfileField("challenges", challengesList);
  };

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    setGoalsList((prev) => [...prev, newGoal.trim()]);
    setNewGoal("");
  };

  const handleAddChallenge = () => {
    if (!newChallenge.trim()) return;
    setChallengesList((prev) => [...prev, newChallenge.trim()]);
    setNewChallenge("");
  };

  const handleSaveHealthScores = () => {
    updateHealthScores(localScores);
  };

  // Generate priority advice based on lowest scores
  const priorityAdvice = Object.entries(healthScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([key, val]) => {
      const dim = HEALTH_DIMENSIONS.find((d) => d.key === key);
      let actionAdvice = "";
      if (key === "marketingRoi") actionAdvice = "Audit Meta ad accounts. Consider scheduling with Layla Hassan.";
      else if (key === "cashFlow") actionAdvice = "Calibrate a 13-week runway scenario. Consult Priya Menon.";
      else if (key === "supplyChain") actionAdvice = "Map safety stock parameters. Read UAE Sourcing guide.";
      else actionAdvice = "Leverage Zyne VC to audit dimension details.";

      return {
        dimension: dim?.label || key,
        score: val,
        advice: actionAdvice,
      };
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[color:var(--t10-navy)]">My Business</h2>
          <p className="text-sm text-[color:var(--t10-grey)]">
            Manage your persistent business profile, audit log history, and check 10-dimension health.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-lg border border-[color:var(--t10-border)] bg-white p-1 text-xs">
          {[
            { id: "PROFILE", label: "Profile", Icon: FolderOpen },
            { id: "HEALTH", label: "Health Check", Icon: LineChart },
            { id: "KPIS", label: "Goals & KPIs", Icon: TrendingUp },
            { id: "AUDIT", label: "Audit logs", Icon: History },
          ].map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${active ? "bg-[color:var(--t10-navy)] text-white shadow-sm" : "text-[color:var(--t10-grey)] hover:bg-neutral-100"}`}
              >
                <t.Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PROFILE FORM */}
      {activeTab === "PROFILE" && (
        <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider mb-4 border-b border-[color:var(--t10-border)] pb-2">
            Configure Business Parameters
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs text-[color:var(--t10-navy)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-semibold">Business Name</span>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-semibold">GCC Category / Sector</span>
                <select
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  className="w-full rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2"
                >
                  <option value="Beauty & personal care">Beauty & personal care</option>
                  <option value="Fashion & Apparels">Fashion & Apparels</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="FMCG & Goods">FMCG & Goods</option>
                  <option value="Software & Tech">Software & Tech</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block font-semibold">Business Stage</span>
                <select
                  value={stageInput}
                  onChange={(e) => setStageInput(e.target.value)}
                  className="w-full rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2"
                >
                  <option value="Idea stage">Idea stage / Planning</option>
                  <option value="Operating 1 year">Operating under 1 year</option>
                  <option value="Operating 2 years">Operating 2 years</option>
                  <option value="Scaling GCC (3+ years)">Scaling GCC (3+ years)</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block font-semibold">Team Size</span>
                  <input
                    type="text"
                    value={teamInput}
                    onChange={(e) => setTeamInput(e.target.value)}
                    className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-semibold">Annual Revenue (est.)</span>
                  <input
                    type="text"
                    value={revInput}
                    onChange={(e) => setRevInput(e.target.value)}
                    className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2"
                  />
                </label>
              </div>
            </div>

            {/* Goals & Challenges Lists */}
            <div className="grid gap-6 sm:grid-cols-2 border-t border-[color:var(--t10-border)] pt-4">
              {/* Goals */}
              <div className="space-y-3">
                <span className="font-semibold text-neutral-500 uppercase tracking-wide text-[10px]">
                  Strategic Goals
                </span>
                <ul className="space-y-1.5">
                  {goalsList.map((g, idx) => (
                    <li key={idx} className="flex items-center justify-between rounded bg-[color:var(--t10-offwhite)] px-2.5 py-1.5 border border-[color:var(--t10-border)]">
                      <span>{g}</span>
                      <button
                        type="button"
                        onClick={() => setGoalsList(goalsList.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add new goal..."
                    className="flex-1 rounded border border-[color:var(--t10-border)] px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="rounded bg-[color:var(--t10-navy)] px-3 text-white text-[11px] font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Challenges */}
              <div className="space-y-3">
                <span className="font-semibold text-neutral-500 uppercase tracking-wide text-[10px]">
                  Current Challenges
                </span>
                <ul className="space-y-1.5">
                  {challengesList.map((c, idx) => (
                    <li key={idx} className="flex items-center justify-between rounded bg-[color:var(--t10-offwhite)] px-2.5 py-1.5 border border-[color:var(--t10-border)]">
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => setChallengesList(challengesList.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    value={newChallenge}
                    onChange={(e) => setNewChallenge(e.target.value)}
                    placeholder="Add new challenge..."
                    className="flex-1 rounded border border-[color:var(--t10-border)] px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddChallenge}
                    className="rounded bg-[color:var(--t10-navy)] px-3 text-white text-[11px] font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[color:var(--t10-emerald)] px-5 py-2.5 font-bold text-white hover:bg-[color:var(--t10-green)] transition-all shadow"
            >
              Save Profile changes (Logs Audits)
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: HEALTH CHECK ASSESSMENT */}
      {activeTab === "HEALTH" && (
        <div className="space-y-6">
          {/* Main Health Card */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center border-r border-[color:var(--t10-border)] pr-6 text-center">
              <span className="text-[10px] font-bold text-[color:var(--t10-grey)] uppercase tracking-wider">
                Overall Business Health
              </span>
              <div className="mt-3 relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)]">
                <span className="text-3xl font-bold text-[color:var(--t10-navy)]">
                  {calculateOverallHealthScore()}%
                </span>
              </div>
              <p className="mt-2 text-xs text-[color:var(--t10-grey)] leading-tight">
                Calculated across 10 core parameters. Advisory diagnostics only.
              </p>
            </div>

            {/* Sliders panel */}
            <div className="md:col-span-2 space-y-4 max-h-[300px] overflow-y-auto pr-2">
              <span className="text-xs font-bold text-[color:var(--t10-navy)] uppercase tracking-wider block">
                Adjust Health Scores
              </span>
              {HEALTH_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="space-y-1 rounded border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] p-2.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>{dim.label}</span>
                    <span className="font-bold text-[color:var(--t10-emerald)]">
                      {localScores[dim.key as keyof HealthScores]} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={localScores[dim.key as keyof HealthScores]}
                    onChange={(e) =>
                      setLocalScores({ ...localScores, [dim.key]: parseInt(e.target.value) })
                    }
                    className="w-full accent-[color:var(--t10-emerald)] cursor-pointer"
                  />
                </div>
              ))}
              <button
                onClick={handleSaveHealthScores}
                className="w-full rounded bg-[color:var(--t10-navy)] py-2 text-center text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
              >
                Re-calculate & Record Audit Log
              </button>
            </div>
          </div>

          {/* Priority gap recommendations */}
          <div className="rounded-2xl border border-red-200 bg-red-50/20 p-5 space-y-3">
            <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" /> Critical Priority Gaps
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              {priorityAdvice.map((adv, idx) => (
                <div key={idx} className="rounded-lg bg-white border border-red-100 p-3 space-y-1">
                  <span className="font-bold text-[color:var(--t10-navy)]">{adv.dimension}</span>
                  <p className="text-[11px] text-[color:var(--t10-grey)]">Score: {adv.score} / 10</p>
                  <p className="text-[11px] text-red-700 font-semibold leading-normal pt-1.5 border-t border-red-50">
                    {adv.advice}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* History ledger */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">
              Assessment Runs History
            </h4>
            <div className="divide-y divide-[color:var(--t10-border)] text-xs">
              {healthAssessmentHistory.map((hist, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <span className="text-[color:var(--t10-grey)]">{hist.timestamp}</span>
                  <span className="font-bold text-[color:var(--t10-navy)]">
                    Overall Health Score: {hist.totalScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOALS & KPIS */}
      {activeTab === "KPIS" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* KPI Dashboard */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2">
              Performance Trackers
            </h3>
            
            {/* Simulated mini graphs */}
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-neutral-100 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Monthly Sales</span>
                  <p className="text-lg font-bold text-[color:var(--t10-navy)]">AED 205,000</p>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 text-[10px] flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +12.4%
                </span>
              </div>

              <div className="rounded-xl border border-neutral-100 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Meta CPA Average</span>
                  <p className="text-lg font-bold text-[color:var(--t10-navy)]">AED 84.50</p>
                </div>
                <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-800 text-[10px] flex items-center gap-0.5">
                  <AlertTriangle className="h-3 w-3" /> +4.2%
                </span>
              </div>

              <div className="rounded-xl border border-neutral-100 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Conversion Rate</span>
                  <p className="text-lg font-bold text-[color:var(--t10-navy)]">1.62%</p>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 text-[10px] flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +0.15%
                </span>
              </div>
            </div>
          </div>

          {/* Goal verification panel */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2">
              Action Plan Goals checklists
            </h3>
            <ul className="space-y-3 text-xs leading-normal">
              {profile.goals.map((goal, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-[color:var(--t10-navy)]">{goal}</p>
                    <p className="text-[10px] text-[color:var(--t10-grey)]">Linked to Action items checklist.</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG HISTORY */}
      {activeTab === "AUDIT" && (
        <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-2">
            <h3 className="text-sm font-bold text-[color:var(--t10-navy)] uppercase tracking-wider">
              Profile Change Audits Log
            </h3>
            <span className="text-xs font-semibold text-[color:var(--t10-grey)]">
              Auditable logs (immutable)
            </span>
          </div>

          <div className="overflow-x-auto text-[11px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-[color:var(--t10-grey)] font-semibold">
                  <th className="py-2">Timestamp</th>
                  <th className="py-2">Field</th>
                  <th className="py-2">Previous Value</th>
                  <th className="py-2">New Value</th>
                  <th className="py-2">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[color:var(--t10-navy)]">
                {profileAuditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 font-mono text-neutral-500">{log.timestamp}</td>
                    <td className="py-2.5 font-bold text-blue-800">{log.field}</td>
                    <td className="py-2.5 truncate max-w-xs" title={log.oldValue}>
                      {log.oldValue.length > 50 ? log.oldValue.substr(0, 50) + "..." : log.oldValue}
                    </td>
                    <td className="py-2.5 truncate max-w-xs font-medium" title={log.newValue}>
                      {log.newValue.length > 50 ? log.newValue.substr(0, 50) + "..." : log.newValue}
                    </td>
                    <td className="py-2.5 font-semibold text-neutral-600">{log.user}</td>
                  </tr>
                ))}
                {profileAuditLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center italic text-neutral-400">
                      No parameters changed yet. Edits will generate logs instantly.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
