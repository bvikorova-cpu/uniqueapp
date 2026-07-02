import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, TrendingDown, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Insight {
  title: string;
  body: string;
  action: string;
  sentiment: "positive" | "warning" | "neutral" | "critical";
  icon: string;
}

const iconMap: Record<string, any> = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "alert-triangle": AlertTriangle,
  "lightbulb": Lightbulb,
  "target": Target,
  "zap": Zap,
};

const sentimentStyles = {
  positive: "from-emerald-500/15 to-teal-500/10 border-emerald-500/40 text-emerald-300",
  warning: "from-amber-500/15 to-orange-500/10 border-amber-500/40 text-amber-300",
  neutral: "from-blue-500/15 to-cyan-500/10 border-blue-500/40 text-cyan-300",
  critical: "from-red-500/15 to-pink-500/10 border-red-500/40 text-red-300",
};

interface Props {
  stats: {
    totalUsers: number;
    premiumUsers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    masterchefEarnings: number;
  };
}

export const AIInsightsPanel = ({ stats }: Props) => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-ai-insights", { body: { stats } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setInsights(data.insights || []);
    } catch (e: any) {
      toast({ title: "AI Insights failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Insights Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Insights Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Insights Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-purple-500/10 via-card/80 to-pink-500/10 backdrop-blur-xl border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            AI Executive Insights
          </span>
          <Button size="sm" onClick={generate} disabled={loading}
            className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white border-0">
            {loading ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Analysing</> : <><Sparkles className="h-3 w-3 mr-1" /> Generate</>}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
            Click <strong>Generate</strong> to let AI analyse your platform and surface insights.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((ins, i) => {
              const Icon = iconMap[ins.icon] || Lightbulb;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-3 rounded-lg border bg-gradient-to-br ${sentimentStyles[ins.sentiment]}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm">{ins.title}</p>
                      <p className="text-xs text-foreground/85 mt-1">{ins.body}</p>
                      <p className="text-[11px] mt-2 font-semibold opacity-90">→ {ins.action}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
