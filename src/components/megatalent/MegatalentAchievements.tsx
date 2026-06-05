import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Flame, Heart, Trophy, Sparkles, Zap, Crown, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  userId?: string | null;
}

interface AchievementDef {
  code: string;
  title: string;
  description: string;
  icon: any;
  tier: "bronze" | "silver" | "gold" | "platinum";
  check: (stats: Stats) => boolean;
}

interface Stats {
  submissions: number;
  totalVotes: number;
  topVotes: number;
}

const DEFS: AchievementDef[] = [
  { code: "first_upload", title: "First Steps", description: "Upload your first talent", icon: Sparkles, tier: "bronze", check: (s) => s.submissions >= 1 },
  { code: "five_uploads", title: "Rising Talent", description: "Upload 5 submissions", icon: Zap, tier: "silver", check: (s) => s.submissions >= 5 },
  { code: "ten_uploads", title: "Dedicated Creator", description: "Upload 10 submissions", icon: Star, tier: "gold", check: (s) => s.submissions >= 10 },
  { code: "hundred_votes", title: "Crowd Favorite", description: "Collect 100 total votes", icon: Heart, tier: "silver", check: (s) => s.totalVotes >= 100 },
  { code: "thousand_votes", title: "Viral Star", description: "Collect 1,000 total votes", icon: Flame, tier: "gold", check: (s) => s.totalVotes >= 1000 },
  { code: "ten_thousand_votes", title: "Legend", description: "Collect 10,000 total votes", icon: Crown, tier: "platinum", check: (s) => s.totalVotes >= 10000 },
  { code: "top_post_500", title: "Hit Maker", description: "One post hits 500 votes", icon: Trophy, tier: "gold", check: (s) => s.topVotes >= 500 },
];

const tierColor = (t: string) => {
  switch (t) {
    case "platinum": return "from-cyan-400 to-blue-500 text-cyan-50";
    case "gold": return "from-amber-400 to-yellow-500 text-amber-50";
    case "silver": return "from-slate-300 to-slate-400 text-slate-900";
    default: return "from-amber-700 to-amber-800 text-amber-50";
  }
};

export default function MegatalentAchievements({ userId }: Props) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ submissions: 0, totalVotes: 0, topVotes: 0 });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = userId || u.user?.id;
        if (!uid) {
          if (!cancelled) {
            setUnlocked(new Set());
            setStats({ submissions: 0, totalVotes: 0, topVotes: 0 });
          }
          return;
        }

        // Server-side unlock (idempotent): RPC computes stats from
        // talent_submissions and inserts any newly-qualified achievements.
        // Client can no longer self-insert (RLS blocks).
        await (supabase as any).rpc("mt_unlock_user_achievements");

        const [{ data: subs }, { data: catalog }] = await Promise.all([
          supabase.from("talent_submissions").select("votes_count").eq("user_id", uid).eq("is_active", true),
          (supabase as any).from("mt_achievements").select("id, achievement_key, active").eq("active", true),
        ]);

        const submissions = subs?.length || 0;
        const totalVotes = (subs || []).reduce((sum: number, s: any) => sum + (s.votes_count || 0), 0);
        const topVotes = (subs || []).reduce((m: number, s: any) => Math.max(m, s.votes_count || 0), 0);
        const newStats = { submissions, totalVotes, topVotes };

        const ids = Object.fromEntries((catalog || []).map((a: any) => [a.achievement_key, a.id]));
        const { data: already } = Object.keys(ids).length
          ? await (supabase as any)
              .from("mt_user_achievements")
              .select("achievement_id")
              .eq("user_id", uid)
              .in("achievement_id", Object.values(ids))
          : { data: [] };
        const keyById = Object.fromEntries(Object.entries(ids).map(([key, id]) => [id, key]));
        const have = new Set<string>((already || []).map((a: any) => keyById[a.achievement_id]).filter(Boolean));

        if (!cancelled) {
          setStats(newStats);
          setUnlocked(have);
        }
      } catch (e) {
        console.error("achievements load", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-border/30 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base">Achievements</h3>
          <Badge variant="secondary" className="text-[10px]">
            {unlocked.size}/{DEFS.length}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {stats.submissions} uploads · {stats.totalVotes.toLocaleString()} total votes
        </p>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DEFS.map((d, i) => {
              const isUnlocked = unlocked.has(d.code);
              const Icon = d.icon;
              return (
                <motion.div
                  key={d.code}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`relative p-2.5 rounded-lg border transition-all ${
                    isUnlocked
                      ? "border-primary/40 bg-gradient-to-br from-primary/10 to-accent/5"
                      : "border-border/20 bg-background/40 opacity-50 grayscale"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 bg-gradient-to-br ${tierColor(
                      d.tier,
                    )}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold leading-tight">{d.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{d.description}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
