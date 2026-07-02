import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BadgeLeaderEntry {
  user_id: string;
  badge_count: number;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function BadgeLeaderboard() {
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ["badge-leaderboard"],
    queryFn: async () => {
      const { data: badgeCounts, error: countError } = await supabase
        .from("user_badges")
        .select("user_id");
      if (countError) throw countError;

      const userBadgeCounts: Record<string, number> = {};
      badgeCounts?.forEach((item: any) => {
        userBadgeCounts[item.user_id] = (userBadgeCounts[item.user_id] || 0) + 1;
      });

      const topUsers = Object.entries(userBadgeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      if (topUsers.length === 0) return [];

      const userIds = topUsers.map(([id]) => id);
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      if (profileError) throw profileError;

      const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);
      
      return topUsers.map(([userId, count]) => ({
        user_id: userId,
        badge_count: count,
        profile: profileMap.get(userId) || null,
      })) as BadgeLeaderEntry[];
    },
  });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-2 border-yellow-500/40";
    if (index === 1) return "bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-2 border-gray-400/40";
    if (index === 2) return "bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-2 border-amber-600/40";
    return "bg-muted/30 border border-border/30";
  };

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Badge Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Badge Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Badge Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" /> Badge Hunters 🏆
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Badge Hunters 🏆
          <Badge variant="outline" className="ml-auto">Top 10</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No badge hunters yet!</p>
            <p className="text-sm">Be the first to collect badges</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((leader, index) => (
              <motion.div
                key={leader.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] ${getRankBg(index)}`}
              >
                <div className="w-8 text-center font-bold text-lg flex items-center justify-center">
                  {getRankIcon(index) || `#${index + 1}`}
                </div>
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={leader.profile?.avatar_url || undefined} />
                  <AvatarFallback>{leader.profile?.full_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{leader.profile?.full_name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">Badge Collector</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl">🏅</span>
                    <span className="font-bold text-lg">{leader.badge_count}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">badges</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
