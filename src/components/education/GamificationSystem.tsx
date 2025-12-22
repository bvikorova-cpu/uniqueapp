import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Zap, 
  Trophy, 
  Users, 
  TrendingUp,
  Star,
  Crown,
  Medal,
  Target
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
}

interface XPActivity {
  id: string;
  action: string;
  xp: number;
  timestamp: Date;
}

interface GamificationSystemProps {
  currentXp?: number;
  currentLevel?: number;
  streak?: number;
  leaderboard?: LeaderboardEntry[];
  recentActivities?: XPActivity[];
}

const defaultLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: "1", name: "Peter K.", xp: 15420, level: 42, streak: 30 },
  { rank: 2, userId: "2", name: "Mária S.", xp: 14800, level: 40, streak: 25 },
  { rank: 3, userId: "3", name: "Ján H.", xp: 13200, level: 38, streak: 18 },
  { rank: 4, userId: "4", name: "Anna M.", xp: 12500, level: 35, streak: 22 },
  { rank: 5, userId: "5", name: "Tomáš B.", xp: 11800, level: 33, streak: 15 },
  { rank: 6, userId: "6", name: "Eva K.", xp: 10500, level: 30, streak: 12 },
  { rank: 7, userId: "7", name: "Martin D.", xp: 9800, level: 28, streak: 10 },
  { rank: 8, userId: "8", name: "Lucia P.", xp: 9200, level: 26, streak: 8 },
];

const getLevelColor = (level: number) => {
  if (level >= 40) return "text-yellow-500";
  if (level >= 30) return "text-purple-500";
  if (level >= 20) return "text-blue-500";
  if (level >= 10) return "text-green-500";
  return "text-gray-500";
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-muted-foreground font-medium">#{rank}</span>;
};

export const GamificationSystem = ({
  currentXp = 5420,
  currentLevel = 15,
  streak = 7,
  leaderboard = defaultLeaderboard,
}: GamificationSystemProps) => {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const xpForNextLevel = currentLevel * 500;
  const currentLevelXp = currentXp % 500;
  const progressPercent = (currentLevelXp / 500) * 100;

  return (
    <div className="space-y-6">
      {/* XP & Level Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`w-20 h-20 rounded-full border-4 ${getLevelColor(currentLevel)} border-current flex items-center justify-center bg-background`}
                >
                  <span className="text-3xl font-bold">{currentLevel}</span>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1.5"
                >
                  <Star className="h-4 w-4 text-yellow-900" />
                </motion.div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Level {currentLevel}</h3>
                <p className="text-muted-foreground">{currentXp.toLocaleString()} XP celkom</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-orange-500">
                  <Zap className="h-5 w-5" />
                  <span className="text-2xl font-bold">{streak}</span>
                </div>
                <p className="text-sm text-muted-foreground">Séria dní</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pokrok k Level {currentLevel + 1}</span>
              <span>{currentLevelXp}/{500} XP</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Rebríček
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="leaderboard">
                <TrendingUp className="h-4 w-4 mr-2" />
                Top
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <Target className="h-4 w-4 mr-2" />
                Týždeň
              </TabsTrigger>
              <TabsTrigger value="friends">
                <Users className="h-4 w-4 mr-2" />
                Priatelia
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="space-y-2">
              <AnimatePresence>
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      entry.rank <= 3
                        ? "bg-gradient-to-r from-yellow-500/10 to-transparent"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{entry.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getLevelColor(entry.level)}>
                          Lv. {entry.level}
                        </Badge>
                        {entry.streak >= 7 && (
                          <span className="flex items-center text-xs text-orange-500">
                            <Zap className="h-3 w-3 mr-0.5" />
                            {entry.streak}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{entry.xp.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="weekly">
              <div className="text-center py-8 text-muted-foreground">
                Týždenný rebríček sa obnoví v pondelok
              </div>
            </TabsContent>

            <TabsContent value="friends">
              <div className="text-center py-8 text-muted-foreground">
                Pridajte priateľov a súťažte spolu!
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationSystem;
