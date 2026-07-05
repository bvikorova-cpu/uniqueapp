import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Trophy, Sparkles, Check, Settings, Loader2, Crown, Zap, Pin } from "lucide-react";
import { useChallengePro } from "@/hooks/useChallengePro";
import { ChallengeProBadge } from "./ChallengeProBadge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Upsell card for the Challenge subscriptions.
 *  - PRO tier: €3/month · 2× monthly winner XP (200,000) + gold badge.
 *  - TOP tier: €5/month · everything in PRO + **500,000 XP guaranteed every month**
 *    (auto-granted), TOP badge, and submissions pinned to top of feed.
 *  - Monthly winner (any tier): 1,000,000 AI credits + 5% of the total monthly
 *    subscription revenue pool (paid out as a cash prize).
 */

export function ChallengeProUpsell({ accent = "emerald" }: { accent?: "emerald" | "orange" }) {
  const { tier, isPro, isTop, activeUntil, loading, subscribe, checkingOut } = useChallengePro();
  const [openingPortal, setOpeningPortal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<"pro" | "top" | null>(null);

  const openPortal = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) {
        const w = window.open(url, "_blank", "noopener,noreferrer");
        if (!w) window.location.href = url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (e: any) {
      toast.error(e?.message || "Couldn't open billing portal");
    } finally {
      setOpeningPortal(false);
    }
  };

  const handleSubscribe = (target: "pro" | "top") => {
    setSelectedTarget(target);
    subscribe(target).finally(() => setSelectedTarget(null));
  };

  const ring = accent === "orange" ? "ring-orange-300/60" : "ring-emerald-300/60";
  const grad = accent === "orange"
    ? "from-amber-950 via-orange-900 to-rose-900"
    : "from-emerald-950 via-green-900 to-teal-900";
  const highlight = accent === "orange" ? "text-orange-200" : "text-emerald-200";

  if (loading) return null;

  // Active subscriber view
  if (isPro) {
    return (
      <Card className={`bg-gradient-to-br ${grad} ring-2 ${ring} border-0 text-white mb-4`}>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-yellow-400/20 ring-1 ring-yellow-300/50 shrink-0">
              {isTop ? (
                <Crown className="w-5 h-5 text-pink-300" fill="currentColor" />
              ) : (
                <Leaf className="w-5 h-5 text-yellow-300" fill="currentColor" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold leading-tight">
                You are Challenge {isTop ? "TOP" : "PRO"}
              </p>
              <p className="text-xs text-white/80 mt-1">
                {isTop
                  ? "TOP badge · Pinned in feed · 500,000 XP guaranteed / month"
                  : "2× monthly prize (200,000 XP) · Gold badge next to your name"}
                {activeUntil && <> · Renews {new Date(activeUntil).toLocaleDateString()}</>}
              </p>


            </div>
            <ChallengeProBadge tier={isTop ? "top" : "pro"} />
          </div>

          {/* PRO users can upgrade to TOP */}
          {!isTop && (
            <Button
              size="sm"
              onClick={() => handleSubscribe("top")}
              disabled={checkingOut}
              className="w-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 hover:opacity-90 text-white font-bold gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              {checkingOut && selectedTarget === "top" ? "Opening…" : "Upgrade to TOP — €5/mo"}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={openPortal}
            disabled={openingPortal}
            className="w-full bg-white/10 hover:bg-white/20 border-white/30 text-white gap-1.5"
          >
            {openingPortal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
            Manage billing
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Non-subscriber: show both tiers side-by-side
  return (
    <Card className={`bg-gradient-to-br ${grad} ring-2 ${ring} border-0 text-white mb-4 overflow-hidden`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-yellow-400/20 ring-1 ring-yellow-300/50 shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base sm:text-lg leading-tight">
              Boost your Challenge
            </p>
            <p className="text-sm text-white/80 mt-0.5">Two tiers · Non-refundable</p>
          </div>
        </div>

        {/* Winner prize banner — visible to everyone */}
        <div className="rounded-lg bg-gradient-to-r from-yellow-500/25 via-amber-500/25 to-orange-500/25 border border-yellow-300/50 p-3 flex items-start gap-2">
          <Trophy className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" fill="currentColor" />
          <div className="text-xs sm:text-sm text-white leading-snug">
            <b className="text-yellow-200">Monthly winner prize (any tier):</b>{" "}
            <b>1,000,000 AI credits</b> usable across the whole platform{" "}
            <span className="text-white/70">(non-cashable)</span> +{" "}
            <b>5% of the total monthly subscription pool</b> paid out in cash. The more people subscribe, the bigger the cash prize.
          </div>
        </div>


        <div className="grid gap-3 sm:grid-cols-2">
          {/* PRO card */}
          <div className="rounded-lg bg-black/20 border border-white/10 p-4 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">PRO</p>
                <p className="text-xs text-white/70">€3 / month</p>
              </div>
              <ChallengeProBadge tier="pro" />
            </div>
            <ul className="space-y-2 text-sm text-white/90 flex-1">
              <li className="flex items-start gap-2">
                <Trophy className={`w-4 h-4 mt-0.5 shrink-0 ${highlight}`} />
                <span><b>200,000 XP</b> monthly prize (2×)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlight}`} />
                <span>Gold PRO badge</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlight}`} />
                <span>Eco &amp; Healthy Challenges</span>
              </li>
            </ul>
            <Button
              onClick={() => handleSubscribe("pro")}
              disabled={checkingOut}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-bold"
            >
              {checkingOut && selectedTarget === "pro" ? "Opening…" : "Go PRO — €3/mo"}
            </Button>
          </div>

          {/* TOP card */}
          <div className="rounded-lg bg-gradient-to-br from-pink-500/20 via-fuchsia-500/20 to-purple-500/20 border border-pink-300/40 p-4 space-y-3 flex flex-col relative">
            <span className="absolute -top-2 right-3 text-[10px] font-black tracking-wider bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-2 py-0.5 rounded-full shadow">
              BEST
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">TOP</p>
                <p className="text-xs text-white/70">€5 / month</p>
              </div>
              <ChallengeProBadge tier="top" />
            </div>
            <ul className="space-y-2 text-sm text-white/90 flex-1">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-pink-200" />
                <span>Everything in PRO</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-4 h-4 mt-0.5 shrink-0 text-pink-200" />
                <span><b>500,000 XP guaranteed</b> every month — auto-granted</span>
              </li>
              <li className="flex items-start gap-2">
                <Crown className="w-4 h-4 mt-0.5 shrink-0 text-pink-200" />
                <span><b>TOP</b> badge next to your name</span>
              </li>
              <li className="flex items-start gap-2">
                <Pin className="w-4 h-4 mt-0.5 shrink-0 text-pink-200" />
                <span>Your submission <b>pinned</b> at the top of the feed</span>
              </li>
              <li className="flex items-start gap-2">
                <Trophy className="w-4 h-4 mt-0.5 shrink-0 text-pink-200" />
                <span>If you <b>win</b>: 1M AI credits + 5% of subscription pool (see banner above)</span>
              </li>
            </ul>
            <Button
              onClick={() => handleSubscribe("top")}
              disabled={checkingOut}
              className="w-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 hover:opacity-90 text-white font-bold"
            >
              {checkingOut && selectedTarget === "top" ? "Opening…" : "Go TOP — €5/mo"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
