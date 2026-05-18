import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, MessageCircle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stat {
  label: string;
  value: number;
  delta?: number;
  icon: React.ElementType;
  color: string;
}

interface Props {
  userId: string;
}

/** Lightweight creator analytics — totals + 7-day trend, no edge function required. */
export const CreatorAnalyticsWidget = ({ userId }: Props) => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const sevenAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      const [posts, comments, views] = await Promise.all([
        supabase.from("posts").select("id, likes_count, created_at", { count: "exact", head: false })
          .eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
        supabase.from("comments").select("id, created_at", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase.from("profile_views").select("id, created_at", { count: "exact", head: true })
          .eq("profile_id", userId),
      ]);

      const totalLikes = (posts.data ?? []).reduce((s: number, p: any) => s + (p.likes_count ?? 0), 0);
      const recentPosts = (posts.data ?? []).filter((p: any) => p.created_at > sevenAgo).length;

      setStats([
        { label: "Profile views", value: views.count ?? 0, icon: Eye, color: "text-sky-400" },
        { label: "Likes received", value: totalLikes, icon: Heart, color: "text-rose-400" },
        { label: "Comments", value: comments.count ?? 0, icon: MessageCircle, color: "text-violet-400" },
        { label: "Posts (7d)", value: recentPosts, delta: recentPosts, icon: TrendingUp, color: "text-emerald-400" },
      ]);
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [userId]);

  return (
    <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Creator analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(loading ? Array.from({ length: 4 }) : stats).map((s: any, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-background/40 p-3">
              {s ? (
                <>
                  <s.icon className={`h-4 w-4 mb-1 ${s.color}`} />
                  <div className="text-xl font-bold">{s.value.toLocaleString()}</div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                </>
              ) : (
                <div className="h-14 animate-pulse bg-muted/40 rounded" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorAnalyticsWidget;
