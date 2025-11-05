import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, ArrowLeft, Loader2, Trash2, Calendar, TrendingUp } from "lucide-react";
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

interface Prediction {
  id: string;
  prediction_type: string;
  confidence: number;
  odds: number;
  analysis: string;
}

export default function AdminSportsMatches() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showPredictionDialog, setShowPredictionDialog] = useState(false);
  const [savingPrediction, setSavingPrediction] = useState(false);
  
  const [formData, setFormData] = useState({
    sport: "",
    league: "",
    homeTeam: "",
    awayTeam: "",
    matchDate: "",
    matchTime: "",
  });

  const [predictionData, setPredictionData] = useState({
    predictionType: "",
    confidence: "",
    odds: "",
    analysis: "",
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

  const handleAddPrediction = (match: Match) => {
    setSelectedMatch(match);
    setPredictionData({
      predictionType: "",
      confidence: "",
      odds: "",
      analysis: "",
    });
    setShowPredictionDialog(true);
  };

  const handleSavePrediction = async () => {
    if (!selectedMatch || !user) return;

    if (!predictionData.predictionType || !predictionData.confidence) {
      toast({
        title: "Chyba",
        description: "Vyplňte všetky povinné polia",
        variant: "destructive",
      });
      return;
    }

    setSavingPrediction(true);
    try {
      const { error } = await supabase
        .from('sports_predictions')
        .insert({
          match_id: selectedMatch.id,
          tipster_id: user.id,
          prediction_type: predictionData.predictionType,
          confidence: parseInt(predictionData.confidence),
          odds: predictionData.odds ? parseFloat(predictionData.odds) : null,
          analysis: predictionData.analysis || null,
        });

      if (error) throw error;

      toast({
        title: "Úspech",
        description: "Predikcia bola úspešne pridaná",
      });

      setShowPredictionDialog(false);
    } catch (error) {
      console.error('Error adding prediction:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať predikciu",
        variant: "destructive",
      });
    } finally {
      setSavingPrediction(false);
    }
  };

  const getPredictionOptions = (sport: string) => {
    switch (sport) {
      case "Football":
        return ["Výhra domáci", "Výhra hostia", "Remíza", "Obe dajú gól", "Viac ako 2.5 gólov", "Menej ako 2.5 gólov"];
      case "Basketball":
        return ["Výhra domáci", "Výhra hostia", "Viac ako 200 bodov", "Menej ako 200 bodov", "Domáci -5.5", "Hostia +5.5"];
      case "Tennis":
        return ["Výhra domáci 2-0", "Výhra domáci 2-1", "Výhra hostia 2-0", "Výhra hostia 2-1"];
      case "Hockey":
        return ["Výhra domáci", "Výhra hostia", "Viac ako 5.5 gólov", "Menej ako 5.5 gólov"];
      default:
        return ["Výhra domáci", "Výhra hostia", "Remíza"];
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
                    <div className="flex items-center gap-2">
                      <Dialog open={showPredictionDialog && selectedMatch?.id === match.id} onOpenChange={(open) => {
                        setShowPredictionDialog(open);
                        if (!open) setSelectedMatch(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAddPrediction(match)}
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Pridať predikciu
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Pridať predikciu</DialogTitle>
                            <DialogDescription>
                              {match.home_team} vs {match.away_team}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="predictionType">Typ predikcie *</Label>
                              <Select
                                value={predictionData.predictionType}
                                onValueChange={(value) => setPredictionData({ ...predictionData, predictionType: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Vyberte typ predikcie" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getPredictionOptions(match.sport).map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="confidence">Istota (%) *</Label>
                                <Input
                                  id="confidence"
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="napr. 75"
                                  value={predictionData.confidence}
                                  onChange={(e) => setPredictionData({ ...predictionData, confidence: e.target.value })}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="odds">Kurz</Label>
                                <Input
                                  id="odds"
                                  type="number"
                                  step="0.01"
                                  min="1"
                                  placeholder="napr. 2.50"
                                  value={predictionData.odds}
                                  onChange={(e) => setPredictionData({ ...predictionData, odds: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="analysis">Analýza</Label>
                              <Textarea
                                id="analysis"
                                placeholder="Napíšte krátku analýzu k predikcii..."
                                value={predictionData.analysis}
                                onChange={(e) => setPredictionData({ ...predictionData, analysis: e.target.value })}
                                rows={4}
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setShowPredictionDialog(false)}
                              >
                                Zrušiť
                              </Button>
                              <Button
                                onClick={handleSavePrediction}
                                disabled={savingPrediction}
                              >
                                {savingPrediction ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Ukladám...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Uložiť predikciu
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
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
