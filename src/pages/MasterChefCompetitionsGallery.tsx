import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Trophy, Users, ChefHat, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface CompetitionEntry {
  id: string;
  user_id: string;
  dish_name: string;
  dish_description: string;
  dish_image_url: string;
  votes_count: number;
  recipe: string | null;
  ingredients: string[] | null;
  cooking_time: number | null;
  difficulty_level: string | null;
  hasVoted: boolean;
  chef_name?: string;
}

interface Competition {
  id: string;
  title: string;
  category: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_amount: number | null;
  description: string | null;
  entries: CompetitionEntry[];
  totalVotes: number;
  participantsCount: number;
}

export default function MasterChefCompetitionsGallery() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("active");
  const [votingLoading, setVotingLoading] = useState<string | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const { data: competitionsData, error: competitionsError } = await supabase
        .from('masterchef_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (competitionsError) throw competitionsError;

      const competitionsWithEntries = await Promise.all(
        (competitionsData || []).map(async (comp) => {
          const { data: entriesData, error: entriesError } = await supabase
            .from('masterchef_competition_entries')
            .select('*')
            .eq('competition_id', comp.id);

          if (entriesError) throw entriesError;

          let userVotes: string[] = [];
          if (userId) {
            const { data: votesData } = await supabase
              .from('masterchef_votes')
              .select('entry_id')
              .eq('user_id', userId)
              .in('entry_id', (entriesData || []).map(e => e.id));

            userVotes = (votesData || []).map(v => v.entry_id);
          }

          const userIds = [...new Set((entriesData || []).map(e => e.user_id))];
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

          const profilesMap = new Map(
            (profilesData || []).map(p => [p.id, p.full_name || 'Chef'])
          );

          const entries: CompetitionEntry[] = (entriesData || []).map(entry => ({
            ...entry,
            hasVoted: userVotes.includes(entry.id),
            chef_name: profilesMap.get(entry.user_id) || 'Chef'
          }));

          const totalVotes = entries.reduce((sum, e) => sum + (e.votes_count || 0), 0);

          return {
            ...comp,
            entries,
            totalVotes,
            participantsCount: entries.length
          };
        })
      );

      setCompetitions(competitionsWithEntries);
    } catch (error) {
      console.error("Error loading competitions:", error);
      toast({
        title: "Error",
        description: "Failed to load competitions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (entryId: string) => {
    try {
      setVotingLoading(entryId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login Required",
          description: "You must be logged in to vote",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data: existingVote } = await supabase
        .from('masterchef_votes')
        .select('id')
        .eq('entry_id', entryId)
        .eq('user_id', session.user.id)
        .single();

      if (existingVote) {
        const { error } = await supabase
          .from('masterchef_votes')
          .delete()
          .eq('id', existingVote.id);

        if (error) throw error;

        toast({
          title: "Vote Removed",
          description: "Your vote has been successfully removed",
        });
      } else {
        const { error } = await supabase
          .from('masterchef_votes')
          .insert({
            entry_id: entryId,
            user_id: session.user.id
          });

        if (error) throw error;

        toast({
          title: "Vote Cast!",
          description: "Thank you for voting!",
        });
      }

      await loadCompetitions();

    } catch (error) {
      console.error("Voting error:", error);
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVotingLoading(null);
    }
  };

  const handleEntryClick = (entry: CompetitionEntry) => {
    if (entry.recipe) {
      toast({
        title: entry.dish_name,
        description: entry.recipe.substring(0, 100) + "...",
      });
    }
  };

  const filteredCompetitions = {
    active: competitions.filter(c => c.status === "active"),
    upcoming: competitions.filter(c => c.status === "upcoming"),
    completed: competitions.filter(c => c.status === "completed")
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Master Chef Competitions Gallery works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
        <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading competitions...</p>
        </div>
      </div>
      </>
      );
  }

  const CompetitionCard = ({ competition }: { competition: Competition }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-2xl">{competition.title}</CardTitle>
              <Badge variant={competition.status === 'active' ? 'default' : 'secondary'}>
                {competition.status === 'active' ? 'Active' : competition.status === 'upcoming' ? 'Upcoming' : 'Completed'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{competition.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Ends {new Date(competition.end_date).toLocaleDateString('en-US')}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {competition.participantsCount} participants
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {competition.totalVotes} votes
            </span>
          </div>
          {competition.prize_amount && (
            <div className="flex items-center gap-1 text-orange-600 font-semibold">
              <Trophy className="w-4 h-4" />
              €{competition.prize_amount}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {competition.entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No entries yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competition.entries.map((entry) => (
              <Card 
                key={entry.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleEntryClick(entry)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={entry.dish_image_url} 
                    alt={entry.dish_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {entry.votes_count}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-1">{entry.dish_name}</h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {entry.dish_description}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    by {entry.chef_name}
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    variant={entry.hasVoted ? "secondary" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(entry.id);
                    }}
                    disabled={competition.status !== 'active' || votingLoading === entry.id}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${entry.hasVoted ? 'fill-current' : ''}`} />
                    {entry.hasVoted ? 'Remove Vote' : 'Vote'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-red-500/5 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                KitchenStars Competitions
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
                Support your favorite chefs by voting for their dishes
              </p>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            {filteredCompetitions.active.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">No active competitions at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredCompetitions.active.map((competition) => (
                  <CompetitionCard key={competition.id} competition={competition} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            {filteredCompetitions.upcoming.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">No upcoming competitions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredCompetitions.upcoming.map((competition) => (
                  <CompetitionCard key={competition.id} competition={competition} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {filteredCompetitions.completed.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">No completed competitions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredCompetitions.completed.map((competition) => (
                  <CompetitionCard key={competition.id} competition={competition} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12">
          <Button
            onClick={() => navigate("/masterchef")}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
