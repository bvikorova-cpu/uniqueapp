import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Heart, ThumbsDown, MessageCircle, Loader2, Filter, X, Clock, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TalentCommentsSheet } from "@/components/megatalent/TalentCommentsSheet";
import { useSpendCredits } from "@/hooks/useSpendCredits";

type CategoryOption = { value: string; label: string };
type CategoryGroup = { group: string; categories: CategoryOption[] };

interface Props {
  categoryGroups: CategoryGroup[];
}

type VoteType = "like" | "dislike";

interface Submission {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: "image" | "video";
  category: string;
  votes_count: number;
  dislikes_count: number;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

const PAGE_SIZE = 20;

export default function MegaTalentLatestFeed({ categoryGroups }: Props) {
  const { toast } = useToast();
  const { spend } = useSpendCredits();
  const allCategories = useMemo(
    () => categoryGroups.flatMap((g) => g.categories),
    [categoryGroups]
  );
  const labelOf = useCallback(
    (v: string) => allCategories.find((c) => c.value === v)?.label ?? v,
    [allCategories]
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [myVotes, setMyVotes] = useState<Record<string, VoteType>>({});
  const [busyVote, setBusyVote] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [openComments, setOpenComments] = useState<string | null>(null);

  // Debounce search input -> actual query term
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const fetchPage = useCallback(
    async (pageIndex: number, replace = false) => {
      if (pageIndex === 0) setLoading(true); else setLoadingMore(true);
      try {
        const from = pageIndex * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        let q = supabase
          .from("talent_submissions")
          .select("id, user_id, title, description, media_url, media_type, category, votes_count, dislikes_count, created_at")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .range(from, to);
        if (selected.size > 0) {
          q = q.in("category", Array.from(selected) as any);
        }
        if (search) {
          const escaped = search.replace(/[%,]/g, " ");
          q = q.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`);
        }
        const { data, error } = await q;
        if (error) throw error;
        let rows = ((data as any[]) ?? []) as Submission[];

        // Fetch profiles separately (no FK relationship in schema cache)
        if (rows.length > 0) {
          const uids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
          if (uids.length > 0) {
            const { data: profs } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .in("id", uids);
            const pmap: Record<string, any> = {};
            (profs || []).forEach((p: any) => { pmap[p.id] = p; });
            rows = rows.map((r) => ({ ...r, profiles: pmap[r.user_id] })) as any;
          }
        }

        setHasMore(rows.length === PAGE_SIZE);
        setItems((prev) => (replace ? rows : [...prev, ...rows]));

        if (rows.length > 0) {
          const ids = rows.map((r) => r.id);
          // counts
          const counts: Record<string, number> = {};
          await Promise.all(
            ids.map(async (id) => {
              const { count } = await supabase
                .from("talent_comments")
                .select("id", { count: "exact", head: true })
                .eq("submission_id", id);
              counts[id] = count ?? 0;
            })
          );
          setCommentCounts((prev) => ({ ...prev, ...counts }));
          // my votes for these
          if (userId) {
            const { data: votes } = await supabase
              .from("talent_votes")
              .select("submission_id, vote_type")
              .eq("user_id", userId)
              .in("submission_id", ids);
            const map: Record<string, VoteType> = {};
            (votes ?? []).forEach((v: any) => { map[v.submission_id] = v.vote_type; });
            setMyVotes((prev) => ({ ...prev, ...map }));
          }
        }
      } catch (e: any) {
        toast({ title: "Failed to load feed", description: e?.message ?? "", variant: "destructive" });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selected, search, userId, toast]
  );

  useEffect(() => {
    setPage(0);
    fetchPage(0, true);
  }, [fetchPage]);

  const toggleCategory = (v: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(v)) n.delete(v); else n.add(v);
      return n;
    });
  };
  const clearCategories = () => setSelected(new Set());

  const castVote = async (submissionId: string, voteType: VoteType) => {
    if (!userId) {
      toast({ title: "Sign in required", description: "Sign in to react to posts.", variant: "destructive" });
      return;
    }
    if (busyVote) return;
    setBusyVote(submissionId);
    const previous = myVotes[submissionId];
    try {
      // optimistic update of counts
      setItems((prev) => prev.map((it) => {
        if (it.id !== submissionId) return it;
        let v = it.votes_count, d = it.dislikes_count;
        if (previous === "like") v = Math.max(0, v - 1);
        if (previous === "dislike") d = Math.max(0, d - 1);
        if (previous !== voteType) {
          if (voteType === "like") v += 1; else d += 1;
        }
        return { ...it, votes_count: v, dislikes_count: d };
      }));
      setMyVotes((prev) => {
        const n = { ...prev };
        if (previous === voteType) delete n[submissionId];
        else n[submissionId] = voteType;
        return n;
      });

      if (previous === voteType) {
        // toggle off
        const { error } = await supabase
          .from("talent_votes")
          .delete()
          .eq("submission_id", submissionId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("talent_votes")
          .upsert(
            { submission_id: submissionId, user_id: userId, vote_type: voteType as any },
            { onConflict: "submission_id,user_id" }
          );
        if (error) throw error;
      }
    } catch (e: any) {
      // rollback by refetching this single page
      toast({ title: "Vote failed", description: e?.message ?? "", variant: "destructive" });
      fetchPage(0, true);
    } finally {
      setBusyVote(null);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters */}
      <aside className="lg:col-span-1 order-2 lg:order-1">
        <Card className="sticky top-24 backdrop-blur-xl bg-card/80 border-yellow-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2"><Filter className="h-4 w-4" /> Categories</h3>
              {selected.size > 0 && (
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={clearCategories}>
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selected.size === 0 ? "Showing all categories" : `${selected.size} selected`}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[420px] pr-3">
              <div className="space-y-4">
                {categoryGroups.map((g, idx) => (
                  <div key={idx}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">{g.group}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.categories.map((c) => {
                        const active = selected.has(c.value);
                        return (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => toggleCategory(c.value)}
                            className={`text-[11px] rounded-full border px-2.5 py-1 transition-colors ${
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border/50 hover:border-primary/40"
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>

      {/* Feed */}
      <div className="lg:col-span-3 order-1 lg:order-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Latest posts
          </h2>
          {selected.size > 0 && (
            <div className="hidden md:flex gap-1 flex-wrap justify-end max-w-md">
              {Array.from(selected).slice(0, 4).map((v) => (
                <Badge key={v} variant="secondary" className="text-[10px]">{labelOf(v)}</Badge>
              ))}
              {selected.size > 4 && <Badge variant="outline" className="text-[10px]">+{selected.size - 4}</Badge>}
            </div>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts by title or description…"
            className="pl-9 pr-9 h-10"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="overflow-hidden bg-card/60 animate-pulse">
                <div className="aspect-video bg-muted/30" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-muted/40" />
                  <div className="h-3 w-2/3 rounded bg-muted/30" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center backdrop-blur-xl bg-card/80 border-yellow-500/10">
            <p className="text-muted-foreground">No posts match your filters yet.</p>
          </Card>
        ) : (
          <>
            {items.map((s, index) => {
              const my = myVotes[s.id];
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4) }}
                >
                  <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-border/30 hover:border-primary/20 transition-all">
                    <CardHeader className="pb-2 px-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                            {s.profiles?.full_name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{s.profiles?.full_name || "User"}</p>
                            <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                          {labelOf(s.category)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      <h3 className="font-bold text-base">{s.title}</h3>
                      <div className="rounded-xl overflow-hidden border border-border/20">
                        {s.media_type === "image" ? (
                          <img src={s.media_url} alt={s.title} className="w-full aspect-video object-cover" loading="lazy" />
                        ) : (
                          <video src={s.media_url} controls className="w-full aspect-video" />
                        )}
                      </div>
                      {s.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                      )}
                      <div className="flex items-center gap-1 pt-1 border-t border-border/20">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyVote === s.id}
                          onClick={() => castVote(s.id, "like")}
                          className={`gap-1.5 h-8 px-3 ${my === "like" ? "text-red-500" : ""}`}
                        >
                          <Heart className={`h-4 w-4 ${my === "like" ? "fill-current" : ""}`} />
                          <span className="text-xs font-bold">{s.votes_count?.toLocaleString() ?? 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyVote === s.id}
                          onClick={() => castVote(s.id, "dislike")}
                          className={`gap-1.5 h-8 px-3 ${my === "dislike" ? "text-amber-500" : ""}`}
                        >
                          <ThumbsDown className={`h-4 w-4 ${my === "dislike" ? "fill-current" : ""}`} />
                          <span className="text-xs font-bold">{s.dislikes_count?.toLocaleString() ?? 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 h-8 px-3"
                          onClick={() => setOpenComments(s.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs">{commentCounts[s.id] ?? 0}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading…</> : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <TalentCommentsSheet
        submissionId={openComments}
        open={!!openComments}
        onOpenChange={(o) => !o && setOpenComments(null)}
        onCountChange={(id, c) => setCommentCounts((prev) => ({ ...prev, [id]: c }))}
      />
    </div>
  );
}
