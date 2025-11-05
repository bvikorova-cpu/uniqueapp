import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, ArrowLeft, Loader2, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Match {
  id: string;
  sport: string;
  league: string;
  home_team: string;
  away_team: string;
  match_date: string;
  match_time: string;
  status: string;
}

export default function AdminSportsMatches() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    sport: "",
    league: "",
    homeTeam: "",
    awayTeam: "",
    matchDate: "",
    matchTime: "",
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('sports_matches')
        .select('*')
        .order('match_date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať zápasy",
        variant: "destructive",
      });
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Chyba",
        description: "Musíte byť prihlásený",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formData.sport || !formData.league || !formData.homeTeam || 
        !formData.awayTeam || !formData.matchDate || !formData.matchTime) {
      toast({
        title: "Chyba",
        description: "Vyplňte všetky povinné polia",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const matchDateTime = `${formData.matchDate} ${formData.matchTime}:00+00`;
      
      const { error } = await supabase
        .from('sports_matches')
        .insert({
          sport: formData.sport,
          league: formData.league,
          home_team: formData.homeTeam,
          away_team: formData.awayTeam,
          match_date: matchDateTime,
          match_time: formData.matchTime,
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: "Úspech",
        description: "Zápas bol úspešne pridaný",
      });

      // Reset form
      setFormData({
        sport: "",
        league: "",
        homeTeam: "",
        awayTeam: "",
        matchDate: "",
        matchTime: "",
      });

      // Refresh matches list
      fetchMatches();
    } catch (error) {
      console.error('Error adding match:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať zápas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (matchId: string) => {
    if (!confirm("Naozaj chcete zmazať tento zápas?")) {
      return;
    }

    setDeletingId(matchId);
    try {
      const { error } = await supabase
        .from('sports_matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      toast({
        title: "Úspech",
        description: "Zápas bol úspešne zmazaný",
      });

      // Refresh matches list
      fetchMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa zmazať zápas",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate("/sports-predictor")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na predikcie
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-6 w-6" />
              Pridať nový zápas
            </CardTitle>
            <CardDescription>
              Vyplňte informácie o zápase. Miesto konania nie je povinné.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sport">Šport *</Label>
                <Select
                  value={formData.sport}
                  onValueChange={(value) => setFormData({ ...formData, sport: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte šport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Football">Futbal</SelectItem>
                    <SelectItem value="Basketball">Basketbal</SelectItem>
                    <SelectItem value="Tennis">Tenis</SelectItem>
                    <SelectItem value="Hockey">Hokej</SelectItem>
                    <SelectItem value="Volleyball">Volejbal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="league">Liga *</Label>
                <Input
                  id="league"
                  placeholder="napr. Premier League, NBA, ATP"
                  value={formData.league}
                  onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeTeam">Domáci tím *</Label>
                  <Input
                    id="homeTeam"
                    placeholder="napr. Manchester City"
                    value={formData.homeTeam}
                    onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awayTeam">Hosťujúci tím *</Label>
                  <Input
                    id="awayTeam"
                    placeholder="napr. Arsenal"
                    value={formData.awayTeam}
                    onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matchDate">Dátum *</Label>
                  <Input
                    id="matchDate"
                    type="date"
                    value={formData.matchDate}
                    onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matchTime">Čas *</Label>
                  <Input
                    id="matchTime"
                    type="time"
                    value={formData.matchTime}
                    onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pridávam...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Pridať zápas
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List of existing matches */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Pridané zápasy
            </CardTitle>
            <CardDescription>
              Zoznam všetkých pridaných zápasov
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMatches ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : matches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Zatiaľ neboli pridané žiadne zápasy
              </p>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{match.sport}</Badge>
                        <Badge variant="secondary">{match.league}</Badge>
                      </div>
                      <div className="font-semibold">
                        {match.home_team} vs {match.away_team}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {format(new Date(match.match_date), "dd.MM.yyyy")} • {match.match_time}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(match.id)}
                      disabled={deletingId === match.id}
                    >
                      {deletingId === match.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Zmazať
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
