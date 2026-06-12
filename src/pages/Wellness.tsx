import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Heart, Brain, Wind, Palette, BookOpen, Check, Volume2, Crown, Zap, Shield, Moon, Target } from "lucide-react";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";
import { WellnessHero } from "@/components/wellness/WellnessHero";
import { WellnessAISanctuary } from "@/components/wellness/WellnessAISanctuary";
import { WellnessStreak } from "@/components/wellness/WellnessStreak";
import { WellnessProgressPreview } from "@/components/wellness/WellnessProgressPreview";
import { WellnessAchievements } from "@/components/wellness/WellnessAchievements";
import { WellnessToolCard } from "@/components/wellness/WellnessToolCard";
import { WellnessTestimonials } from "@/components/wellness/WellnessTestimonials";
import { WellnessComparisonTable } from "@/components/wellness/WellnessComparisonTable";
import { MindfulnessChat } from "@/components/wellness/MindfulnessChat";
import { BreathingExercises } from "@/components/wellness/BreathingExercises";
import { GratitudeJournal } from "@/components/wellness/GratitudeJournal";
import { GroundingExercise } from "@/components/wellness/GroundingExercise";
import { DigitalMandala } from "@/components/wellness/DigitalMandala";
import { NatureSounds } from "@/components/wellness/NatureSounds";
import { BodyScanMeditation } from "@/components/wellness/BodyScanMeditation";
import { WellnessProgressDashboard } from "@/components/wellness/WellnessProgressDashboard";
import { DailyWellnessChallenges } from "@/components/wellness/DailyWellnessChallenges";
import { SleepStories } from "@/components/wellness/SleepStories";
import { motion, AnimatePresence } from "framer-motion";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const WELLNESS_PLANS = {
  basicMonthly: { name: "Basic Monthly", price: "€4.99", period: "/month", priceId: "price_1SQQ0zGaXSfGtYFtXRewT2s9", tier: "basic", isLifetime: false, icon: Wind, gradient: "from-sky-500/15 to-cyan-500/5", accentColor: "text-sky-400", features: ["Breathing Exercises", "5-4-3-2-1 Grounding", "Nature Sounds", "Body Scan Meditation", "Sleep Stories", "Daily Challenges"] },
  premiumMonthly: { name: "Premium Monthly", price: "€9.99", period: "/month", priceId: "price_1SQQ1zGaXSfGtYFt773EG7rN", tier: "premium", isLifetime: false, icon: Crown, gradient: "from-violet-500/15 to-purple-500/5", accentColor: "text-violet-400", popular: true, features: ["All Basic features", "AI Mindfulness Coach", "Gratitude Journal with AI", "Digital Mandala Drawing", "Progress Dashboard"] },
  basicLifetime: { name: "Basic Lifetime", price: "€29.99", period: " once", priceId: "price_1SQQ2OGaXSfGtYFtSFCDoDRg", tier: "basic", isLifetime: true, icon: Shield, gradient: "from-emerald-500/15 to-green-500/5", accentColor: "text-emerald-400", savings: "Save 50%+", features: ["Lifetime Access", "Breathing Exercises", "5-4-3-2-1 Grounding", "Nature Sounds", "Body Scan Meditation", "Sleep Stories"] },
  premiumLifetime: { name: "Premium Lifetime", price: "€49.99", period: " once", priceId: "price_1SQQ2gGaXSfGtYFtpMEdnEfw", tier: "premium", isLifetime: true, icon: Zap, gradient: "from-amber-500/15 to-orange-500/5", accentColor: "text-amber-400", savings: "Best Value", features: ["Lifetime Access", "All Premium features", "AI Mindfulness Coach", "Gratitude Journal with AI", "Digital Mandala Drawing"] },
};

const WELLNESS_TOOLS = [
  {
    id: "breathing", name: "Breathing Exercises", icon: Wind,
    description: "Guided breathing techniques for stress relief and relaxation",
    color: "from-sky-500 to-cyan-600",
    features: ["4-7-8 Breathing", "Box Breathing", "Visual guidance", "Session tracking", "Multiple techniques"],
    premium: false,
  },
  {
    id: "grounding", name: "5-4-3-2-1 Grounding", icon: Brain,
    description: "Sensory grounding exercise to reduce anxiety and panic",
    color: "from-violet-500 to-purple-600",
    features: ["Step-by-step guidance", "Anxiety relief", "Panic attack support", "Progress tracking", "Audio cues"],
    premium: false,
  },
  {
    id: "sounds", name: "Nature Sounds", icon: Volume2,
    description: "Ambient soundscapes for relaxation, focus, and sleep",
    color: "from-emerald-500 to-green-600",
    features: ["Rain & thunder", "Ocean waves", "Forest ambience", "Volume control", "Sleep timer"],
    premium: false,
  },
  {
    id: "bodyscan", name: "Body Scan Meditation", icon: Heart,
    description: "Progressive relaxation from head to toe with audio guidance",
    color: "from-rose-500 to-pink-600",
    features: ["Interactive body map", "Audio guidance", "Progressive relaxation", "Session completion", "Tension release"],
    premium: false,
  },
  {
    id: "sleep", name: "Sleep Stories", icon: Moon,
    description: "Calming narratives and ambient sounds to help you drift off",
    color: "from-indigo-500 to-blue-600",
    features: ["Multiple stories", "Ambient themes", "Sleep timer", "Volume control", "New stories weekly"],
    premium: false,
  },
  {
    id: "challenges", name: "Daily Challenges", icon: Target,
    description: "Gamified daily wellness tasks with XP and streak tracking",
    color: "from-amber-500 to-orange-600",
    features: ["Daily tasks", "XP rewards", "Streak tracking", "Multiple categories", "Progress gamification"],
    premium: false,
  },
  {
    id: "chat", name: "AI Mindfulness Coach", icon: Brain,
    description: "24/7 AI coach trained in CBT, mindfulness, and therapeutic techniques",
    color: "from-purple-500 to-violet-600",
    features: ["24/7 availability", "CBT techniques", "Empathetic responses", "Quick prompts", "Session history"],
    premium: true,
  },
  {
    id: "journal", name: "Gratitude Journal", icon: BookOpen,
    description: "Write gratitude entries and receive AI-powered insights",
    color: "from-amber-500 to-yellow-600",
    features: ["AI insights", "Mood tracking", "Writing prompts", "Entry history", "Emotional analysis"],
    premium: true,
  },
  {
    id: "mandala", name: "Digital Mandala", icon: Palette,
    description: "Creative mindfulness through symmetrical drawing",
    color: "from-pink-500 to-rose-600",
    features: ["Symmetry modes", "Color palettes", "Export to image", "Creative expression", "Meditative drawing"],
    premium: true,
  },
];

export default function Wellness() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setSubscriptionStatus({ subscribed: false }); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke('check-wellness-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({ title: "Error", description: "Failed to check subscription status", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { checkSubscription(); }, []);

  const handleCheckout = async (planKey: keyof typeof WELLNESS_PLANS) => {
    // Pre-open a window synchronously to keep user gesture → avoids popup blocker
    const checkoutWindow = window.open('', '_blank');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        checkoutWindow?.close();
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
      if (data?.url && checkoutWindow) {
        checkoutWindow.location.href = data.url;
      } else if (data?.url) {
        window.location.href = data.url;
      } else {
        checkoutWindow?.close();
      }
    } catch (error) {
      checkoutWindow?.close();
      console.error('Checkout error:', error);
      toast({ title: "Error", description: "Failed to start checkout", variant: "destructive" });
    } finally { setCheckoutLoading(null); }
  };

  const hasBasicAccess = subscriptionStatus?.subscribed && subscriptionStatus?.tier;
  const hasPremiumAccess = subscriptionStatus?.subscribed && subscriptionStatus?.tier === "premium";

  const handleSelectTool = (toolId: string, isPremium: boolean) => {
    if (isPremium && !hasPremiumAccess) {
      toast({ title: "Premium Required", description: "Upgrade to Premium to access this tool" });
      return;
    }
    if (!isPremium && !hasBasicAccess) {
      toast({ title: "Subscription Required", description: "Subscribe to access wellness tools" });
      return;
    }
    setActiveTool(toolId);
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

  // If a tool is active, show it full-screen
  if (activeTool) {
    const toolComponents: Record<string, JSX.Element> = {
      breathing: <BreathingExercises />,
      grounding: <GroundingExercise />,
      sounds: <NatureSounds />,
      bodyscan: <BodyScanMeditation />,
      sleep: <SleepStories />,
      challenges: <DailyWellnessChallenges />,
      chat: <MindfulnessChat />,
      journal: <GratitudeJournal />,
      mandala: <DigitalMandala />,
      progress: <WellnessProgressDashboard />,
    };

    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 pointer-events-none z-0"><FloatingParticles /></div>
        <div className="relative z-10 container mx-auto px-2 sm:px-4 pt-20 pb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <Button variant="ghost" onClick={() => setActiveTool(null)} className="gap-2">
              ← Back to Wellness
            </Button>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {toolComponents[activeTool]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-0"><FloatingParticles /></div>

      <div className="relative z-10 container mx-auto px-2 sm:px-4 pt-20 pb-12">
        {/* Hero */}
        <WellnessHero />

        <HeroRewardedAd sectionKey="page_wellness" />

        {/* New AI Sanctuary — 4 premium AI features */}
        <WellnessAISanctuary />

        {/* Engagement widgets row (like AI Mentor) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <WellnessStreak />
          <WellnessProgressPreview />
          <WellnessAchievements />
        </div>

        {/* Active Plan Badge */}
        {hasBasicAccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="relative overflow-hidden border-primary/30 backdrop-blur-xl bg-card/80">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-emerald-500/5" />
              <CardContent className="relative py-4 flex items-center gap-4">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">Active Plan:</span>
                  <Badge variant="default" className="text-sm px-3 shadow-lg">
                    {subscriptionStatus.tier.toUpperCase()}
                  </Badge>
                  {subscriptionStatus.is_lifetime && (
                    <span className="text-sm flex items-center gap-1"><Sparkles className="w-4 h-4 text-amber-400" /> Lifetime</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main content: Tool cards + sidebar (like AI Mentor) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tool Cards Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {WELLNESS_TOOLS.slice(0, 6).map((tool, i) => (
              <WellnessToolCard
                key={tool.id}
                tool={tool}
                hasAccess={tool.premium ? hasPremiumAccess : hasBasicAccess}
                isPremium={tool.premium}
                onSelect={() => handleSelectTool(tool.id, tool.premium)}
                index={i}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <WellnessTestimonials />
            <WellnessComparisonTable />
          </div>
        </div>

        {/* Premium Tools Section */}
        <div className="mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400" />
              Premium Tools
            </h2>
            <p className="text-sm text-muted-foreground">Advanced AI-powered wellness features</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WELLNESS_TOOLS.filter(t => t.premium).map((tool, i) => (
              <WellnessToolCard
                key={tool.id}
                tool={tool}
                hasAccess={hasPremiumAccess}
                isPremium={true}
                onSelect={() => handleSelectTool(tool.id, true)}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* Pricing */}
        {!hasBasicAccess && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet-500/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <div className="p-2 rounded-xl bg-primary/10"><Sparkles className="w-5 h-5 text-primary" /></div>
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
                        <Card className={`relative overflow-hidden border-border/50 backdrop-blur-xl bg-card/60 hover:border-primary/30 transition-all group h-full ${(plan as any).popular ? 'ring-2 ring-primary/30 border-primary/40' : ''}`}>
                          <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                          {(plan as any).popular && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>}
                          {(plan as any).savings && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">{(plan as any).savings}</div>}
                          <CardHeader className="relative pb-2">
                            <div className="p-2 rounded-xl bg-card/60 w-fit mb-2"><Icon className={`w-5 h-5 ${plan.accentColor}`} /></div>
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

        {/* How it works */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Choose a Plan", desc: "Subscribe to Basic or Premium wellness" },
              { step: "2", title: "Pick Your Tools", desc: "Open any available wellness tool" },
              { step: "3", title: "Build Your Routine", desc: "Complete daily challenges and track progress" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
