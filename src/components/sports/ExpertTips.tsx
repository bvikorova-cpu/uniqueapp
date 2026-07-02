import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Trophy, Users, TrendingUp, Star, Lock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { usePurchaseVerification } from "@/hooks/usePurchaseVerification";
import { getUserFriendlyErrorMessage } from "@/utils/errorHandler";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Tipster {
  id: string;
  display_name: string;
  avatar_url: string | null;
  sport_specialization: string;
  win_rate: number;
  total_predictions: number;
  followers_count: number;
  total_earnings: number;
}

interface Prediction {
  id: string;
  match_id: string;
  tipster_id: string;
  prediction_type: string;
  confidence: number;
  odds: number;
  price: number;
  is_premium: boolean;
  analysis_text: string | null;
  sports_tipsters: Tipster;
  sports_matches: {
    home_team: string;
    away_team: string;
    sport: string;
    match_date: string;
  };
}

export function ExpertTips() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [purchasedTips, setPurchasedTips] = useState<Set<string>>(new Set());
  const [purchasing, setPurchasing] = useState<string | null>(null);
  
  // Handle payment verification
  usePurchaseVerification();

  useEffect(() => {
    fetchPredictions();
    if (user) {
      fetchPurchasedTips();
    }
  }, [user]);

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('sports_predictions')
        .select(`
          *,
          sports_tipsters(*),
          sports_matches(home_team, away_team, sport, match_date)
        `)
        .eq('is_premium', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPredictions((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching predictions:', error);
      toast({
        title: "Error",
        description: getUserFriendlyErrorMessage(error, "Failed to load expert tips"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedTips = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('sports_purchased_tips')
        .select('prediction_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setPurchasedTips(new Set(data?.map(p => p.prediction_id) || []));
    } catch (error) {
      console.error('Error fetching purchased tips:', error);
    }
  };

  const handlePurchaseTip = async (predictionId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setPurchasing(predictionId);
      const { data, error } = await supabase.functions.invoke('purchase-tip', {
        body: { predictionId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: getUserFriendlyErrorMessage(error, "Failed to purchase tip"),
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const isPurchased = (predictionId: string) => purchasedTips.has(predictionId);

  if (loading) {
    return (
<div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No expert tips available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {predictions.map((prediction) => {
        const purchased = isPurchased(prediction.id);
        const tipster = prediction.sports_tipsters;
        const match = prediction.sports_matches;

        // Skip predictions with missing data
        if (!tipster || !match) {
          return null;
        }

        return (
          <Card key={prediction.id} className="hover:shadow-lg transition-all">
            <FloatingHowItWorks title="ExpertTips — How it works" steps={[{title:"Open this section",desc:"Access ExpertTips from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={tipster.avatar_url || undefined} />
                    <AvatarFallback>{tipster.display_name?.[0] || 'T'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{tipster.display_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="secondary">{tipster.sport_specialization}</Badge>
                      <span className="text-green-500 font-semibold">{tipster.win_rate}% Win Rate</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  {purchased ? (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Purchased
                    </Badge>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold text-primary">€{prediction.price}</div>
                      <div className="text-xs text-muted-foreground">per tip</div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Match Info */}
                <div className="p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>{match.sport}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(match.match_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="text-lg font-semibold">
                    {match.home_team} vs {match.away_team}
                  </div>
                </div>

                {/* Prediction Info */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Prediction</div>
                    <div className="font-semibold">{prediction.prediction_type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                    <div className="font-semibold text-primary">{prediction.confidence}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Odds</div>
                    <div className="font-semibold">{prediction.odds}</div>
                  </div>
                </div>

                {/* Analysis - Only show if purchased */}
                {purchased && prediction.analysis_text ? (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Expert Analysis</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{prediction.analysis_text}</p>
                  </div>
                ) : !purchased && (
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Purchase this tip to unlock expert analysis and detailed insights
                    </p>
                  </div>
                )}

                {/* Purchase Button */}
                {!purchased && (
                  <Button
                    onClick={() => handlePurchaseTip(prediction.id)}
                    disabled={purchasing === prediction.id}
                    className="w-full"
                    size="lg"
                  >
                    {purchasing === prediction.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Trophy className="mr-2 h-4 w-4" />
                        Purchase Tip for €{prediction.price}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
