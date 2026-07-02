import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, CheckCircle, Calendar } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const RedemptionDashboard = () => {
  const { toast } = useToast();
  const [redemption, setRedemption] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
    loadRedemption();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("confession_purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_type", "redemption_path")
        .eq("status", "active")
        .single();

      setHasAccess(!!data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const loadRedemption = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("redemption_progress")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) setRedemption(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("generate-redemption-plan");
      
      if (error) throw error;

      setRedemption(data.redemption);
      toast({ title: "Redemption Plan Created!" });
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return (
      <>
        <FloatingHowItWorks
          title='Redemption Dashboard'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Redemption Dashboard panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-foreground">Redemption Path - Locked</CardTitle>
          <CardDescription className="text-muted-foreground">
            Purchase Redemption Path service to unlock personalized spiritual coaching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Go to <strong>Services</strong> section to purchase (€49 one-time)
          </p>
        </CardContent>
      </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {!redemption ? (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Begin Your Redemption Journey</CardTitle>
            <CardDescription className="text-muted-foreground">
              Generate your personalized redemption plan with AI guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGeneratePlan} disabled={loading} size="lg" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Trophy className="mr-2 h-5 w-5" />
                  Generate Redemption Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-foreground">Your Progress</CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <Progress value={redemption.progress_percentage} className="flex-1" />
                <span className="text-2xl font-bold text-foreground">
                  {redemption.progress_percentage}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{redemption.milestones_completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{redemption.total_milestones}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {redemption.certificate_earned ? "✓" : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Certificate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {redemption.redemption_plan && Object.keys(redemption.redemption_plan).map((phaseKey, idx) => {
            const phase = redemption.redemption_plan[phaseKey];
            return (
              <Card key={idx} className="border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-foreground">{phase.title}</CardTitle>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.tasks?.map((task: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-foreground">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};