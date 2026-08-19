import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";
import { useState } from "react";
import { useChallengePro } from "@/hooks/useChallengePro";

/**
 * Participation in the Eco / Healthy Challenge is subscription-only.
 * There is no free tier — users must hold PRO (€3/mo) or TOP (€5/mo).
 */
export function ChallengeLockedCard({ accent = "emerald", challenge = "eco" }: { accent?: "emerald" | "orange"; challenge?: "eco" | "healthy" }) {
  const { subscribe, checkingOut } = useChallengePro(challenge);
  const [target, setTarget] = useState<"pro" | "top" | null>(null);

  const go = (t: "pro" | "top") => {
    setTarget(t);
    subscribe(t).finally(() => setTarget(null));
  };

  const grad = accent === "orange"
    ? "from-amber-950 via-orange-900 to-rose-900"
    : "from-emerald-950 via-green-900 to-teal-900";

  return (
    <Card className={`bg-gradient-to-br ${grad} border-0 text-white`}>
      <CardContent className="pt-6 space-y-4 text-center">
        <Lock className="w-9 h-9 mx-auto text-yellow-300" />
        <div>
          <p className="font-bold text-lg">Subscription required</p>
          <p className="text-sm text-white/80 mt-1">
            Participation is paid only — there is no free entry. This {challenge === "healthy" ? "Healthy" : "Eco"} Challenge plan is
            separate from the other challenge. Choose PRO (€3/mo) or TOP (€5/mo) to submit
            your daily proof, appear in the feed and compete for the monthly prize.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            onClick={() => go("pro")}
            disabled={checkingOut}
            className="bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-bold"
          >
            {checkingOut && target === "pro" ? "Opening…" : "Go PRO — €3/mo"}
          </Button>
          <Button
            onClick={() => go("top")}
            disabled={checkingOut}
            className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 hover:opacity-90 text-white font-bold gap-1.5"
          >
            <Crown className="w-4 h-4" />
            {checkingOut && target === "top" ? "Opening…" : "Go TOP — €5/mo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
