import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Clock, Gift, Zap, CheckCircle2, Users, Camera, MessageCircle, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const weeklyChallenges = [
  { id: "photo_day", emoji: "📸", title: "Photo Marathon", desc: "Post 5 photos this week", progress: 3, target: 5, reward: 100, icon: Camera, color: "from-orange-500 to-coral-500" },
  { id: "engage", emoji: "💬", title: "Social Butterfly", desc: "Comment on 20 posts", progress: 12, target: 20, reward: 150, icon: MessageCircle, color: "from-teal-500 to-cyan-500" },
  { id: "collab", emoji: "🤝", title: "Collaboration Week", desc: "Create 3 collab posts", progress: 1, target: 3, reward: 200, icon: Users, color: "from-purple-500 to-violet-500" },
  { id: "hearts", emoji: "❤️", title: "Love Spreader", desc: "Like 50 posts this week", progress: 34, target: 50, reward: 75, icon: Heart, color: "from-rose-500 to-pink-500" },
];

const dailyChallenges = [
  { id: "daily_post", emoji: "✍️", title: "Daily Creator", desc: "Share a post today", completed: false, reward: 25 },
  { id: "daily_comment", emoji: "💭", title: "Voice Your Opinion", desc: "Leave 3 meaningful comments", completed: true, reward: 15 },
  { id: "daily_share", emoji: "🔄", title: "Share the Love", desc: "Repost someone's content", completed: false, reward: 20 },
];

export default function WallSocialChallenges() {
  const [challenges, setChallenges] = useState(dailyChallenges);
  const { toast } = useToast();

  const getTimeLeftInWeek = () => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    const diff = endOfWeek.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return `${days}d ${hours}h`;
  };

  return (
    <div className="space-y-4">
      {/* Daily Challenges */}
      <Card className="p-4 bg-card/80 backdrop-blur-md border-border/30">
        <h3 className="font-bold flex items-center gap-2 mb-3"><Zap className="h-4 w-4 text-amber-500" /> Daily Challenges</h3>
        <div className="space-y-2">
          {challenges.map((ch, i) => (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-xl ${ch.completed ? "bg-green-500/10 border border-green-500/20" : "bg-muted/20 border border-border/20"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{ch.emoji}</span>
                <div>
                  <p className={`text-sm font-bold ${ch.completed ? "text-green-600 dark:text-green-400 line-through" : ""}`}>{ch.title}</p>
                  <p className="text-[10px] text-muted-foreground">{ch.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-500">+{ch.reward} XP</span>
                {ch.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                    setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, completed: true } : c));
                    toast({ title: `✅ ${ch.title} completed!`, description: `+${ch.reward} XP earned!` });
                  }}>
                    Claim
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Weekly Challenges */}
      <Card className="p-4 bg-card/80 backdrop-blur-md border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2"><Target className="h-4 w-4 text-orange-500" /> Weekly Challenges</h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {getTimeLeftInWeek()} left</span>
        </div>
        <div className="space-y-3">
          {weeklyChallenges.map((ch, i) => {
            const pct = Math.round((ch.progress / ch.target) * 100);
            const isComplete = ch.progress >= ch.target;
            return (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-xl border ${isComplete ? "bg-green-500/10 border-green-500/20" : "bg-muted/10 border-border/20"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${ch.color} flex items-center justify-center`}>
                      <ch.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{ch.title}</p>
                      <p className="text-[10px] text-muted-foreground">{ch.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1"><Gift className="h-3 w-3" /> +{ch.reward} XP</span>
                    <p className="text-[10px] text-muted-foreground">{ch.progress}/{ch.target}</p>
                  </div>
                </div>
                <Progress value={pct} className="h-1.5" />
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
