import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MyPets } from "@/components/virtual-pet/MyPets";
import { PetShop } from "@/components/virtual-pet/PetShop";
import { PetCustomization } from "@/components/virtual-pet/PetCustomization";
import { PetTrading } from "@/components/virtual-pet/PetTrading";
import { MiniGames } from "@/components/virtual-pet/MiniGames";
import { PetBattle } from "@/components/virtual-pet/PetBattle";
import { PetBreeding } from "@/components/virtual-pet/PetBreeding";
import { AIPetPersonalityCoach } from "@/components/virtual-pet/AIPetPersonalityCoach";
import { AIPetNameGenerator } from "@/components/virtual-pet/AIPetNameGenerator";
import { AIPetHealthPredictor } from "@/components/virtual-pet/AIPetHealthPredictor";
import { AIPetStoryGenerator } from "@/components/virtual-pet/AIPetStoryGenerator";
import { AIPetMoodAnalyzer } from "@/components/virtual-pet/AIPetMoodAnalyzer";
import { AIPetTrainingPlanner } from "@/components/virtual-pet/AIPetTrainingPlanner";
import { AIPetCompatibilityChecker } from "@/components/virtual-pet/AIPetCompatibilityChecker";
import { AIPetBattleStrategy } from "@/components/virtual-pet/AIPetBattleStrategy";
import { VirtualPetHero } from "@/components/virtual-pet/VirtualPetHero";
import {
  Heart, Store, Palette, ArrowLeftRight, Gamepad2, Swords, Dna,
  Brain, Wand2, Activity, BookOpen, Coins, CreditCard, Flame, Trophy, Star,
  SmilePlus, CalendarDays, HeartHandshake, Target
} from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import PetCrossPromo from "@/components/pet-translator/PetCrossPromo";
import { trackPetActivity } from "@/lib/petLover";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ActiveView = "dashboard" | "pets" | "battle" | "shop" | "customize" | "trading" | "games" | "breeding" |
  "personality-coach" | "name-generator" | "health-predictor" | "story-generator" |
  "mood-analyzer" | "training-planner" | "compatibility-checker" | "battle-strategy";

const tools: { id: ActiveView; icon: any; title: string; description: string; color: string; badge?: string; isNew?: boolean }[] = [
  { id: "pets", icon: Heart, title: "My Pets", description: "View, feed & care for your companions", color: "pink" },
  { id: "battle", icon: Swords, title: "Battle Arena", description: "PvP combat against AI opponents", color: "red", badge: "Hot" },
  { id: "shop", icon: Store, title: "Pet Shop", description: "Buy accessories & mystery boxes", color: "blue" },
  { id: "customize", icon: Palette, title: "Customize", description: "Equip skins & accessories", color: "purple" },
  { id: "trading", icon: ArrowLeftRight, title: "Trading Post", description: "Trade rare pets with players", color: "orange" },
  { id: "games", icon: Gamepad2, title: "Mini Games", description: "Earn rewards & XP from games", color: "cyan" },
  { id: "breeding", icon: Dna, title: "Breeding Lab", description: "Combine pets for rare offspring", color: "emerald" },
  { id: "personality-coach", icon: Brain, title: "AI Personality Coach", description: "AI care routines & analysis", color: "violet", badge: "5 Cr", isNew: true },
  { id: "name-generator", icon: Wand2, title: "AI Name Generator", description: "Creative AI-generated pet names", color: "pink", badge: "3 Cr", isNew: true },
  { id: "health-predictor", icon: Activity, title: "AI Health Predictor", description: "Forecast evolution & health trends", color: "emerald", badge: "8 Cr", isNew: true },
  { id: "story-generator", icon: BookOpen, title: "AI Story Generator", description: "Adventure stories starring your pets", color: "amber", badge: "6 Cr", isNew: true },
  { id: "mood-analyzer", icon: SmilePlus, title: "AI Mood Analyzer", description: "Deep emotional state analysis", color: "cyan", badge: "4 Cr", isNew: true },
  { id: "training-planner", icon: CalendarDays, title: "AI Training Planner", description: "Optimized daily training schedule", color: "blue", badge: "5 Cr", isNew: true },
  { id: "compatibility-checker", icon: HeartHandshake, title: "AI Compatibility", description: "Breeding compatibility & predictions", color: "pink", badge: "6 Cr", isNew: true },
  { id: "battle-strategy", icon: Target, title: "AI Battle Strategy", description: "Optimal formations & tactics", color: "red", badge: "4 Cr", isNew: true },
];

const VirtualPet = () => {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const { credits } = useAICredits();
  const navigate = useNavigate();

  const goBack = () => setActiveView("dashboard");

  useEffect(() => { trackPetActivity('virtual'); }, []);

  const renderView = () => {
    switch (activeView) {
      case "pets": return <MyPets onSelectPet={setSelectedPetId} />;
      case "battle": return <PetBattle />;
      case "shop": return <PetShop />;
      case "customize": return <PetCustomization selectedPetId={selectedPetId} />;
      case "trading": return <PetTrading />;
      case "games": return <MiniGames selectedPetId={selectedPetId} />;
      case "breeding": return <PetBreeding selectedPetId={selectedPetId} />;
      case "personality-coach": return <AIPetPersonalityCoach onBack={goBack} />;
      case "name-generator": return <AIPetNameGenerator onBack={goBack} />;
      case "health-predictor": return <AIPetHealthPredictor onBack={goBack} />;
      case "story-generator": return <AIPetStoryGenerator onBack={goBack} />;
      case "mood-analyzer": return <AIPetMoodAnalyzer onBack={goBack} />;
      case "training-planner": return <AIPetTrainingPlanner onBack={goBack} />;
      case "compatibility-checker": return <AIPetCompatibilityChecker onBack={goBack} />;
      case "battle-strategy": return <AIPetBattleStrategy onBack={goBack} />;
      default: return null;
    }
  };

  const oldViews: ActiveView[] = ["pets", "battle", "shop", "customize", "trading", "games", "breeding"];

  return (
    <>
      <FloatingHowItWorks title="How Virtual Pet works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(236,72,153,0.15) 3px, rgba(236,72,153,0.15) 4px)' }} />

      <main className="flex-1 container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-8">
        <div className="max-w-6xl mx-auto">
          {activeView === "dashboard" ? (
            <>
              <VirtualPetHero />

              <HeroRewardedAd sectionKey="page_virtualpet" />

              <div className="mb-6"><PetCrossPromo side="virtual" /></div>

              {/* Engagement Row */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: Flame, label: "Care Streak", value: "7 Days", color: "text-orange-500", action: () => setActiveView('care') },
                  { icon: Coins, label: "Credits", value: `${credits.credits_remaining}`, color: "text-amber-500", action: () => navigate('/ai-credits-store') },
                  { icon: Trophy, label: "Pet Master", value: "Level 12", color: "text-amber-500", action: () => setActiveView('battle') },

                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                    <Card className="border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer active:scale-[0.97]"
                      onClick={item.action}>
                      <CardContent className="p-3 text-center">
                        <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
                        <p className="text-lg font-black">{item.value}</p>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center mb-6">
                <Button onClick={() => navigate('/ai-credits-store')} className="gap-2">
                  <CreditCard className="h-4 w-4" />Buy Credits
                </Button>
              </div>

              {/* Tool Grid */}
              <div className="mb-8">
                <h2 className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4">
                  Pet Tools & AI Services
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {tools.map((tool, i) => (
                    <motion.div key={tool.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03, type: "spring" }}>
                      <Card className="border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer active:scale-[0.97] group relative overflow-hidden"
                        onClick={() => setActiveView(tool.id)}>
                        {tool.isNew && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">NEW</div>
                        )}
                        <CardContent className="p-3 text-center space-y-1.5">
                          <div className={`w-10 h-10 mx-auto rounded-xl bg-${tool.color}-500/10 border border-${tool.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <tool.icon className={`w-5 h-5 text-${tool.color}-500`} />
                          </div>
                          <h3 className="font-bold text-xs leading-tight">{tool.title}</h3>
                          <p className="text-[10px] text-muted-foreground leading-tight">{tool.description}</p>
                          {tool.badge && (
                            <span className="inline-block text-[9px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{tool.badge}</span>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">How It Works</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Heart, title: "1. Adopt", desc: "Choose from 28+ species including mythical creatures" },
                      { icon: Gamepad2, title: "2. Play & Care", desc: "Feed, play mini-games, and keep your pet happy" },
                      { icon: Swords, title: "3. Battle & Breed", desc: "Fight AI opponents and breed rare offspring" },
                      { icon: Brain, title: "4. AI Services", desc: "Use AI coaches, predictors & strategy advisors" },
                    ].map((step, i) => (
                      <div key={i} className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                          <step.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-bold text-xs">{step.title}</h4>
                        <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pro Tips */}
              <Card className="border-border/40 bg-card/80 backdrop-blur-sm mt-6">
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" />Pro Tips</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Start with a Cat or Dog (20 credits each) — cheapest to adopt!</li>
                    <li>• Use AI Battle Strategy before arena fights for +30% win rate</li>
                    <li>• AI Training Planner creates optimal XP routes — level up 2x faster</li>
                    <li>• Check Compatibility before breeding to predict rare mutations</li>
                    <li>• AI Mood Analyzer helps identify hidden stress — boost happiness by 25%</li>
                    <li>• Pets need Level 10+ to breed — feed and play daily to level up fast</li>
                    <li>• Generate adventure stories to share with the community</li>
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="max-w-4xl mx-auto">
              {oldViews.includes(activeView) && (
                <Button variant="ghost" onClick={goBack} className="mb-4 gap-2">← Back to Dashboard</Button>
              )}
              {renderView()}
            </div>
          )}
        </div>
      </main>
    </div>
    </>
    );
};

export default VirtualPet;
