import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Trophy, Users, ChefHat, ThumbsUp, Eye, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Dish {
  id: string;
  chefName: string;
  dishName: string;
  imageUrl: string;
  description: string;
  votes: number;
  hasVoted: boolean;
}

export default function MasterChefCompetitionsGallery() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("active");
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  // Mock data - replace with real data from Supabase
  const competitions = [
    {
      id: "1",
      title: "Master of Desserts",
      category: "Desserts",
      startDate: "2024-12-01",
      endDate: "2024-12-15",
      participants: 24,
      totalVotes: 456,
      status: "active",
      dishes: [
        {
          id: "d1",
          chefName: "Chef Maria",
          dishName: "Chocolate Lava Cake",
          imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
          description: "Rich chocolate cake with molten center",
          votes: 125,
          hasVoted: false,
        },
        {
          id: "d2",
          chefName: "Chef John",
          dishName: "Crème Brûlée",
          imageUrl: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400",
          description: "Classic French custard dessert",
          votes: 98,
          hasVoted: false,
        },
      ] as Dish[],
    },
    {
      id: "2",
      title: "Quick Fire Challenge",
      category: "Speed Cooking",
      startDate: "2024-12-05",
      endDate: "2024-12-10",
      participants: 48,
      totalVotes: 892,
      status: "active",
      dishes: [
        {
          id: "d3",
          chefName: "Chef Sarah",
          dishName: "15-Minute Pasta",
          imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
          description: "Fresh pasta with tomato basil sauce",
          votes: 234,
          hasVoted: false,
        },
      ] as Dish[],
    },
  ];

  const handleVote = async (competitionId: string, dishId: string) => {
    try {
      setVotingLoading(dishId);

      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please sign in to vote for your favorite dishes",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // TODO: Implement voting logic in Supabase
      // For now, just show success message
      toast({
        title: "Vote Submitted!",
        description: "Thank you for voting! Your vote has been counted.",
      });

      // Update local state (in real implementation, refetch from DB)
      // This is just for demo purposes
      
    } catch (error) {
      console.error("Voting error:", error);
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVotingLoading(null);
    }
  };

  const activeCompetitions = competitions.filter(c => c.status === "active");
  const upcomingCompetitions = competitions.filter(c => c.status === "upcoming");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                MasterChef Competitions
              </h1>
              <p className="text-muted-foreground text-lg">
                Vote for your favorite dishes and support talented chefs
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/masterchef-subscription")}
            >
              <ChefHat className="mr-2 h-4 w-4" />
              Become a Chef
            </Button>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">Free Voting!</h3>
              <p className="text-sm text-muted-foreground">
                Sign in to vote for your favorite dishes. All votes are free!
              </p>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="active">
              Active ({activeCompetitions.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Coming Soon ({upcomingCompetitions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-8">
            {activeCompetitions.map((competition) => (
              <Card key={competition.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{competition.title}</CardTitle>
                        <Badge className="bg-green-500">Live Now</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ChefHat className="h-4 w-4" />
                          {competition.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {competition.participants} chefs competing
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {competition.totalVotes} total votes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Ends {new Date(competition.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {competition.dishes.map((dish) => (
                      <Card key={dish.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48 overflow-hidden bg-muted">
                          <img
                            src={dish.imageUrl}
                            alt={dish.dishName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span className="text-sm font-semibold">{dish.votes}</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="mb-3">
                            <h3 className="font-bold text-lg mb-1">{dish.dishName}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <ChefHat className="h-3 w-3" />
                              {dish.chefName}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {dish.description}
                          </p>
                          <Button
                            className="w-full"
                            onClick={() => handleVote(competition.id, dish.id)}
                            disabled={votingLoading === dish.id || dish.hasVoted}
                            variant={dish.hasVoted ? "secondary" : "default"}
                          >
                            {votingLoading === dish.id ? (
                              "Voting..."
                            ) : dish.hasVoted ? (
                              <>
                                <Award className="mr-2 h-4 w-4" />
                                Voted
                              </>
                            ) : (
                              <>
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Vote for this dish
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                New exciting competitions are being prepared. Check back soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-12 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-orange-500" />
              Want to Compete?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Join as a chef and participate in exciting cooking competitions. Win prizes, gain recognition, and showcase your culinary skills!
            </p>
            <Button onClick={() => navigate("/masterchef-subscription")}>
              View Chef Subscription Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
