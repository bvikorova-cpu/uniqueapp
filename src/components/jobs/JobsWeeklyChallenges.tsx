import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Clock, Users, Trophy } from "lucide-react";

const CHALLENGES = [
  { id: 1, title: "Speed Applicant", desc: "Apply to 5 jobs this week", progress: 0, goal: 5, reward: "3 Credits", icon: "⚡", active: true },
  { id: 2, title: "Network Builder", desc: "Connect with 3 companies", progress: 0, goal: 3, reward: "5 Credits", icon: "🤝", active: true },
  { id: 3, title: "Skill Sharpener", desc: "Use 2 different AI career tools", progress: 0, goal: 2, reward: "4 Credits", icon: "🛠️", active: true },
  { id: 4, title: "Global Reach", desc: "Apply to jobs in 2 countries", progress: 0, goal: 2, reward: "6 Credits", icon: "🌍", active: true },
];

const PAST_CHALLENGES = [
  { title: "Resume Revamp", winner: "Alex M.", participants: 234, reward: "10 Credits" },
  { title: "Interview Marathon", winner: "Sarah K.", participants: 189, reward: "8 Credits" },
  { title: "Industry Explorer", winner: "James L.", participants: 156, reward: "7 Credits" },
];

export default function JobsWeeklyChallenges() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🏋️ Weekly Challenges</h2>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <Clock className="h-3 w-3 mr-1" /> Resets Sunday
        </Badge>
      </div>

      <div className="space-y-3">
        {CHALLENGES.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/80 border-border/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{c.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm">{c.title}</p>
                      <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">{c.reward}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{c.desc}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={(c.progress / c.goal) * 100} className="h-2 flex-1" />
                      <span className="text-xs font-mono">{c.progress}/{c.goal}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400" /> Past Winners</h3>
        <div className="space-y-2">
          {PAST_CHALLENGES.map((p, i) => (
            <Card key={i} className="bg-card/50 border-border/20">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground">Winner: {p.winner} • {p.participants} participants</p>
                </div>
                <Badge variant="outline" className="text-[9px]">{p.reward}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
