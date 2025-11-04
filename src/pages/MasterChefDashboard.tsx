import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Users, Star, TrendingUp, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function MasterChefDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalCompetitions: 0,
    wins: 0,
    totalVotes: 0,
    currentRank: "-",
    level: 1,
    xp: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Prihlásenie potrebné",
        description: "Prosím prihláste sa pre pokračovanie",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            MasterChef Dashboard
          </h1>
          <p className="text-muted-foreground">Tvoja cesta k dokonalosti v kuchyni</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Súťaže</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompetitions}</div>
              <p className="text-xs text-muted-foreground">Celkovo absolvovaných</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Výhry</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.wins}</div>
              <p className="text-xs text-muted-foreground">1. miesta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hlasy</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVotes}</div>
              <p className="text-xs text-muted-foreground">Od divákov</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rank</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentRank}</div>
              <p className="text-xs text-muted-foreground">Globálne umiestnenie</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Aktívne súťaže
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">Momentálne nie sú žiadne aktívne súťaže</p>
                <Button onClick={() => navigate("/masterchef/competitions")}>
                  Prehľadať súťaže
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Chef Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((position) => (
                  <div key={position} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                      {position}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Šéfkuchár #{position}</p>
                      <p className="text-xs text-muted-foreground">
                        {1000 - position * 100} bodov
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Button
            size="lg"
            className="h-32 flex flex-col gap-2"
            onClick={() => navigate("/masterchef/live-battles")}
          >
            <Flame className="h-8 w-8" />
            <span className="text-lg font-semibold">Live Battles</span>
            <span className="text-xs opacity-80">Súťaž v reálnom čase</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-32 flex flex-col gap-2"
            onClick={() => navigate("/masterchef/competitions")}
          >
            <Trophy className="h-8 w-8" />
            <span className="text-lg font-semibold">Súťaže</span>
            <span className="text-xs opacity-80">Async competitions</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-32 flex flex-col gap-2"
            onClick={() => navigate("/masterchef/leaderboard")}
          >
            <TrendingUp className="h-8 w-8" />
            <span className="text-lg font-semibold">Leaderboard</span>
            <span className="text-xs opacity-80">Globálne rebríčky</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-32 flex flex-col gap-2"
            onClick={() => navigate("/masterchef/profile")}
          >
            <Users className="h-8 w-8" />
            <span className="text-lg font-semibold">Profil</span>
            <span className="text-xs opacity-80">Tvoje štatistiky</span>
          </Button>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Najbližšie eventy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <h4 className="font-semibold">Quick Fire Challenge</h4>
                  <p className="text-sm text-muted-foreground">30 minút | Live Battle</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Dnes 18:00</p>
                  <Button size="sm" className="mt-2">
                    Prihlásiť sa
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <h4 className="font-semibold">Dessert Masters</h4>
                  <p className="text-sm text-muted-foreground">48h upload | Async</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Zajtra 20:00</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Detaily
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
