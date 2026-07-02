import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Loader2, AlertCircle, Sparkles, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const BestSelfFinder = () => {
  const [bestVersions, setBestVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCheckingAccess(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_multiverse_access', {
        user_id_param: session.user.id,
        service_type_param: 'best_self_selection'
      });

      if (!error) {
        setHasAccess(data);
        if (data) {
          loadBestVersions();
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const loadBestVersions = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('get-user-universes');

      if (error) throw error;

      setBestVersions(data.bestVersions || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('find-best-self');

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: `Found your top ${data.bestVersions.length} best versions`,
      });

      setBestVersions(data.bestVersions);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (checkingAccess) {
    return (
      <>
        <FloatingHowItWorks
          title='Best Self Finder'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Best Self Finder panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
      </>
    );
  }

  const handlePurchase = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-multiverse-checkout', {
        body: { serviceType: 'best_self_selection' }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Opening Checkout",
          description: "Complete your purchase to unlock Best Self Selection",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to open checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!hasAccess) {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-background">
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto" />
          <h3 className="text-xl font-semibold text-foreground">Access Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Purchase "Best Self Selection" for €99/month to find your optimal versions.
          </p>
          <Button 
            onClick={handlePurchase}
            className="bg-gradient-to-r from-violet-500 to-purple-500"
          >
            <Crown className="mr-2 h-4 w-4" />
            Subscribe to Best Self Selection - €99/month
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-violet-400" />
            Best Self Selection
          </CardTitle>
          <CardDescription>
            AI-curated ranking of your most successful parallel versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing All Versions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find My Best Versions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      ) : bestVersions.length === 0 ? (
        <Card className="border-muted">
          <CardContent className="py-12 text-center text-muted-foreground">
            No analysis yet. Click "Find My Best Versions" to start!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bestVersions.map((version) => (
            <Card
              key={version.id}
              className="border-violet-500/20 bg-gradient-to-br from-violet-950/5 to-background"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                      #{version.ranking}
                    </Badge>
                    <CardTitle className="text-xl text-violet-400">
                      {version.universe?.universe_name}
                    </CardTitle>
                  </div>
                  <TrendingUp className="w-5 h-5 text-violet-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {version.universe?.universe_description}
                </p>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-violet-400">Success Metrics:</p>
                  {Object.entries(version.success_metrics || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize">{key}</span>
                        <span>{value}/100</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </div>

                {version.traits?.keyStrengths && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-violet-400">Key Strengths:</p>
                    <div className="flex flex-wrap gap-2">
                      {version.traits.keyStrengths.map((strength: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {version.achievements && version.achievements.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-violet-400">Achievements:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {version.achievements.map((achievement: string, i: number) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSelfFinder;
