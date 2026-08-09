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
import { AiMarkdown } from "@/components/common/AiMarkdown";


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
      const { data, error } = await supabase.functions.invoke('nutrition-router', {
        body: { action: 'grocery_optimizer', weekly_budget: Number(budget), people: Number(people), days: Number(days), diet_type: dietType }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setResult(data.plan); toast.success("Grocery plan optimized!"); },
    onError: (e: any) => toast.error(e.message || "Error optimizing") });

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
            <CardDescription>Meal plans within your budget with cheapest alternatives (5 credits)</CardDescription>
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
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !credits || credits.credits_remaining < 5} className="w-full gap-2" size="lg">
              {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Optimizing...</> : <><Sparkles className="h-5 w-5" /> Optimize Grocery List (5 credits)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader><CardTitle>Optimized Grocery Plan</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
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

                {result.cost_per_person_per_day && (
                  <p className="text-xs text-muted-foreground text-center">
                    ≈ €{result.cost_per_person_per_day} per person / day
                  </p>
                )}

                {result.summary && (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
                    <AiMarkdown content={String(result.summary)} />
                  </div>
                )}

                {result.macros_per_day && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      ["Cal", result.macros_per_day.calories],
                      ["Protein", result.macros_per_day.protein_g && `${result.macros_per_day.protein_g}g`],
                      ["Carbs", result.macros_per_day.carbs_g && `${result.macros_per_day.carbs_g}g`],
                      ["Fat", result.macros_per_day.fat_g && `${result.macros_per_day.fat_g}g`],
                    ].map(([label, value]) => value ? (
                      <div key={String(label)} className="p-2 rounded-lg bg-muted/50 border border-border/30 text-center">
                        <p className="text-sm font-bold">{value}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                      </div>
                    ) : null)}
                  </div>
                )}

                {Array.isArray(result.category_totals) && result.category_totals.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">📊 Spend by Category</h4>
                    {result.category_totals.map((c: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">{c.category}</span>
                          <span className="text-muted-foreground">€{c.total} {c.percent ? `• ${c.percent}%` : ""}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.min(100, Number(c.percent) || 0)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(result.grocery_list) && result.grocery_list.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🛒 Shopping List ({result.grocery_list.length} items)</h4>
                    {result.grocery_list.map((item: any, i: number) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border/30 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-sm font-medium">{item.name}</span>
                            {item.quantity && <span className="text-xs text-muted-foreground ml-2">{item.quantity}</span>}
                            {item.category && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{item.category}</span>}
                          </div>
                          <span className="text-sm font-bold shrink-0">€{item.price}</span>
                        </div>
                        {item.reason && <p className="text-xs text-muted-foreground">{item.reason}</p>}
                        {item.cheaper_alternative && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">💡 Cheaper: {item.cheaper_alternative}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(result.meal_suggestions) && result.meal_suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🍽️ Meal Plan</h4>
                    {result.meal_suggestions.map((meal: any, i: number) => (
                      <div key={i} className="p-3 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border/30 space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-medium text-sm">
                            {meal.day ? `Day ${meal.day} · ` : ""}{meal.meal_type ? `${meal.meal_type} — ` : ""}{meal.name}
                          </p>
                          {meal.cost_per_serving && <span className="text-xs font-bold shrink-0">€{meal.cost_per_serving}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {[
                            meal.calories && `${meal.calories} cal`,
                            meal.protein_g && `${meal.protein_g}g protein`,
                            meal.prep_minutes && `${meal.prep_minutes} min`,
                          ].filter(Boolean).join(" • ")}
                        </p>
                        {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
                          <p className="text-xs"><span className="font-medium">Ingredients:</span> {meal.ingredients.join(", ")}</p>
                        )}
                        {meal.instructions && <p className="text-xs text-muted-foreground">{meal.instructions}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(result.swap_suggestions) && result.swap_suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🔁 Smart Swaps</h4>
                    {result.swap_suggestions.map((s: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-muted/40 border border-border/30 text-xs space-y-0.5">
                        <p className="font-medium">{s.from} → {s.to} {s.saves_eur ? <span className="text-emerald-500">(saves €{s.saves_eur})</span> : null}</p>
                        {s.note && <p className="text-muted-foreground">{s.note}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {[
                  ["👩‍🍳 Batch Cooking Tips", result.batch_cooking_tips],
                  ["♻️ Waste Reduction", result.waste_reduction_tips],
                  ["🧾 Shopping Strategy", result.shopping_strategy],
                ].map(([title, list]: any) => Array.isArray(list) && list.length > 0 ? (
                  <div key={title} className="space-y-1.5">
                    <h4 className="font-semibold text-sm">{title}</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {list.map((t: string, i: number) => <li key={i} className="text-xs text-muted-foreground">{t}</li>)}
                    </ul>
                  </div>
                ) : null)}
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
