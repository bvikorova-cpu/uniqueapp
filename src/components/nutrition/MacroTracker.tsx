import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, TrendingUp, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function MacroTracker() {
  const queryClient = useQueryClient();
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  const { data: tracking } = useQuery({
    queryKey: ['macro-tracking', today],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('macro_tracking').select('*').eq('user_id', user.id).eq('date', today).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const addMealMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const newMeal = { name: mealName, calories, protein, carbs, fats, time: new Date().toISOString() };
      const currentMeals = (tracking?.meals as any[]) || [];
      const updatedMeals = [...currentMeals, newMeal];
      const { error } = await supabase.from('macro_tracking').upsert({
        user_id: user.id, date: today,
        calories: (tracking?.calories || 0) + calories,
        protein: (tracking?.protein || 0) + protein,
        carbs: (tracking?.carbs || 0) + carbs,
        fats: (tracking?.fats || 0) + fats,
        meals: updatedMeals
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['macro-tracking'] });
      setMealName(""); setCalories(0); setProtein(0); setCarbs(0); setFats(0);
      toast.success("Meal logged!");
    },
    onError: (error: any) => toast.error(error.message || "Error logging meal"),
  });

  const goals = { calories: 2000, protein: 150, carbs: 200, fats: 65 };
  const current = { calories: tracking?.calories || 0, protein: tracking?.protein || 0, carbs: tracking?.carbs || 0, fats: tracking?.fats || 0 };
  const pct = (v: number, g: number) => Math.min((v / g) * 100, 100);

  const macroItems = [
    { label: "Calories", current: current.calories, goal: goals.calories, unit: "", color: "from-orange-500 to-red-500", bgColor: "from-orange-500/10 to-red-500/10" },
    { label: "Protein", current: current.protein, goal: goals.protein, unit: "g", color: "from-red-500 to-rose-500", bgColor: "from-red-500/10 to-rose-500/10" },
    { label: "Carbs", current: current.carbs, goal: goals.carbs, unit: "g", color: "from-amber-500 to-yellow-500", bgColor: "from-amber-500/10 to-yellow-500/10" },
    { label: "Fats", current: current.fats, goal: goals.fats, unit: "g", color: "from-blue-500 to-indigo-500", bgColor: "from-blue-500/10 to-indigo-500/10" },
  ];

  return (
    <>
      <FloatingHowItWorks title="MacroTracker — How it works" steps={[{title:"Open this tool",desc:"Access MacroTracker within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-6">
      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20">
              <Target className="h-5 w-5 text-emerald-500" />
            </div>
            Today's Progress
          </CardTitle>
          <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {macroItems.map((item) => (
            <div key={item.label} className={`p-3 rounded-xl bg-gradient-to-br ${item.bgColor} border border-border/40`}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{item.label}</span>
                <span className="text-muted-foreground">{Math.round(item.current)}{item.unit} / {item.goal}{item.unit}</span>
              </div>
              <Progress value={pct(item.current, item.goal)} className="h-2" />
            </div>
          ))}

          {tracking?.meals && Array.isArray(tracking.meals) && tracking.meals.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Today's Meals
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(tracking.meals as any[]).map((meal: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-muted/50 rounded-lg text-sm border border-border/30">
                    <p className="font-medium">{meal.name}</p>
                    <p className="text-xs text-muted-foreground">{meal.calories} cal • {meal.protein}g P • {meal.carbs}g C • {meal.fats}g F</p>
                  </div>
                ))}
              </div>
            </div>
    )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            Log Meal
          </CardTitle>
          <CardDescription>Manually track your meals and macros</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Meal Name</Label>
            <Input value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="e.g. Chicken & Rice" className="bg-background/50" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Calories</Label>
              <Input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} min={0} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Protein (g)</Label>
              <Input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} min={0} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Carbs (g)</Label>
              <Input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} min={0} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Fats (g)</Label>
              <Input type="number" value={fats} onChange={(e) => setFats(Number(e.target.value))} min={0} className="bg-background/50" />
            </div>
          </div>

          <Button onClick={() => { if (!mealName || calories <= 0) { toast.error("Fill in meal name and calories"); return; } addMealMutation.mutate(); }}
            disabled={addMealMutation.isPending} className="w-full gap-2" size="lg">
            <Plus className="h-5 w-5" /> Log Meal
          </Button>

          <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
            <p className="text-sm text-muted-foreground">💡 <strong>Tip:</strong> Use the Food Scanner to automatically detect calories from photos!</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
}
