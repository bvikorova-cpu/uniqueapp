import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, Trophy, Gift, Lock, Star, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const tiers = [
  { level: 1, xp: 0, reward: "Bronze Key Badge", icon: Star, unlocked: true },
  { level: 5, xp: 500, reward: "Exclusive Room: Neon Crypt", icon: Zap, unlocked: true },
  { level: 10, xp: 1200, reward: "Custom Avatar Frame", icon: Crown, unlocked: true },
  { level: 15, xp: 2000, reward: "3x AI Credits Boost", icon: Gift, unlocked: false },
  { level: 20, xp: 3000, reward: "Legendary Escape Room", icon: Trophy, unlocked: false },
  { level: 25, xp: 4500, reward: "Season Champion Title", icon: Crown, unlocked: false },
  { level: 30, xp: 6000, reward: "Creator Revenue Boost +20%", icon: Star, unlocked: false },
  { level: 50, xp: 10000, reward: "Diamond Master Badge", icon: Trophy, unlocked: false },
];

const challenges = [
  { name: "Complete 5 rooms this week", progress: 3, total: 5, xp: 200 },
  { name: "Use AI tools 10 times", progress: 7, total: 10, xp: 150 },
  { name: "Win a speedrun tournament", progress: 0, total: 1, xp: 500 },
  { name: "Create a room with 50+ plays", progress: 0, total: 1, xp: 300 },
];

export function SeasonPassView({ onBack }: { onBack: () => void }) {
  const [owned] = useState(false);
  const currentXP = 1450;
  const currentLevel = 12;

  return (
    <>
      <FloatingHowItWorks title={"Season Pass View - How it works"} steps={[{ title: 'Open', desc: 'Access the Season Pass View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Season Pass View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-red-900/30 p-6 mb-6 border border-amber-500/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px]" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-black">Season 1: Shadow Depths</h2>
              </div>
              <p className="text-muted-foreground text-sm">April 1 – June 30, 2026 · 87 days remaining</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Level {currentLevel}</Badge>
                <span className="text-sm">{currentXP} / 2000 XP</span>
              </div>
              <Progress value={(currentXP / 2000) * 100} className="mt-2 h-2 w-64" />
            </div>
            {!owned && (
              <Button onClick={() => toast.info("Redirecting to checkout...")} className="bg-gradient-to-r from-amber-600 to-orange-700">
                <Crown className="w-4 h-4 mr-2" />Buy Season Pass · €9.99
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Weekly Challenges */}
      <h3 className="text-lg font-bold mb-3">Weekly Challenges</h3>
      <div className="grid md:grid-cols-2 gap-3 mb-8">
        {challenges.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium">{c.name}</p>
                  <Badge variant="secondary" className="text-[10px]">+{c.xp} XP</Badge>
                </div>
                <Progress value={(c.progress / c.total) * 100} className="h-1.5 mb-1" />
                <p className="text-xs text-muted-foreground">{c.progress}/{c.total}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reward Track */}
      <h3 className="text-lg font-bold mb-3">Reward Track</h3>
      <div className="space-y-2">
        {tiers.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={t.unlocked ? "border-amber-500/30 bg-amber-500/5" : "opacity-60"}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.unlocked ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-muted"}`}>
                    {t.unlocked ? <Icon className="w-5 h-5 text-white" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Level {t.level}</p>
                    <p className="text-xs text-muted-foreground">{t.reward}</p>
                  </div>
                  {t.unlocked && <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[10px]">Claimed</Badge>}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
}
