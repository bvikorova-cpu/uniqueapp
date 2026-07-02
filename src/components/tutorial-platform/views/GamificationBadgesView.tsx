import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Medal, Trophy, Star, Zap, BookOpen, Users, Flame, Target, Award, Crown, GraduationCap, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  progress: number;
  requirement: number;
  unit: string;
  unlocked: boolean;
  rarity: string;
  xp: number;
}

const badges: BadgeItem[] = [
  { id: "first-lesson", name: "First Steps", description: "Complete your first lesson", icon: BookOpen, color: "from-emerald-500 to-teal-600", progress: 1, requirement: 1, unit: "lesson", unlocked: true, rarity: "Common", xp: 10 },
  { id: "speed-learner", name: "Speed Learner", description: "Complete 5 lessons in one day", icon: Zap, color: "from-yellow-500 to-amber-600", progress: 3, requirement: 5, unit: "lessons", unlocked: false, rarity: "Uncommon", xp: 25 },
  { id: "streak-7", name: "Week Warrior", description: "Maintain a 7-day streak", icon: Flame, color: "from-orange-500 to-red-600", progress: 5, requirement: 7, unit: "days", unlocked: false, rarity: "Uncommon", xp: 50 },
  { id: "streak-30", name: "Monthly Master", description: "Maintain a 30-day streak", icon: Crown, color: "from-amber-500 to-yellow-600", progress: 12, requirement: 30, unit: "days", unlocked: false, rarity: "Rare", xp: 200 },
  { id: "course-complete", name: "Course Graduate", description: "Complete an entire course", icon: GraduationCap, color: "from-blue-500 to-indigo-600", progress: 1, requirement: 1, unit: "course", unlocked: true, rarity: "Common", xp: 100 },
  { id: "quiz-ace", name: "Quiz Ace", description: "Score 100% on 3 quizzes", icon: Target, color: "from-purple-500 to-violet-600", progress: 2, requirement: 3, unit: "quizzes", unlocked: false, rarity: "Uncommon", xp: 75 },
  { id: "reviewer", name: "Helpful Reviewer", description: "Write 5 course reviews", icon: Star, color: "from-pink-500 to-rose-600", progress: 2, requirement: 5, unit: "reviews", unlocked: false, rarity: "Uncommon", xp: 40 },
  { id: "social", name: "Community Star", description: "Get 50 likes on forum posts", icon: Users, color: "from-sky-500 to-blue-600", progress: 23, requirement: 50, unit: "likes", unlocked: false, rarity: "Rare", xp: 100 },
  { id: "multi-course", name: "Knowledge Seeker", description: "Enroll in 10 courses", icon: BookOpen, color: "from-teal-500 to-emerald-600", progress: 4, requirement: 10, unit: "courses", unlocked: false, rarity: "Rare", xp: 150 },
  { id: "mentor", name: "Mentor Badge", description: "Complete 5 mentorship sessions", icon: Award, color: "from-fuchsia-500 to-purple-600", progress: 1, requirement: 5, unit: "sessions", unlocked: false, rarity: "Epic", xp: 250 },
  { id: "live", name: "Live Participant", description: "Join 10 live sessions", icon: Sparkles, color: "from-rose-500 to-pink-600", progress: 3, requirement: 10, unit: "sessions", unlocked: false, rarity: "Uncommon", xp: 60 },
  { id: "legend", name: "Platform Legend", description: "Earn 1000 total XP", icon: Trophy, color: "from-amber-400 to-orange-600", progress: 385, requirement: 1000, unit: "XP", unlocked: false, rarity: "Legendary", xp: 500 },
];

const rarityColors: Record<string, string> = {
  Common: "bg-slate-500/10 text-slate-600",
  Uncommon: "bg-emerald-500/10 text-emerald-600",
  Rare: "bg-blue-500/10 text-blue-600",
  Epic: "bg-purple-500/10 text-purple-600",
  Legendary: "bg-amber-500/10 text-amber-600",
};

interface Props { onBack: () => void; }

export function GamificationBadgesView({ onBack }: Props) {
  const unlocked = badges.filter(b => b.unlocked).length;
  const totalXP = badges.filter(b => b.unlocked).reduce((s, b) => s + b.xp, 0);

  return (
    <>
      <FloatingHowItWorks title={"Gamification Badges View - How it works"} steps={[{ title: 'Open', desc: 'Access the Gamification Badges View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gamification Badges View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
          <Medal className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Gamification Badges</h2>
          <p className="text-sm text-muted-foreground">{unlocked}/{badges.length} unlocked • {totalXP} XP earned</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Card className="p-4 text-center bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-black">{totalXP}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <Medal className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-black">{unlocked}</p>
          <p className="text-xs text-muted-foreground">Badges Unlocked</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <Crown className="w-8 h-8 text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-black">Silver</p>
          <p className="text-xs text-muted-foreground">Current Rank</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {badges.map(badge => {
          const Icon = badge.icon;
          const pct = Math.min(100, (badge.progress / badge.requirement) * 100);
          return (
            <Card key={badge.id} className={`p-4 hover:shadow-lg transition-all ${badge.unlocked ? "border-amber-500/30 bg-amber-500/5" : "opacity-80"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg shrink-0 ${!badge.unlocked ? "grayscale opacity-50" : ""}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm">{badge.name}</h3>
                    {badge.unlocked && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{badge.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-[9px] px-1.5 py-0 ${rarityColors[badge.rarity]}`}>{badge.rarity}</Badge>
                    <span className="text-[10px] font-bold text-amber-600">+{badge.xp} XP</span>
                  </div>
                </div>
              </div>
              {!badge.unlocked && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-muted-foreground">{badge.progress}/{badge.requirement} {badge.unit}</span>
                    <span className="font-bold">{Math.round(pct)}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
    </>
  );
}