import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { Sparkles, Zap, Star, Package, ArrowLeft, Image as ImageIcon, Brush, Pencil, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AICreditsHero } from "@/components/ai-credits/AICreditsHero";
import { AICreditsLiveTicker } from "@/components/ai-credits/AICreditsLiveTicker";
import { AICreditsFlashSale } from "@/components/ai-credits/AICreditsFlashSale";
import { AICreditsLowBalanceAlert } from "@/components/ai-credits/AICreditsLowBalanceAlert";
import { AICreditsRecommendation } from "@/components/ai-credits/AICreditsRecommendation";
import { AIUsageAnalytics } from "@/components/ai-credits/AIUsageAnalytics";
import { AICommunityGalleryStrip } from "@/components/ai-credits/AICommunityGalleryStrip";
import { AutoRechargeCard } from "@/components/ai-credits/AutoRechargeCard";
import { CreditSubscriptionCard } from "@/components/ai-credits/CreditSubscriptionCard";
import { RolloverPolicyBanner } from "@/components/ai-credits/RolloverPolicyBanner";
import { BulkSliderCalculator } from "@/components/ai-credits/BulkSliderCalculator";
import { SpendForecastCard } from "@/components/ai-credits/SpendForecastCard";
import { UsageBreakdownChart } from "@/components/ai-credits/UsageBreakdownChart";
import { GiftCreditsDialog } from "@/components/ai-credits/GiftCreditsDialog";
import { ReferralCreditsCard } from "@/components/ai-credits/ReferralCreditsCard";
import { PromoCodeInput } from "@/components/ai-credits/PromoCodeInput";
import { AlternativePayMethods } from "@/components/ai-credits/AlternativePayMethods";
import { ReceiptHistoryCard } from "@/components/ai-credits/ReceiptHistoryCard";
import { WatchAdButton } from "@/components/ads/WatchAdButton";
import { SEO } from "@/components/SEO";

const AICreditsStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits, refresh } = useAICredits();
  const [loading, setLoading] = useState(false);
  const packagesRef = useRef<HTMLDivElement>(null);

  // Post-payment verification: refresh credits after Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("payment");
    const sessionId = params.get("session_id");
    if (status === "success" && sessionId) {
      (async () => {
        try {
          await supabase.functions.invoke("verify-payment", {
            body: { session_id: sessionId },
          });
        } catch (e) {
          console.warn("verify-payment failed", e);
        }
        await refresh();
        toast({
          title: "Payment successful",
          description: "Your AI credits have been added to your account.",
        });
        // Clean URL
        window.history.replaceState({}, "", "/ai-credits-store");
      })();
    } else if (status === "canceled") {
      toast({
        title: "Payment canceled",
        description: "No charge was made. You can try again anytime.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/ai-credits-store");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const creditPackages = [
    { name: "Starter", credits: 10, price: 5, icon: Sparkles, popular: false, description: "Try AI features", perCredit: 0.50 },
    { name: "Basic", credits: 25, price: 10, icon: Star, popular: true, description: "Most popular", perCredit: 0.40, savings: "20%" },
    { name: "Pro", credits: 60, price: 20, icon: Zap, popular: false, description: "Power creators", perCredit: 0.33, savings: "34%" },
    { name: "Ultimate", credits: 150, price: 40, icon: Package, popular: false, description: "Best value", perCredit: 0.27, savings: "46%" },
  ];

  const usageCosts = [
    { icon: ImageIcon, label: "Image Generation", cost: "5 credits" },
    { icon: Pencil, label: "Image Editing", cost: "3 credits" },
    { icon: Brush, label: "Style Transfer", cost: "3 credits" },
    { icon: ArrowUpRight, label: "AI Upscaler", cost: "2 credits" },
  ];

  const handlePurchase = async (pkg: { credits: number; price: number }) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", description: "Please sign in to purchase credits", variant: "destructive" });
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          product: "ai_credits",
          amount: pkg.price * 100,
          productName: `${pkg.credits} AI Credits`,
          mode: "payment",
          metadata: { credits: String(pkg.credits) },
          successUrl: `${window.location.origin}/ai-credits-store?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/ai-credits-store?payment=canceled`,
        },
      });
      if (error) throw error;
      if (data?.url) {
        const w = window.open(data.url, '_blank', 'noopener,noreferrer');
        if (!w) window.location.href = data.url;
      }
    } catch (error: any) {
      toast({ title: "Payment Error", description: error?.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const scrollToPackages = () => packagesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Flash-sale shortcut: 100 credits for €25 (custom price)
  const handleFlashSale = () => handlePurchase({ credits: 100, price: 25 });

  const handleSelectByCredits = (creditsAmount: number) => {
    const pkg = creditPackages.find(p => p.credits === creditsAmount);
    if (pkg) handlePurchase(pkg);
    else scrollToPackages();
  };

  return (
    <>
      <SEO
        title="AI Credits Store - Top up & unlock AI tools"
        description="Buy AI credits to generate images, videos, music, courses and more across Unique. Flash sales, packs and bundles available."
        canonical="/ai-credits-store"
      />
    <div className="min-h-screen bg-background pt-16 pb-12">
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Preparing Payment</h3>
            <p className="text-muted-foreground">Please wait...</p>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/ai-generation')} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Studio
        </Button>

        {/* Cinematic hero */}
        <AICreditsHero
          credits={credits?.credits_remaining ?? 0}
          totalPurchased={credits?.total_credits_purchased ?? 0}
          onScrollToPackages={scrollToPackages}
        />

        {/* Live ticker */}
        <AICreditsLiveTicker />

        {/* Low balance alert (renders only if low) */}
        <AICreditsLowBalanceAlert credits={credits?.credits_remaining ?? 0} />

        {/* Earn free XP by watching an ad */}
        <div className="flex items-center justify-center gap-3 rounded-xl border border-border/40 bg-card/40 p-4 backdrop-blur">
          <span className="text-sm text-muted-foreground">Earn free XP — no purchase needed:</span>
          <WatchAdButton size="sm" />
        </div>


        {/* Flash sale */}
        <AICreditsFlashSale onClaim={handleFlashSale} />

        {/* Smart recommendation */}
        <AICreditsRecommendation onSelectPackage={handleSelectByCredits} />

        {/* Packages */}
        <div ref={packagesRef} className="scroll-mt-20">
          <div className="text-center mb-6">
            <Badge className="mb-3" variant="default">
              <Package className="h-3 w-3 mr-1" /> Choose your pack
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black">
              Credits that grow with you
            </h2>
            <p className="text-sm text-muted-foreground mt-2">Bigger packs = lower price per credit</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
            {creditPackages.map((pkg, i) => {
              const Icon = pkg.icon;
              return (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className={`relative h-full transition-all hover:-translate-y-1 hover:shadow-xl ${pkg.popular ? 'ring-2 ring-primary shadow-xl shadow-primary/10' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground shadow-lg">Most Popular</Badge>
                      </div>
                    )}
                    {pkg.savings && (
                      <div className="absolute -top-3 right-3">
                        <Badge className="bg-emerald-500 text-white shadow-lg">−{pkg.savings}</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4 pt-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${pkg.popular ? 'bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/30' : 'bg-muted'}`}>
                        <Icon className={`h-7 w-7 ${pkg.popular ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <CardTitle className="text-xl font-black">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                      <div className="mt-3">
                        <span className="text-4xl font-black">€{pkg.price}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{pkg.credits} credits · €{pkg.perCredit}/credit</p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className={`w-full font-bold ${pkg.popular ? 'bg-gradient-to-r from-primary to-purple-500 hover:opacity-90' : ''}`}
                        variant={pkg.popular ? 'default' : 'outline'}
                        disabled={loading}
                        onClick={() => handlePurchase(pkg)}
                      >
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Roll-over policy */}
        <RolloverPolicyBanner />

        {/* Bulk slider */}
        <BulkSliderCalculator />

        {/* Monthly subscription packs */}
        <CreditSubscriptionCard />

        {/* Spend forecast */}
        <SpendForecastCard />

        {/* Promo code */}
        <PromoCodeInput onApplied={refresh} />

        {/* Alternative pay methods notice */}
        <AlternativePayMethods />

        {/* Gift + Referral row */}
        <div className="max-w-5xl mx-auto mb-6 flex justify-end">
          <GiftCreditsDialog />
        </div>
        <ReferralCreditsCard />

        {/* Auto-recharge */}
        <AutoRechargeCard currentBalance={credits?.credits_remaining ?? 0} />

        {/* Smart features section */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
          <AIUsageAnalytics />
          <UsageBreakdownChart />
        </div>

        {/* Receipt history */}
        <ReceiptHistoryCard />

        {/* Community gallery */}
        <div className="max-w-6xl mx-auto mb-8">
          <AICommunityGalleryStrip />
        </div>

        {/* Usage Costs */}
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> Credit Usage Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {usageCosts.map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-bold text-sm">{item.cost}</p>
                    <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Credits are valid for 12 months · Usable across all AI features on the platform
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default AICreditsStore;
