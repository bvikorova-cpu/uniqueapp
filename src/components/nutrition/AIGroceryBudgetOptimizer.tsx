import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Loader2, ArrowLeft, Sparkles, DollarSign, TrendingDown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export default function AIGroceryBudgetOptimizer({ onBack }: Props) {
  const { credits } = useAICredits();
  const [budget, setBudget] = useState("50");
  const [people, setPeople] = useState("2");
  const [days, setDays] = useState("7");
  const [dietType, setDietType] = useState("balanced");
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('nutrition-grocery-optimizer', {
        body: { weekly_budget: Number(budget), people: Number(people), days: Number(days), diet_type: dietType }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setResult(data.plan); toast.success("Grocery plan optimized!"); },
    onError: (e: any) => toast.error(e.message || "Error optimizing"),
  });

  return (
    <>
      <FloatingHowItWorks title="AIGroceryBudgetOptimizer — How it works" steps={[{title:"Open this tool",desc:"Access AIGroceryBudgetOptimizer within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 drop-shadow-md">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                <ShoppingCart className="h-5 w-5 text-teal-500" />
              </div>
              AI Grocery Budget Optimizer
            </CardTitle>
            <CardDescription>Meal plans within your budget with cheapest alternatives (6 credits)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weekly Budget (€)</Label>
                <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>People</Label>
                <Input type="number" value={people} onChange={(e) => setPeople(e.target.value)} min="1" max="10" className="bg-background/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Days</Label>
                <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} min="1" max="14" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Diet Type</Label>
                <Select value={dietType} onValueChange={setDietType}>
                  <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="high_protein">High Protein</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !credits || credits.credits_remaining < 6} className="w-full gap-2" size="lg">
              {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Optimizing...</> : <><Sparkles className="h-5 w-5" /> Optimize Grocery List (6 credits)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader><CardTitle>Optimized Grocery Plan</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/20 text-center">
                    <DollarSign className="h-6 w-6 mx-auto text-emerald-500" />
                    <p className="text-2xl font-black text-emerald-500">€{result.total_cost || budget}</p>
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 text-center">
                    <TrendingDown className="h-6 w-6 mx-auto text-primary" />
                    <p className="text-2xl font-black text-primary">{result.savings_percent || 0}%</p>
                    <p className="text-xs text-muted-foreground">Saved vs Average</p>
                  </div>
                </div>
                {result.grocery_list && Array.isArray(result.grocery_list) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🛒 Shopping List</h4>
                    {result.grocery_list.map((item: any, i: number) => (
                      <div key={i} className="p-2.5 bg-muted/50 rounded-lg border border-border/30 flex justify-between items-center">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold">€{item.price}</span>
                          {item.quantity && <span className="text-xs text-muted-foreground ml-2">{item.quantity}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {result.meal_suggestions && Array.isArray(result.meal_suggestions) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🍽️ Meal Suggestions</h4>
                    {result.meal_suggestions.map((meal: any, i: number) => (
                      <div key={i} className="p-3 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border/30">
                        <p className="font-medium text-sm">{meal.name}</p>
                        <p className="text-xs text-muted-foreground">{meal.cost_per_serving && `€${meal.cost_per_serving}/serving`} • {meal.calories && `${meal.calories} cal`}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Your optimized grocery plan will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
    </>);
}
