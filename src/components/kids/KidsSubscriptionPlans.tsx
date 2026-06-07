import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Loader2, Crown, Star, BookOpen, Palette, FlaskConical, MessageCircle, Pencil, Moon, School, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SafeContentBadge } from "./SafeContentBadge";
import { PricingHero } from "./pricing/PricingHero";
import { ComparisonTable } from "./pricing/ComparisonTable";
import { FlipBenefitCard } from "./pricing/FlipBenefitCard";
import { TestimonialCarousel } from "./pricing/TestimonialCarousel";
import { SavingsCalculator } from "./pricing/SavingsCalculator";
import { PricingFAQ } from "./pricing/PricingFAQ";
import { TrustBadges } from "./pricing/TrustBadges";

const PRODUCT_TIERS = {
  monthly: {
    product_id: "prod_TPWmSQy8vJrtpe",
    price_id: "price_1SShj2GaXSfGtYFtcKlTJYGa"
  },
  annual: {
    product_id: "prod_TPWmNY3AZcnjUH",
    price_id: "price_1SShj3GaXSfGtYFtGEneXVhs"
  },
  gold_pass: {
    product_id: "prod_UbEDgqmGITgxMA",
    price_id: "price_1Tc1kyGaXSfGtYFtcfVW1fcY"
  }
};

const benefitCards = [
  { icon: BookOpen, emoji: "📖", title: "Story Creator", shortDesc: "AI-powered custom stories", details: ["Personalized characters & plots", "Choose theme, length & moral", "Save to Magic Library", "Share with family"], color: "from-purple-500/10 to-pink-500/10" },
  { icon: GraduationCap, emoji: "🎓", title: "Homework Helper", shortDesc: "Smart tutoring assistant", details: ["Step-by-step explanations", "Math, Science, Language", "Adapts to child's level", "Practice exercises"], color: "from-blue-500/10 to-cyan-500/10" },
  { icon: Palette, emoji: "🎨", title: "Drawing Buddy", shortDesc: "Learn to draw anything", details: ["Step-by-step tutorials", "AI drawing suggestions", "Save & share artwork", "Multiple art styles"], color: "from-pink-500/10 to-rose-500/10" },
  { icon: FlaskConical, emoji: "🔬", title: "Science Lab", shortDesc: "Virtual experiments", details: ["Safe virtual experiments", "Interactive simulations", "Real-world science topics", "Quizzes & badges"], color: "from-green-500/10 to-emerald-500/10" },
  { icon: MessageCircle, emoji: "💬", title: "Character Chat", shortDesc: "Talk to story characters", details: ["Chat with AI characters", "Educational conversations", "Safe & moderated", "Multiple personalities"], color: "from-amber-500/10 to-yellow-500/10" },
  { icon: Moon, emoji: "🌙", title: "Bedtime Stories", shortDesc: "Relaxing sleep stories", details: ["Calming narrated stories", "Sleep timer built-in", "Age-appropriate content", "New stories daily"], color: "from-indigo-500/10 to-violet-500/10" },
];

export default function KidsSubscriptionPlans() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCheckingSubscription(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke('check-kids-subscription');
      if (error) throw error;
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to subscribe');
      return;
    }
    setLoading(prev => ({ ...prev, [planId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('create-kids-subscription-checkout', {
        body: { tier: planId }
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening checkout...');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (!currentSubscription?.subscribed) return false;
    const productId = PRODUCT_TIERS[planId as keyof typeof PRODUCT_TIERS]?.product_id;
    return currentSubscription.product_id === productId;
  };

  const handleManageSubscription = async () => {
    setLoading(prev => ({ ...prev, portal: true }));
    try {
      const { data, error } = await supabase.functions.invoke('kids-customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening subscription portal...');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open portal. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, portal: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Hero */}
        <PricingHero />

        {/* Manage Subscription Button */}
        {currentSubscription?.subscribed && (
          <div className="text-center">
            <Button
              onClick={handleManageSubscription}
              disabled={loading.portal}
              variant="outline"
            >
              {loading.portal ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
              ) : '⚙️ Manage Subscription'}
            </Button>
          </div>
        )}

        {/* Gold Pass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Card className="relative overflow-hidden border-4 border-amber-400 shadow-2xl shadow-amber-300/30 ring-2 ring-amber-400/50 max-w-lg w-full bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/40 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/20">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-amber-500/5 to-orange-500/10 pointer-events-none" />
            
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
              <Badge className="gap-1 text-base px-4 py-2 shadow-lg bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 text-white border-2 border-amber-300">
                <Crown className="h-4 w-4" /> BEST FOR FAMILIES
              </Badge>
            </div>
            
            <div className="h-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
            
            <CardHeader className="text-center pb-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400"
              >
                <Crown className="h-10 w-10 text-white" />
              </motion.div>
              <CardTitle className="text-2xl text-amber-700 dark:text-amber-300">
                👑 Unique Kids Gold Pass
              </CardTitle>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg text-muted-foreground line-through">€99</span>
                  <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">€79</span>
                </div>
                <div className="text-sm text-muted-foreground">/month</div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2">
                  All Kids Channel modules included!
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 gap-2">
                {[
                  '🎓 Homework Helper - Unlimited',
                  '📖 Story Creator - Unlimited',
                  '🎨 Drawing Buddy - Unlimited',
                  '🔬 Science Lab - Unlimited',
                  '📚 Reading Companion - Unlimited',
                  '🎨 Coloring Pages - Unlimited',
                  '🏰 Fairy Castles - Full Access',
                  '💬 Character Chat - Unlimited',
                  '🌙 Bedtime Stories - All Content',
                  '👨‍👩‍👧 Up to 5 child profiles',
                  '📊 Monthly Progress Reports',
                  '📈 Parental analytics dashboard',
                  '⭐ Priority support 24/7'
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900">
                      <Star className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={() => handleUpgrade('gold_pass')}
                disabled={isCurrentPlan('gold_pass') || loading['gold_pass'] || checkingSubscription}
                className="w-full text-lg py-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:via-amber-600 hover:to-orange-600 text-white border-2 border-amber-300"
              >
                {loading['gold_pass'] ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
                ) : isCurrentPlan('gold_pass') ? (
                  '✓ Your Plan'
                ) : (
                  <><Crown className="mr-2 h-5 w-5" /> Get Gold Pass</>
                )}
              </Button>
              
              <p className="text-xs text-center text-amber-700 dark:text-amber-300 mt-3">
                🔒 Secure payment. Requires parental verification for AI features.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flip Benefit Cards */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              What's Included
            </span>
            {" "}in Gold Pass
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {benefitCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <FlipBenefitCard {...card} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <ComparisonTable />

        {/* Savings Calculator */}
        <SavingsCalculator />

        {/* Testimonials */}
        <TestimonialCarousel />

        {/* Trust Badges */}
        <TrustBadges />

        {/* Safe Content Badge */}
        <div className="max-w-2xl mx-auto">
          <SafeContentBadge />
        </div>

        {/* FAQ */}
        <PricingFAQ />

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6 pb-8"
        >
          <h2 className="text-3xl font-bold">
            Ready to unlock the{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              magic
            </span>
            ? ✨
          </h2>
          <Button
            onClick={() => handleUpgrade('gold_pass')}
            disabled={isCurrentPlan('gold_pass') || loading['gold_pass']}
            size="lg"
            className="text-lg px-12 py-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl"
          >
            <Crown className="mr-2 h-5 w-5" /> Get Gold Pass — €79/mo
          </Button>
          <p className="text-sm text-muted-foreground">
            ✓ No hidden fees · ✓ Cancel anytime · ✓ 14-day money-back guarantee
          </p>
        </motion.div>
      </div>
    </div>
  );
}
