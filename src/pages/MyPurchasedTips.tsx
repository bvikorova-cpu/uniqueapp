import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PurchasedTip {
  id: string;
  prediction_id: string;
  amount_paid: number;
  purchased_at: string;
  sports_predictions: {
    id: string;
    prediction_type: string;
    confidence: number;
    odds: number;
    analysis_text: string | null;
    result: string | null;
    tipster_id: string;
    sports_tipsters: {
      display_name: string;
      avatar_url: string | null;
    };
    sports_matches: {
      home_team: string;
      away_team: string;
      sport: string;
      match_date: string;
    };
  };
}

export default function MyPurchasedTips() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<PurchasedTip[]>([]);

  useEffect(() => {
    if (user) {
      fetchPurchasedTips();
    }
  }, [user]);

  const fetchPurchasedTips = async () => {
    try {
      const { data, error } = await supabase
        .from('sports_purchased_tips')
        .select(`
          *,
          sports_predictions!inner(
            *,
            sports_tipsters!inner(display_name, avatar_url),
            sports_matches!inner(home_team, away_team, sport, match_date)
          )
        `)
        .eq('user_id', user?.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setTips((data as any) || []);
    } catch (error) { console.error('Error fetching purchased tips:', error);
      toast({
        title: "Error",
        description: "Failed to load purchased tips",
        variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (result: string | null) => {
    if (!result) return <Clock className="h-5 w-5 text-muted-foreground" />;
    if (result === 'won') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getResultBadge = (result: string | null) => {
    if (!result) return <Badge variant="secondary">Pending</Badge>;
    if (result === 'won') return <Badge className="bg-green-500">Won</Badge>;
    return <Badge variant="destructive">Lost</Badge>;
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
        <h1 className="text-3xl font-black mb-2">My Purchased Tips</h1>
        <p className="text-muted-foreground">Track your purchased expert predictions</p>
      </div>

      {tips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">No purchased tips yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Browse expert tips on the Sports Predictor page
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tips.map((tip) => (
            <Card key={tip.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={tip.sports_predictions.sports_tipsters.avatar_url || undefined} />
                      <AvatarFallback>
                        {tip.sports_predictions.sports_tipsters.display_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {tip.sports_predictions.sports_tipsters.display_name}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(tip.purchased_at), 'MMM dd, yyyy')}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getResultIcon(tip.sports_predictions.result)}
                    {getResultBadge(tip.sports_predictions.result)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">
                      {tip.sports_predictions.sports_matches.home_team} vs{' '}
                      {tip.sports_predictions.sports_matches.away_team}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tip.sports_predictions.sports_matches.sport} •{' '}
                      {format(new Date(tip.sports_predictions.sports_matches.match_date), 'PPP')}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Prediction</p>
                      <p className="font-semibold">{tip.sports_predictions.prediction_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="font-semibold">{tip.sports_predictions.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Odds</p>
                      <p className="font-semibold">{tip.sports_predictions.odds.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="font-semibold">€{tip.amount_paid.toFixed(2)}</p>
                    </div>
                  </div>

                  {tip.sports_predictions.analysis_text && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Expert Analysis</p>
                      <p className="text-sm">{tip.sports_predictions.analysis_text}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
