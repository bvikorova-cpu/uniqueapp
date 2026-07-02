import { ArrowLeft, Crown, Palette, Brain, Swords, Heart, Eye, ShoppingBag, Sparkles, Camera, BarChart3, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const HolographicHowItWorks = ({ onBack }: Props) => {
  const steps = [
    { icon: Crown, title: "1. Create Your Avatar", desc: "Design a unique 3D holographic avatar by choosing a visual style (Cyberpunk, Crystal, Shadow, Cosmic, etc.) and personality traits. Your avatar comes to life with advanced AI." },
    { icon: Brain, title: "2. Watch It Evolve", desc: "Your avatar's AI learns from interactions and develops autonomous behaviors. It gains XP, levels up through 6 evolution stages, and develops unique personality quirks over time." },
    { icon: Palette, title: "3. Customize & Upgrade", desc: "Unlock hundreds of appearance options, clothing, accessories, custom animations, and voice packs through our customization packs (Basic €3 or Advanced €15)." },
    { icon: Swords, title: "4. Battle Other Avatars", desc: "Enter the Battle Arena for PvP combat. Choose 1v1 Duels (€2), Tournaments (€5), or Survival mode (€3). Win prizes and climb the ELO ranking leaderboard." },
    { icon: Heart, title: "5. Breed Unique Offspring", desc: "Combine two avatars to create offspring with inherited traits and abilities. Rare trait combinations can produce Legendary avatars. Each pair can breed up to 3 offspring (€10)." },
    { icon: Camera, title: "6. Emotion Sync", desc: "Use your camera to let your avatar mirror your real-time emotions. The AI detects your facial expressions and translates them into holographic animations." },
    { icon: ShoppingBag, title: "7. Trade on Marketplace", desc: "Buy and sell custom skins, accessories, animations, and voice packs created by the community. Items range from Uncommon to Legendary rarity." },
    { icon: Eye, title: "8. Explore the Gallery", desc: "Browse stunning avatar creations from other users. Like, share, and get inspiration. Featured avatars are highlighted for the community." },
  ];

  return (
    <>
      <FloatingHowItWorks title="How Holographic How It Works works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">How It Works</h2>
          <p className="text-sm text-muted-foreground">Complete guide to the Holographic Avatar universe</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> What Are Holographic Avatars?</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Holographic Avatars is a revolutionary platform where you can create stunning 3D digital beings powered by artificial intelligence. Unlike static avatars, our holographic avatars are autonomous entities that learn, evolve, develop unique personalities, compete in battles, breed offspring, and interact with other avatars — even when you're offline.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Note: This is an entertainment platform. All avatars exist in a virtual environment powered by AI algorithms designed for engagement and fun.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="hover:border-primary/30 transition-all">
              <CardContent className="p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
    );
};
