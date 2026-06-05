import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Sparkles, Star, Check, Loader2 } from "lucide-react";
import { useUserXp } from "@/hooks/useUserXp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TIERS = [
  { lvl: 1, xp: 0, reward: "Welcome badge", icon: "🎁" },
  { lvl: 2, xp: 50, reward: "Gold border on submissions", icon: "🥇" },
  { lvl: 3, xp: 150, reward: "+5 credits", icon: "💎" },
  { lvl: 4, xp: 300, reward: "Spotlight slot for 24h", icon: "🌟" },
  { lvl: 5, xp: 500, reward: "Custom emote pack", icon: "🎨" },
  { lvl: 6, xp: 800, reward: "Free Battle Royale entry", icon: "⚔️" },
  { lvl: 7, xp: 1200, reward: "Champion-only chat access", icon: "👑" },
];

const SEASON_ID = "current";

const MegatalentSeasonPass = ({ userId }: { userId: string | null }) => {
  const { xp } = useUserXp(userId);
  const [claimed, setClaimed] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setClaimed(new Set());
      return;
    }
    const { data } = await (supabase as any)
      .from("mt_season_pass_claims")
      .select("tier_level")
      .eq("user_id", userId)
      .eq("season_id", SEASON_ID);
    setClaimed(new Set((data || []).map((r: any) => r.tier_level)));
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const claim = async (tier: typeof TIERS[number]) => {
    if (!userId) {
      toast.error("Sign in required");
      return;
    }
    if (xp < tier.xp) {
      toast.error(`Need ${tier.xp - xp} more XP`);
      return;
    }
    if (claimed.has(tier.lvl)) return;
    setBusy(tier.lvl);
    const { data, error } = await (supabase as any).rpc("mt_claim_season_tier", {
      _season_id: SEASON_ID,
      _tier_level: tier.lvl,
    });
    setBusy(null);
    if (error) {
      toast.error("Claim failed", { description: error.message });
      return;
    }
    if (data?.error) {
      toast.error(data.error === "insufficient_xp" ? `Need ${data.need} more XP` : data.error);
      return;
    }
    setClaimed((prev) => new Set([...prev, tier.lvl]));
    toast.success(`Claimed: ${tier.reward}`);
  };

  const currentTier = [...TIERS].reverse().find((t) => xp >= t.xp) || TIERS[0];
  const nextTier = TIERS.find((t) => t.xp > xp);
  const pct = nextTier ? Math.round(((xp - currentTier.xp) / (nextTier.xp - currentTier.xp)) * 100) : 100;

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-bold">Season Pass</h3>
          <Badge variant="secondary" className="ml-auto gap-1">
            <Sparkles className="h-3 w-3" /> {xp} XP
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Tier {currentTier.lvl}</span>
          {nextTier ? <span>{nextTier.xp - xp} XP to Tier {nextTier.lvl}</span> : <span>Max tier reached</span>}
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-primary to-accent" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TIERS.map((t) => {
            const unlocked = xp >= t.xp;
            const isClaimed = claimed.has(t.lvl);
            const isCurrent = t.lvl === currentTier.lvl;
            return (
              <motion.div
                key={t.lvl}
                whileHover={{ y: -2 }}
                className={`min-w-[120px] rounded-xl p-3 text-center border-2 transition flex flex-col ${
                  isClaimed
                    ? "border-emerald-500 bg-emerald-500/10"
                    : isCurrent
                    ? "border-primary bg-primary/15"
                    : unlocked
                    ? "border-yellow-500/40 bg-yellow-500/5"
                    : "border-border/30 bg-background/30 opacity-60"
                }`}
              >
                <div className="text-2xl mb-1">
                  {unlocked ? t.icon : <Lock className="h-5 w-5 mx-auto text-muted-foreground" />}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Tier {t.lvl}</div>
                <div className="text-xs font-semibold leading-tight mt-0.5">{t.reward}</div>
                <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-center gap-0.5">
                  <Star className="h-2.5 w-2.5" />
                  {t.xp}
                </div>
                <Button
                  size="sm"
                  variant={isClaimed ? "outline" : unlocked ? "default" : "ghost"}
                  disabled={!unlocked || isClaimed || busy === t.lvl}
                  onClick={() => claim(t)}
                  className="mt-2 h-7 text-[10px] px-2"
                >
                  {busy === t.lvl ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isClaimed ? (
                    <>
                      <Check className="h-3 w-3 mr-1" /> Claimed
                    </>
                  ) : unlocked ? (
                    "Claim"
                  ) : (
                    "Locked"
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MegatalentSeasonPass;
