import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Lock,
  MessageSquare,
  Pin,
  Plus,
  Send,
  Shield,
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

const CATEGORIES = [
  { key: "general", label: "General" },
  { key: "deals", label: "Deals" },
  { key: "wealth", label: "Wealth" },
  { key: "geopolitics", label: "Geopolitics" },
  { key: "culture", label: "Culture" },
  { key: "philanthropy", label: "Philanthropy" },
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
    const { data } = await supabase
      .from("exclusive_forum_replies")
      .select("*")
      .eq("thread_id", openThread.id)
      .order("created_at", { ascending: true });
    setReplies((data ?? []) as Reply[]);
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
          <button
            onClick={() => setComposerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-black text-sm font-medium hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" /> New thread
          </button>
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
              <button
                key={t.id}
                onClick={() => openThreadPanel(t)}
                className="w-full text-left border border-neutral-900 hover:border-amber-500/40 bg-neutral-950/60 rounded-2xl p-5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
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
                  </div>
                  <div className="text-right shrink-0 text-xs text-neutral-500">
                    <div className="text-amber-400 text-sm font-medium">{t.reply_count}</div>
                    <div>replies</div>
                    <div className="mt-2">{formatDistanceToNow(new Date(t.last_activity_at), { addSuffix: true })}</div>
                  </div>
                </div>
              </button>
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
              {isAdmin && (
                <div className="flex items-center gap-2 text-xs">
                  <button onClick={() => togglePinned(openThread)} className="px-2 py-1 rounded border border-neutral-800 hover:text-amber-400">
                    {openThread.is_pinned ? "Unpin" : "Pin"}
                  </button>
                  <button onClick={() => toggleLocked(openThread)} className="px-2 py-1 rounded border border-neutral-800 hover:text-amber-400">
                    {openThread.is_locked ? "Unlock" : "Lock"}
                  </button>
                  <button onClick={() => deleteThread(openThread)} className="px-2 py-1 rounded border border-red-900/60 text-red-400 hover:bg-red-900/20 inline-flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
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
                    <div className="text-[11px] text-neutral-500 mb-1">
                      {r.pseudonym} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
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
