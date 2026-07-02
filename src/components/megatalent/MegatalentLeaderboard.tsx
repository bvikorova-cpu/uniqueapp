import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Crown, Medal, Loader2, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  category: string;
  categories?: string[];
}

type Period = "weekly" | "monthly" | "all_time";

const PRIZE_POOL: Record<Period, { total: number; splits: number[] }> = {
  weekly: { total: 500, splits: [250, 150, 100] },
  monthly: { total: 2500, splits: [1500, 600, 400] },
  all_time: { total: 0, splits: [] },
};

export default function MegatalentLeaderboard({ category, categories }: Props) {
  const [period, setPeriod] = useState<Period>("weekly");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const now = new Date();
        let sinceIso: string | null = null;
        if (period === "weekly") {
          sinceIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        } else if (period === "monthly") {
          sinceIso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        }

        const cats = categories && categories.length > 0 ? categories : [category];
        let q = supabase
          .from("talent_submissions")
          .select("id, title, media_url, media_type, votes_count, user_id, created_at")
          .in("category", cats as any)
          .eq("is_active", true)
          .order("votes_count", { ascending: false })
          .limit(100);

        if (sinceIso) q = q.gte("created_at", sinceIso);

        const { data, error } = await q;
        if (error) throw error;

        const subs = (data as any[]) || [];
        const userIds = [...new Set(subs.map((s) => s.user_id))];
        let profiles: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: pData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", userIds);
          (pData || []).forEach((p: any) => {
            profiles[p.id] = p;
          });
        }
        const enriched = subs.map((s) => ({ ...s, profiles: profiles[s.user_id] }));
        if (!cancelled) setRows(enriched);
      } catch (e) {
        console.error("leaderboard load", e);
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [category, categories, period]);

  const pool = PRIZE_POOL[period];

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="h-4 w-4 text-amber-400" />;
    if (i === 1) return <Medal className="h-4 w-4 text-slate-300" />;
    if (i === 2) return <Medal className="h-4 w-4 text-amber-700" />;
    return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{i + 1}</span>;
  };

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-border/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h3 className="font-bold text-base">Talent Leaderboard</h3>
            <Badge variant="secondary" className="text-[10px]">TOP 100</Badge>
          </div>
          {pool.total > 0 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 gap-1">
              <Gift className="h-3 w-3" /> €{pool.total} prize pool
            </Badge>
          )}
        </div>
        {pool.splits.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1">
            1st €{pool.splits[0]} · 2nd €{pool.splits[1]} · 3rd €{pool.splits[2]}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="grid grid-cols-3 mb-3 h-8">
            <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
            <TabsTrigger value="all_time" className="text-xs">All-time</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : rows.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">
                No entries in this period
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {rows.map((r, i) => {
                  const isTop3 = i < 3;
                  const prize = pool.splits[i];
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.4) }}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border ${
                        isTop3
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-border/20 bg-background/40"
                      }`}
                    >
                      <div className="w-5 flex justify-center shrink-0">{rankIcon(i)}</div>
                      {r.media_type === "image" ? (
                        <img
                          src={r.media_url}
                          alt={r.title}
                          className="w-10 h-10 rounded-md object-cover shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/30 to-accent/30 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{r.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {r.profiles?.full_name || "User"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold">{(r.votes_count || 0).toLocaleString()}</p>
                        {prize ? (
                          <p className="text-[10px] text-amber-400 font-semibold">€{prize}</p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground">votes</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
