import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles, Coins } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreditBannerProps {
  label: string;            // e.g. "Reading"
  creditsRemaining: number;
  costPerUse: number;
  onBuyCredits: () => void;
  unitName?: string;        // e.g. "analysis", "story"
}

/**
 * Generic credit balance / out-of-credits banner used across Kids modules.
 * Replaces legacy subscription banners in the paid-only credit model.
 */
export const CreditBanner = ({ label,
  creditsRemaining,
  costPerUse,
  onBuyCredits,
  unitName = "use" }: CreditBannerProps) => {
  const { user } = useAuth();
  const [goldPass, setGoldPass] = useState(false);

  // Hide the entire credit banner when the user has an active Kids Gold Pass —
  // access is unlimited and no credits are deducted, so showing "0 credits" is
  // misleading. Reacts realtime to webhook-driven changes.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("kids_gold_pass_status")
        .select("active")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setGoldPass(!!data?.active);
    };
    load();
    const ch = supabase
      .channel(`credit-banner-gold-${user.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "kids_gold_pass_status", filter: `user_id=eq.${user.id}` },
        load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [user?.id]);

  if (goldPass) return null;

  const canUse = creditsRemaining >= costPerUse;
  const usesLeft = Math.floor(creditsRemaining / costPerUse);

  if (!canUse) {
    return (
    <>
      <FloatingHowItWorks title={"Credit Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Credit Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Credit Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">
                {creditsRemaining === 0
                  ? `No ${label} credits left`
                  : `Not enough ${label} credits`}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                You have <strong>{creditsRemaining}</strong> credits. Each {unitName} costs{" "}
                <strong>{costPerUse}</strong>. Buy credits to continue.
              </p>
              <Button
                onClick={onBuyCredits}
                className="bg-gradient-to-r from-primary to-accent"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Buy {label} credits
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/40">
      <CardContent className="py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Coins className="h-6 w-6 text-primary" />
          <div>
            <p className="font-semibold text-foreground">
              {creditsRemaining} {label} credits
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ {usesLeft} {unitName}
              {usesLeft === 1 ? "" : "s"} left ({costPerUse} credits each)
            </p>
          </div>
        </div>
        <Button onClick={onBuyCredits} variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Buy more
        </Button>
      </CardContent>
    </Card>
  );
};
