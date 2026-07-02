import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Gift, Loader2, Lock, Sparkles, Star, Ticket, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { triggerRewardConfetti } from "@/utils/confetti";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Season {
  id: string;
  season_number: number;
  name: string;
  starts_at: string;
  ends_at: string;
}

interface Progress {
  xp: number;
  premium_unlocked: boolean;
  claimed_tiers: number[];
}

const TOTAL_TIERS = 30;
const XP_PER_TIER = 100;

export default function IQBattlePass() {
  const [season, setSeason] = useState<Season | null>(null);
  const [progress, setProgress] = useState<Progress>({ xp: 0, premium_unlocked: false, claimed_tiers: [] });
  const [loading, setLoading] = useState(true);
  const [claimingTier, setClaimingTier] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const currentTier = Math.min(TOTAL_TIERS, Math.floor(progress.xp / XP_PER_TIER));
  const xpInTier = progress.xp % XP_PER_TIER;
  const daysLeft = useMemo(() => {
    if (!season) return 0;
    const ms = new Date(season.ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [season]);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: s } = await supabase
      .from("iq_battle_pass_seasons")
      .select("id,season_number,name,starts_at,ends_at")
      .eq("is_active", true)
      .order("season_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (s) {
      setSeason(s as Season);
      const { data: p } = await supabase
        .from("iq_battle_pass_progress")
        .select("xp,premium_unlocked,claimed_tiers")
        .eq("user_id", user.id)
        .eq("season_id", s.id)
        .maybeSingle();
      if (p) setProgress(p as Progress);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const claimTier = async (tier: number) => {
    setClaimingTier(tier);
    try {
      const { data, error } = await supabase.rpc("claim_iq_battle_pass_tier", { _tier: tier });
      if (error) throw error;
      const res = data as { claimed: boolean; reason?: string };
      if (!res.claimed) {
        toast({ title: "Cannot claim", description: res.reason });
      } else {
        triggerRewardConfetti();
        toast({ title: `Tier ${tier} claimed!`, description: "Reward added to your IQ credits" });
        await load();
        qc.invalidateQueries({ queryKey: ["iq-credits"] });
      }
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" });
    } finally {
      setClaimingTier(null);
    }
  };

  const unlockPremium = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !season) return;
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          productType: "iq_battle_pass",
          metadata: { season_id: season.id, season_number: season.season_number },
          successUrl: window.location.origin + "/iq-platform?bp=success",
          cancelUrl: window.location.origin + "/iq-platform",
        },
      });
      if (error) throw error;
      if (data?.url) {
        const w = window.open(data.url, "_blank", "noopener,noreferrer");
        if (!w) window.location.href = data.url;
      }
    } catch (e) {
      toast({
        title: "Premium unlock",
        description: "Checkout not yet configured for Battle Pass — contact support.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How IQBattle Pass works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
        <CardContent className="p-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></CardContent>
      </Card>
      </>
      );
  }

  if (!season) {
    return (
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No active Battle Pass season. Check back soon!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-600/15 via-pink-500/10 to-amber-500/10 border-purple-500/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ticket className="h-5 w-5 text-purple-400" /> {season.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Season {season.season_number} · {daysLeft} days left
            </p>
          </div>
          {progress.premium_unlocked ? (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              <Crown className="h-3 w-3 mr-1" /> Premium
            </Badge>
          ) : (
            <Button size="sm" variant="outline" onClick={unlockPremium} className="text-xs h-7">
              <Sparkles className="h-3 w-3 mr-1" /> Unlock Premium
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Tier {currentTier}/{TOTAL_TIERS}
            </span>
            <span className="text-muted-foreground">
              {currentTier < TOTAL_TIERS ? `${xpInTier}/${XP_PER_TIER} XP` : "MAX"}
            </span>
          </div>
          <Progress value={currentTier < TOTAL_TIERS ? (xpInTier / XP_PER_TIER) * 100 : 100} className="h-2" />
          <p className="text-[11px] text-muted-foreground mt-1">
            Total XP: <span className="font-semibold text-purple-400">{progress.xp}</span>
            {" · "}Earn XP from duels, daily challenges, and IQ tests
          </p>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-64 overflow-y-auto pr-1">
          {Array.from({ length: TOTAL_TIERS }, (_, i) => i + 1).map((tier) => {
            const reached = currentTier >= tier;
            const claimed = progress.claimed_tiers.includes(tier);
            const isPremiumTier = tier % 5 === 0;
            const canClaim = reached && !claimed;
            return (
              <motion.button
                key={tier}
                whileHover={canClaim ? { scale: 1.05 } : undefined}
                whileTap={canClaim ? { scale: 0.95 } : undefined}
                onClick={() => canClaim && claimTier(tier)}
                disabled={!canClaim || claimingTier === tier}
                className={`relative aspect-square rounded-md border text-[10px] font-bold flex flex-col items-center justify-center transition-all ${
                  claimed
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : canClaim
                      ? "bg-gradient-to-br from-purple-500/40 to-pink-500/30 border-purple-400 text-white animate-pulse cursor-pointer"
                      : reached
                        ? "bg-muted/40 border-border"
                        : "bg-muted/20 border-border/30 opacity-50"
                }`}
                title={`Tier ${tier} · ${tier * XP_PER_TIER} XP`}
              >
                {isPremiumTier && (
                  <Crown className={`h-2.5 w-2.5 absolute top-0.5 right-0.5 ${progress.premium_unlocked ? "text-amber-400" : "text-muted-foreground"}`} />
                )}
                <span>{tier}</span>
                {claimingTier === tier ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : claimed ? (
                  <Star className="h-3 w-3" />
                ) : canClaim ? (
                  <Gift className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3 opacity-40" />
                )}
              </motion.button>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Each tier rewards <span className="font-semibold text-purple-400">+1 IQ credit</span>.
          Premium unlocks <span className="font-semibold text-amber-400">+3 bonus credits</span> on every 5th tier (5, 10, 15, 20, 25, 30).
        </p>
      </CardContent>
    </Card>
  );
}
