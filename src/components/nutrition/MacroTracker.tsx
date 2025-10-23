import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MacroTracker() {
  const queryClient = useQueryClient();
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  // Fetch today's tracking
  const { data: tracking } = useQuery({
    queryKey: ['macro-tracking', today],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('macro_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const addMealMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newMeal = {
        name: mealName,
        calories,
        protein,
        carbs,
        fats,
        time: new Date().toISOString()
      };

      const currentMeals = (tracking?.meals as any[]) || [];
      const updatedMeals = [...currentMeals, newMeal];

      const totalCalories = (tracking?.calories || 0) + calories;
      const totalProtein = (tracking?.protein || 0) + protein;
      const totalCarbs = (tracking?.carbs || 0) + carbs;
      const totalFats = (tracking?.fats || 0) + fats;

      const { error } = await supabase
        .from('macro_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fats: totalFats,
          meals: updatedMeals
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['macro-tracking'] });
      setMealName("");
      setCalories(0);
      setProtein(0);
      setCarbs(0);
      setFats(0);
      toast.success("Meal logged!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error logging meal");
    }
  });

  const goals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65
  };

  const current = {
    calories: tracking?.calories || 0,
    protein: tracking?.protein || 0,
    carbs: tracking?.carbs || 0,
    fats: tracking?.fats || 0
  };

  const percentages = {
    calories: (current.calories / goals.calories) * 100,
    protein: (current.protein / goals.protein) * 100,
    carbs: (current.carbs / goals.carbs) * 100,
    fats: (current.fats / goals.fats) * 100
  };

  const handleAddMeal = () => {
    if (!mealName || calories <= 0) {
      toast.error("Please fill in meal name and calories");
      return;
    }
    addMealMutation.mutate();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Today's Progress
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Calories</span>
                <span className="text-muted-foreground">{Math.round(current.calories)} / {goals.calories}</span>
              </div>
              <Progress value={Math.min(percentages.calories, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Protein</span>
                <span className="text-muted-foreground">{Math.round(current.protein)}g / {goals.protein}g</span>
              </div>
              <Progress value={Math.min(percentages.protein, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Carbs</span>
                <span className="text-muted-foreground">{Math.round(current.carbs)}g / {goals.carbs}g</span>
              </div>
              <Progress value={Math.min(percentages.carbs, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Fats</span>
                <span className="text-muted-foreground">{Math.round(current.fats)}g / {goals.fats}g</span>
              </div>
              <Progress value={Math.min(percentages.fats, 100)} className="h-2" />
            </div>
          </div>

          {tracking?.meals && Array.isArray(tracking.meals) && tracking.meals.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Today's Meals
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(tracking.meals as any[]).map((meal: any, idx: number) => (
                  <div key={idx} className="p-2 bg-muted rounded text-sm">
                    <p className="font-medium">{meal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {meal.calories} cal • {meal.protein}g P • {meal.carbs}g C • {meal.fats}g F
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Meal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Log Meal
          </CardTitle>
          <CardDescription>
            Manually track your meals and macros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal-name">Meal Name</Label>
            <Input
              id="meal-name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="e.g. Chicken & Rice"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fats">Fats (g)</Label>
              <Input
                id="fats"
                type="number"
                value={fats}
                onChange={(e) => setFats(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <Button
            onClick={handleAddMeal}
            disabled={addMealMutation.isPending}
            className="w-full gap-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Log Meal
          </Button>

          <div className="p-3 bg-blue-500/10 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              💡 Tip: Use the Food Scanner tab to automatically scan meals and get nutritional info!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
