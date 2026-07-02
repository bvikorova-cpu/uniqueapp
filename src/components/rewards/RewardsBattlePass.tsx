import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Lock, Check, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";


interface Reward {
  id: string;
  tier: number;
  track: "free" | "premium";
  reward_type: string;
  reward_value: number;
  reward_label: string;
  reward_icon: string | null;
}

export default function RewardsBattlePass() {
  const { user } = useAuth();
  const [season, setSeason] = useState<any>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [claims, setClaims] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [claimingKey, setClaimingKey] = useState<string | null>(null);
  const [purchasingPremium, setPurchasingPremium] = useState(false);

  const refresh = async () => {
    const { data: s } = await supabase
      .from("battle_pass_seasons")
      .select("*")
      .eq("is_active", true)
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSeason(s);
    if (!s) { setLoading(false); return; }

    // Parallel fetch of rewards + progress + claims
    const rewardsP = supabase
      .from("battle_pass_rewards")
      .select("*")
      .eq("season_id", s.id)
      .order("tier", { ascending: true });

    const progP = user
      ? supabase.from("user_battle_pass").select("*").eq("user_id", user.id).eq("season_id", s.id).maybeSingle()
      : Promise.resolve({ data: null } as any);

    const claimsP = user
      ? supabase.from("user_battle_pass_claims").select("tier, track").eq("user_id", user.id).eq("season_id", s.id)
      : Promise.resolve({ data: [] } as any);

    const [{ data: r }, progRes, { data: cl }] = await Promise.all([rewardsP, progP, claimsP]);
    setRewards((r || []) as Reward[]);

    if (user) {
      let prog = (progRes as any).data;
      if (!prog) {
        // Upsert avoids duplicate-row races on first render across multiple tabs.
        const ins = await supabase.from("user_battle_pass")
          .upsert({ user_id: user.id, season_id: s.id }, { onConflict: "user_id,season_id", ignoreDuplicates: false })
          .select().single();
        prog = ins.data;
      }
      setProgress(prog);
      setClaims(new Set((cl || []).map((c: any) => `${c.tier}-${c.track}`)));
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user?.id]);

  const claimReward = async (tier: number, track: "free" | "premium") => {
    if (!user || !season) return;
    const key = `${tier}-${track}`;
    if (claimingKey) return;
    if (claims.has(key)) return;
    if (track === "premium" && !progress?.has_premium) {
      toast.error("Premium track required");
      return;
    }
    if (tier > (progress?.current_tier ?? 0)) {
      toast.error("Reach this tier first");
      return;
    }
    setClaimingKey(key);
    try {
      const { data, error } = await supabase.rpc("claim_battle_pass_reward", {
        _season_id: season.id, _tier: tier, _track: track,
      });
      if (error) { toast.error(error.message); return; }
      const res = data as any;
      if (!res?.ok) { toast.error(res?.error ?? "Claim failed"); return; }
      toast.success("Reward claimed! 🎉");
      await refresh();
    } finally {
      setClaimingKey(null);
    }
  };

  const purchasePremium = async () => {
    if (!user || !season || purchasingPremium) return;
    setPurchasingPremium(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: "rewards_checkout", kind: "battle_pass_premium" },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (!url) throw new Error("No checkout URL");
      window.location.href = url;
    } catch (e: any) {
      toast.error(e?.message || "Checkout failed");
      setPurchasingPremium(false);
    }
  };

  useEffect(() => {
    const onDone = () => refresh();
    window.addEventListener("rewards-purchase-completed", onDone);
    return () => window.removeEventListener("rewards-purchase-completed", onDone);
  }, [user?.id]);


  if (loading) return <p className="text-sm text-muted-foreground p-4">{"Loading Battle Pass..."}</p>;
  if (!season) return (
    <Card><CardContent className="p-8 text-center text-muted-foreground">
      <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>{"No active Battle Pass season. Check back soon!"}</p>
    </CardContent></Card>
  );

  const currentXP = progress?.current_xp ?? 0;
  const currentTier = progress?.current_tier ?? 0;
  const xpInTier = currentXP % season.xp_per_tier;
  const tierProgress = (xpInTier / season.xp_per_tier) * 100;
  const daysLeft = Math.max(0, Math.ceil((+new Date(season.ends_at) - Date.now()) / 86400000));

  const tiersToShow = Array.from({ length: season.total_tiers }, (_, i) => i + 1);
  const rewardsByKey = new Map<string, Reward>();
  rewards.forEach(r => rewardsByKey.set(`${r.tier}-${r.track}`, r));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/30">
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge className="bg-white/20 mb-2">{`Season ${season.season_number}`}</Badge>
              <h2 className="text-2xl font-bold">{season.name}</h2>
              <p className="text-sm opacity-90">{`${daysLeft} days left · Tier ${currentTier} / ${season.total_tiers}`}</p>
            </div>
            {!progress?.has_premium && (
              <Button onClick={purchasePremium} disabled={purchasingPremium} className="bg-white text-purple-700 hover:bg-white/90 font-bold">
                <Crown className="h-4 w-4 mr-1" />
                {purchasingPremium ? "Loading…" : `Unlock Premium · €${season.premium_price_eur}`}
              </Button>
            )}
            {progress?.has_premium && (
              <Badge className="bg-yellow-400 text-purple-900 font-bold gap-1">
                <Crown className="h-3 w-3" /> {"PREMIUM"}
              </Badge>
            )}
          </div>
          <div className="mt-4">
            <Progress value={tierProgress} className="h-3 bg-white/20" />
            <p className="text-xs mt-1 opacity-90">{`${xpInTier} / ${season.xp_per_tier} XP to Tier ${currentTier + 1}`}</p>
          </div>
        </div>
      </Card>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max px-1">
          {tiersToShow.map(tier => {
            const free = rewardsByKey.get(`${tier}-free`);
            const premium = rewardsByKey.get(`${tier}-premium`);
            const reached = tier <= currentTier;
            const freeClaimed = claims.has(`${tier}-free`);
            const premiumClaimed = claims.has(`${tier}-premium`);
            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tier * 0.01 }}
                className="w-24 flex-shrink-0"
              >
                <div className="text-center mb-1">
                  <Badge variant={reached ? "default" : "outline"} className="text-xs">T{tier}</Badge>
                </div>
                {/* Free track */}
                <button
                  onClick={() => free && claimReward(tier, "free")}
                  disabled={!free || !reached || freeClaimed || claimingKey === `${tier}-free`}
                  className={`w-full aspect-square rounded-lg border-2 mb-2 flex flex-col items-center justify-center text-xs p-1 transition-all ${
                    freeClaimed ? "bg-emerald-500/20 border-emerald-500" :
                    reached ? "bg-card border-primary/40 hover:border-primary cursor-pointer" :
                    "bg-muted/40 border-border/40 opacity-50"
                  }`}
                >
                  {freeClaimed ? <Check className="h-5 w-5 text-emerald-400" /> :
                   !reached ? <Lock className="h-4 w-4 text-muted-foreground" /> :
                   <Star className="h-4 w-4 text-yellow-500" />}
                  <span className="mt-1 truncate w-full text-[10px]">{free?.reward_label || "—"}</span>
                </button>
                {/* Premium track */}
                <button
                  onClick={() => premium && claimReward(tier, "premium")}
                  disabled={!premium || !reached || !progress?.has_premium || premiumClaimed || claimingKey === `${tier}-premium`}
                  className={`w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs p-1 transition-all ${
                    premiumClaimed ? "bg-yellow-500/20 border-yellow-500" :
                    !progress?.has_premium ? "bg-muted/40 border-yellow-500/30 opacity-60" :
                    reached ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/60 hover:border-yellow-500 cursor-pointer" :
                    "bg-muted/40 border-border/40 opacity-50"
                  }`}
                >
                  {premiumClaimed ? <Check className="h-5 w-5 text-yellow-400" /> :
                   !progress?.has_premium ? <Crown className="h-4 w-4 text-yellow-500/60" /> :
                   !reached ? <Lock className="h-4 w-4 text-muted-foreground" /> :
                   <Crown className="h-4 w-4 text-yellow-500" />}
                  <span className="mt-1 truncate w-full text-[10px]">{premium?.reward_label || "—"}</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-muted-foreground flex items-center gap-4 px-1">
        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {"Free track"}</span>
        <span className="flex items-center gap-1"><Crown className="h-3 w-3 text-yellow-500" /> {"Premium track"}</span>
      </div>
    </div>
  );
}
