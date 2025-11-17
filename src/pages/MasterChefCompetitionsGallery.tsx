import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Trophy, Users, ChefHat, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
            (profilesData || []).map(p => [p.id, p.full_name || 'Šéfkuchár'])
          );

          const entries: CompetitionEntry[] = (entriesData || []).map(entry => ({
            ...entry,
            hasVoted: userVotes.includes(entry.id),
            chef_name: profilesMap.get(entry.user_id) || 'Šéfkuchár'
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
        title: "Chyba",
        description: "Nepodarilo sa načítať súťaže",
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
          title: "Vyžaduje sa prihlásenie",
          description: "Pre hlasovanie sa musíte prihlásiť",
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
          title: "Hlas odstránený",
          description: "Váš hlas bol úspešne odstránený",
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
          title: "Hlas odoslaný!",
          description: "Ďakujeme za hlasovanie!",
        });
      }

      await loadCompetitions();

    } catch (error) {
      console.error("Voting error:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odoslať hlas. Skúste to znova.",
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

  const activeCompetitions = competitions.filter(c => c.status === "active");
  const upcomingCompetitions = competitions.filter(c => c.status === "upcoming");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítavam súťaže...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-red-500/5 pt-32 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                MasterChef Súťaže
              </h1>
              <p className="text-muted-foreground text-lg">
                Hlasujte za vaše obľúbené jedlá a podporujte talentovaných kuchárov
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/masterchef-subscription")}
            >
              <ChefHat className="mr-2 h-4 w-4" />
              Staň sa šéfkuchárom
            </Button>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">Bezplatné hlasovanie!</h3>
              <p className="text-sm text-muted-foreground">
                Prihláste sa a hlasujte za vaše obľúbené jedlá. Všetky hlasy sú zadarmo!
              </p>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="active">
              Aktívne ({activeCompetitions.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Pripravované ({upcomingCompetitions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-8">
            {activeCompetitions.length === 0 ? (
              <Card className="p-12 text-center">
                <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Žiadne aktívne súťaže</h3>
                <p className="text-muted-foreground">
                  Momentálne nie sú žiadne aktívne súťaže. Skontrolujte neskôr!
                </p>
              </Card>
            ) : (
              activeCompetitions.map((competition) => (
                <Card key={competition.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-2xl">{competition.title}</CardTitle>
                          <Badge className="bg-green-500">Prebieha</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ChefHat className="h-4 w-4" />
                            {competition.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {competition.participantsCount} súťažiacich
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {competition.totalVotes} hlasov
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Končí {new Date(competition.end_date).toLocaleDateString('sk-SK')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {competition.entries.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Zatiaľ žiadne prihlášky do tejto súťaže
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {competition.entries.map((entry) => (
                          <Card 
                            key={entry.id} 
                            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => handleEntryClick(entry)}
                          >
                            <div className="relative h-48 overflow-hidden bg-muted">
                              <img
                                src={entry.dish_image_url}
                                alt={entry.dish_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                                <Heart className={`h-3 w-3 ${entry.hasVoted ? 'fill-red-500 text-red-500' : ''}`} />
                                <span className="text-sm font-semibold">{entry.votes_count}</span>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <div className="mb-3">
                                <h3 className="font-bold text-lg mb-1">{entry.dish_name}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <ChefHat className="h-3 w-3" />
                                  {entry.chef_name}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {entry.dish_description}
                              </p>
                              {entry.cooking_time && (
                                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {entry.cooking_time} minút
                                </p>
                              )}
                              <Button
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(entry.id);
                                }}
                                disabled={votingLoading === entry.id}
                                variant={entry.hasVoted ? "secondary" : "default"}
                              >
                                {votingLoading === entry.id ? (
                                  "Hlasujem..."
                                ) : entry.hasVoted ? (
                                  <>
                                    <Heart className="mr-2 h-4 w-4 fill-current" />
                                    Zrušiť hlas
                                  </>
                                ) : (
                                  <>
                                    <Heart className="mr-2 h-4 w-4" />
                                    Hlasovať
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingCompetitions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Pripravujeme nové súťaže</h3>
                <p className="text-muted-foreground">
                  Nové vzrušujúce súťaže sa pripravujú. Skontrolujte neskôr!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingCompetitions.map((competition) => (
                  <Card key={competition.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{competition.title}</CardTitle>
                            <Badge variant="outline">Čoskoro</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {competition.description || "Pripravuje sa vzrušujúca súťaž!"}
                          </p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ChefHat className="h-4 w-4" />
                              {competition.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Začína {new Date(competition.start_date).toLocaleDateString('sk-SK')}
                            </span>
                            {competition.prize_amount && (
                              <span className="flex items-center gap-1">
                                <Trophy className="h-4 w-4" />
                                Cena: €{competition.prize_amount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Card className="mt-12 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-orange-500" />
              Chcete súťažiť?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Pridajte sa ako šéfkuchár a zúčastnite sa vzrušujúcich kuchárskych súťaží. Vyhrajte ceny, získajte uznanie a predveďte svoje kulinárske schopnosti!
            </p>
            <Button onClick={() => navigate("/masterchef-subscription")}>
              Zobraziť predplatné pre šéfkuchárov
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
