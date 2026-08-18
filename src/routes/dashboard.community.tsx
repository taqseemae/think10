import { createFileRoute, Link } from "@tanstack/react-router";
import { useDashboardState } from "@/context/DashboardStateContext";
import { getPublicConsultantsFn } from "@/lib/server-actions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  MessageSquare,
  Calendar,
  HelpCircle,
  Shield,
  ThumbsUp,
  UserPlus,
  Check,
  Send,
  Plus,
  X,
  Clock,
  ChevronRight,
  Info,
  Lock,
  CheckCircle,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/community")({
  component: CommunityPage,
});

function CommunityPage() {
  const {
    posts,
    addPost,
    likePost,
    addComment,
    connections,
    toggleConnection,
    tickets,
    createSupportTicket,
    role,
    resetAllData,
  } = useDashboardState();

  const [activeTab, setActiveTab] = useState<"BOARD" | "EVENTS" | "SUPPORT" | "PRIVACY">("BOARD");

  const { data: experts = [] } = useQuery({
    queryKey: ["public-consultants"],
    queryFn: () => getPublicConsultantsFn()
  });

  // Local posting states
  const [boardTopic, setBoardTopic] = useState("Launch");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [showAddPost, setShowAddPost] = useState(false);

  // Comment state per post ID
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});

  // Help Ticket States
  const [ticketCategory, setTicketCategory] = useState("Technical help");
  const [ticketDesc, setTicketDesc] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    addPost(boardTopic, postTitle, postContent);
    setPostTitle("");
    setPostContent("");
    setShowAddPost(false);
  };

  const handleSendComment = (postId: string) => {
    const input = commentInputMap[postId];
    if (!input || !input.trim()) return;

    addComment(postId, input.trim());
    setCommentInputMap((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDesc.trim()) return;

    createSupportTicket(ticketCategory, ticketDesc);
    setTicketDesc("");
    setSuccessMsg("Support ticket created successfully. Our team will review within 2 hours.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Mock Events List
  const events = [
    {
      id: "e1",
      title: "Ramadan Inventory Strategy Circle",
      desc: "Vetted experts outline safety stock reorder thresholds for Dubai shipping lanes.",
      time: "Wed 22 Jul · 10:00 GST",
      type: "Virtual Office Hours",
      slots: "8 slots remaining",
    },
    {
      id: "e2",
      title: "DTC Cost & CAC Optimization Circle",
      desc: "Analyze blended ad ROI models against GCC benchmarks. Bring your ad dashboards.",
      time: "Fri 24 Jul · 14:00 GST",
      type: "Founder Roundtable",
      slots: "5 slots remaining",
    },
  ];

  const [rsvpMap, setRsvpMap] = useState<Record<string, boolean>>({});

  // If user is Free: restrict premium community posts
  const isPremiumRestricted = role === "Free" || role === "Cancelled";

  return (
    <div className="space-y-6 animate-fade-in text-xs text-[color:var(--t10-navy)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Community & Support</h2>
          <p className="text-sm text-[color:var(--t10-grey)]">
            Network with UAE founders, attend expert office hours, and file support requests.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-lg border border-[color:var(--t10-border)] bg-white p-1">
          {[
            { id: "BOARD", label: "Forums", Icon: MessageSquare },
            { id: "EVENTS", label: "Office Hours", Icon: Calendar },
            { id: "SUPPORT", label: "Help Tickets", Icon: HelpCircle },
            { id: "PRIVACY", label: "Privacy Centre", Icon: Shield },
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

      {successMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: BOARD/FORUMS */}
      {activeTab === "BOARD" && (
        <div className="grid gap-6 md:grid-cols-[1fr_260px]">
          {/* Main Forum feed */}
          <div className="space-y-4">
            {isPremiumRestricted ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--t10-border)] bg-neutral-50 p-8 text-center max-w-md mx-auto space-y-4">
                <Lock className="h-10 w-10 text-neutral-400 mx-auto" />
                <h3 className="text-sm font-bold">Premium Forum Access Restricted</h3>
                <p className="text-[11px] text-[color:var(--t10-grey)] leading-normal">
                  Topic boards, connection requests, and expert office hours are available to paid
                  members. Upgrade your plan to unlock.
                </p>
                <Link
                  to="/dashboard/billing"
                  className="inline-block rounded bg-[color:var(--t10-navy)] px-4 py-2 font-bold text-white text-[11px]"
                >
                  View Pricing Plans
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white border border-[color:var(--t10-border)] rounded-xl p-3">
                  <div className="flex gap-2">
                    {["Launch", "Marketing", "Logistics"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setBoardTopic(t)}
                        className={`rounded-full px-3 py-1 font-bold ${boardTopic === t ? "bg-[color:var(--t10-mint)] text-[color:var(--t10-navy)] border border-emerald-100" : "text-[color:var(--t10-grey)] hover:bg-neutral-50"}`}
                      >
                        {t} Space
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAddPost(true)}
                    className="inline-flex items-center gap-1 rounded bg-[color:var(--t10-navy)] px-3 py-1.5 font-bold text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Start Thread
                  </button>
                </div>

                {/* Posts mapping */}
                {posts
                  .filter((p) => p.space === boardTopic)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[color:var(--t10-navy)]">{p.title}</h4>
                          <p className="text-[10px] text-[color:var(--t10-grey)] mt-0.5">
                            By {p.author} · {p.authorCompany} · {p.timestamp}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-[color:var(--t10-grey)]">
                        {p.content}
                      </p>

                      <div className="flex items-center gap-4 pt-3 border-t border-neutral-100 text-[10px] font-bold text-[color:var(--t10-grey)]">
                        <button
                          onClick={() => likePost(p.id)}
                          className={`flex items-center gap-1 hover:text-[color:var(--t10-emerald)] transition-colors ${p.likedByUser ? "text-[color:var(--t10-emerald)]" : ""}`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" /> {p.likes} Likes
                        </button>
                      </div>

                      {/* Comments section */}
                      <div className="bg-neutral-50 rounded-xl p-3 space-y-2 text-[10px]">
                        <p className="font-bold text-[color:var(--t10-grey)] uppercase tracking-wider">
                          Dialogue ({p.comments.length})
                        </p>
                        <div className="space-y-2">
                          {p.comments.map((c) => (
                            <div key={c.id} className="space-y-0.5">
                              <p className="font-semibold">
                                {c.author}{" "}
                                <span className="font-normal text-neutral-400">— {c.timestamp}</span>
                              </p>
                              <p className="text-[color:var(--t10-grey)] leading-normal">{c.content}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-1.5 pt-2 border-t border-neutral-200">
                          <input
                            value={commentInputMap[p.id] || ""}
                            onChange={(e) =>
                              setCommentInputMap({ ...commentInputMap, [p.id]: e.target.value })
                            }
                            placeholder="Add your advisory feedback..."
                            className="flex-1 rounded border border-neutral-200 bg-white px-2 py-1 text-xs"
                          />
                          <button
                            onClick={() => handleSendComment(p.id)}
                            className="rounded bg-[color:var(--t10-navy)] px-3 text-white"
                          >
                            <Send className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Sidebar: Member Connections */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-4 shadow-sm h-fit space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--t10-navy)] border-b border-[color:var(--t10-border)] pb-2 flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-[color:var(--t10-emerald)]" /> Member Connections
            </h3>

            {isPremiumRestricted ? (
              <p className="text-[10px] text-neutral-400 italic">No connection privileges.</p>
            ) : (
              <div className="space-y-3">
                {experts.map((exp: any) => {
                  const conn = connections[exp.slug] || "CONNECT";
                  return (
                    <div key={exp.slug} className="flex items-center justify-between gap-2 text-[10px]">
                      <div className="min-w-0">
                        <p className="font-bold truncate">{exp.name}</p>
                        <p className="text-neutral-400 truncate">{exp.role || "Consultant"}</p>
                      </div>
                      <button
                        onClick={() => toggleConnection(exp.slug)}
                        className={`px-2.5 py-1 rounded font-bold border transition-colors ${conn === "ACCEPTED" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : conn === "PENDING" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-neutral-300 hover:bg-neutral-50"}`}
                      >
                        {conn === "ACCEPTED" ? "Connected" : conn === "PENDING" ? "Pending" : "Connect"}
                      </button>
                    </div>
                  );
                })}
                {experts.length === 0 && (
                  <p className="text-xs text-neutral-500 py-4 italic">No approved consultants found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EVENTS RSVPS */}
      {activeTab === "EVENTS" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2">
            Vetted Expert Office Hours
          </h3>

          {isPremiumRestricted ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--t10-border)] bg-neutral-50 p-6 text-center italic text-neutral-400">
              RSVP features restricted for Free Preview members.
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((evt) => {
                const rsvped = rsvpMap[evt.id];
                return (
                  <div
                    key={evt.id}
                    className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-800 uppercase tracking-wide">
                          {evt.type}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">{evt.slots}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[color:var(--t10-navy)]">{evt.title}</h4>
                      <p className="text-[11px] text-[color:var(--t10-grey)] leading-relaxed">
                        {evt.desc}
                      </p>
                      <p className="text-[10px] text-[color:var(--t10-grey)] font-semibold">
                        Scheduled: {evt.time}
                      </p>
                    </div>

                    <button
                      onClick={() => setRsvpMap((prev) => ({ ...prev, [evt.id]: !rsvped }))}
                      className={`rounded-lg px-4 py-2 font-bold transition-all shadow-sm ${rsvped ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-[color:var(--t10-navy)] text-white hover:bg-neutral-800"}`}
                    >
                      {rsvped ? "RSVP Confirmed" : "RSVP Seat"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HELP TICKETS */}
      {activeTab === "SUPPORT" && (
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          {/* Create ticket form */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2">
              File Support Request
            </h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <label className="block text-xs">
                <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">Issue Category</span>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2 text-xs"
                >
                  <option value="Technical help">Technical help / Call room error</option>
                  <option value="Billing & Refunds">Billing & Refunds</option>
                  <option value="Advisor dispute">Advisor dispute / Complaint</option>
                  <option value="DIFC Privacy request">DIFC Privacy / Data deletion</option>
                </select>
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">
                  Description of Issue / Dispute
                </span>
                <textarea
                  rows={4}
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full rounded-md border border-[color:var(--t10-border)] p-2.5 text-xs outline-none focus:border-[color:var(--t10-emerald)]"
                  placeholder="Provide all relevant details. If requesting refunds for technical calls, describe the connection lost."
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-lg bg-[color:var(--t10-navy)] py-2 text-center text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow"
              >
                Submit Ticket (Auto SLAs Logged)
              </button>
            </form>
          </div>

          {/* Ticket tracker */}
          <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between h-[360px] overflow-hidden">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2 flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-[color:var(--t10-grey)]" /> Open Ticket Pipelines
              </h3>

              <div className="overflow-y-auto max-h-[220px] pr-1 space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-neutral-100 bg-[color:var(--t10-offwhite)] p-3 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-[color:var(--t10-navy)]">{t.category}</span>
                        <p className="text-[9px] text-neutral-400 mt-0.5">{t.createdAt} · {t.id}</p>
                      </div>
                      <span className="rounded bg-yellow-100 px-2 py-0.5 text-[8px] font-bold text-yellow-800 uppercase tracking-wide">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[color:var(--t10-grey)] leading-normal">
                      {t.description}
                    </p>
                    <div className="border-t border-neutral-200/50 pt-2 text-[10px] text-[color:var(--t10-grey)]">
                      <strong>Updates</strong>: {t.updates[0].message}
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <p className="text-xs text-[color:var(--t10-grey)] italic text-center py-10">
                    No active support tickets.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY CENTRE */}
      {activeTab === "PRIVACY" && (
        <div className="max-w-xl mx-auto rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[color:var(--t10-border)] pb-2 flex items-center gap-1.5">
            <Shield className="h-4.5 w-4.5 text-[color:var(--t10-emerald)]" /> DIFC Privacy Controls
          </h3>

          <div className="space-y-4 text-xs">
            <ToggleOption
              label="Allow Zyne VC to analyze shared library documents for chat context."
              defaultChecked
            />
            <ToggleOption
              label="Retain strategy call audio recordings for 90 days (default policy)."
              defaultChecked
            />
            <ToggleOption label="Permit verified marketplace advisors to request cost parameters before strategy calls." />
          </div>

          <div className="pt-6 border-t border-[color:var(--t10-border)] space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--t10-grey)]">
              Data Download & Account Deletion Requests
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSuccessMsg("DIFC Data Request Received! Preparing complete ZIP archive of your Cost logs, Health diagnostics, and Zyne chat history.");
                  setTimeout(() => setSuccessMsg(""), 5000);
                }}
                className="flex-1 rounded-lg border border-[color:var(--t10-navy)] py-2.5 font-bold text-[color:var(--t10-navy)] hover:bg-neutral-50 transition-colors shadow-sm"
              >
                Request Data Download (.zip)
              </button>
              <button
                onClick={() => {
                  if (confirm("MANDATORY WARNING: Under GCC policies, requesting account deletion will wipe your persistent profile parameters, ledger transaction balances, and Zyne memory logs. Proceed?")) {
                    resetAllData();
                  }
                }}
                className="flex-1 rounded-lg border border-red-200 py-2.5 font-bold text-red-600 hover:bg-red-50 transition-colors shadow-sm"
              >
                Delete Think10 Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Post Thread modal */}
      {showAddPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-3">
              <h3 className="text-sm font-bold text-[color:var(--t10-navy)]">Start Community Thread</h3>
              <button
                onClick={() => setShowAddPost(false)}
                className="rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <label className="block">
                <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">Thread Title</span>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Sourcing delays at Jebel Ali port"
                  className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">Post Description</span>
                <textarea
                  rows={4}
                  required
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Provide all relevant details to invite strategy insights..."
                  className="w-full rounded-md border border-[color:var(--t10-border)] p-2.5"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-lg bg-[color:var(--t10-emerald)] py-2 text-center text-xs font-bold text-white hover:bg-[color:var(--t10-green)] transition-all shadow"
              >
                Post Thread
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleOption({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] p-3.5 cursor-pointer">
      <span className="text-[11px] font-semibold text-[color:var(--t10-navy)] pr-4">{label}</span>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4.5 w-4.5 accent-[color:var(--t10-emerald)]"
      />
    </label>
  );
}
