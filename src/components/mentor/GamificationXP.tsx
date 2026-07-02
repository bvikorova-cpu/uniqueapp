import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Trophy, Star, Flame, Zap, Award, Target, Crown, Medal } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface XPData {
  xp_total: number;
  level: number;
  badges: string[];
  streak_days: number;
  longest_streak: number;
}

const BADGE_CONFIG: Record<string, { label: string; icon: typeof Trophy; color: string }> = {
  level_5: { label: "Level 5 Achiever", icon: Star, color: "text-yellow-400" },
  level_10: { label: "Level 10 Master", icon: Crown, color: "text-amber-400" },
  xp_500: { label: "500 XP Club", icon: Zap, color: "text-blue-400" },
  xp_1000: { label: "XP Legend", icon: Trophy, color: "text-purple-400" },
  streak_7: { label: "7-Day Streak", icon: Flame, color: "text-orange-400" },
  streak_30: { label: "30-Day Streak", icon: Flame, color: "text-red-400" },
  first_plan: { label: "First Plan", icon: Target, color: "text-green-400" },
  mood_master: { label: "Mood Master", icon: Medal, color: "text-pink-400" },
};

const LEVEL_TITLES = [
  "", "Beginner", "Apprentice", "Student", "Practitioner", "Adept",
  "Expert", "Master", "Grandmaster", "Legend", "Transcendent",
  "Enlightened", "Ascended", "Mythic", "Divine", "Infinite",
];

export function GamificationXP() {
  const [xp, setXP] = useState<XPData | null>(null);

  useEffect(() => {
    loadXP();
  }, []);

  const loadXP = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("mentor_xp").select("*").eq("user_id", user.id).maybeSingle();
    setXP(data as XPData | null);
  };

  const level = xp?.level || 1;
  const totalXP = xp?.xp_total || 0;
  const xpInLevel = totalXP % 100;
  const xpToNext = 100;
  const title = LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)] || `Level ${level}`;
  const badges = xp?.badges || [];

  return (
    <>
      <FloatingHowItWorks title="How Gamification XP works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" /> Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level display */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
        >
          <div className="text-3xl font-black text-primary mb-1">Level {level}</div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{xpInLevel} XP</span>
              <span>{xpToNext} XP</span>
            </div>
            <Progress value={(xpInLevel / xpToNext) * 100} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total: {totalXP} XP</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Flame className="h-4 w-4 mx-auto text-orange-400 mb-1" />
            <p className="text-lg font-bold">{xp?.streak_days || 0}</p>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Award className="h-4 w-4 mx-auto text-yellow-400 mb-1" />
            <p className="text-lg font-bold">{badges.length}</p>
            <p className="text-[10px] text-muted-foreground">Badges</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Star className="h-4 w-4 mx-auto text-blue-400 mb-1" />
            <p className="text-lg font-bold">{xp?.longest_streak || 0}</p>
            <p className="text-[10px] text-muted-foreground">Best Streak</p>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Earned Badges</p>
            <div className="flex flex-wrap gap-1.5">
              {badges.map((badge) => {
                const config = BADGE_CONFIG[badge];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <motion.div key={badge} initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }}>
                    <Badge variant="outline" className="text-xs gap-1 py-1">
                      <Icon className={`h-3 w-3 ${config.color}`} />
                      {config.label}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* XP earning guide */}
        <div className="text-xs text-muted-foreground space-y-1 p-2 rounded-lg bg-muted/20">
          <p className="font-semibold text-foreground text-[11px]">How to Earn XP:</p>
          <p>• Chat with mentor: +15 XP</p>
          <p>• Log mood: +10 XP</p>
          <p>• Voice coaching: +10 XP</p>
          <p>• Generate action plan: +25 XP</p>
          <p>• Complete a goal: +50 XP</p>
        </div>
      </CardContent>
    </Card>
    </>
    );
}
