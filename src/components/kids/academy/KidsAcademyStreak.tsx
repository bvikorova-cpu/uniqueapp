import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Flame, Star, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const DAILY_CHALLENGES = [
  { id: "read", title: "Read a Story", emoji: "📖", xpReward: 15, description: "Read or create any story" },
  { id: "draw", title: "Draw Something", emoji: "🎨", xpReward: 15, description: "Complete a drawing challenge" },
  { id: "quiz", title: "Answer 5 Questions", emoji: "❓", xpReward: 20, description: "Complete a quick quiz" },
  { id: "explore", title: "Visit 2 Modules", emoji: "🗺️", xpReward: 10, description: "Explore different worlds" },
  { id: "experiment", title: "Do an Experiment", emoji: "🧪", xpReward: 20, description: "Try a virtual experiment" },
];

const STREAK_REWARDS = [
  { days: 3, reward: "🔥 Fire Badge", bonus: "1.5x XP" },
  { days: 7, reward: "⭐ Star Crown", bonus: "2x XP" },
  { days: 14, reward: "🦄 Unicorn Avatar", bonus: "2.5x XP" },
  { days: 30, reward: "🏆 Legend Status", bonus: "3x XP" },
];

export const KidsAcademyStreak = () => {
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("kids-academy-streak");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [completedToday, setCompletedToday] = useState<string[]>(() => {
    const saved = localStorage.getItem("kids-academy-daily-completed");
    const data = saved ? JSON.parse(saved) : { date: "", completed: [] };
    return data.date === new Date().toDateString() ? data.completed : [];
  });

  const weekendBonus = new Date().getDay() === 0 || new Date().getDay() === 6;

  const handleCompleteChallenge = (challenge: typeof DAILY_CHALLENGES[0]) => {
    if (completedToday.includes(challenge.id)) return;
    const newCompleted = [...completedToday, challenge.id];
    setCompletedToday(newCompleted);
    const xpGained = weekendBonus ? challenge.xpReward * 2 : challenge.xpReward;
    const currentXp = parseInt(localStorage.getItem("kids-academy-xp") || "0", 10);
    localStorage.setItem("kids-academy-xp", String(currentXp + xpGained));
    toast.success(`+${xpGained} XP earned!`, { description: challenge.title });
    if (newCompleted.length === DAILY_CHALLENGES.length) {
      setStreak(prev => prev + 1);
      toast.success("🔥 Streak +1!", { description: "All daily challenges complete!" });
    }
  };

  useEffect(() => {
    localStorage.setItem("kids-academy-streak", String(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem(
      "kids-academy-daily-completed",
      JSON.stringify({ date: new Date().toDateString(), completed: completedToday })
    );
  }, [completedToday]);

  const currentMultiplier = streak >= 30 ? "3x" : streak >= 14 ? "2.5x" : streak >= 7 ? "2x" : streak >= 3 ? "1.5x" : "1x";

  return (
    <>
      <FloatingHowItWorks title={"Kids Academy Streak - How it works"} steps={[{ title: 'Open', desc: 'Access the Kids Academy Streak section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Kids Academy Streak.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Streak Card */}
      <Card className="border-2 border-orange-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500" />
            Daily Streak
            {streak > 0 && (
              <Badge className="bg-orange-500/15 text-orange-600 border-orange-500/30 ml-auto">
                {currentMultiplier} XP Bonus
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Streak counter */}
          <div className="text-center">
            <motion.div
              animate={streak > 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-5xl font-black text-primary mb-1"
            >
              {streak}
            </motion.div>
            <span className="text-sm text-muted-foreground">day streak</span>
          </div>

          {/* Weekly calendar */}
          <div className="flex justify-center gap-2">
            {DAYS.map((day, i) => {
              const today = new Date().getDay();
              const adjustedDay = today === 0 ? 6 : today - 1; // Mon=0
              const isToday = i === adjustedDay;
              const isPast = i < adjustedDay;
              const isActive = isPast && i >= adjustedDay - streak;
              return (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isToday
                      ? "border-primary bg-primary/20 text-primary"
                      : isActive
                      ? "border-orange-500/50 bg-orange-500/20 text-orange-600"
                      : "border-border bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {isActive ? "🔥" : day}
                </div>
              );
            })}
          </div>

          {/* Streak milestones */}
          <div className="space-y-1.5">
            {STREAK_REWARDS.map((sr, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                  streak >= sr.days
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : "bg-muted/30 border border-border/50 opacity-60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{sr.reward}</span>
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {sr.days} days • {sr.bonus}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenge */}
      <Card className="border-2 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Today's Challenges
            {weekendBonus && (
              <Badge className="bg-yellow-500/15 text-yellow-600 border-yellow-500/30 ml-auto">
                🎉 Weekend 2x Bonus!
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAILY_CHALLENGES.map((challenge, i) => {
            const done = completedToday.includes(challenge.id);
            return (
              <motion.button
                key={challenge.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleCompleteChallenge(challenge)}
                disabled={done}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  done
                    ? "bg-green-500/10 border-green-500/30 cursor-default"
                    : "bg-card/50 border-border/50 hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                }`}
              >
                <span className="text-2xl">{challenge.emoji}</span>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {challenge.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{challenge.description}</p>
                </div>
                <div className="text-right">
                  {done ? (
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-[10px]">
                      ✓ Done
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      <Star className="w-2.5 h-2.5 mr-0.5 text-amber-500" />
                      +{challenge.xpReward} XP
                    </Badge>
                  )}
                </div>
              </motion.button>
            );
          })}
        </CardContent>
      </Card>
    </div>
    </>
  );
};
