import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Lock,
  Pin,
  Star,
  Eye,
  Plus,
  ExternalLink,
  Trash2,
} from "lucide-react";

type FeedPost = {
  id: string;
  category: string;
  title: string;
  body: string;
  link_url: string | null;
  is_pinned: boolean;
  published_at: string;
  author_id: string;
};

const CATEGORIES = [
  { key: "off_market", label: "Off-market" },
  { key: "pre_ipo", label: "Pre-IPO" },
  { key: "culture", label: "Culture" },
  { key: "intel", label: "Intel" },
  { key: "event", label: "Event" },
  { key: "other", label: "Other" },
] as const;

const CAT_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label]),
);

export default function ExclusiveFeed() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState({
    category: "intel" as string,
    title: "",
    body: "",
    link_url: "",
    is_pinned: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) {
        setIsMember(false);
        setLoading(false);
        return;
      }
      const { data: mem } = await supabase
        .from("exclusive_members")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      const active = !!mem && mem.status === "active";
      if (cancelled) return;
      setIsMember(active);
      if (!active) {
        setLoading(false);
        return;
      }
      const [{ data: postsData }, { data: reactData }] = await Promise.all([
        supabase
          .from("exclusive_feed_posts")
          .select("id,category,title,body,link_url,is_pinned,published_at,author_id")
          .order("is_pinned", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(200),
        supabase
          .from("exclusive_feed_reactions")
          .select("post_id, kind")
          .eq("user_id", user.id)
          .eq("kind", "starred"),
      ]);
      if (cancelled) return;
      setPosts((postsData ?? []) as FeedPost[]);
      setStarred(new Set((reactData ?? []).map((r: any) => r.post_id as string)));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleStar = async (postId: string) => {
    if (!user) return;
    const isStarred = starred.has(postId);
    const next = new Set(starred);
    if (isStarred) {
      next.delete(postId);
      setStarred(next);
      await supabase
        .from("exclusive_feed_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("kind", "starred");
    } else {
      next.add(postId);
      setStarred(next);
      await supabase
        .from("exclusive_feed_reactions")
        .insert({ post_id: postId, user_id: user.id, kind: "starred" });
    }
  };

  const publish = async () => {
    if (!user) return;
    if (draft.title.trim().length < 3 || draft.body.trim().length < 10) {
      toast.error("Title (3+ chars) and body (10+ chars) required.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("exclusive_feed_posts")
      .insert({
        author_id: user.id,
        category: draft.category,
        title: draft.title.trim(),
        body: draft.body.trim(),
        link_url: draft.link_url.trim() || null,
        is_pinned: draft.is_pinned,
      })
      .select("id,category,title,body,link_url,is_pinned,published_at,author_id")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPosts((prev) => [data as FeedPost, ...prev]);
    setDraft({ category: "intel", title: "", body: "", link_url: "", is_pinned: false });
    setComposerOpen(false);
    toast.success("Published to Insider Feed.");
  };

  const removePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("exclusive_feed_posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f5e9c9]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% -10%, rgba(212,175,55,0.15), transparent 60%), radial-gradient(1000px 500px at 90% 10%, rgba(120,80,20,0.18), transparent 60%), linear-gradient(180deg, #050505 0%, #0a0806 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-5 pt-20 pb-24">
        <Link
          to="/exclusive"
          className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#d4af37]/70 hover:text-[#f7e7b0]"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Exclusive
        </Link>

        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-[#d4af37]">
          <Sparkles className="h-3 w-3" /> Insider Feed
        </div>
        <h1
          className="font-serif text-4xl leading-tight md:text-5xl"
          style={{
            background: "linear-gradient(180deg, #f7e7b0 0%, #d4af37 55%, #8a6a1c 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Signal, not noise.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[#c9bfa4]/85">
          Curated by humans. Off-market opportunities, pre-IPO whispers, cultural intel.
          Nothing algorithmic. Nothing public.
        </p>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#d4af37]" />
          </div>
        ) : !user ? (
          <div className="mt-12 rounded-2xl border border-[#d4af37]/25 bg-black/40 p-8 text-center">
            <Lock className="mx-auto mb-3 h-5 w-5 text-[#d4af37]" />
            <p className="text-sm text-[#c9bfa4]/85">Sign in to access Exclusive.</p>
            <button
              onClick={() => navigate("/auth?redirect=/exclusive/feed")}
              className="mt-4 rounded-full border border-[#d4af37]/40 px-6 py-2 text-xs uppercase tracking-[0.25em] text-[#f7e7b0] hover:bg-[#d4af37]/10"
            >
              Sign in
            </button>
          </div>
        ) : !isMember ? (
          <div className="mt-12 rounded-2xl border border-[#d4af37]/25 bg-black/40 p-8 text-center">
            <Lock className="mx-auto mb-3 h-5 w-5 text-[#d4af37]" />
            <p className="text-sm text-[#c9bfa4]/85">
              Membership required to enter the Insider Feed.
            </p>
            <button
              onClick={() => navigate("/exclusive")}
              className="mt-4 rounded-full border border-[#d4af37]/40 px-6 py-2 text-xs uppercase tracking-[0.25em] text-[#f7e7b0] hover:bg-[#d4af37]/10"
            >
              Request initiation
            </button>
          </div>
        ) : (
          <>
            {isAdmin && (
              <div className="mt-8">
                {!composerOpen ? (
                  <button
                    onClick={() => setComposerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-[#f7e7b0] hover:bg-[#d4af37]/20"
                  >
                    <Plus className="h-3.5 w-3.5" /> New signal
                  </button>
                ) : (
                  <div className="rounded-2xl border border-[#d4af37]/30 bg-black/50 p-5">
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.key}
                          onClick={() => setDraft((d) => ({ ...d, category: c.key }))}
                          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${
                            draft.category === c.key
                              ? "bg-[#d4af37]/20 text-[#f7e7b0] border border-[#d4af37]/50"
                              : "border border-[#d4af37]/20 text-[#c9bfa4]/70"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder="Title"
                      maxLength={200}
                      className="mt-4 w-full rounded-lg border border-[#d4af37]/20 bg-black/40 px-3 py-2 text-sm text-[#f5e9c9] placeholder:text-[#c9bfa4]/40 focus:border-[#d4af37]/60 focus:outline-none"
                    />
                    <textarea
                      value={draft.body}
                      onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                      placeholder="The signal. Be specific, be brief."
                      maxLength={5000}
                      rows={5}
                      className="mt-2 w-full rounded-lg border border-[#d4af37]/20 bg-black/40 px-3 py-2 text-sm text-[#f5e9c9] placeholder:text-[#c9bfa4]/40 focus:border-[#d4af37]/60 focus:outline-none"
                    />
                    <input
                      value={draft.link_url}
                      onChange={(e) => setDraft((d) => ({ ...d, link_url: e.target.value }))}
                      placeholder="Optional link (https://…)"
                      className="mt-2 w-full rounded-lg border border-[#d4af37]/20 bg-black/40 px-3 py-2 text-sm text-[#f5e9c9] placeholder:text-[#c9bfa4]/40 focus:border-[#d4af37]/60 focus:outline-none"
                    />
                    <label className="mt-3 flex items-center gap-2 text-xs text-[#c9bfa4]/80">
                      <input
                        type="checkbox"
                        checked={draft.is_pinned}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, is_pinned: e.target.checked }))
                        }
                        className="h-3.5 w-3.5 accent-[#d4af37]"
                      />
                      Pin to top
                    </label>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={publish}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-2 text-xs font-medium uppercase tracking-[0.25em] text-[#0a0806] disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        Publish
                      </button>
                      <button
                        onClick={() => setComposerOpen(false)}
                        className="rounded-full border border-[#d4af37]/30 px-5 py-2 text-xs uppercase tracking-[0.25em] text-[#c9bfa4]/80"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 space-y-4">
              {posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d4af37]/20 bg-black/20 p-10 text-center text-sm text-[#c9bfa4]/70">
                  The feed is quiet. New signals appear here as they arrive.
                </div>
              ) : (
                posts.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-b from-[#0e0b06] to-[#050403] p-6"
                    style={{ boxShadow: "0 20px 60px -30px rgba(212,175,55,0.35)" }}
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em]">
                      <span className="rounded-full border border-[#d4af37]/40 px-2 py-0.5 text-[#f7e7b0]">
                        {CAT_LABEL[p.category] ?? p.category}
                      </span>
                      {p.is_pinned && (
                        <span className="inline-flex items-center gap-1 text-[#d4af37]">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}
                      <span className="text-[#c9bfa4]/50">
                        {new Date(p.published_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl text-[#f5e9c9]">{p.title}</h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#c9bfa4]/85">
                      {p.body}
                    </p>
                    {p.link_url && (
                      <a
                        href={p.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs text-[#d4af37] hover:text-[#f7e7b0]"
                      >
                        Open link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <div className="mt-5 flex items-center gap-2 border-t border-[#d4af37]/10 pt-4 text-xs">
                      <button
                        onClick={() => toggleStar(p.id)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 uppercase tracking-[0.25em] ${
                          starred.has(p.id)
                            ? "border-[#d4af37]/60 bg-[#d4af37]/15 text-[#f7e7b0]"
                            : "border-[#d4af37]/20 text-[#c9bfa4]/70 hover:text-[#f7e7b0]"
                        }`}
                      >
                        <Star className="h-3 w-3" />
                        {starred.has(p.id) ? "Starred" : "Star"}
                      </button>
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#c9bfa4]/50">
                        <Eye className="h-3 w-3" /> Private to members
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => removePost(p.id)}
                          className="ml-auto inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-red-300/80 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
