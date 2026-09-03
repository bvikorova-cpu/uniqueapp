import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Sparkles, Check, Coins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VerifiedBadge } from "@/components/verified/VerifiedBadge";
import { toast } from "sonner";

export const VERIFIED_CREDIT_COST = 30;

const HIGHLIGHTS = [
  "Golden verified badge",
  "Feed priority",
  "Verified-only comment highlight",
  "Lifetime badge (one-time purchase)",
];

export function ProfileVerificationCard() {
  const { user, verificationTier } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [tier, setTier] = useState<string>("none");

  const fetchTier = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("verification_tier")
      .eq("id", user.id)
      .maybeSingle();
    setTier((data as any)?.verification_tier ?? "none");
  };

  useEffect(() => {
    void fetchTier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const effectiveTier = tier !== "none" ? tier : verificationTier ?? "none";
  const isVerified = effectiveTier !== "none";

  const buyWithCredits = async () => {
    if (!user) {
      navigate("/auth", { state: { returnTo: "/verified" } });
      return;
    }
    setProcessing(true);
    try {
      const { data, error } = await (supabase as any).rpc("purchase_verified_with_credits");
      if (error) throw error;
      if (!(data as any)?.ok) {
        if ((data as any)?.error === "insufficient_credits") {
          toast.error("Not enough credits", {
            description: `Unique Verified costs ${VERIFIED_CREDIT_COST} credits.`,
            action: { label: "Top up", onClick: () => navigate("/ai-credits-store") } });
          return;
        }
        throw new Error((data as any)?.error || "Purchase failed");
      }
      toast.success("You are now Unique Verified!");
      await fetchTier();
    } catch (e: any) {
      toast.error(e?.message || "Purchase failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mb-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">
            {isVerified ? "Your Unique membership" : "Get Unique Verified"}
          </h3>
        </div>
        {isVerified && (
          <div className="inline-flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Current:</span>
            <VerifiedBadge tier={"verified" as any} size="sm" />
          </div>
        )}
      </div>

      <div className="relative rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm">Verified</div>
            {isVerified ? (
              <div className="text-xs text-muted-foreground">Lifetime badge — unlocked</div>
            ) : (
              <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-500" />
                <span className="font-semibold text-foreground">{VERIFIED_CREDIT_COST} credits</span> one-time
              </div>
            )}
          </div>
        </div>
        <ul className="space-y-1 mb-4">
          {HIGHLIGHTS.map((h) => (
            <li key={h} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
        <Button
          size="sm"
          className="w-full font-semibold bg-gradient-to-r from-amber-500 to-primary hover:opacity-90 text-white border-0"
          disabled={isVerified || processing}
          onClick={() => void buyWithCredits()}
        >
          {processing ? (
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Working…
            </span>
          ) : isVerified ? (
            "Active"
          ) : (
            `Unlock for ${VERIFIED_CREDIT_COST} credits`
          )}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => navigate("/verified")}
        className="mt-3 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
      >
        See all benefits →
      </button>
    </div>
  );
}
