import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  Crown,
  Zap,
  ExternalLink,
  Sparkles,
  Shield,
  Headphones,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SubscriptionHero } from "@/components/subscription/SubscriptionHero";
import { BillingToggle } from "@/components/subscription/BillingToggle";
import { ComparisonTable } from "@/components/subscription/ComparisonTable";
import { SubscriptionFAQ } from "@/components/subscription/SubscriptionFAQ";
import { SubscriptionTestimonials } from "@/components/subscription/SubscriptionTestimonials";
import { SavingsCalculator } from "@/components/subscription/SavingsCalculator";
import { LiveActivityBanner } from "@/components/subscription/LiveActivityBanner";
import {
  CurrencySelector,
  useDetectedCurrency,
  formatPrice,
} from "@/components/subscription/CurrencySelector";
import { UrgencyTimer } from "@/components/subscription/UrgencyTimer";
import { EnterpriseTier } from "@/components/subscription/EnterpriseTier";
import { WinBackDialog } from "@/components/subscription/WinBackDialog";
import { PerksCarousel } from "@/components/subscription/PerksCarousel";


import { RoiDashboard } from "@/components/subscription/RoiDashboard";
import { GiftSubscriptionDialog } from "@/components/subscription/GiftSubscriptionDialog";
import { RedeemGiftDialog } from "@/components/subscription/RedeemGiftDialog";
import { PlanRecommenderCard } from "@/components/subscription/PlanRecommenderCard";
import { SeatManagement } from "@/components/subscription/SeatManagement";
import { LoyaltyTierBadge } from "@/components/subscription/LoyaltyTierBadge";
import { UsageMeterCard } from "@/components/subscription/UsageMeterCard";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [currentTier, setCurrentTier] = useState<string>("basic");
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [yearly, setYearly] = useState(false);
  const [winBackOpen, setWinBackOpen] = useState(false);
  const [currency, setCurrency] = useDetectedCurrency();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (sub) setCurrentTier(sub.tier);
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: { tier, billing: yearly ? "yearly" : "monthly" },
      });
      if (error) throw error;
      if (data?.url) setStripeUrl(data.url);
    } catch (error) {
      console.error("Subscription error:", error);
      toast({ title: "Error", description: "Failed to create payment", variant: "destructive" });
    }
  };

  // Three-step retention flow handlers
  const handlePauseSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("pause-subscription", {
        body: { months: 1 },
      });
      if (error) throw error;
      toast({
        title: "Subscription paused ⏸️",
        description: data?.message || "Your subscription is paused for 1 month.",
      });
      await checkAuth();
    } catch (error) {
      console.error("Pause error:", error);
      toast({
        title: "Couldn't pause",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptDiscount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("apply-retention-discount", {});
      if (error) throw error;
      toast({
        title: "🎁 Discount applied!",
        description: data?.message || "50% off applied to your next 3 invoices.",
      });
      await checkAuth();
    } catch (error) {
      console.error("Discount error:", error);
      toast({
        title: "Couldn't apply discount",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || currentTier === "basic") return;
    setCanceling(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { subscriptionType: "general" },
      });
      if (error) throw error;
      toast({
        title: "Subscription cancelled",
        description: data.message || "Subscription will be cancelled at the end of the current period",
      });
      setWinBackOpen(false);
      await checkAuth();
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({ title: "Error", description: "Failed to cancel subscription", variant: "destructive" });
    } finally {
      setCanceling(false);
    }
  };

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get("success");
      const tier = urlParams.get("tier");
      if (success === "true" && tier) {
        toast({ title: "Payment processing", description: "Verifying subscription status..." });
        // Retry with backoff — Stripe webhook may lag a few seconds
        const delays = [0, 1500, 3000, 6000];
        let activated = false;
        for (const d of delays) {
          if (d) await new Promise((r) => setTimeout(r, d));
          const { data, error } = await supabase.functions.invoke("check-subscription");
          if (!error && data?.tier && data.tier === tier) {
            setCurrentTier(data.tier);
            toast({ title: "Success!", description: `${tier.toUpperCase()} subscription has been activated` });
            activated = true;
            break;
          }
        }
        if (!activated) {
          toast({
            title: "Still processing",
            description: "Subscription activation is taking longer than usual. Refresh in a minute.",
          });
        }
        window.history.replaceState({}, "", "/subscription");
      }
    };
    if (user) checkPaymentStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Base prices in EUR — converted via currency selector
  const monthlyPrices = { basic: 5, premium: 15, business: 50 };
  const yearlyPrices = { basic: 48, premium: 144, business: 480 }; // ~20% off
  const basePrices = yearly ? yearlyPrices : monthlyPrices;
  const period = yearly ? "/yr" : "/mo";

  const plans = [
    {
      tier: "basic",
      name: "Basic",
      tagline: "Get started for free essentials",
      basePrice: basePrices.basic,
      icon: Check,
      gradient: "from-slate-500/20 to-slate-700/10",
      iconBg: "bg-slate-500/10",
      iconColor: "text-slate-400",
      popular: false,
      features: [
        "5 Bazaar listings/month",
        "5 auctions/month",
        "All basic features",
        "3% sales commission",
        "20 AI generations/month",
        "Email support",
      ],
    },
    {
      tier: "premium",
      name: "Premium",
      tagline: "Most loved by serious creators",
      basePrice: basePrices.premium,
      icon: Crown,
      gradient: "from-primary/30 via-purple-500/20 to-amber-400/10",
      iconBg: "bg-gradient-to-br from-primary/20 to-purple-500/20",
      iconColor: "text-primary",
      popular: true,
      features: [
        "Unlimited listings",
        "Unlimited auctions",
        "0% sales commission",
        "50 AI generations/month",
        "Featured listings (3/month)",
        "Priority support",
        "Analytics & statistics",
      ],
    },
    {
      tier: "business",
      name: "Business",
      tagline: "Scale without limits",
      basePrice: basePrices.business,
      icon: Zap,
      gradient: "from-amber-500/20 via-orange-500/10 to-rose-500/10",
      iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-500",
      popular: false,
      features: [
        "Everything from Premium",
        "0% commission forever",
        "Unlimited AI features",
        "Unlimited featured listings",
        "Custom branding",
        "API access",
        "Dedicated support",
        "Personal account manager",
      ],
    },
  ];

  const trustBadges = [
    { icon: Shield, label: "Bank-grade security" },
    { icon: Award, label: "GDPR compliant" },
    { icon: Headphones, label: "24/7 support" },
    { icon: Sparkles, label: "Cancel anytime" },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <AlertDialog open={!!stripeUrl} onOpenChange={() => setStripeUrl(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Subscription Ready
            </AlertDialogTitle>
            <AlertDialogDescription>
              Click the button below to complete payment securely via Stripe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={() => {
              if (!stripeUrl) return;
              const w = window.open(stripeUrl, "_blank", "noopener,noreferrer");
              if (!w) window.location.href = stripeUrl;
            }} className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Stripe Payment
            </Button>
            <Button variant="outline" onClick={() => setStripeUrl(null)} className="w-full">
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <WinBackDialog
        open={winBackOpen}
        onClose={() => setWinBackOpen(false)}
        onPause={handlePauseSubscription}
        onAcceptDiscount={handleAcceptDiscount}
        onConfirmCancel={handleCancelSubscription}
        cancelling={canceling}
      />

      <div className="container mx-auto px-4">
        {/* (1) Hero */}
        <SubscriptionHero currentTier={currentTier} />

        <HeroRewardedAd sectionKey="page_subscription" />

        {/* (8) ROI dashboard for paying users */}
        {user && currentTier !== "basic" && (
          <RoiDashboard userId={user.id} currency={currency} tier={currentTier} />
        )}

        {/* Phase 3 — Subscription extensions */}
        {user && (
          <div className="mt-6 space-y-4 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <LoyaltyTierBadge />
              <div className="flex gap-2">
                <RedeemGiftDialog />
                <GiftSubscriptionDialog />
              </div>
            </div>
            <PlanRecommenderCard />
            <div className="grid md:grid-cols-2 gap-4">
              <UsageMeterCard />
              {currentTier !== "basic" && <SeatManagement tier={currentTier} />}
            </div>
          </div>
        )}

        {/* (1) Live activity */}
        <div className="mt-8">
          <LiveActivityBanner />
        </div>

        {/* (5) Urgency timer */}
        <UrgencyTimer />

        {/* (4) Currency display (charges always in EUR via Stripe) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
          <CurrencySelector value={currency} onChange={setCurrency} />
          <p className="text-xs text-muted-foreground">
            Display only — all payments are processed in EUR (€).
          </p>
        </div>
        <BillingToggle yearly={yearly} onChange={setYearly} />

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            const isCurrent = currentTier === plan.tier;
            const monthlyEur = monthlyPrices[plan.tier as keyof typeof monthlyPrices];
            const savingsEur = yearly ? monthlyEur * 12 - plan.basePrice : 0;
            return (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
              >
                <Card
                  className={`relative overflow-hidden h-full transition-all hover:scale-[1.02] hover:shadow-2xl ${
                    plan.popular ? "ring-2 ring-primary shadow-xl shadow-primary/20 lg:scale-105" : ""
                  } ${isCurrent ? "border-emerald-500/50" : ""}`}
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.gradient}`} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-30 pointer-events-none`} />

                  {plan.popular && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-purple-500 text-primary-foreground border-0 px-3 py-1 shadow-lg">
                        ⭐ Most Popular
                      </Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-emerald-500 text-white border-0">Current</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6 relative">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-2xl ${plan.iconBg}`}>
                        <Icon className={`h-8 w-8 ${plan.iconColor}`} />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black">{plan.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
                    <div className="mt-4 flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-black bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                        {formatPrice(plan.basePrice, currency)}
                      </span>
                      <span className="text-muted-foreground text-sm">{period}</span>
                    </div>
                    {yearly && savingsEur > 0 && (
                      <p className="text-xs text-emerald-500 font-semibold mt-1">
                        Save {formatPrice(savingsEur, currency)} vs monthly
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-6 relative">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="mt-0.5 p-0.5 rounded-full bg-emerald-500/20">
                            <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full font-semibold ${
                        plan.popular
                          ? "bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/30"
                          : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      disabled={isCurrent}
                      onClick={() => handleSubscribe(plan.tier)}
                    >
                      {isCurrent
                        ? "Current Plan"
                        : plan.tier === "basic"
                        ? "Choose Basic"
                        : currentTier === "basic"
                        ? `Start ${plan.name} Free`
                        : `Switch to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* (3) Enterprise anchor tier */}
        <EnterpriseTier />

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-6 text-sm text-muted-foreground"
        >
          {trustBadges.map((b) => (
            <div key={b.label} className="flex items-center gap-1.5">
              <b.icon className="h-4 w-4 text-primary" />
              <span>{b.label}</span>
            </div>
          ))}
        </motion.div>

        {/* (2)+(9) Cancel triggers Win-back flow with pause + discount */}
        {currentTier !== "basic" && (
          <div className="mt-10 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWinBackOpen(true)}
              disabled={canceling}
              className="text-muted-foreground hover:text-destructive"
            >
              Cancel current subscription
            </Button>
          </div>
        )}

        {/* (10) Perks spotlight */}
        <PerksCarousel />

        {/* Savings calculator */}
        <SavingsCalculator />

        {/* Comparison */}
        <ComparisonTable />

        {/* Testimonials */}
        <SubscriptionTestimonials />


        {/* FAQ */}
        <SubscriptionFAQ />

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-amber-400/10 border border-primary/30 backdrop-blur-xl"
        >
          <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-black mb-3">Ready to go Premium?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of creators turning passion into income. Cancel anytime, keep everything you build.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30 font-semibold"
            onClick={() => handleSubscribe("premium")}
            disabled={currentTier === "premium"}
          >
            <Crown className="h-4 w-4 mr-2" />
            {currentTier === "premium" ? "You're on Premium ✨" : "Start Premium Today"}
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Prices in {currency.code} · Secure payments via Stripe · Cancel anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;
