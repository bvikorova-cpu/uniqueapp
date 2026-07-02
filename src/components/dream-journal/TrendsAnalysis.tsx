import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const TrendsAnalysis = () => {
  const { toast } = useToast();
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<any>(null);

  const analyzeTrends = async () => {
    setLoading(true);
    try {
      await spendCredit("effect");

      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("mood-trends", {
        body: { days: 30 },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.error) {
        // Handle specific error cases
        const errorMessage = response.error.message || response.error;
        if (errorMessage.includes("402") || errorMessage.includes("Insufficient") || errorMessage.includes("credits")) {
          toast({ 
            title: "Insufficient Credits", 
            description: "You need to add OpenAI credits to your workspace. Go to Settings → Workspace → Usage.",
            variant: "destructive" 
          });
        } else if (errorMessage.includes("429") || errorMessage.includes("Rate limit")) {
          toast({ 
            title: "Rate Limit Exceeded", 
            description: "Too many requests. Please try again in a few minutes.",
            variant: "destructive" 
          });
        } else {
          toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
        return;
      }
      
      setTrends(response.data);
      toast({ title: "Success", description: "Trends analyzed successfully!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "concerning": return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Trends Analysis'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Trends Analysis panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mental Health Trends</CardTitle>
          <CardDescription>
            Analyze your mood patterns over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Credits: {credits?.credits_remaining || 0}</p>
            <Button onClick={analyzeTrends} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              Analyze Trends
            </Button>
          </div>
        </CardContent>
      </Card>

      {trends && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {getTrendIcon(trends.trend)}
                <CardTitle>Overall Trend: {trends.trend}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{trends.summary}</p>
            </CardContent>
          </Card>

          {trends.patterns && trends.patterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Patterns Detected</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {trends.patterns.map((pattern: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{pattern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {trends.recommendations && trends.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {trends.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {trends.warnings && trends.warnings.length > 0 && (
            <Card className="border-red-500/50">
              <CardHeader>
                <CardTitle className="text-red-500">Important Notices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {trends.warnings.map((warning: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500">⚠</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
    </>
  );
};

export default TrendsAnalysis;