import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Clock, Zap, MessageSquare, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: typeof Target;
  xpReward: number;
  multiplier?: string;
  progress: number;
  goal: number;
  color: string;
}

function buildChallenges(p: { posts: number; comments: number; likes: number; streak: number }): Challenge[] {
  return [
    { id: "posts", title: "Content Creator", description: "Create 5 posts this week", icon: Target, xpReward: 50, progress: p.posts, goal: 5, color: "text-primary" },
    { id: "comments", title: "Conversation Starter", description: "Leave 10 comments", icon: MessageSquare, xpReward: 30, progress: p.comments, goal: 10, color: "text-blue-500" },
    { id: "likes", title: "Supporter", description: "Like 20 posts", icon: Heart, xpReward: 20, progress: p.likes, goal: 20, color: "text-pink-500" },
    { id: "streak", title: "Streak Master", description: "Login 7 days in a row", icon: Zap, xpReward: 100, multiplier: "2x XP", progress: p.streak, goal: 7, color: "text-orange-500" },
  ];
}

function getTimeUntilReset() {
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);
  const diff = nextMonday.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours };
}

export default function WeeklyChallenges() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(getTimeUntilReset());
  const [progress, setProgress] = useState({ posts: 0, comments: 0, likes: 0, streak: 0 });
  const challenges = buildChallenges(progress);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeUntilReset()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc("get_weekly_challenge_progress" as any);
      const res = data as any;
      if (cancelled || !res?.ok) return;
      setProgress({
        posts: res.posts ?? 0,
        comments: res.comments ?? 0,
        likes: res.likes ?? 0,
        streak: res.streak ?? 0,
      });
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Weekly Challenges
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {timeLeft.days}d {timeLeft.hours}h left
            </Badge>
            <HowItWorksButton title="Weekly Challenges" intro="Rotating weekly objectives that reward bonus XP." steps={[
              { title: "One week per set", desc: "The timer shows when this week's challenges reset. New ones appear every Monday." },
              { title: "Progress auto-tracks", desc: "Playing games, chatting, liking posts — normal activity fills the challenge bars." },
              { title: "Bonus XP on completion", desc: "Every finished challenge instantly credits the XP shown on its card." },
              { title: "Don't skip a week", desc: "Unfinished challenges expire on reset. Complete all for a Weekly Champion bonus." },
            ]} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge, i) => {
          const pct = Math.min((challenge.progress / challenge.goal) * 100, 100);
          const completed = challenge.progress >= challenge.goal;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-3 rounded-xl border transition-all ${
                completed
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-muted/30 border-border/30 hover:border-primary/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-background/50 ${challenge.color}`}>
                  <challenge.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">{challenge.title}</h4>
                    <div className="flex items-center gap-1 shrink-0">
                      {challenge.multiplier && (
                        <Badge className="bg-orange-500/20 text-orange-500 text-[10px] px-1.5 py-0">
                          {challenge.multiplier}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        +{challenge.xpReward} XP
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {challenge.progress}/{challenge.goal}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
