import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Target, Gift, Trophy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const MILESTONES = [
  { day: 3, reward: "🎯 Profile Boost", desc: "Your profile gets priority visibility for 24h" },
  { day: 7, reward: "⭐ Gold Badge", desc: "Earn the 'Consistent Applicant' badge" },
  { day: 14, reward: "🎁 5 Free Credits", desc: "Bonus AI credits for career tools" },
  { day: 21, reward: "🏆 Featured Profile", desc: "Appear in 'Top Candidates' section" },
  { day: 30, reward: "💎 Premium Trial", desc: "3-day premium access unlocked" },
  { day: 60, reward: "👑 Career Champion", desc: "Legendary badge + 15 free credits" },
  { day: 100, reward: "🌟 Hall of Fame", desc: "Permanent leaderboard spotlight" },
];

export default function JobsApplicationStreaks() {
  const [currentStreak] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);

  const handleCheckIn = () => {
    setCheckedToday(true);
    toast.success("Daily check-in recorded! Keep the streak going 🔥");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-black">🔥 Application Streaks</h2>

      <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4">
            <Flame className="h-10 w-10 text-white" />
          </div>
          <p className="text-4xl font-black mb-1">{currentStreak}</p>
          <p className="text-sm text-muted-foreground mb-4">Day Streak</p>
          <Button
            onClick={handleCheckIn}
            disabled={checkedToday}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            {checkedToday ? <><CheckCircle className="h-4 w-4 mr-2" /> Checked In Today</> : <><Target className="h-4 w-4 mr-2" /> Daily Check-in</>}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-bold text-sm flex items-center gap-2"><Gift className="h-4 w-4 text-amber-400" /> Milestone Rewards</h3>
        {MILESTONES.map((m, i) => {
          const unlocked = currentStreak >= m.day;
          return (
            <motion.div key={m.day} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`border-border/30 ${unlocked ? "bg-amber-500/10 border-amber-500/30" : "bg-card/50 opacity-60"}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${unlocked ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {m.day}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{m.reward}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  {unlocked && <Trophy className="h-5 w-5 text-amber-400" />}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
