import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HeartPulse, Loader2, Plus, TrendingUp, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const PhobiaCureDashboard = () => {
  const [phobias, setPhobias] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [selectedPhobia, setSelectedPhobia] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
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

      const { data, error } = await supabase.rpc('has_phobia_access', {
        user_id_param: session.user.id,
        service_type_param: 'phobia_cure'
      });

      if (!error) {
        setHasAccess(data);
        if (data) {
          loadData();
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('get-user-phobias');

      if (error) throw error;

      setPhobias(data.phobias || []);
      setTreatments(data.treatments || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleGenerateCure = async () => {
    if (!selectedPhobia) {
      toast({
        title: "Select a Phobia",
        description: "Please select a phobia to generate cure plan",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate cure plans",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-phobia-cure', {
        body: { phobiaId: selectedPhobia }
      });

      if (error) throw error;

      toast({
        title: "Cure Plan Generated",
        description: "Your personalized treatment plan is ready",
      });

      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (checkingAccess) {
    return (
    <>
      <FloatingHowItWorks title={"Phobia Cure Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Phobia Cure Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Phobia Cure Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    </>
  );
  }

  if (!hasAccess) {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-background">
        <CardContent className="py-12 text-center space-y-4">
          <HeartPulse className="w-16 h-16 text-yellow-400 mx-auto" />
          <h3 className="text-xl font-semibold text-foreground">Access Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You need to purchase "Phobia Cure Premium" to generate AI-powered treatment plans.
          </p>
          <Button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            View Pricing Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <HeartPulse className="w-6 h-6 text-cyan-400" />
            AI Phobia Cure Dashboard
          </CardTitle>
          <CardDescription>
            Generate and track personalized treatment plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedPhobia} onValueChange={setSelectedPhobia}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a phobia to treat" />
              </SelectTrigger>
              <SelectContent>
                {phobias.map((phobia) => (
                  <SelectItem key={phobia.id} value={phobia.id}>
                    {phobia.phobia_name} (Severity: {phobia.severity}/10)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerateCure}
              disabled={generating || !selectedPhobia}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              {generating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Plus className="w-4 h-4 mr-2" />
              Generate Cure Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : treatments.length === 0 ? (
        <Card className="border-muted">
          <CardContent className="py-12 text-center text-muted-foreground">
            No active treatment plans. Generate one above to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {treatments.map((treatment) => {
            const phobia = phobias.find(p => p.id === treatment.phobia_id);
            const plan = treatment.treatment_plan;
            const progress = (treatment.sessions_completed / treatment.total_sessions) * 100;

            return (
              <Card key={treatment.id} className="border-blue-500/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-blue-400">
                        {phobia?.phobia_name}
                      </CardTitle>
                      <CardDescription>{plan.title}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-cyan-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {treatment.sessions_completed}/{treatment.total_sessions} sessions
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Overview:</p>
                    <p className="text-sm text-muted-foreground">{plan.overview}</p>
                  </div>

                  {plan.expected_outcomes && plan.expected_outcomes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Expected Outcomes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.expected_outcomes.map((outcome: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground">{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PhobiaCureDashboard;
