import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, Clock, MapPin, User, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const PastLifeRegressionSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [regression, setRegression] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingAccess(false);
        return;
      }

      const { data } = await supabase
        .from("reincarnation_purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_type", "past_life_regression")
        .eq("status", "active")
        .single();

      setHasAccess(!!data);
    } catch (error) {
      console.error("Error checking access:", error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleRegression = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-past-life-regression');

      if (error) throw error;

      setRegression(data.regression);
      toast({
        title: "Past Life Discovered!",
        description: `Uncovered a life from ${data.regression.life_era}`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Regression Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <>
        <FloatingHowItWorks
          title='Past Life Regression Section'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Regression Section panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="border-primary/20">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">Checking access...</p>
        </CardContent>
      </Card>
      </>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Past Life Regression - Locked
          </CardTitle>
          <CardDescription>
            Purchase this service to unlock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-destructive/50">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Go to <strong>Services tab</strong> to purchase (€79 one-time)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          Past Life Regression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleRegression} disabled={loading} className="w-full" size="lg">
          {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Accessing...</> : <><Eye className="mr-2 h-5 w-5" />Begin Session</>}
        </Button>

        {regression && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>{regression.life_name}</CardTitle>
              <CardDescription className="flex gap-4">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{regression.life_era}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{regression.life_location}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Life Story</h4>
                <p className="text-muted-foreground text-sm">{regression.life_story}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Events</h4>
                {regression.key_events?.map((event: any, i: number) => (
                  <div key={i} className="flex gap-2 p-2 bg-muted/50 rounded mb-2">
                    <Badge variant="outline">Age {event.age}</Badge>
                    <div><p className="text-sm font-medium">{event.event}</p><p className="text-xs text-muted-foreground">{event.significance}</p></div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Relationships</h4>
                {regression.relationships?.map((rel: any, i: number) => (
                  <div key={i} className="p-3 rounded bg-primary/5 border border-primary/20 mb-2">
                    <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><span className="font-medium">{rel.person}</span><Badge variant="secondary" className="ml-auto">{rel.connection}</Badge></div>
                    <p className="text-sm text-muted-foreground">Lesson: {rel.lesson}</p>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between mb-2"><span>Verification</span><Badge>{regression.verification_score}%</Badge></div>
                <Progress value={regression.verification_score} />
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
