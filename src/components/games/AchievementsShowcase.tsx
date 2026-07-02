import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Crown, 
  Medal,
  Flame,
  Award,
  Lock
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: "trophy" | "star" | "zap" | "target" | "crown" | "medal" | "flame" | "award";
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
  unlockedAt?: Date;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  crown: Crown,
  medal: Medal,
  flame: Flame,
  award: Award,
};

const rarityColors = {
  common: "bg-gray-500/20 text-gray-500 border-gray-500/30",
  rare: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  legendary: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
};

const rarityGlow = {
  common: "",
  rare: "shadow-blue-500/20",
  epic: "shadow-purple-500/30",
  legendary: "shadow-yellow-500/40 shadow-lg",
};

interface AchievementsShowcaseProps {
  achievements?: Achievement[];
  totalXp?: number;
  level?: number;
}

const defaultAchievements: Achievement[] = [
  {
    id: "1",
    name: "First Victory",
    description: "Win your first game",
    icon: "trophy",
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    rarity: "common",
    xpReward: 100,
    unlockedAt: new Date(),
  },
  {
    id: "2",
    name: "Winning Streak",
    description: "Vyhrajte 5 hier za sebou",
    icon: "flame",
    progress: 3,
    maxProgress: 5,
    unlocked: false,
    rarity: "rare",
    xpReward: 250,
  },
  {
    id: "3",
    name: "Majster",
    description: "Dosiahnite level 50",
    icon: "crown",
    progress: 12,
    maxProgress: 50,
    unlocked: false,
    rarity: "epic",
    xpReward: 500,
  },
  {
    id: "4",
    name: "Legenda",
    description: "Vyhrajte turnaj",
    icon: "star",
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    rarity: "legendary",
    xpReward: 1000,
  },
];

export const AchievementsShowcase = ({
  achievements = defaultAchievements,
  totalXp = 1250,
  level = 12,
}: AchievementsShowcaseProps) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const nextLevelXp = level * 500;
  const currentLevelProgress = (totalXp % 500) / 5;

  return (
    <>
      <FloatingHowItWorks title={"Achievements Showcase - How it works"} steps={[{ title: 'Open', desc: 'Access the Achievements Showcase section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Achievements Showcase.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Level Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{level}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Star className="h-3 w-3 text-yellow-900" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Level {level}</h3>
                <p className="text-sm text-muted-foreground">{totalXp} XP celkom</p>
              </div>
            </div>
            <Badge variant="outline" className="text-primary border-primary">
              {unlockedCount}/{achievements.length} achievements
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pokrok k Level {level + 1}</span>
              <span>{totalXp % 500}/{500} XP</span>
            </div>
            <Progress value={currentLevelProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = iconMap[achievement.icon];
              const isUnlocked = achievement.unlocked;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-4 rounded-xl border transition-all ${
                    isUnlocked
                      ? `${rarityColors[achievement.rarity]} ${rarityGlow[achievement.rarity]}`
                      : "bg-muted/50 border-muted-foreground/20 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isUnlocked ? "bg-background/50" : "bg-muted"
                      }`}
                    >
                      {isUnlocked ? (
                        <Icon className="h-6 w-6" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{achievement.name}</h4>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      {!isUnlocked && (
                        <div className="space-y-1">
                          <Progress
                            value={(achievement.progress / achievement.maxProgress) * 100}
                            className="h-1.5"
                          />
                          <p className="text-xs text-muted-foreground">
                            {achievement.progress}/{achievement.maxProgress}
                          </p>
                        </div>
                      )}
                      {isUnlocked && (
                        <p className="text-xs text-primary">
                          +{achievement.xpReward} XP
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default AchievementsShowcase;
