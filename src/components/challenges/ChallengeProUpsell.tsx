import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Trophy, Sparkles, Check, Settings, Loader2 } from "lucide-react";
import { useChallengePro } from "@/hooks/useChallengePro";
import { ChallengeProBadge } from "./ChallengeProBadge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Upsell card for the €3/month Challenge PRO subscription.
 * Shown at the top of Eco Challenge & Healthy Challenge pages.
 *  - Non-subscribers see a "Go PRO" CTA.
 *  - Active subscribers see a confirmation with badge + expiry.
 */
export function ChallengeProUpsell({ accent = "emerald" }: { accent?: "emerald" | "orange" }) {
  const { isPro, activeUntil, loading, subscribe, checkingOut } = useChallengePro();

  const ring = accent === "orange" ? "ring-orange-300/60" : "ring-emerald-300/60";
  const grad = accent === "orange"
    ? "from-amber-950 via-orange-900 to-rose-900"
    : "from-emerald-950 via-green-900 to-teal-900";
  const highlight = accent === "orange" ? "text-orange-200" : "text-emerald-200";

  if (loading) return null;

  if (isPro) {
    return (
      <Card className={`bg-gradient-to-br ${grad} ring-2 ${ring} border-0 text-white mb-4`}>
        <CardContent className="pt-5 pb-5 flex items-center gap-3">
          <div className="p-2 rounded-full bg-yellow-400/20 ring-1 ring-yellow-300/50">
            <Leaf className="w-6 h-6 text-yellow-300" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold">You are Challenge PRO</p>
              <ChallengeProBadge />
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              2× monthly prize (200,000 XP) · Gold badge next to your name
              {activeUntil && <> · Renews {new Date(activeUntil).toLocaleDateString()}</>}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${grad} ring-2 ${ring} border-0 text-white mb-4 overflow-hidden`}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-yellow-400/20 ring-1 ring-yellow-300/50 shrink-0">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-lg">Go Challenge PRO — €3/month</p>
              <ChallengeProBadge />
            </div>
            <ul className="mt-2 space-y-1 text-sm text-white/90">
              <li className="flex items-center gap-2">
                <Trophy className={`w-4 h-4 ${highlight}`} />
                Win <b>200,000 XP</b> instead of 100,000 XP when you're monthly champion
              </li>
              <li className="flex items-center gap-2">
                <Check className={`w-4 h-4 ${highlight}`} />
                Gold-leaf <b>Eco-Champion PRO</b> badge next to your name everywhere
              </li>
              <li className="flex items-center gap-2">
                <Check className={`w-4 h-4 ${highlight}`} />
                Applies to <b>both</b> Eco &amp; Healthy Challenges · Cancel anytime
              </li>
            </ul>
            <Button
              onClick={subscribe}
              disabled={checkingOut}
              className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-bold"
            >
              {checkingOut ? "Opening checkout…" : "Upgrade to PRO — €3/mo"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
