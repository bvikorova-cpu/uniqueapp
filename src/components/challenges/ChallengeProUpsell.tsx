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
  const [openingPortal, setOpeningPortal] = useState(false);

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

  const ring = accent === "orange" ? "ring-orange-300/60" : "ring-emerald-300/60";
  const grad = accent === "orange"
    ? "from-amber-950 via-orange-900 to-rose-900"
    : "from-emerald-950 via-green-900 to-teal-900";
  const highlight = accent === "orange" ? "text-orange-200" : "text-emerald-200";

  if (loading) return null;

  if (isPro) {
    return (
      <Card className={`bg-gradient-to-br ${grad} ring-2 ${ring} border-0 text-white mb-4`}>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-yellow-400/20 ring-1 ring-yellow-300/50 shrink-0">
              <Leaf className="w-5 h-5 text-yellow-300" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold leading-tight">You are Challenge PRO</p>
              <p className="text-xs text-white/80 mt-1">
                2× monthly prize (200,000 XP) · Gold badge next to your name
                {activeUntil && <> · Renews {new Date(activeUntil).toLocaleDateString()}</>}
              </p>
            </div>
            <ChallengeProBadge />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={openPortal}
            disabled={openingPortal}
            className="w-full bg-white/10 hover:bg-white/20 border-white/30 text-white gap-1.5"
          >
            {openingPortal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
            Manage or cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${grad} ring-2 ${ring} border-0 text-white mb-4 overflow-hidden`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-yellow-400/20 ring-1 ring-yellow-300/50 shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base sm:text-lg leading-tight">
              Go Challenge PRO
            </p>
            <p className="text-sm text-white/80 mt-0.5">€3 / month · Cancel anytime</p>
          </div>
          <ChallengeProBadge />
        </div>

        <ul className="space-y-2.5 text-sm text-white/90">
          <li className="flex items-start gap-2.5">
            <Trophy className={`w-4 h-4 mt-0.5 shrink-0 ${highlight}`} />
            <span>Win <b>200,000 XP</b> instead of 100,000 XP as monthly champion</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlight}`} />
            <span>Gold-leaf <b>Eco-Champion PRO</b> badge next to your name</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlight}`} />
            <span>Works on <b>both</b> Eco &amp; Healthy Challenges</span>
          </li>
        </ul>

        <Button
          onClick={subscribe}
          disabled={checkingOut}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-bold"
        >
          {checkingOut ? "Opening checkout…" : "Upgrade to PRO — €3/mo"}
        </Button>
      </CardContent>
    </Card>
  );
}
