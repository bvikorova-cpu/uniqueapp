import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
interface LeaderRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  items_purchased: number;
  total_credits_spent: number;
}

/** Top spenders / collectors of the last 30 days — public, motivational. */
export const StoreLeaderboard = ({ currentUserId }: { currentUserId?: string }) => {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const since = new Date(Date.now() - 30 * 86400_000).toISOString();
        const { data: purchases } = await supabase
          .from("premium_store_purchases")
          .select("user_id, credits_spent")
          .gte("created_at", since)
          .eq("is_gift", false);

        if (!purchases) {
          setLoading(false);
          return;
        }

        // Aggregate client-side
        const map = new Map<string, { items: number; total: number }>();
        for (const p of purchases) {
          const cur = map.get(p.user_id) || { items: 0, total: 0 };
          cur.items += 1;
          cur.total += p.credits_spent || 0;
          map.set(p.user_id, cur);
        }

        const top = Array.from(map.entries())
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 10);

        // Resolve display names
        const ids = top.map(([id]) => id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", ids);

        const profMap = new Map(
          (profilesData || []).map((p: any) => [p.id, p])
        );
        setRows(
          top.map(([user_id, agg]) => {
            const p: any = profMap.get(user_id);
            return {
              user_id,
              display_name: p?.full_name || p?.username || "Anonymous",
              avatar_url: p?.avatar_url || null,
              items_purchased: agg.items,
              total_credits_spent: agg.total,
            };
          })
        );
      } catch (e) {
        console.error("Leaderboard load error", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <>
<div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-6 text-center text-sm text-muted-foreground">
        Loading top collectors…
      </div>
      </>
      );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-8 text-center">
        <Trophy className="h-10 w-10 mx-auto text-amber-400/60 mb-3" />
        <p className="font-bold text-lg">Be the first on the leaderboard</p>
        <p className="text-sm text-muted-foreground">Make your first purchase to claim the crown 👑</p>
      </div>
    );
  }

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="h-5 w-5 text-amber-400" />;
    if (i === 1) return <Medal className="h-5 w-5 text-zinc-300" />;
    if (i === 2) return <Medal className="h-5 w-5 text-orange-400" />;
    return <span className="text-sm font-black text-muted-foreground w-5 text-center">#{i + 1}</span>;
  };

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background/60 to-purple-500/5 backdrop-blur-xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-black">Top Collectors</h3>
        <Badge variant="outline" className="ml-auto text-[10px] border-amber-500/40 text-amber-400">
          Last 30 days
        </Badge>
      </div>

      <div className="space-y-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.user_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              r.user_id === currentUserId
                ? "border-primary/50 bg-primary/10"
                : "border-border/40 bg-background/40 hover:border-amber-500/30"
            }`}
          >
            <div className="w-8 flex items-center justify-center shrink-0">{rankIcon(i)}</div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400/30 to-purple-500/30 flex items-center justify-center text-sm font-black shrink-0 overflow-hidden">
              {r.avatar_url ? (
                <img src={r.avatar_url} alt={r.display_name || "user"} className="h-full w-full object-cover" />
              ) : (
                (r.display_name || "?").charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold truncate text-sm">
                {r.display_name}
                {r.user_id === currentUserId && (
                  <span className="ml-2 text-[10px] text-primary font-black">YOU</span>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">{r.items_purchased} items collected</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 font-black">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {r.total_credits_spent.toLocaleString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
