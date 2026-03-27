import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Heart, Brain, Wind, Palette, BookOpen, Check, Volume2, TrendingUp, Crown, Zap, Shield, Lock, Moon, Target } from "lucide-react";
import { MindfulnessChat } from "@/components/wellness/MindfulnessChat";
import { BreathingExercises } from "@/components/wellness/BreathingExercises";
import { GratitudeJournal } from "@/components/wellness/GratitudeJournal";
import { GroundingExercise } from "@/components/wellness/GroundingExercise";
import { DigitalMandala } from "@/components/wellness/DigitalMandala";
import { NatureSounds } from "@/components/wellness/NatureSounds";
import { BodyScanMeditation } from "@/components/wellness/BodyScanMeditation";
import { WellnessProgressDashboard } from "@/components/wellness/WellnessProgressDashboard";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";
import { BreathingCircleHero } from "@/components/wellness/BreathingCircleHero";
import { DailyWellnessChallenges } from "@/components/wellness/DailyWellnessChallenges";
import { SleepStories } from "@/components/wellness/SleepStories";
import { motion, AnimatePresence } from "framer-motion";

const WELLNESS_PLANS = {
  basicMonthly: {
    name: "Basic Monthly",
    price: "€4.99",
    period: "/month",
    priceId: "price_1SQQ0zGaXSfGtYFtXRewT2s9",
    tier: "basic",
    isLifetime: false,
    icon: Wind,
    gradient: "from-sky-500/15 to-cyan-500/5",
    accentColor: "text-sky-400",
    features: ["Breathing Exercises", "5-4-3-2-1 Grounding", "Nature Sounds", "Body Scan Meditation"],
  },
  premiumMonthly: {
    name: "Premium Monthly",
    price: "€9.99",
    period: "/month",
    priceId: "price_1SQQ1zGaXSfGtYFt773EG7rN",
    tier: "premium",
    isLifetime: false,
    icon: Crown,
    gradient: "from-violet-500/15 to-purple-500/5",
    accentColor: "text-violet-400",
    popular: true,
    features: ["AI Mindfulness Coach", "Breathing Exercises", "Gratitude Journal with AI", "5-4-3-2-1 Grounding", "Digital Mandala Drawing", "Body Scan Meditation"],
  },
  basicLifetime: {
    name: "Basic Lifetime",
    price: "€29.99",
    period: " once",
    priceId: "price_1SQQ2OGaXSfGtYFtSFCDoDRg",
    tier: "basic",
    isLifetime: true,
    icon: Shield,
    gradient: "from-emerald-500/15 to-green-500/5",
    accentColor: "text-emerald-400",
    savings: "Save 50%+",
    features: ["Lifetime Access", "Breathing Exercises", "5-4-3-2-1 Grounding", "Nature Sounds", "Body Scan Meditation"],
  },
  premiumLifetime: {
    name: "Premium Lifetime",
    price: "€49.99",
    period: " once",
    priceId: "price_1SQQ2gGaXSfGtYFtpMEdnEfw",
    tier: "premium",
    isLifetime: true,
    icon: Zap,
    gradient: "from-amber-500/15 to-orange-500/5",
    accentColor: "text-amber-400",
    savings: "Best Value",
    features: ["Lifetime Access", "AI Mindfulness Coach", "Breathing Exercises", "Gratitude Journal with AI", "5-4-3-2-1 Grounding", "Digital Mandala Drawing", "Body Scan Meditation"],
  },
};

const TABS = [
  { value: "progress", label: "Progress", icon: TrendingUp, requiresBasic: true, requiresPremium: false },
  { value: "breathing", label: "Breathing", icon: Wind, requiresBasic: true, requiresPremium: false },
  { value: "grounding", label: "Grounding", icon: Brain, requiresBasic: true, requiresPremium: false },
  { value: "sounds", label: "Sounds", icon: Volume2, requiresBasic: true, requiresPremium: false },
  { value: "bodyscan", label: "Body Scan", icon: Heart, requiresBasic: true, requiresPremium: false },
  { value: "challenges", label: "Challenges", icon: Target, requiresBasic: true, requiresPremium: false },
  { value: "sleep", label: "Sleep Stories", icon: Moon, requiresBasic: true, requiresPremium: false },
  { value: "chat", label: "AI Coach", icon: Brain, requiresBasic: false, requiresPremium: true },
  { value: "journal", label: "Journal", icon: BookOpen, requiresBasic: false, requiresPremium: true },
  { value: "mandala", label: "Mandala", icon: Palette, requiresBasic: false, requiresPremium: true },
];

export default function Wellness() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("breathing");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscriptionStatus({ subscribed: false });
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke('check-wellness-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({ title: "Error", description: "Failed to check subscription status", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkSubscription(); }, []);

  // Animated tab indicator
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [activeTab]);

  const handleCheckout = async (planKey: keyof typeof WELLNESS_PLANS) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Authentication Required", description: "Please sign in to subscribe", variant: "destructive" });
        return;
      }
      setCheckoutLoading(planKey);
      const plan = WELLNESS_PLANS[planKey];
      const { data, error } = await supabase.functions.invoke('create-wellness-checkout', {
        body: { priceId: plan.priceId, tier: plan.tier, isLifetime: plan.isLifetime },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({ title: "Error", description: "Failed to start checkout", variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const hasBasicAccess = subscriptionStatus?.subscribed && subscriptionStatus?.tier;
  const hasPremiumAccess = subscriptionStatus?.subscribed && subscriptionStatus?.tier === "premium";

  const canAccess = (tab: typeof TABS[0]) => {
    if (tab.requiresPremium) return hasPremiumAccess;
    if (tab.requiresBasic) return hasBasicAccess;
    return true;
  };

  const renderContent = () => {
    const tab = TABS.find((t) => t.value === activeTab);
    if (!tab) return null;

    if (tab.requiresPremium && !hasPremiumAccess) return <PremiumRequired premium />;
    if (tab.requiresBasic && !hasBasicAccess) return <PremiumRequired />;

    const content: Record<string, JSX.Element> = {
      progress: <WellnessProgressDashboard />,
      breathing: <BreathingExercises />,
      grounding: <GroundingExercise />,
      sounds: <NatureSounds />,
      bodyscan: <BodyScanMeditation />,
      challenges: <DailyWellnessChallenges />,
      sleep: <SleepStories />,
      chat: <MindfulnessChat />,
      journal: <GratitudeJournal />,
      mandala: <DigitalMandala />,
    };

    return content[activeTab] || null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Heart className="w-8 h-8 text-primary" />
        </motion.div>
        <p className="text-sm text-muted-foreground">Loading wellness...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingParticles />
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-8 sm:py-16 pt-20 sm:pt-20 max-w-7xl">
        {/* Hero Section with Breathing Circle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 sm:mb-12"
        >
          <div className="text-center max-w-4xl mx-auto mb-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
                <Heart className="w-4 h-4" />
                <span className="font-medium">Mental Health & Wellness</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
            >
              Your Wellness Sanctuary
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8"
            >
              Professional tools for relaxation, mindfulness, and inner peace
            </motion.p>

            {/* Breathing Circle Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <BreathingCircleHero />
            </motion.div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {[
              { icon: Brain, label: "AI Coach", desc: "24/7 empathetic assistant", color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/5" },
              { icon: Wind, label: "Exercises", desc: "Breathing & body scan", color: "text-sky-400", bg: "from-sky-500/10 to-cyan-500/5" },
              { icon: Moon, label: "Sleep Stories", desc: "Calming narratives", color: "text-indigo-400", bg: "from-indigo-500/10 to-blue-500/5" },
              { icon: Target, label: "Challenges", desc: "Daily wellness goals", color: "text-amber-400", bg: "from-amber-500/10 to-orange-500/5" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                >
                  <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80 hover:shadow-lg transition-all group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <CardContent className="relative pt-4 sm:pt-6 p-3 sm:p-6">
                      <div className={`p-2 rounded-xl bg-card/60 w-fit mb-2 ${item.color}`}>
                        <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                      </div>
                      <h3 className="font-semibold mb-1 text-xs sm:text-base">{item.label}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Info Section */}
        <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="relative pt-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">What is Wellness & Mental Health?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our platform provides a comprehensive suite of professional-grade relaxation, mindfulness,
                    and mental wellbeing tools. Whether you're dealing with daily stress, anxiety, trouble sleeping, or simply want to
                    improve your overall mental health, our scientifically-backed techniques are designed to help you find inner peace.
                  </p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  How to Use
                </h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    { step: "1", text: "Subscribe to a Basic or Premium plan" },
                    { step: "2", text: "Navigate between tabs for different exercises" },
                    { step: "3", text: "Follow visual guides for breathing & body scan" },
                    { step: "4", text: "Complete daily wellness challenges for XP" },
                    { step: "5", text: "Play sleep stories or nature sounds before bed" },
                    { step: "6", text: "Chat with AI Coach 24/7 (Premium)" },
                    { step: "7", text: "Write gratitude entries with AI insights (Premium)" },
                    { step: "8", text: "Track your progress and streaks over time" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-2 p-2 rounded-lg bg-card/40">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{item.step}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <h4 className="font-semibold mb-3">Why Use Wellness Tools?</h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    { text: "Reduce stress and anxiety", sub: "Breathing exercises provably lower cortisol" },
                    { text: "Improve sleep quality", sub: "Sleep stories and nature sounds aid restful sleep" },
                    { text: "Build healthy habits", sub: "Daily challenges create lasting wellness routines" },
                    { text: "24/7 AI support", sub: "Mindfulness coach is always available" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-2 p-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">{item.text}</span>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
                💡 <strong>Tip:</strong> Even 5 minutes daily can significantly improve your mental wellbeing over time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        {!hasBasicAccess && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet-500/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  Choose Your Wellness Plan
                </CardTitle>
                <CardDescription>Select a plan to unlock comprehensive relaxation and mindfulness tools</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(WELLNESS_PLANS).map(([key, plan], index) => {
                    const Icon = plan.icon;
                    return (
                      <motion.div key={key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                        <Card className={`relative overflow-hidden border-border/50 backdrop-blur-xl bg-card/60 hover:border-primary/30 transition-all group h-full ${
                          (plan as any).popular ? 'ring-2 ring-primary/30 border-primary/40' : ''
                        }`}>
                          <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                          {(plan as any).popular && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                          )}
                          {(plan as any).savings && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">{(plan as any).savings}</div>
                          )}
                          <CardHeader className="relative pb-2">
                            <div className="p-2 rounded-xl bg-card/60 w-fit mb-2">
                              <Icon className={`w-5 h-5 ${plan.accentColor}`} />
                            </div>
                            <CardTitle className="text-base">{plan.name}</CardTitle>
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-3xl font-black text-foreground">{plan.price}</span>
                              <span className="text-sm text-muted-foreground">{plan.period}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="relative">
                            <ul className="space-y-2 mb-5">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              onClick={() => handleCheckout(key as keyof typeof WELLNESS_PLANS)}
                              disabled={!!checkoutLoading}
                              className={`w-full active:scale-[0.97] transition-transform ${(plan as any).popular ? 'shadow-lg shadow-primary/20' : ''}`}
                              variant={(plan as any).popular ? "default" : "outline"}
                            >
                              {checkoutLoading === key ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</> : 'Subscribe'}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Plan */}
        {hasBasicAccess && (
          <Card className="mb-8 relative overflow-hidden border-primary/30 backdrop-blur-xl bg-card/80">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-emerald-500/5" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                Your Active Wellness Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center gap-4">
                <Badge variant="default" className="text-lg px-4 py-1 shadow-lg">
                  {subscriptionStatus.tier.toUpperCase()}
                </Badge>
                {subscriptionStatus.is_lifetime ? (
                  <span className="text-sm flex items-center gap-1"><Sparkles className="w-4 h-4 text-amber-400" /> Lifetime Access</span>
                ) : subscriptionStatus.subscription_end ? (
                  <span className="text-sm text-muted-foreground">
                    Active until {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Active subscription</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Animated Tab Bar */}
        <div className="relative mb-6">
          <div
            ref={tabsRef}
            className="flex overflow-x-auto gap-1 p-1.5 rounded-2xl backdrop-blur-xl bg-card/60 border border-border/30 scrollbar-hide relative"
          >
            {/* Sliding indicator */}
            <motion.div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-primary/15 border border-primary/20"
              animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              style={{ zIndex: 0 }}
            />

            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              const isPremium = tab.requiresPremium;
              const disabled = !canAccess(tab);

              return (
                <button
                  key={tab.value}
                  data-tab={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`relative z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive
                      ? "text-primary"
                      : disabled
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isPremium && !hasPremiumAccess && (
                    <Crown className="w-3 h-3 text-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content with Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PremiumRequired({ premium = false }: { premium?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="mt-4 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-primary/5 to-transparent" />
        <CardContent className="relative pt-10 pb-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {premium ? 'Premium Plan' : 'Subscription'} Required
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            {premium
              ? 'Upgrade to Premium to unlock AI Coach, Gratitude Journal, and Digital Mandala'
              : 'Subscribe to unlock this wellness tool and discover inner peace'}
          </p>
          {premium && (
            <Badge className="mt-3 bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Crown className="w-3 h-3 mr-1" /> Premium Feature
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
