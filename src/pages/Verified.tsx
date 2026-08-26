import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VerifiedBadge } from "@/components/verified/VerifiedBadge";
import { Sparkles, Check, Shield, Zap, MessageSquare, Headphones, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const VERIFIED_CREDIT_COST = 30;

const FEATURES = [
  "Golden verified badge on profile",
  "Priority in Wall feed & search",
  "Verified-only comment highlight",
  "VIP support channel",
  "Lifetime badge — one-time credit payment, no subscription",
];

export default function Verified() {
  const { t } = useTranslation();
  const { user, verificationTier } = useAuth();
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchTier = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("verification_tier")
      .eq("id", user.id)
      .maybeSingle();
    setCurrentTier((data as any)?.verification_tier ?? verificationTier ?? "none");
    setLoading(false);
  };

  useEffect(() => {
    void fetchTier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isVerified = currentTier !== "none";

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
          toast.error(t("verified.noCredits", "Not enough credits"), {
            description: `Unique Verified costs ${VERIFIED_CREDIT_COST} credits.`,
            action: { label: "Top up", onClick: () => navigate("/ai-credits-store") } });
          return;
        }
        throw new Error((data as any)?.error || "Purchase failed");
      }
      toast.success(t("verified.welcomeSimple", "Welcome to Unique Verified!"));
      await fetchTier();
    } catch (e: any) {
      toast.error(e?.message || t("verified.checkoutError", "Purchase failed."));
    } finally {
      setProcessing(false);
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
        <title>Unique Verified — One-time credit badge</title>
        <meta
          name="description"
          content="Get the golden Unique Verified badge for a one-time 30 credit payment. Feed priority, highlighted comments and VIP support."
        />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {t("verified.tagline", "Stand out. Be trusted. Get seen.")}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {t("verified.title", "Unique")}{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Verified
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              "verified.subtitleCredits",
              "One golden badge, one single payment in credits. No subscription, no renewals."
            )}
          </p>

          {isVerified && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary/10 border border-primary/20">
              <span className="text-muted-foreground">{t("verified.yourPlan", "Your plan:")}</span>
              <VerifiedBadge tier={"verified" as any} size="md" />
            </div>
          )}
        </div>

        <div className="relative rounded-3xl border border-amber-500/30 bg-card p-6 sm:p-8 shadow-xl shadow-amber-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Unique Verified</h2>
              <VerifiedBadge tier={"verified" as any} size="sm" showLabel={false} />
            </div>
          </div>

          <div className="mb-6 flex items-baseline gap-2">
            <Coins className="w-6 h-6 text-amber-500 self-center" />
            <span className="text-4xl font-black">{VERIFIED_CREDIT_COST}</span>
            <span className="text-muted-foreground">
              {t("verified.creditsOneTime", "credits · one-time")}
            </span>
          </div>

          <ul className="space-y-3 mb-8">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            className={`w-full rounded-xl font-bold ${
              isVerified
                ? "bg-muted text-muted-foreground hover:bg-muted"
                : "bg-gradient-to-r from-amber-500 to-primary hover:opacity-90 text-white"
            }`}
            disabled={processing || isVerified}
            onClick={() => void buyWithCredits()}
          >
            {processing ? (
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                {t("verified.working", "Working…")}
              </span>
            ) : isVerified ? (
              t("verified.currentPlan", "Current plan")
            ) : (
              t("verified.unlockCredits", "Unlock for {{cost}} credits", { cost: VERIFIED_CREDIT_COST })
            )}
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
          <div className="p-5 rounded-2xl bg-card border border-border">
            <Shield className="w-7 h-7 mx-auto text-amber-500 mb-3" />
            <h3 className="font-bold mb-1">{t("verified.trust", "Trusted profiles")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("verified.trustDesc", "Users know you are a real, verified member of Unique.")}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border">
            <Zap className="w-7 h-7 mx-auto text-primary mb-3" />
            <h3 className="font-bold mb-1">{t("verified.priority", "Feed priority")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("verified.priorityDesc", "Your posts appear higher and reach more people.")}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border">
            <MessageSquare className="w-7 h-7 mx-auto text-accent mb-3" />
            <h3 className="font-bold mb-1">{t("verified.comments", "Stand out")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("verified.commentsDesc", "Verified comments get highlighted across the platform.")}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border">
            <Headphones className="w-7 h-7 mx-auto text-purple-500 mb-3" />
            <h3 className="font-bold mb-1">{t("verified.support", "VIP support")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("verified.supportDesc", "Fast, human help when you need it.")}
            </p>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
          {t(
            "verified.disclaimerCredits",
            "Verification is tied to your Unique account and is non-transferable. Credits are deducted once; there is no recurring charge."
          )}
        </p>
      </div>
    </div>
  );
}
