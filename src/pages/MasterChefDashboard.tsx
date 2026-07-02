import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Users, Star, TrendingUp, Calendar, Clock, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SendGiftDialog } from "@/components/masterchef/SendGiftDialog";
import { useMasterChefSubscription } from "@/hooks/useMasterChefSubscription";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function MasterChefDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, tier, loading: subscriptionLoading } = useMasterChefSubscription();
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [selectedChef, setSelectedChef] = useState<{ id: string; name: string } | null>(null);
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

  useEffect(() => {
    if (!subscriptionLoading && !subscribed) {
      toast({
        title: "Subscription Required",
        description: "You need an active KitchenStars subscription to access the dashboard",
        variant: "destructive",
      });
      navigate("/masterchef-subscription");
    }
  }, [subscribed, subscriptionLoading, navigate, toast]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };

  if (subscriptionLoading) {
    return (
      <>
        <FloatingHowItWorks title="How Master Chef Dashboard works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
        <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 animate-bounce text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your KitchenStars dashboard...</p>
        </div>
      </div>
      </>
      );
  }

  if (!subscribed) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 pt-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            KitchenStars Dashboard
          </h1>
          <p className="text-muted-foreground">Your journey to culinary perfection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Competitions</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompetitions}</div>
              <p className="text-xs text-muted-foreground">Total completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Wins</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.wins}</div>
              <p className="text-xs text-muted-foreground">1st places</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Votes</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVotes}</div>
              <p className="text-xs text-muted-foreground">From viewers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rank</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentRank}</div>
              <p className="text-xs text-muted-foreground">Global ranking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Active Competitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">No active competitions at the moment</p>
                <Button onClick={() => navigate("/masterchef/competitions")}>
                  Browse Competitions
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
                      <p className="font-medium text-sm">Chef #{position}</p>
                      <p className="text-xs text-muted-foreground">
                        {1000 - position * 100} points
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedChef({ id: `chef-${position}`, name: `Chef #${position}` });
                        setGiftDialogOpen(true);
                      }}
                    >
                      <Gift className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <div className="flex items-start gap-4">
            <Gift className="h-8 w-8 text-orange-500 shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Support Your Favorite Chefs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send virtual gifts to show appreciation and support. All gifts go directly to the chefs!
              </p>
              <div className="flex gap-2 flex-wrap">
                <div className="px-3 py-1 rounded-full bg-background/50 text-xs">👏 €2</div>
                <div className="px-3 py-1 rounded-full bg-background/50 text-xs">🔥 €5</div>
                <div className="px-3 py-1 rounded-full bg-background/50 text-xs">👨‍🍳 €10</div>
                <div className="px-3 py-1 rounded-full bg-background/50 text-xs">⭐ €25</div>
                <div className="px-3 py-1 rounded-full bg-background/50 text-xs">🏆 €50</div>
                <div className="px-3 py-1 rounded-full bg-background/50 text-xs">💎 €100</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Button
            size="lg"
            className="h-32 flex flex-col gap-2"
            onClick={() => navigate("/masterchef/live-battles")}
          >
            <Flame className="h-8 w-8" />
            <span className="text-lg font-semibold">Live Battles</span>
            <span className="text-xs opacity-80">Compete in real-time</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-32 flex flex-col gap-2"
            onClick={() => navigate("/masterchef/competitions")}
          >
            <Trophy className="h-8 w-8" />
            <span className="text-lg font-semibold">Competitions</span>
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
            <span className="text-xs opacity-80">Global rankings</span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-32 flex flex-col gap-2"
            onClick={() => navigate("/masterchef/profile")}
          >
            <Users className="h-8 w-8" />
            <span className="text-lg font-semibold">Profile</span>
            <span className="text-xs opacity-80">Your statistics</span>
          </Button>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <h4 className="font-semibold">Quick Fire Challenge</h4>
                  <p className="text-sm text-muted-foreground">30 minutes | Live Battle</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Today 6:00 PM</p>
                  <Button size="sm" className="mt-2" onClick={() => {
                    const signed = JSON.parse(localStorage.getItem("masterchef_signups") || "[]");
                    if (signed.includes("quickfire")) { toast({ description: "You are already signed up" }); return; }
                    signed.push("quickfire");
                    localStorage.setItem("masterchef_signups", JSON.stringify(signed));
                    toast({ description: "Signed up for Quick Fire Challenge!" });
                  }}>
                    Sign Up
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <h4 className="font-semibold">Dessert Masters</h4>
                  <p className="text-sm text-muted-foreground">48h upload | Async</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Tomorrow 8:00 PM</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => toast({ description: "Dessert Masters: 48h asynchronous baking challenge — upload your creation in 48 hours. Prize: featured chef spotlight." })}>
                    Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedChef && (
          <SendGiftDialog
            open={giftDialogOpen}
            onOpenChange={setGiftDialogOpen}
            chefId={selectedChef.id}
            chefName={selectedChef.name}
          />
        )}
      </div>
    </div>
  );
}
