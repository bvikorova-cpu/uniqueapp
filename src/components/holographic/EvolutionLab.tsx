import { ArrowLeft, TrendingUp, Zap, Brain, Star, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const EVOLUTION_STAGES = [
  { level: 1, name: "Seed Form", xp: "0-500", desc: "Basic avatar with minimal AI", unlocks: "Basic emotions" },
  { level: 10, name: "Awakened", xp: "500-2K", desc: "Avatar gains self-awareness", unlocks: "Conversation ability" },
  { level: 25, name: "Sentient", xp: "2K-10K", desc: "Deep personality emerges", unlocks: "Creative expression" },
  { level: 50, name: "Transcendent", xp: "10K-50K", desc: "Autonomous decision-making", unlocks: "Battle strategies" },
  { level: 75, name: "Ascended", xp: "50K-200K", desc: "Near-perfect AI awareness", unlocks: "Breeding mastery" },
  { level: 100, name: "Eternal", xp: "200K+", desc: "Maximum evolution achieved", unlocks: "Legendary status" },
];

const STATS = [
  { name: "Intelligence", value: 72, color: "bg-blue-500" },
  { name: "Creativity", value: 85, color: "bg-violet-500" },
  { name: "Combat Power", value: 63, color: "bg-red-500" },
  { name: "Social Skills", value: 91, color: "bg-emerald-500" },
  { name: "Adaptation", value: 78, color: "bg-amber-500" },
];

export const EvolutionLab = ({ onBack }: Props) => {
  return (
    <>
      <FloatingHowItWorks
        title='Evolution Lab'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Evolution Lab panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Evolution Lab</h2>
          <p className="text-sm text-muted-foreground">Track your avatar's growth and AI development</p>
        </div>
      </div>

      {/* Current Stats */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Avatar Stats</h3>
          <div className="space-y-4">
            {STATS.map((stat, i) => (
              <motion.div key={stat.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{stat.name}</span>
                  <span className="text-muted-foreground">{stat.value}/100</span>
                </div>
                <Progress value={stat.value} className="h-2" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evolution Timeline */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Evolution Stages</h3>
          <div className="space-y-4">
            {EVOLUTION_STAGES.map((stage, i) => (
              <motion.div key={stage.level} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`p-4 rounded-xl border transition-all ${i <= 1 ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={i <= 1 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>Lv.{stage.level}</Badge>
                    <h4 className="font-bold text-sm">{stage.name}</h4>
                  </div>
                  <span className="text-xs text-muted-foreground">{stage.xp} XP</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{stage.desc}</p>
                <p className="text-xs text-primary flex items-center gap-1"><Star className="w-3 h-3" /> Unlocks: {stage.unlocks}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
