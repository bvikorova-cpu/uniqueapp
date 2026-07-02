import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Gift, Camera, Crown, Star, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const streakRewards = [
  { day: 3, reward: "+2 Bonus Credits", icon: Gift },
  { day: 7, reward: "+5 Credits + Badge", icon: Star },
  { day: 14, reward: "Free Skin Analysis", icon: Camera },
  { day: 30, reward: "+25 Credits + Title", icon: Crown },
  { day: 60, reward: "+50 Credits", icon: Trophy },
  { day: 100, reward: "Legend Status", icon: Flame },
];

interface Props { currentStreak: number; }

export default function FutureFaceSelfieStreaks({ currentStreak }: Props) {
  return (
    <>
      <FloatingHowItWorks title={"Future Face Selfie Streaks - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Selfie Streaks section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Selfie Streaks.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">📸 Daily Selfie Streaks</h2>
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{currentStreak} Days</p>
              <p className="text-xs text-muted-foreground">Current Selfie Streak</p>
            </div>
            <Badge className="ml-auto bg-cyan-500/20 text-cyan-500 border-cyan-500/30 text-[10px]">
              Take a selfie daily!
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {streakRewards.map((sr, i) => {
              const achieved = currentStreak >= sr.day;
              return (
                <motion.div key={sr.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`text-center p-3 transition-all ${achieved ? "border-cyan-500/50 bg-cyan-500/10" : "opacity-50"}`}>
                    <sr.icon className={`h-5 w-5 mx-auto mb-1 ${achieved ? "text-cyan-500" : "text-muted-foreground"}`} />
                    <p className="text-xs font-bold">Day {sr.day}</p>
                    <p className="text-[9px] text-muted-foreground">{sr.reward}</p>
                    {achieved && <Badge className="mt-1 text-[8px] bg-cyan-500 text-white">✓</Badge>}
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
