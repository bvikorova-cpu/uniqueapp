import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw, CalendarClock } from "lucide-react";
import { useChallengePro, type ChallengeKind } from "@/hooks/useChallengePro";
import { toast } from "sonner";

/** Subscription status panel with an explicit "Check payment" re-sync button. */
export function ChallengeSubscriptionPanel({ challenge }: { challenge: ChallengeKind }) {
  const { tier, isPro, activeUntil, loading, syncFromStripe } = useChallengePro(challenge);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try {
      await syncFromStripe();
      toast.success("Payment status refreshed");
    } catch {
      toast.error("Could not verify payment. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const nextPeriod = activeUntil
    ? new Date(activeUntil).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {isPro ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm">
                Subscription:{" "}
                {loading ? "checking…" : isPro ? "Active" : "Inactive"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {challenge} Challenge {isPro ? (tier === "top" ? "TOP (€5/mo)" : "PRO (€3/mo)") : "— no active plan"}
              </p>
            </div>
          </div>
          {isPro && <Badge variant="secondary">{tier === "top" ? "TOP" : "PRO"}</Badge>}
        </div>

        {nextPeriod && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="w-3.5 h-3.5" />
            {isPro ? `Next billing period starts ${nextPeriod}` : `Expired on ${nextPeriod}`}
          </p>
        )}

        <Button size="sm" variant="outline" onClick={check} disabled={checking} className="w-full sm:w-auto">
          <RefreshCw className={`w-4 h-4 mr-2 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Checking…" : "Check payment"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default ChallengeSubscriptionPanel;
