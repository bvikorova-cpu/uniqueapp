import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";

const SPORTS = ["Football", "Basketball", "Tennis", "Hockey", "Volleyball", "Baseball"];
const LEAGUES = {
  Football: ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Champions League"],
  Basketball: ["NBA", "EuroLeague", "Spanish ACB", "Turkish BSL"],
  Tennis: ["ATP", "WTA", "Grand Slam"],
  Hockey: ["NHL", "KHL", "Champions League"],
  Volleyball: ["CEV Champions League", "World Championship"],
  Baseball: ["MLB", "NPB"],
};

export default function SportsAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  
  const [formData, setFormData] = useState({
    sport: "",
    league: "",
    home_team: "",
    away_team: "",
    match_date: format(new Date(), "yyyy-MM-dd"),
    match_time: "20:00",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      const { data, error } = await supabase
        .from("sports_matches")
        .select("*")
        .gte("match_date", new Date().toISOString())
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
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

    if (!formData.sport || !formData.league || !formData.home_team || !formData.away_team) {
      toast({
        title: "Chýbajúce údaje",
        description: "Vyplňte všetky povinné polia",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("sports_matches").insert([formData]);

      if (error) throw error;

      toast({
        title: "Úspech! ⚽",
        description: "Zápas bol úspešne pridaný",
      });

      // Reset form
      setFormData({
        sport: "",
        league: "",
        home_team: "",
        away_team: "",
        match_date: format(new Date(), "yyyy-MM-dd"),
        match_time: "20:00",
      });

      // Refresh matches list
      await fetchMatches();
    } catch (error: any) {
      console.error("Error adding match:", error);
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa pridať zápas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (matchId: string) => {
    if (!confirm("Naozaj chcete vymazať tento zápas?")) return;

    try {
      const { error } = await supabase.from("sports_matches").delete().eq("id", matchId);

      if (error) throw error;

      toast({
        title: "Vymazané",
        description: "Zápas bol úspešne vymazaný",
      });

      await fetchMatches();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa vymazať zápas",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/sports-predictor")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na predikcie
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add Match Form */}
          <Card>
            <CardHeader>
              <CardTitle>Pridať nový zápas</CardTitle>
              <CardDescription>Vyplňte údaje o nadchádzajúcom zápase</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sport">Šport *</Label>
                  <Select
                    value={formData.sport}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sport: value, league: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte šport" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="league">Liga *</Label>
                  <Select
                    value={formData.league}
                    onValueChange={(value) => setFormData({ ...formData, league: value })}
                    disabled={!formData.sport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte ligu" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.sport &&
                        LEAGUES[formData.sport as keyof typeof LEAGUES]?.map((league) => (
                          <SelectItem key={league} value={league}>
                            {league}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="home_team">Domáci tým *</Label>
                  <Input
                    id="home_team"
                    value={formData.home_team}
                    onChange={(e) =>
                      setFormData({ ...formData, home_team: e.target.value })
                    }
                    placeholder="Napr. Real Madrid"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="away_team">Hosťujúci tým *</Label>
                  <Input
                    id="away_team"
                    value={formData.away_team}
                    onChange={(e) =>
                      setFormData({ ...formData, away_team: e.target.value })
                    }
                    placeholder="Napr. Barcelona"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="match_date">Dátum *</Label>
                    <Input
                      id="match_date"
                      type="date"
                      value={formData.match_date}
                      onChange={(e) =>
                        setFormData({ ...formData, match_date: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="match_time">Čas *</Label>
                    <Input
                      id="match_time"
                      type="time"
                      value={formData.match_time}
                      onChange={(e) =>
                        setFormData({ ...formData, match_time: e.target.value })
                      }
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

          {/* Matches List */}
          <Card>
            <CardHeader>
              <CardTitle>Nadchádzajúce zápasy</CardTitle>
              <CardDescription>
                Zoznam všetkých pridaných zápasov ({matches.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMatches ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : matches.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Zatiaľ žiadne zápasy
                </p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-primary">
                            {match.sport}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {match.league}
                          </span>
                        </div>
                        <div className="font-semibold text-sm">
                          {match.home_team} vs {match.away_team}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(match.match_date), "dd.MM.yyyy")} •{" "}
                          {match.match_time}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(match.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
