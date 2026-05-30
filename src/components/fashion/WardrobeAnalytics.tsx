import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, BarChart3, PieChart, TrendingUp, Shirt, Euro, Calendar, Sparkles, AlertTriangle } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";

const CREDIT_COST = 10;

interface AnalyticsResult {
  wardrobe_summary: {
    total_items: number;
    total_estimated_value: string;
    avg_cost_per_wear: string;
    most_worn_category: string;
    least_worn_category: string;
  };
  category_breakdown: { category: string; count: number; percentage: number; value: string }[];
  color_distribution: { color: string; count: number; percentage: number }[];
  usage_insights: {
    most_versatile_item: string;
    underused_items: string[];
    cost_per_wear_champions: { item: string; cost_per_wear: string; times_worn: number }[];
  };
  recommendations: string[];
  wardrobe_score: number;
  sustainability_rating: string;
}

export default function WardrobeAnalytics() {
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const { credits, spendCredit } = useAICredits();

  const { data: wardrobeItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ["wardrobe-analytics-items"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const { data } = await supabase.from("wardrobe_items").select("*").eq("user_id", session.user.id);
      return data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let i = 0; i < CREDIT_COST; i++) {
        const ok = await spendCredit("custom_generation", "Wardrobe Analytics");
        if (!ok && i === 0) throw new Error("Insufficient credits");
      }

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "wardrobe-analytics", items: wardrobeItems },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult(data.analytics);
      toast.success("Wardrobe analyzed!");
    },
    onError: (e: any) => toast.error(e.message || "Analysis failed"),
  });

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Wardrobe Analytics</h2>
            <p className="text-sm text-muted-foreground">AI-powered usage stats, cost-per-wear & optimization insights • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Wardrobe Items</p>
              <p className="text-sm text-muted-foreground">{loadingItems ? "Loading..." : `${wardrobeItems.length} items tracked`}</p>
            </div>
            <Shirt className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || wardrobeItems.length === 0 || (credits?.credits_remaining || 0) < CREDIT_COST}
          className="w-full gap-2" size="lg"
        >
          {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><BarChart3 className="h-4 w-4" /> Analyze Wardrobe ({CREDIT_COST} Credits)</>}
        </Button>

        {wardrobeItems.length === 0 && !loadingItems && (
          <div className="text-center py-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Add items to your Wardrobe Manager first to get analytics</p>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Score & Summary */}
            <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black">Wardrobe Health</h3>
                <div className="text-center">
                  <div className="text-4xl font-black text-primary">{result.wardrobe_score}</div>
                  <p className="text-xs text-muted-foreground">/100</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Total Items", value: result.wardrobe_summary.total_items, icon: Shirt },
                  { label: "Total Value", value: result.wardrobe_summary.total_estimated_value, icon: Euro },
                  { label: "Avg Cost/Wear", value: result.wardrobe_summary.avg_cost_per_wear, icon: TrendingUp },
                ].map((stat, i) => (
                  <div key={i} className="bg-background/50 rounded-lg p-3 text-center">
                    <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-sm flex items-center gap-2">
                <span className="text-muted-foreground">Sustainability:</span>
                <span className="font-semibold text-primary">{result.sustainability_rating}</span>
              </div>
            </Card>

            {/* Category Breakdown */}
            <Card className="p-5 bg-card/80 border-white/10">
              <h4 className="font-bold mb-3 flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Category Breakdown</h4>
              <div className="space-y-2">
                {result.category_breakdown.map((cat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{cat.category}</span>
                        <span className="text-muted-foreground">{cat.count} items • {cat.value}</span>
                      </div>
                      <div className="h-2 bg-background/80 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold w-10 text-right">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Color Distribution */}
            <Card className="p-5 bg-card/80 border-white/10">
              <h4 className="font-bold mb-3">🎨 Color Distribution</h4>
              <div className="flex flex-wrap gap-2">
                {result.color_distribution.map((c, i) => (
                  <div key={i} className="bg-primary/10 rounded-full px-3 py-1.5 text-xs font-medium">
                    {c.color} ({c.count}) — {c.percentage}%
                  </div>
                ))}
              </div>
            </Card>

            {/* Usage Insights */}
            <Card className="p-5 bg-card/80 border-white/10">
              <h4 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Usage Insights</h4>
              <p className="text-sm mb-3"><span className="font-semibold">Most Versatile:</span> {result.usage_insights.most_versatile_item}</p>

              {result.usage_insights.cost_per_wear_champions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Cost-Per-Wear Champions:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {result.usage_insights.cost_per_wear_champions.map((c, i) => (
                      <div key={i} className="bg-background/50 rounded-lg p-2 text-xs">
                        <p className="font-semibold">{c.item}</p>
                        <p className="text-muted-foreground">{c.cost_per_wear}/wear • {c.times_worn} wears</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.usage_insights.underused_items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-500 mb-1">⚠️ Underused Items:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.usage_insights.underused_items.map((item, i) => (
                      <span key={i} className="text-xs bg-amber-500/10 text-amber-600 rounded-full px-2 py-1">{item}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Recommendations */}
            <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <h4 className="font-bold mb-3">💡 AI Recommendations</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary font-bold">{i + 1}.</span> {rec}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
