import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";
import {
  ArrowLeft,
  Flag,
  Loader2,
  Lock,
  MessageSquare,
  Pin,
  Plus,
  Send,
  Shield,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Thread = {
  id: string;
  author_id: string;
  pseudonym: string;
  category: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  view_count: number;
  last_activity_at: string;
  created_at: string;
};

type Reply = {
  id: string;
  thread_id: string;
  author_id: string;
  pseudonym: string;
  body: string;
  created_at: string;
};

type Report = {
  id: string;
  reporter_id: string;
  target_type: "thread" | "reply";
  target_id: string;
  reason: string;
  details: string | null;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
};

const CATEGORIES = [
  { key: "general", label: "General" },
  { key: "deals", label: "Deals" },
  { key: "wealth", label: "Wealth" },
  { key: "geopolitics", label: "Geopolitics" },
  { key: "culture", label: "Culture" },
  { key: "philanthropy", label: "Philanthropy" },
] as const;

const REPORT_REASONS = [
  "Harassment or personal attack",
  "Doxxing / identity reveal",
  "Spam or promotion",
  "Illegal content",
  "Off-topic / low quality",
  "Other",
] as const;

const PSEUDO_PREFIX = ["Onyx", "Vellum", "Silent", "Obsidian", "Golden", "Quiet", "Marble", "Cinder", "Ivory", "Ember"];
const PSEUDO_SUFFIX = ["Fox", "Heron", "Owl", "Whale", "Cipher", "Fern", "Compass", "Anchor", "Lyre", "Sable"];

const rollPseudonym = () =>
  `${PSEUDO_PREFIX[Math.floor(Math.random() * PSEUDO_PREFIX.length)]} ${PSEUDO_SUFFIX[Math.floor(Math.random() * PSEUDO_SUFFIX.length)]}`;

export default function ExclusiveForum() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [pseudonym, setPseudonym] = useState(rollPseudonym());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [threadCategory, setThreadCategory] = useState<string>("general");
  const [submitting, setSubmitting] = useState(false);

  const [openThread, setOpenThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyBody, setReplyBody] = useState("");
  const [replyPseudonym, setReplyPseudonym] = useState(rollPseudonym());
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [reportTarget, setReportTarget] = useState<
    { type: "thread" | "reply"; id: string; preview: string } | null
  >(null);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const [moderationOpen, setModerationOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth?returnTo=/exclusive/forum");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("exclusive_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      setIsMember(!!data || isAdmin);
      setLoading(false);
    })();
  }, [user, isAdmin, navigate]);

  const loadThreads = async () => {
    const { data, error } = await supabase
      .from("exclusive_forum_threads")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("last_activity_at", { ascending: false })
      .limit(200);
    if (error) {
      toast.error("Unable to load threads");
      return;
    }
    setThreads((data ?? []) as Thread[]);
  };

  useEffect(() => {
    if (!isMember) return;
    loadThreads();
    const channel = supabase
      .channel("exclusive-forum-threads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exclusive_forum_threads" },
        () => loadThreads(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMember]);

  // Admin: track pending report count as a live badge
  useEffect(() => {
    if (!isAdmin) return;
    const refreshPending = async () => {
      const { count } = await supabase
        .from("exclusive_forum_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      setPendingCount(count ?? 0);
    };
    refreshPending();
    const channel = supabase
      .channel("exclusive-forum-reports")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exclusive_forum_reports" },
        () => {
          refreshPending();
          if (moderationOpen) loadReports();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, moderationOpen]);

  const loadReports = async () => {
    setReportsLoading(true);
    const { data } = await supabase
      .from("exclusive_forum_reports")
      .select("*")
      .order("status", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(200);
    setReports((data ?? []) as Report[]);
    setReportsLoading(false);
  };

  const openModeration = () => {
    setModerationOpen(true);
    loadReports();
  };

  const filtered = useMemo(
    () => (category === "all" ? threads : threads.filter((t) => t.category === category)),
    [threads, category],
  );

  const submitThread = async () => {
    if (!user) return;
    const t = title.trim();
    const b = body.trim();
    const p = pseudonym.trim() || rollPseudonym();
    if (t.length < 4 || b.length < 10) {
      toast.error("Title needs 4+ and body 10+ characters");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("exclusive_forum_threads").insert({
      author_id: user.id,
      pseudonym: p.slice(0, 40),
      category: threadCategory,
      title: t.slice(0, 160),
      body: b.slice(0, 4000),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Thread posted");
    setTitle("");
    setBody("");
    setPseudonym(rollPseudonym());
    setComposerOpen(false);
  };

  const openThreadPanel = async (t: Thread) => {
    setOpenThread(t);
    setReplies([]);
    setReplyPseudonym(rollPseudonym());
    const { data } = await supabase
      .from("exclusive_forum_replies")
      .select("*")
      .eq("thread_id", t.id)
      .order("created_at", { ascending: true });
    setReplies((data ?? []) as Reply[]);
  };

  const reloadReplies = async (threadId: string) => {
    const { data } = await supabase
      .from("exclusive_forum_replies")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    setReplies((data ?? []) as Reply[]);
  };

  const sendReply = async () => {
    if (!user || !openThread) return;
    const b = replyBody.trim();
    if (b.length < 2) return;
    setReplySubmitting(true);
    const { error } = await supabase.from("exclusive_forum_replies").insert({
      thread_id: openThread.id,
      author_id: user.id,
      pseudonym: (replyPseudonym.trim() || rollPseudonym()).slice(0, 40),
      body: b.slice(0, 2000),
    });
    setReplySubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setReplyBody("");
    await reloadReplies(openThread.id);
    loadThreads();
  };

  const togglePinned = async (t: Thread) => {
    await supabase
      .from("exclusive_forum_threads")
      .update({ is_pinned: !t.is_pinned })
      .eq("id", t.id);
    loadThreads();
  };

  const toggleLocked = async (t: Thread) => {
    await supabase
      .from("exclusive_forum_threads")
      .update({ is_locked: !t.is_locked })
      .eq("id", t.id);
    loadThreads();
    if (openThread?.id === t.id) setOpenThread({ ...t, is_locked: !t.is_locked });
  };

  const deleteThread = async (t: Thread) => {
    if (!confirm("Delete this thread?")) return;
    await supabase.from("exclusive_forum_threads").delete().eq("id", t.id);
    if (openThread?.id === t.id) setOpenThread(null);
    loadThreads();
  };

  const deleteReply = async (r: Reply) => {
    if (!confirm("Delete this reply?")) return;
    await supabase.from("exclusive_forum_replies").delete().eq("id", r.id);
    if (openThread) await reloadReplies(openThread.id);
    loadThreads();
  };

  const openReport = (type: "thread" | "reply", id: string, preview: string) => {
    setReportTarget({ type, id, preview });
    setReportReason(REPORT_REASONS[0]);
    setReportDetails("");
  };

  const submitReport = async () => {
    if (!user || !reportTarget) return;
    setReportSubmitting(true);
    const { error } = await supabase.from("exclusive_forum_reports").insert({
      reporter_id: user.id,
      target_type: reportTarget.type,
      target_id: reportTarget.id,
      reason: reportReason,
      details: reportDetails.trim().slice(0, 1000) || null,
    });
    setReportSubmitting(false);
    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        toast.info("You already reported this — a moderator will review it.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Reported. Thank you.");
    setReportTarget(null);
  };

  const resolveReport = async (
    id: string,
    status: "resolved" | "dismissed",
  ) => {
    await supabase
      .from("exclusive_forum_reports")
      .update({ status, resolved_by: user?.id ?? null, resolved_at: new Date().toISOString() })
      .eq("id", id);
    loadReports();
  };

  const removeReportedTarget = async (r: Report) => {
    if (!confirm(`Delete this ${r.target_type}?`)) return;
    const table = r.target_type === "thread" ? "exclusive_forum_threads" : "exclusive_forum_replies";
    await supabase.from(table).delete().eq("id", r.target_id);
    await resolveReport(r.id, "resolved");
    loadThreads();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-black text-neutral-200 grid place-items-center p-6">
        <div className="max-w-md text-center space-y-4">
          <Lock className="h-10 w-10 mx-auto text-amber-500" />
          <h1 className="text-2xl font-serif">Members only</h1>
          <p className="text-neutral-400 text-sm">
            The Silent Forum is available to active Unique Exclusive members.
          </p>
          <Link
            to="/exclusive"
            className="inline-block px-5 py-2 rounded-full bg-amber-500 text-black text-sm font-medium"
          >
            View Exclusive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/exclusive" className="inline-flex items-center gap-2 text-neutral-400 hover:text-amber-400 text-sm">
            <ArrowLeft className="h-4 w-4" /> Exclusive
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={openModeration}
                className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:border-amber-500/40 text-xs"
              >
                <ShieldAlert className="h-4 w-4" /> Moderation
                {pendingCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setComposerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-black text-sm font-medium hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" /> New thread
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-amber-100">Silent Forum</h1>
          <p className="text-neutral-500 text-sm mt-2">
            Pseudonymous. Ghost-mode. No screenshots, no external attribution. Speak freely.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>
              {c.label}
            </FilterChip>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="border border-neutral-900 rounded-2xl p-12 text-center text-neutral-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
            No threads yet. Be the first voice in the room.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="group border border-neutral-900 hover:border-amber-500/40 bg-neutral-950/60 rounded-2xl p-5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => openThreadPanel(t)}
                    className="text-left min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                      {t.is_pinned && (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}
                      {t.is_locked && (
                        <span className="inline-flex items-center gap-1 text-neutral-400">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      )}
                      <span>{CATEGORIES.find((c) => c.key === t.category)?.label ?? t.category}</span>
                      <span>· by {t.pseudonym}</span>
                    </div>
                    <h3 className="text-lg font-serif text-amber-50 truncate">{t.title}</h3>
                    <p className="text-neutral-400 text-sm mt-1 line-clamp-2">{t.body}</p>
                  </button>
                  <div className="flex flex-col items-end gap-2 shrink-0 text-xs text-neutral-500">
                    <div className="text-right">
                      <div className="text-amber-400 text-sm font-medium">{t.reply_count}</div>
                      <div>replies</div>
                      <div className="mt-2">{formatDistanceToNow(new Date(t.last_activity_at), { addSuffix: true })}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openReport("thread", t.id, t.title);
                      }}
                      className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-neutral-500 hover:text-red-400 transition-opacity"
                      title="Report thread"
                    >
                      <Flag className="h-3 w-3" /> Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 grid place-items-center p-4" onClick={() => setComposerOpen(false)}>
          <div
            className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-amber-100">New thread</h2>
              <button onClick={() => setComposerOpen(false)} className="text-neutral-500 hover:text-neutral-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder="Pseudonym"
                  maxLength={40}
                  className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setPseudonym(rollPseudonym())}
                  className="px-3 py-2 rounded-lg border border-neutral-800 text-xs text-neutral-400 hover:text-amber-400"
                >
                  Roll
                </button>
              </div>
              <select
                value={threadCategory}
                onChange={(e) => setThreadCategory(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                maxLength={160}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What's on your mind?"
                rows={6}
                maxLength={4000}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm resize-none"
              />
              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-neutral-500 inline-flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Your identity is never shown alongside this post.
                </p>
                <button
                  onClick={submitThread}
                  disabled={submitting}
                  className="px-4 py-2 rounded-full bg-amber-500 text-black text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Posting…" : "Post thread"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thread panel */}
      {openThread && (
        <div className="fixed inset-0 z-50 bg-black/80 flex justify-end" onClick={() => setOpenThread(null)}>
          <div
            className="w-full max-w-2xl h-full overflow-y-auto bg-neutral-950 border-l border-neutral-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setOpenThread(null)} className="text-neutral-500 hover:text-neutral-200">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => openReport("thread", openThread.id, openThread.title)}
                  className="px-2 py-1 rounded border border-neutral-800 hover:text-red-400 hover:border-red-900/60 inline-flex items-center gap-1"
                >
                  <Flag className="h-3 w-3" /> Report
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => togglePinned(openThread)} className="px-2 py-1 rounded border border-neutral-800 hover:text-amber-400">
                      {openThread.is_pinned ? "Unpin" : "Pin"}
                    </button>
                    <button onClick={() => toggleLocked(openThread)} className="px-2 py-1 rounded border border-neutral-800 hover:text-amber-400">
                      {openThread.is_locked ? "Unlock" : "Lock"}
                    </button>
                    <button onClick={() => deleteThread(openThread)} className="px-2 py-1 rounded border border-red-900/60 text-red-400 hover:bg-red-900/20 inline-flex items-center gap-1">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                {CATEGORIES.find((c) => c.key === openThread.category)?.label ?? openThread.category} · by {openThread.pseudonym}
              </div>
              <h2 className="text-2xl font-serif text-amber-100">{openThread.title}</h2>
              <p className="text-neutral-300 whitespace-pre-wrap mt-3 leading-relaxed">{openThread.body}</p>
            </div>

            <div className="space-y-4 border-t border-neutral-900 pt-4">
              {replies.length === 0 ? (
                <p className="text-neutral-500 text-sm">No replies yet.</p>
              ) : (
                replies.map((r) => (
                  <div key={r.id} className="border border-neutral-900 rounded-xl p-4 bg-black/40">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[11px] text-neutral-500">
                        {r.pseudonym} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          onClick={() => openReport("reply", r.id, r.body.slice(0, 60))}
                          className="text-neutral-500 hover:text-red-400 inline-flex items-center gap-1"
                        >
                          <Flag className="h-3 w-3" /> Report
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => deleteReply(r)}
                            className="text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-neutral-200 text-sm whitespace-pre-wrap">{r.body}</p>
                  </div>
                ))
              )}
            </div>

            {openThread.is_locked ? (
              <div className="mt-6 text-center text-xs text-neutral-500 inline-flex items-center gap-1 justify-center w-full">
                <Lock className="h-3 w-3" /> This thread is locked.
              </div>
            ) : (
              <div className="mt-6 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={replyPseudonym}
                    onChange={(e) => setReplyPseudonym(e.target.value)}
                    maxLength={40}
                    className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setReplyPseudonym(rollPseudonym())}
                    className="px-3 py-2 rounded-lg border border-neutral-800 text-xs text-neutral-400"
                  >
                    Roll
                  </button>
                </div>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Reply…"
                  rows={3}
                  maxLength={2000}
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={sendReply}
                    disabled={replySubmitting || replyBody.trim().length < 2}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-black text-sm font-medium disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" /> Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-[60] bg-black/85 grid place-items-center p-4" onClick={() => setReportTarget(null)}>
          <div
            className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-serif text-amber-100 inline-flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-400" /> Report {reportTarget.type}
              </h2>
              <button onClick={() => setReportTarget(null)} className="text-neutral-500 hover:text-neutral-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-4 line-clamp-2">"{reportTarget.preview}"</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500">Details (optional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Give the moderator context…"
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-neutral-500 inline-flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Anonymous to the reported member.
                </p>
                <button
                  onClick={submitReport}
                  disabled={reportSubmitting}
                  className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium disabled:opacity-50"
                >
                  {reportSubmitting ? "Sending…" : "Submit report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin moderation panel */}
      {isAdmin && moderationOpen && (
        <div className="fixed inset-0 z-[55] bg-black/85 flex justify-end" onClick={() => setModerationOpen(false)}>
          <div
            className="w-full max-w-xl h-full overflow-y-auto bg-neutral-950 border-l border-neutral-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-amber-100 inline-flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-400" /> Moderation queue
              </h2>
              <button onClick={() => setModerationOpen(false)} className="text-neutral-500 hover:text-neutral-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {reportsLoading ? (
              <div className="grid place-items-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              </div>
            ) : reports.length === 0 ? (
              <p className="text-neutral-500 text-sm">No reports yet.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="border border-neutral-900 rounded-xl p-4 bg-black/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                        {r.target_type} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </div>
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                          r.status === "pending"
                            ? "border-red-900/60 text-red-400"
                            : r.status === "resolved"
                              ? "border-emerald-900/60 text-emerald-400"
                              : "border-neutral-800 text-neutral-500"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="text-sm text-amber-100 mb-1">{r.reason}</div>
                    {r.details && <p className="text-xs text-neutral-400 whitespace-pre-wrap mb-2">{r.details}</p>}
                    <p className="text-[11px] text-neutral-600 mb-3">Target id: {r.target_id}</p>

                    {r.status === "pending" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => removeReportedTarget(r)}
                          className="px-3 py-1.5 rounded border border-red-900/60 text-red-400 hover:bg-red-900/20 text-xs inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Delete {r.target_type}
                        </button>
                        <button
                          onClick={() => resolveReport(r.id, "resolved")}
                          className="px-3 py-1.5 rounded border border-emerald-900/60 text-emerald-400 hover:bg-emerald-900/20 text-xs"
                        >
                          Mark resolved
                        </button>
                        <button
                          onClick={() => resolveReport(r.id, "dismissed")}
                          className="px-3 py-1.5 rounded border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
        active
          ? "bg-amber-500 text-black border-amber-500"
          : "border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-500/40"
      }`}
    >
      {children}
    </button>
  );
}
