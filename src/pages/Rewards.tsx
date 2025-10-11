import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGamification } from "@/hooks/useGamification";
import {
  Trophy,
  Award,
  TrendingUp,
  Gift,
  Star,
  Medal,
  Target,
  Zap,
} from "lucide-react";

export default function Rewards() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useState(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  });

  const {
    userPoints,
    userBadges,
    allBadges,
    claimDailyReward,
    canClaimDaily,
    pointsForNextLevel,
    progressToNextLevel,
  } = useGamification(user?.id);

  // Get leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data: pointsData, error } = await supabase
        .from("user_points")
        .select("user_id, total_points, level")
        .order("total_points", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get profiles for users
      const userIds = pointsData.map((p) => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      return pointsData.map((p) => ({
        ...p,
        profile: profiles?.find((pr) => pr.id === p.user_id),
      }));
    },
  });

  // Get user rank
  const userRank =
    leaderboard.findIndex((u) => u.user_id === user?.id) + 1;

  const earnedBadgeIds = new Set(userBadges.map((ub: any) => ub.badge_id));

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-muted-foreground">Prihlás sa pre zobrazenie odmien</p>
          <Button onClick={() => navigate("/auth")} className="mt-4">
            Prihlásiť sa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent text-center">
          🎮 Odmeny & Výsledky
        </h1>

        {/* User Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-primary" />
                Level {userPoints?.level || 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-semibold">
                    {userPoints?.current_level_points || 0} /{" "}
                    {pointsForNextLevel}
                  </span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-amber-500" />
                Body
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {userPoints?.total_points || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Celkovo nazbieraných
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Medal className="h-5 w-5 text-blue-500" />
                Rebríček
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                #{userRank || "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Z {leaderboard.length} používateľov
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="badges" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="badges">
              <Award className="h-4 w-4 mr-2" />
              Odznaky
            </TabsTrigger>
            <TabsTrigger value="daily">
              <Gift className="h-4 w-4 mr-2" />
              Denné odmeny
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <TrendingUp className="h-4 w-4 mr-2" />
              Žebříček
            </TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle>
                  Odznaky ({userBadges.length}/{allBadges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allBadges.map((badge: any) => {
                    const earned = earnedBadgeIds.has(badge.id);
                    return (
                      <Card
                        key={badge.id}
                        className={`${
                          earned
                            ? "bg-gradient-to-br from-primary/20 to-primary/10 border-primary"
                            : "opacity-50 grayscale"
                        }`}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <h3 className="font-semibold text-sm mb-1">
                            {badge.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {badge.description}
                          </p>
                          <Badge variant={earned ? "default" : "secondary"}>
                            {earned ? "Získané!" : `${badge.points_reward} bodov`}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Rewards Tab */}
          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Denná odmena
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="inline-block p-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-4">
                  <Gift className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Získaj denne {10} bodov!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Prihlás sa každý deň a získaj bonus body. Dlhšie série = väčšie
                  odmeny!
                </p>
                <Button
                  size="lg"
                  onClick={() => claimDailyReward()}
                  disabled={!canClaimDaily}
                  className="min-w-[200px]"
                >
                  {canClaimDaily ? (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Získať odmenu
                    </>
                  ) : (
                    "Dnes už získané"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Top 100 používateľov</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((entry: any, index: number) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        entry.user_id === user.id
                          ? "bg-primary/10 border border-primary"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.profile?.avatar_url} />
                        <AvatarFallback>
                          {entry.profile?.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {entry.profile?.full_name || "Používateľ"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Level {entry.level}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {entry.total_points}
                        </p>
                        <p className="text-xs text-muted-foreground">bodov</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
