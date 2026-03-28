import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TipsterProfile {
  id: string;
  display_name: string;
  win_rate: number;
  total_predictions: number;
  correct_predictions: number;
  followers_count: number;
  total_earnings: number;
  pending_payout: number;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  sport: string;
  match_date: string;
  league: string;
}

export default function TipsterDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TipsterProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // New prediction form state
  const [selectedMatch, setSelectedMatch] = useState("");
  const [predictionType, setPredictionType] = useState("");
  const [confidence, setConfidence] = useState("70");
  const [odds, setOdds] = useState("2.00");
  const [price, setPrice] = useState("9.99");
  const [analysis, setAnalysis] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      checkTipsterStatus();
    }
  }, [user]);

  const checkTipsterStatus = async () => {
    try {
      const { data: tipster, error } = await supabase
        .from('sports_tipsters')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error || !tipster) {
        toast({
          title: "Access Denied",
          description: "You need to be an approved tipster to access this page",
          variant: "destructive",
        });
        navigate('/sports-predictor');
        return;
      }

      setProfile(tipster);
      await fetchMatches();
      await fetchPredictions(tipster.id);
    } catch (error) {
      console.error('Error checking tipster status:', error);
      navigate('/sports-predictor');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('sports_matches')
        .select('*')
        .gte('match_date', new Date().toISOString())
        .order('match_date', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPredictions = async (tipsterId: string) => {
    try {
      const { data, error } = await supabase
        .from('sports_predictions')
        .select('*, sports_matches(home_team, away_team, sport, match_date, league)')
        .eq('tipster_id', tipsterId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const handleSubmitPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMatch) {
      toast({
        title: "Error",
        description: "Please select a match",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('sports_predictions').insert({
        tipster_id: profile?.id,
        match_id: selectedMatch,
        prediction_type: predictionType,
        confidence: parseInt(confidence),
        odds: parseFloat(odds),
        price: parseFloat(price),
        is_premium: true,
        analysis_text: analysis,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prediction added successfully",
      });

      // Reset form
      setSelectedMatch("");
      setPredictionType("");
      setConfidence("70");
      setOdds("2.00");
      setPrice("9.99");
      setAnalysis("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add prediction",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Tipster Dashboard</h1>
        <p className="text-muted-foreground">Manage your predictions and track your performance</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.win_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {profile?.correct_predictions}/{profile?.total_predictions} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.followers_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{profile?.total_earnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{profile?.pending_payout.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available to withdraw</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="add" className="space-y-4">
        <TabsList>
          <TabsTrigger value="add">Add Prediction</TabsTrigger>
          <TabsTrigger value="active">Active Predictions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Prediction</CardTitle>
              <CardDescription>Create a premium tip for your followers</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPrediction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="match">Select Match</Label>
                  <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a match" />
                    </SelectTrigger>
                    <SelectContent>
                      {matches.map((match) => (
                        <SelectItem key={match.id} value={match.id}>
                          {match.home_team} vs {match.away_team} - {match.league} -{' '}
                          {format(new Date(match.match_date), 'MMM dd, yyyy')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prediction">Prediction Type</Label>
                  <Input
                    id="prediction"
                    value={predictionType}
                    onChange={(e) => setPredictionType(e.target.value)}
                    placeholder="e.g., Home Win, Over 2.5 Goals"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confidence">Confidence (%)</Label>
                    <Input
                      id="confidence"
                      type="number"
                      min="1"
                      max="100"
                      value={confidence}
                      onChange={(e) => setConfidence(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="odds">Odds</Label>
                    <Input
                      id="odds"
                      type="number"
                      step="0.01"
                      min="1"
                      value={odds}
                      onChange={(e) => setOdds(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analysis">Expert Analysis</Label>
                  <Textarea
                    id="analysis"
                    value={analysis}
                    onChange={(e) => setAnalysis(e.target.value)}
                    placeholder="Provide detailed analysis for your prediction..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Publish Prediction
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Predictions</CardTitle>
              <CardDescription>Your pending predictions awaiting results</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Prediction History</CardTitle>
              <CardDescription>View all your past predictions and results</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
