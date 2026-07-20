import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Crown, Star, Sparkles, Check, ArrowRight, ArrowDown, RefreshCw, X, RotateCcw, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VerifiedBadge } from "@/components/verified/VerifiedBadge";
import { toast } from "sonner";

type TierKey = "verified" | "plus" | "pro";

const TIERS: Array<{
  key: TierKey;
  name: string;
  price: string;
  period: string;
  icon: typeof Shield;
  accent: string;
  highlights: string[];
  popular?: boolean;
}> = [
  {
    key: "verified",
    name: "Verified",
    price: "9.99",
    period: "one-time",
    icon: Shield,
    accent: "from-amber-400 to-yellow-600",
    highlights: ["Golden badge", "Feed priority", "50 AI credits"],
  },
  {
    key: "plus",
    name: "Plus",
    price: "4.99",
    period: "/mo",
    icon: Crown,
    accent: "from-pink-500 to-rose-600",
    popular: true,
    highlights: ["Everything in Verified", "200 AI credits / mo", "Top feed priority"],
  },
  {
    key: "pro",
    name: "Pro",
    price: "14.99",
    period: "/mo",
    icon: Star,
    accent: "from-purple-500 to-fuchsia-600",
    highlights: ["Everything in Plus", "Unlimited AI*", "Personal manager"],
  },
];

const RANK: Record<string, number> = { none: 0, verified: 1, plus: 2, pro: 3 };

type StripeStatus = "none" | "active" | "canceling" | "expired";
type LiveState = {
  tier: TierKey | "none";
  status: StripeStatus;
  expiresAt: string | null;
};

export function ProfileVerificationCard() {
  const { user, verificationTier } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState<TierKey | null>(null);
  const [live, setLive] = useState<LiveState | null>(null);
  const [checking, setChecking] = useState(false);

  const fetchLive = async () => {
    if (!user) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-verification", {});
      if (error) throw error;
      if (data && typeof data.tier === "string") {
        setLive({
          tier: data.tier,
          status: (data.status ?? "none") as StripeStatus,
          expiresAt: data.expires_at ?? null,
        });
      }
    } catch (e: any) {
      // Non-fatal: fall back to AuthContext tier
      console.warn("check-verification failed", e?.message);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    void fetchLive();
    // Re-check when the tab regains focus (user often returns from Stripe here).
    const onFocus = () => void fetchLive();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const effectiveTier: TierKey | "none" = (live?.tier ?? verificationTier ?? "none") as
    | TierKey
    | "none";
  const currentRank = RANK[effectiveTier] ?? 0;
  const isSubscribed = currentRank > 0;
  const expiresAt = live?.expiresAt ?? null;
  const status = live?.status ?? (isSubscribed ? "active" : "none");

  const manageSubscription = async (
    action: "downgrade" | "cancel" | "resume" | "cancel_now",
    targetTier?: "plus" | "pro",
  ) => {
    if (!user) return;
    const key: TierKey = targetTier ?? (effectiveTier as TierKey);
    setProcessing(key);
    try {
      const { data, error } = await supabase.functions.invoke("manage-verification", {
        body: { action, target_tier: targetTier },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(
        action === "downgrade"
          ? `Downgraded to ${targetTier?.toUpperCase()} with pro-rata credit.`
          : action === "cancel"
          ? "Subscription will cancel at period end."
          : action === "resume"
          ? "Subscription resumed."
          : "Subscription cancelled.",
      );
      await fetchLive();
    } catch (e: any) {
      toast.error(e?.message || "Action failed.");
    } finally {
      setProcessing(null);
    }
  };

  const startCheckout = async (tier: TierKey) => {

    if (!user) {
      navigate("/auth", { state: { returnTo: `/verified?tier=${tier}` } });
      return;
    }
    setProcessing(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: "verification", tier },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      toast.error(e?.message || "Checkout failed.");
      setProcessing(null);
    }
  };

  const expiryLabel =
    expiresAt && effectiveTier !== "verified" && effectiveTier !== "none"
      ? new Date(expiresAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  return (
    <div className="mb-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">
            {isSubscribed ? "Your Unique membership" : "Get Unique Verified"}
          </h3>
        </div>
        <div className="inline-flex items-center gap-2 text-sm">
          {isSubscribed && (
            <>
              <span className="text-muted-foreground">Current:</span>
              <VerifiedBadge tier={effectiveTier as TierKey} size="sm" />
              {status === "canceling" && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                  Cancels {expiryLabel ?? "soon"}
                </span>
              )}
              {status === "active" && expiryLabel && (
                <span className="text-xs text-muted-foreground">renews {expiryLabel}</span>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => void fetchLive()}
            disabled={checking}
            title="Re-check status from Stripe"
            className="p-1 rounded-md hover:bg-accent/40 text-muted-foreground disabled:opacity-50"
            aria-label="Refresh from Stripe"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const rank = RANK[tier.key];
          const isCurrent = rank === currentRank;
          const isIncluded = rank < currentRank;
          const isUpgrade = rank > currentRank && currentRank > 0;
          const disabled = isCurrent || isIncluded || !!processing;

          return (
            <div
              key={tier.key}
              className={`relative rounded-xl border p-4 flex flex-col ${
                tier.popular ? "border-primary/40 bg-primary/5" : "border-border bg-background/50"
              } ${isCurrent ? "ring-2 ring-primary" : ""}`}
            >
              {tier.popular && !isCurrent && (
                <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold shadow">
                  POPULAR
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${tier.accent} text-white shadow`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">{tier.name}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">€{tier.price}</span> {tier.period}
                  </div>
                </div>
              </div>
              <ul className="space-y-1 mb-3 flex-1">
                {tier.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              {(() => {
                const isDowngrade = rank < currentRank && rank > 0 && tier.key !== "verified";
                const canceling = status === "canceling";
                // Special case: when on this exact tier and it's a recurring plan, show cancel/resume
                if (isCurrent && (tier.key === "plus" || tier.key === "pro")) {
                  return (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full font-semibold"
                      disabled={!!processing}
                      onClick={() => void manageSubscription(canceling ? "resume" : "cancel")}
                    >
                      {processing === (tier.key as TierKey) ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          Working…
                        </span>
                      ) : canceling ? (
                        <span className="inline-flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Resume</span>
                      ) : (
                        <span className="inline-flex items-center gap-1"><X className="w-3.5 h-3.5" /> Cancel at period end</span>
                      )}
                    </Button>
                  );
                }
                return (
                  <Button
                    size="sm"
                    variant={tier.popular || isUpgrade ? "default" : "outline"}
                    className={`w-full font-semibold ${
                      tier.popular || isUpgrade
                        ? "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0"
                        : ""
                    }`}
                    disabled={(isCurrent || isIncluded || !!processing) && !isDowngrade}
                    onClick={() =>
                      isDowngrade
                        ? void manageSubscription("downgrade", tier.key as "plus")
                        : startCheckout(tier.key)
                    }
                  >
                    {processing === tier.key ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Working…
                      </span>
                    ) : isCurrent ? (
                      "Current"
                    ) : isDowngrade ? (
                      <span className="inline-flex items-center gap-1"><ArrowDown className="w-3.5 h-3.5" /> Downgrade</span>
                    ) : isIncluded ? (
                      "Included"
                    ) : isUpgrade ? (
                      <span className="inline-flex items-center gap-1">Upgrade <ArrowRight className="w-3.5 h-3.5" /></span>
                    ) : (
                      `Get ${tier.name}`
                    )}
                  </Button>
                );
              })()}
            </div>
          );
        })}
      </div>




      <button
        type="button"
        onClick={() => navigate("/verified")}
        className="mt-3 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
      >
        Compare all benefits →
      </button>
    </div>
  );
}
