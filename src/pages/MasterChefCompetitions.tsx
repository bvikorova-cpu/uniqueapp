import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Users, ChefHat, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMasterChefSubscription } from "@/hooks/useMasterChefSubscription";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function MasterChefCompetitions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, loading: subscriptionLoading } = useMasterChefSubscription();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!subscriptionLoading && !subscribed) {
      toast({
        title: "Subscription Required",
        description: "You need an active KitchenStars subscription to view competitions",
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
      return;
    }
    setLoading(false);
  };

  const competitions = [
    {
      id: 1,
      title: "Master of Desserts",
      category: "Desserts",
      startDate: "2024-12-01",
      endDate: "2024-12-15",
      participants: 24,
      prize: "€500",
      status: "active",
      difficulty: "Advanced",
    },
    {
      id: 2,
      title: "Quick Fire Challenge",
      category: "Speed Cooking",
      startDate: "2024-12-05",
      endDate: "2024-12-10",
      participants: 48,
      prize: "€300",
      status: "active",
      difficulty: "Intermediate",
    },
    {
      id: 3,
      title: "Regional Cuisine Championship",
      category: "Fine Dining",
      startDate: "2024-12-10",
      endDate: "2024-12-30",
      participants: 16,
      prize: "€1000",
      status: "upcoming",
      difficulty: "Professional",
    },
  ];

  if (loading || subscriptionLoading) {
    return (
      <>
        <FloatingHowItWorks title="How Master Chef Competitions works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
        <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading competitions...</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              KitchenStars Competitions
            </h1>
            <p className="text-muted-foreground">
              Join exciting cooking battles and showcase your skills
            </p>
          </div>
          <Button onClick={() => navigate("/masterchef/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6 mb-8">
          {competitions.map((competition) => (
            <Card key={competition.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{competition.title}</CardTitle>
                      <Badge
                        variant={competition.status === "active" ? "default" : "secondary"}
                      >
                        {competition.status === "active" ? "Active Now" : "Scheduled"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ChefHat className="h-4 w-4" />
                        {competition.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {competition.participants} chefs
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Prize: {competition.prize}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {competition.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(competition.startDate).toLocaleDateString()} -{" "}
                      {new Date(competition.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant={competition.status === "active" ? "default" : "outline"}
                    disabled={competition.status !== "active"}
                  >
                    {competition.status === "active" ? "Join Competition" : "Opens Soon"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-orange-500" />
              How Competitions Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-500">1</div>
                <h3 className="font-semibold">Join & Submit</h3>
                <p className="text-sm text-muted-foreground">
                  Register for a competition and submit your dish within the time limit
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-500">2</div>
                <h3 className="font-semibold">Community Voting</h3>
                <p className="text-sm text-muted-foreground">
                  Other chefs and viewers vote for their favorite dishes
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-500">3</div>
                <h3 className="font-semibold">Win Prizes</h3>
                <p className="text-sm text-muted-foreground">
                  Top chefs receive cash prizes and exclusive badges
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
