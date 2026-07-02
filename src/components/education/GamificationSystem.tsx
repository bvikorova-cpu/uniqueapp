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
  Target,
  Sparkles
} from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
}

interface GamificationSystemProps {
  currentXp?: number;
  currentLevel?: number;
  streak?: number;
  leaderboard?: LeaderboardEntry[];
}

const getLevelColor = (level: number) => {
  if (level >= 40) return "text-yellow-500";
  if (level >= 30) return "text-purple-500";
  if (level >= 20) return "text-blue-500";
  if (level >= 10) return "text-green-500";
  return "text-muted-foreground";
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-muted-foreground font-medium">#{rank}</span>;
};

const getRankBg = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-transparent border-yellow-500/20";
  if (rank === 2) return "bg-gradient-to-r from-gray-400/10 via-gray-300/5 to-transparent border-gray-400/20";
  if (rank === 3) return "bg-gradient-to-r from-amber-600/10 via-orange-500/5 to-transparent border-amber-600/20";
  return "hover:bg-muted/50";
};

export const GamificationSystem = ({
  currentXp = 0,
  currentLevel = 1,
  streak = 0,
  leaderboard = [],
}: GamificationSystemProps) => {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const currentLevelXp = currentXp % 500;
  const progressPercent = (currentLevelXp / 500) * 100;

  return (
    <>
      <FloatingHowItWorks title="How Gamification System works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      {/* XP & Level Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-primary/20">
          <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`w-20 h-20 rounded-full border-4 ${getLevelColor(currentLevel)} border-current flex items-center justify-center bg-background/80 backdrop-blur-sm`}
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
                  <p className="text-muted-foreground">{currentXp.toLocaleString()} XP total</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Zap className="h-5 w-5" />
                    <span className="text-2xl font-bold">{streak}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {currentLevel + 1}</span>
                <span className="font-semibold">{currentLevelXp}/500 XP</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Leaderboard
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
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="friends">
                  <Users className="h-4 w-4 mr-2" />
                  Friends
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard" className="space-y-2">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No students ranked yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Complete quizzes to appear on the leaderboard!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-3 rounded-xl border ${getRankBg(entry.rank)}`}
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
                )}
              </TabsContent>

              <TabsContent value="weekly">
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Weekly leaderboard resets on Monday</p>
                </div>
              </TabsContent>

              <TabsContent value="friends">
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Add friends and compete together!</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
    );
};

export default GamificationSystem;
