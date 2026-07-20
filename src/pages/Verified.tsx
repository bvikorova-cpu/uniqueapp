import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VerifiedBadge } from "@/components/verified/VerifiedBadge";
import { Sparkles, Check, Shield, Crown, Zap, Star, MessageSquare, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const TIERS = [
  {
    key: "verified",
    name: "Unique Verified",
    price: "9.99",
    period: "one-time",
    badge: "Verified",
    icon: Shield,
    accent: "from-amber-400 to-yellow-600",
    shadow: "shadow-amber-500/20",
    features: [
      "Golden verified badge on profile",
      "Priority in Wall feed & search",
      "50 AI credits included",
      "VIP support channel",
      "Verified-only comment highlight",
      "Lifetime badge (no subscription)",
    ],
  },
  {
    key: "plus",
    name: "Unique Plus",
    price: "4.99",
    period: "month",
    badge: "Plus",
    icon: Crown,
    accent: "from-pink-500 to-rose-600",
    shadow: "shadow-pink-500/20",
    popular: true,
    features: [
      "Everything in Verified",
      "Sparkling Plus badge",
      "200 AI credits every month",
      "Top feed priority for your posts",
      "Exclusive filters & stickers",
      "Early access to new features",
    ],
  },
  {
    key: "pro",
    name: "Unique Pro",
    price: "14.99",
    period: "month",
    badge: "Pro",
    icon: Star,
    accent: "from-purple-500 to-fuchsia-600",
    shadow: "shadow-purple-500/20",
    features: [
      "Everything in Plus",
      "Ultimate Pro badge with crown",
      "Unlimited AI credits*",
      "Highest feed priority",
      "Custom profile branding",
      "Personal account manager",
      "Verified creator eligibility",
    ],
  },
];

export default function Verified() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingTier, setProcessingTier] = useState<string | null>(null);

  const success = searchParams.get("success") === "true";
  const canceledTier = searchParams.get("canceled") === "true" ? searchParams.get("tier") : null;
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (canceledTier) {
      toast(t("verified.paymentCanceled", "Payment canceled. You can try again anytime."));
    }
  }, [canceledTier, t]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let mounted = true;

    const check = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-subscription", {
          body: { tier: "verification" },
        });
        if (!mounted) return;
        if (error) throw error;
        setCurrentTier(data?.tier ?? "none");

        // After Stripe redirects back, apply the verification grant.
        if (success && sessionId && data?.tier === "none") {
          const apply = await supabase.functions.invoke("apply-verification", {
            body: { session_id: sessionId },
          });
          if (apply.error) throw apply.error;
          if (apply.data?.applied) {
            setCurrentTier(apply.data.tier);
            toast.success(
              t("verified.welcome", "Welcome to Unique {{tier}}!", { tier: apply.data.tier }),
            );
            navigate("/verified", { replace: true });
          }
        }
      } catch (e: any) {
        console.error("Verification check failed", e);
        toast.error(e?.message || t("verified.error", "Could not load verification status."));
      } finally {
        setLoading(false);
      }
    };

    check();
    return () => {
      mounted = false;
    };
  }, [user, success, sessionId, navigate, t]);

  const startCheckout = async (tier: string) => {
    if (!user) {
      navigate("/auth", { state: { returnTo: `/verified?tier=${tier}` } });
      return;
    }
    setProcessingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: "verification", tier },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (e: any) {
      toast.error(e?.message || t("verified.checkoutError", "Checkout failed."));
      setProcessingTier(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <Sparkles className="h-10 w-10 animate-spin text-primary relative" />
          </div>
          <p className="text-muted-foreground">{t("verified.loading", "Loading Unique Verified…")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Helmet>
        <title>Unique Verified</title>
        <meta name="description" content="Get verified on Unique. Golden badges, priority feed, AI credits and exclusive features." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("verified.tagline", "Stand out. Be trusted. Get seen.")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {t("verified.title", "Unique")}{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Verified
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              "verified.subtitle",
              "Unlock golden badges, priority visibility, AI credits and exclusive features that make your profile impossible to miss."
            )}
          </p>

          {currentTier && currentTier !== "none" && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary/10 border border-primary/20">
              <span className="text-muted-foreground">{t("verified.yourPlan", "Your plan:")}</span>
              <VerifiedBadge tier={currentTier} size="md" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = currentTier === tier.key;
            const isHigherCurrent =
              currentTier &&
              ["verified", "plus", "pro"].indexOf(currentTier) >= ["verified", "plus", "pro"].indexOf(tier.key);

            return (
              <div
                key={tier.key}
                className={`relative rounded-3xl border bg-card p-6 sm:p-8 flex flex-col transition-transform hover:-translate-y-1 ${
                  tier.popular ? "border-primary/40 shadow-xl scale-[1.02]" : "border-border shadow-sm"
                } ${tier.shadow}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold shadow-lg">
                    {t("verified.mostPopular", "MOST POPULAR")}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${tier.accent} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <VerifiedBadge tier={tier.key as any} size="sm" showLabel={false} />
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-black">€{tier.price}</span>
                  <span className="text-muted-foreground ml-2">
                    {tier.period === "one-time" ? t("verified.oneTime", "one-time") : `/ ${t("verified.month", "month")}`}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full rounded-xl font-bold ${
                    isCurrent || isHigherCurrent
                      ? "bg-muted text-muted-foreground hover:bg-muted"
                      : "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                  }`}
                  disabled={!!processingTier || isCurrent || isHigherCurrent}
                  onClick={() => startCheckout(tier.key)}
                >
                  {processingTier === tier.key ? (
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      {t("verified.redirecting", "Redirecting…")}
                    </span>
                  ) : isCurrent ? (
                    t("verified.currentPlan", "Current plan")
                  ) : isHigherCurrent ? (
                    t("verified.includedInHigher", "Included in your plan")
                  ) : (
                    t("verified.getStarted", "Get {{name}}", { name: tier.name })
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-5 rounded-2xl bg-card border border-border">
            <Shield className="w-7 h-7 mx-auto text-amber-500 mb-3" />
            <h4 className="font-bold mb-1">{t("verified.trust", "Trusted profiles")}</h4>
            <p className="text-sm text-muted-foreground">{t("verified.trustDesc", "Users know you are a real, verified member of Unique.")}</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border">
            <Zap className="w-7 h-7 mx-auto text-primary mb-3" />
            <h4 className="font-bold mb-1">{t("verified.priority", "Feed priority")}</h4>
            <p className="text-sm text-muted-foreground">{t("verified.priorityDesc", "Your posts appear higher and reach more people.")}</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border">
            <MessageSquare className="w-7 h-7 mx-auto text-accent mb-3" />
            <h4 className="font-bold mb-1">{t("verified.comments", "Stand out")}</h4>
            <p className="text-sm text-muted-foreground">{t("verified.commentsDesc", "Verified comments get highlighted across the platform.")}</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border">
            <Headphones className="w-7 h-7 mx-auto text-purple-500 mb-3" />
            <h4 className="font-bold mb-1">{t("verified.support", "VIP support")}</h4>
            <p className="text-sm text-muted-foreground">{t("verified.supportDesc", "Fast, human help when you need it.")}</p>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground max-w-3xl mx-auto">
          {t(
            "verified.disclaimer",
            "*Unlimited AI credits in Pro are subject to fair-use policy. Verification is tied to your Unique account and is non-transferable. Subscriptions renew automatically until canceled."
          )}
        </p>
      </div>
    </div>
  );
}
