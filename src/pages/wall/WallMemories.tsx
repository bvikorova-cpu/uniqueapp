import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Calendar, Loader2, Heart, MessageCircle, Share2, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInYears } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { canonicalUrl } from "@/lib/canonicalUrl";

type Memory = {
  id: string;
  content: string | null;
  created_at: string;
  likes_count: number | null;
  comments_count: number | null;
  feeling: string | null;
  location: string | null;
  media_urls: string[] | null;
  media_types: string[] | null;
  memory_kind: string;
};

export default function WallMemories() {
  const [userId, setUserId] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ["post-memories-page", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_post_memories_v2" as any, { _limit: 50 });
      if (error) throw error;
      return (data ?? []) as Memory[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const onThisDay = memories.filter((m) => m.memory_kind === "on_this_day");
  const throwbacks = memories.filter((m) => m.memory_kind !== "on_this_day");

  const share = async (m: Memory) => {
    const url = canonicalUrl(`/post/${m.id}`);
    try {
      if (navigator.share) {
        await navigator.share({ title: "A memory on Unique", text: m.content ?? "", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      /* user cancelled */
    }
  };

  const renderCard = (m: Memory, i: number) => {
    const yearsAgo = differenceInYears(new Date(), new Date(m.created_at));
    const media = (m.media_urls ?? []).slice(0, 4);
    const types = m.media_types ?? [];
    return (
      <motion.div
        key={m.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(i * 0.04, 0.4) }}
        className="overflow-hidden rounded-xl bg-card/60 backdrop-blur-md border border-border/50 hover:border-amber-500/40 transition-all"
      >
        <button onClick={() => navigate(`/post/${m.id}`)} className="w-full text-left">
          {media.length > 0 && (
            <div className={`grid gap-0.5 ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {media.map((url, idx) =>
                (types[idx] ?? "").startsWith("video") ? (
                  <video key={url} src={url} muted playsInline className="w-full h-32 object-cover bg-muted" />
                ) : (
                  <img key={url} src={url} alt={m.content?.slice(0, 60) || "Memory photo"} loading="lazy" className="w-full h-32 object-cover bg-muted" />
                )
              )}
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                <Calendar className="h-3 w-3" />
                {yearsAgo > 0 ? `${yearsAgo} ${yearsAgo === 1 ? "year" : "years"} ago` : format(new Date(m.created_at), "PP")}
              </span>
              {m.memory_kind === "on_this_day" && (
                <Badge variant="secondary" className="text-[10px] h-5">On this day</Badge>
              )}
            </div>
            {m.content && <p className="text-sm text-foreground line-clamp-4 whitespace-pre-wrap">{m.content}</p>}
            {(m.feeling || m.location) && (
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                {m.feeling && <span>{m.feeling}</span>}
                {m.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.location}</span>}
              </div>
            )}
          </div>
        </button>
        <div className="px-4 pb-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{m.likes_count ?? 0}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{m.comments_count ?? 0}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 px-2" onClick={() => share(m)}>
            <Share2 className="h-3.5 w-3.5 mr-1" /> Share
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-primary/10 to-purple-500/5 border border-amber-500/20 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-500 shadow-xl shadow-amber-500/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-amber-500 to-pink-500 bg-clip-text text-transparent">
              Memories
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {memories.length > 0
                ? `${memories.length} moments from your past${onThisDay.length ? ` · ${onThisDay.length} on this day` : ""}`
                : "Your past posts will appear here"}
            </p>
          </div>
        </div>
      </motion.div>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">How it works:</strong> Memories collects your own older posts. Anything you
          published on this exact day in a previous year is highlighted as “On this day”; everything else appears as a
          throwback, newest first. Tap a memory to open the original post, or use Share to send the link to friends.
        </CardContent>
      </Card>

      {!userId ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Sign in to view your memories</CardContent></Card>
      ) : isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : memories.length === 0 ? (
        <Card className="border-dashed border-2 border-amber-500/20">
          <CardContent className="py-16 text-center">
            <Sparkles className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-black mb-2">No memories yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Posts you publish today will show up here from tomorrow.</p>
            <Button onClick={() => navigate("/wall")}>Create a post</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {onThisDay.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">On this day</h2>
              <div className="grid gap-3 sm:grid-cols-2">{onThisDay.map(renderCard)}</div>
            </section>
          )}
          {throwbacks.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Throwbacks</h2>
              <div className="grid gap-3 sm:grid-cols-2">{throwbacks.map(renderCard)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
