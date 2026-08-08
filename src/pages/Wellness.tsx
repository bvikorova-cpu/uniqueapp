import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Heart, Brain, Wind, Palette, BookOpen, Volume2, Crown, Target } from "lucide-react";
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

import { motion, AnimatePresence } from "framer-motion";
import { useSpendCredits, CREDIT_COSTS } from "@/hooks/useSpendCredits";
import { useAICredits } from "@/hooks/useAICredits";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const WELLNESS_AI_COST = CREDIT_COSTS.wellness_ai_tool;

const WELLNESS_TOOLS = [
  { id: "breathing", name: "Breathing Exercises", icon: Wind,
    description: "Guided breathing techniques for stress relief and relaxation",
    color: "from-sky-500 to-cyan-600",
    features: ["4-7-8 Breathing", "Box Breathing", "Visual guidance", "Session tracking", "Multiple techniques"],
    cost: 0 },
  { id: "grounding", name: "5-4-3-2-1 Grounding", icon: Brain,
    description: "Sensory grounding exercise to reduce anxiety and panic",
    color: "from-violet-500 to-purple-600",
    features: ["Step-by-step guidance", "Anxiety relief", "Panic attack support", "Progress tracking", "Audio cues"],
    cost: 0 },
  { id: "sounds", name: "Nature Sounds", icon: Volume2,
    description: "Ambient soundscapes for relaxation, focus, and sleep",
    color: "from-emerald-500 to-green-600",
    features: ["Rain & thunder", "Ocean waves", "Forest ambience", "Volume control", "Sleep timer"],
    cost: 0 },
  { id: "bodyscan", name: "Body Scan Meditation", icon: Heart,
    description: "Progressive relaxation from head to toe with audio guidance",
    color: "from-rose-500 to-pink-600",
    features: ["Interactive body map", "Audio guidance", "Progressive relaxation", "Session completion", "Tension release"],
    cost: 0 },
  { id: "challenges", name: "Daily Challenges", icon: Target,
    description: "Gamified daily wellness tasks with XP and streak tracking",
    color: "from-amber-500 to-orange-600",
    features: ["Daily tasks", "XP rewards", "Streak tracking", "Multiple categories", "Progress gamification"],
    cost: 0 },
  { id: "chat", name: "AI Mindfulness Coach", icon: Brain,
    description: "24/7 AI coach trained in CBT, mindfulness, and therapeutic techniques",
    color: "from-purple-500 to-violet-600",
    features: ["24/7 availability", "CBT techniques", "Empathetic responses", "Quick prompts", "Session history"],
    cost: WELLNESS_AI_COST },
  { id: "journal", name: "Gratitude Journal", icon: BookOpen,
    description: "Write gratitude entries and receive AI-powered insights",
    color: "from-amber-500 to-yellow-600",
    features: ["AI insights", "Mood tracking", "Writing prompts", "Entry history", "Emotional analysis"],
    cost: WELLNESS_AI_COST },
  { id: "mandala", name: "Digital Mandala", icon: Palette,
    description: "Creative mindfulness through symmetrical drawing",
    color: "from-pink-500 to-rose-600",
    features: ["Symmetry modes", "Color palettes", "Export to image", "Creative expression", "Meditative drawing"],
    cost: WELLNESS_AI_COST },
];

export default function Wellness() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const { toast } = useToast();
  const { spend } = useSpendCredits();
  const { paidBalance, loading, refresh } = useAICredits();

  const handleSelectTool = async (toolId: string, cost: number) => {
    if (cost === 0 || unlocked.includes(toolId)) {
      setActiveTool(toolId);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    setUnlocking(toolId);
    const ok = await spend("wellness_ai_tool", { description: `Wellness tool: ${toolId}` });
    setUnlocking(null);
    if (!ok) return;
    await refresh();
    window.dispatchEvent(new Event("ai-credits-updated"));
    setUnlocked((prev) => [...prev, toolId]);
    setActiveTool(toolId);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    toast({ title: "Unlocked", description: `${cost} credits spent` });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <FloatingHowItWorks title="Wellness — How it works" steps={[{title:"Open the tool",desc:"Launch Wellness from the menu to access its features."},{title:"Explore options",desc:"Browse available cards, filters and personalized recommendations."},{title:"Interact & track",desc:"Log entries, start sessions or run AI scans. AI tools cost 3 credits."},{title:"Review progress",desc:"Check your dashboard for streaks, achievements and history."}]} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Heart className="w-8 h-8 text-primary" />
        </motion.div>
        <p className="text-sm text-muted-foreground">Loading wellness...</p>
      </div>
    );
  }

  // If a tool is active, show it full-screen
  if (activeTool) { const toolComponents: Record<string, JSX.Element> = {
      breathing: <BreathingExercises />,
      grounding: <GroundingExercise />,
      sounds: <NatureSounds />,
      bodyscan: <BodyScanMeditation />,
      
      challenges: <DailyWellnessChallenges />,
      chat: <MindfulnessChat />,
      journal: <GratitudeJournal />,
      mandala: <DigitalMandala />,
      progress: <WellnessProgressDashboard /> };

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

        {/* Credit balance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="relative overflow-hidden border-primary/30 backdrop-blur-xl bg-card/80">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-emerald-500/5" />
            <CardContent className="relative py-4 flex flex-wrap items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">Your credits:</span>
                <Badge variant="default" className="text-sm px-3 shadow-lg">{paidBalance}</Badge>
                <span className="text-sm text-muted-foreground">AI tools cost {WELLNESS_AI_COST} credits</span>
              </div>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => window.location.assign("/ai-credits")}>
                Top up credits
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main content: Tool cards + sidebar (like AI Mentor) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tool Cards Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {WELLNESS_TOOLS.filter(t => t.cost === 0).map((tool, i) => (
              <WellnessToolCard
                key={tool.id}
                tool={tool}
                hasAccess={tool.cost === 0 || unlocked.includes(tool.id)}
                isPremium={tool.cost > 0}
                cost={tool.cost}
                onSelect={() => handleSelectTool(tool.id, tool.cost)}
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
              AI Tools · {WELLNESS_AI_COST} credits
            </h2>
            <p className="text-sm text-muted-foreground">Advanced AI-powered wellness features — {WELLNESS_AI_COST} credits per unlock</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WELLNESS_TOOLS.filter(t => t.cost > 0).map((tool, i) => (
              <WellnessToolCard
                key={tool.id}
                tool={tool}
                hasAccess={unlocked.includes(tool.id)}
                isPremium={true}
                cost={WELLNESS_AI_COST}
                onSelect={() => handleSelectTool(tool.id, WELLNESS_AI_COST)}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Get credits", desc: `Relaxation tools are included; AI tools cost ${WELLNESS_AI_COST} credits` },
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
