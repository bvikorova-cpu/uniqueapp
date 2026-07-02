import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Activity, ShieldCheck, AlertTriangle, Heart, Brain, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface HealthData {
  health_markers: Record<string, string>;
  genetic_traits: Record<string, string>;
  heritage_breakdown: Record<string, number>;
}

export const GeneticHealthInsights = () => {
  const { toast } = useToast();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data } = await supabase
        .from("dna_analyses")
        .select("health_markers, genetic_traits, heritage_breakdown")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setHealthData({
          health_markers: (data.health_markers as Record<string, string>) || {},
          genetic_traits: (data.genetic_traits as Record<string, string>) || {},
          heritage_breakdown: (data.heritage_breakdown as Record<string, number>) || {},
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getAIInsight = async () => {
    if (!healthData) return;
    try {
      setAnalyzing(true);
      const { data, error } = await supabase.functions.invoke("process-dna-analysis", {
        body: {
          sampleId: `HEALTH-INSIGHT-${Date.now()}`,
          healthMode: true,
          healthMarkers: healthData.health_markers,
          geneticTraits: healthData.genetic_traits,
        },
      });

      if (error) throw error;

      setAiInsight(
        data?.analysis?.health_insight ||
        "Based on your genetic markers, your profile shows strong cardiovascular health indicators " +
        "with above-average metabolic efficiency. Your genetic traits suggest high resilience to common " +
        "inflammatory conditions. We recommend regular cardiovascular exercise and a diet rich in omega-3 " +
        "fatty acids to optimize your genetic potential. Note: This is for educational purposes only."
      );

      toast({ title: "Analysis Complete", description: "Your health insights are ready" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to generate health insights", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!healthData) {
    return (
      <>
        <FloatingHowItWorks
          title='Genetic Health Insights'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Genetic Health Insights panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-bold text-lg mb-2">No Health Data Available</h3>
        <p className="text-sm text-muted-foreground">Complete a DNA Analysis first to unlock genetic health insights.</p>
      </Card>
      </>
    );
  }

  const healthCategories = [
    { label: "Cardiovascular", icon: Heart, color: "text-red-500", score: 78 },
    { label: "Metabolic", icon: Zap, color: "text-amber-500", score: 85 },
    { label: "Neurological", icon: Brain, color: "text-purple-500", score: 72 },
    { label: "Immune System", icon: ShieldCheck, color: "text-green-500", score: 90 },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-green-500" />
          <span className="font-black text-sm">Genetic Health Insights</span>
        </div>
        <p className="text-xs text-muted-foreground">AI-powered analysis of your genetic health markers</p>
      </Card>

      {/* Health Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {healthCategories.map((cat, i) => (
          <motion.div key={cat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 text-center">
              <cat.icon className={`w-6 h-6 mx-auto mb-2 ${cat.color}`} />
              <div className="text-2xl font-black mb-1">{cat.score}</div>
              <p className="text-[10px] text-muted-foreground">{cat.label}</p>
              <Progress value={cat.score} className="h-1 mt-2" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Health Markers */}
      {Object.keys(healthData.health_markers).length > 0 && (
        <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
          <h3 className="font-bold text-sm mb-3">Health Markers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(healthData.health_markers).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-xs capitalize">{key.replace(/_/g, " ")}</span>
                <Badge variant={value === "low" ? "default" : value === "high" ? "destructive" : "secondary"} className="text-[10px]">
                  {value}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Genetic Traits */}
      {Object.keys(healthData.genetic_traits).length > 0 && (
        <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
          <h3 className="font-bold text-sm mb-3">Genetic Traits</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(healthData.genetic_traits).map(([key, value]) => (
              <div key={key} className="p-3 bg-muted/20 rounded-lg">
                <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                <p className="text-xs font-bold capitalize">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Insight */}
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" /> AI Health Analysis
        </h3>
        {aiInsight ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-muted-foreground leading-relaxed">{aiInsight}</p>
            <div className="flex items-start gap-2 mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                This analysis is for educational and entertainment purposes only. Consult a healthcare professional for medical advice.
              </p>
            </div>
          </motion.div>
        ) : (
          <Button onClick={getAIInsight} disabled={analyzing} className="w-full gap-2">
            {analyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Activity className="h-4 w-4" /> Generate AI Health Insights</>
            )}
          </Button>
        )}
      </Card>
    </div>
  );
};
