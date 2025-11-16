import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Infinity, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const KarmicDebtTracker = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const calculateKarma = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to calculate karma",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('calculate-karmic-debt');

      if (error) throw error;

      setInsights(data.insights);
      toast({
        title: "Karma Calculated!",
        description: `Your karmic balance is ${data.insights.status}`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Calculation Failed",
        description: "Failed to calculate karma. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateKarma();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Infinity className="h-5 w-5 text-primary" />
            Karmic Debt Calculator
          </CardTitle>
          <CardDescription>
            Track your karmic balance and spiritual lessons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!insights && (
            <Button 
              onClick={calculateKarma} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating Karma...
                </>
              ) : (
                <>
                  <Infinity className="mr-2 h-4 w-4" />
                  Calculate My Karma
                </>
              )}
            </Button>
          )}

          {insights && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Overall Karmic Balance</CardTitle>
                    <Badge 
                      variant={
                        insights.overall_balance >= 70 ? "default" : 
                        insights.overall_balance >= 50 ? "secondary" : 
                        "destructive"
                      }
                      className="flex items-center gap-1"
                    >
                      {insights.overall_balance >= 70 ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {insights.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Balance Score</span>
                      <span className="text-2xl font-bold text-primary">{insights.overall_balance}/100</span>
                    </div>
                    <Progress value={insights.overall_balance} className="h-3" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary">{insights.total_debts}</div>
                      <div className="text-xs text-muted-foreground mt-1">Total Karmic Debts</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-yellow-500">{insights.active_debts}</div>
                      <div className="text-xs text-muted-foreground mt-1">Active</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-green-500">{insights.resolved_debts}</div>
                      <div className="text-xs text-muted-foreground mt-1">Resolved</div>
                    </div>
                  </div>

                  {insights.recommendations && insights.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Karmic Recommendations
                      </h4>
                      <div className="space-y-2">
                        {insights.recommendations.map((rec: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.daily_actions && insights.daily_actions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Daily Karma Actions</h4>
                      <div className="space-y-2">
                        {insights.daily_actions.map((action: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <span className="text-sm flex-1">{action.action}</span>
                            <Badge variant="outline" className="ml-2">
                              +{action.karma_points} points
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={calculateKarma} 
                    variant="outline"
                    className="w-full"
                  >
                    Refresh Karma Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
