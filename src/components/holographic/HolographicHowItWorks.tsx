import { ArrowLeft, Crown, Palette, Brain, Swords, Heart, Eye, Camera, TrendingUp, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useHolographicStats } from "@/hooks/useHolographicStats";

interface Props { onBack: () => void; }

export const HolographicHowItWorks = ({ onBack }: Props) => {
  const { stats, loading } = useHolographicStats();

  const steps = [
    { icon: Crown, title: "1. Create Your Avatar", cost: "10 credits", desc: "Design a holographic avatar by choosing a visual style and personality traits. The AI generates the image and it is saved to My Avatars.", done: stats.avatars > 0, progress: `${stats.avatars} created` },
    { icon: Palette, title: "2. Restyle It", cost: "5 credits", desc: "Pick a saved avatar and generate a new version with a different style, outfit and accessory. Results are downloadable and saved back to your collection.", done: stats.avatars > 1, progress: `${stats.styles.length} styles used` },
    { icon: Swords, title: "3. Battle Other Avatars", cost: "2-5 credits", desc: "Run a battle and get a round-by-round log. Wins pay real credits back into your balance; every result is stored on your account.", done: stats.battles > 0, progress: `${stats.battles} battles · ${stats.wins} won` },
    { icon: Heart, title: "4. Breed Offspring", cost: "10 credits", desc: "Combine two avatars to create offspring with inherited traits and a generated image. Rarity depends on the parents' trait mix.", done: stats.breedings > 0, progress: `${stats.breedings} offspring · ${stats.rareOffspring} rare` },
    { icon: Camera, title: "5. Emotion Sync", cost: "1 credit", desc: "Use your camera so the AI reads your facial expression and maps it to your avatar's emotional state.", done: false, progress: "Camera based" },
    { icon: Eye, title: "6. My Avatars", cost: "Free", desc: "Every avatar you generate is listed here with download and delete options.", done: stats.avatars > 0, progress: `${stats.avatars} in collection` },
    { icon: TrendingUp, title: "7. Evolution Lab", cost: "Free", desc: "XP and levels are calculated from your real activity: avatars created, battles won and offspring bred.", done: stats.xp > 0, progress: `${stats.xp.toLocaleString()} XP · Lv.${stats.level}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">How It Works</h2>
          <p className="text-sm text-muted-foreground">Guide to the avatar tools, with your live progress</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> What Are Holographic Avatars?</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Holographic Avatars lets you generate AI avatar images, restyle them, put them into battles and breed new
            variants. Every tool runs on your credit balance, and every result — avatars, battles, offspring — is stored
            on your account, so the numbers you see are always your own real data.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Entertainment feature. Battles are AI-generated simulations; only the credit rewards and your saved results are real.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={step.done ? "border-primary/30" : ""}>
                <CardContent className="p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm">{step.title}</h3>
                      <Badge variant="secondary" className="text-[10px]">{step.cost}</Badge>
                      <Badge className={`text-[10px] ${step.done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {step.progress}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
