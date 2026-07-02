import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Gift, Star, Crown, Trophy, Heart } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const streakRewards = [
  { day: 3, reward: "+2 Bonus Credits", icon: Gift },
  { day: 7, reward: "+5 Credits + Badge", icon: Star },
  { day: 14, reward: "+10 Credits", icon: Heart },
  { day: 30, reward: "+25 Credits + Title", icon: Crown },
  { day: 60, reward: "+50 Credits", icon: Trophy },
  { day: 100, reward: "Pet Whisperer Status", icon: Flame },
];

interface PetMoodStreaksProps {
  currentStreak: number;
}

export default function PetMoodStreaks({ currentStreak }: PetMoodStreaksProps) {
  return (
    <>
      <FloatingHowItWorks title="How Pet Mood Streaks works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🔥 Pet Mood Streaks</h2>
      <Card className="bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border-purple-500/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{currentStreak} Days</p>
              <p className="text-xs text-muted-foreground">Current Mood Check Streak</p>
            </div>
            <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30 hidden sm:flex">
              Check your pet's mood daily!
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {streakRewards.map((sr, i) => {
              const achieved = currentStreak >= sr.day;
              return (
                <motion.div key={sr.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`text-center p-3 transition-all ${achieved ? "border-purple-500/50 bg-purple-500/10" : "opacity-50"}`}>
                    <sr.icon className={`h-5 w-5 mx-auto mb-1 ${achieved ? "text-purple-500" : "text-muted-foreground"}`} />
                    <p className="text-xs font-bold">Day {sr.day}</p>
                    <p className="text-[9px] text-muted-foreground">{sr.reward}</p>
                    {achieved && <Badge className="mt-1 text-[8px] bg-purple-500 text-white">✓ Earned</Badge>}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
}
