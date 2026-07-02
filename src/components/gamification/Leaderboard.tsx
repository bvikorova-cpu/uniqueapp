import { useLeaderboard } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function Leaderboard() {
  const { data: leaders = [], isLoading } = useLeaderboard(10);

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-2 border-yellow-500/40";
    if (index === 1) return "bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-2 border-gray-400/40";
    if (index === 2) return "bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-2 border-amber-600/40";
    return "bg-muted/30 border border-border/30";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <>
      <FloatingHowItWorks title={"Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            TOP 10 Leaderboard
          </div>
          <Badge variant="outline">Top 10</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No players yet</p>
            <p className="text-sm mt-1">Be the first to earn XP!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((leader: any, index) => (
              <motion.div
                key={leader.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] ${getRankStyle(index)}`}
              >
                <div className="w-8 text-center font-bold text-lg flex items-center justify-center">
                  {getRankIcon(index) || `#${index + 1}`}
                </div>

                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={leader.profile?.avatar_url} />
                  <AvatarFallback>{leader.profile?.full_name?.[0] || "?"}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {leader.profile?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Level {leader.level}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{leader.total_points?.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
