import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Utensils, Download, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";

export default function MealPlannerGenerator() {
  const queryClient = useQueryClient();
  const { credits } = useAICredits();
  
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(7);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(150);
  const [targetCarbs, setTargetCarbs] = useState(200);
  const [targetFats, setTargetFats] = useState(65);
  const [dietaryPreference, setDietaryPreference] = useState("");
  const [allergen, setAllergen] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: {
          title,
          days,
          targetCalories,
          targetProtein,
          targetCarbs,
          targetFats,
          dietaryPreferences,
          allergens,
          isPremium: false
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedPlan(data.mealPlan);
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success("Meal plan generated successfully!");
    },
    onError: (error: any) => {
      console.error('Generation error:', error);
      toast.error(error.message || "Error generating meal plan");
    }
  });

  const handleGenerate = () => {
    if (!title || targetCalories < 500) {
      toast.error("Please fill in all required fields");
      return;
    }

    const hasAICredits = credits && credits.credits_remaining >= 50;
    
    if (!hasAICredits) {
      toast.error('You need 50 AI credits to generate a meal plan. Please purchase credits.');
      return;
    }

    generateMutation.mutate();
  };

  const addDietaryPreference = () => {
    if (dietaryPreference && !dietaryPreferences.includes(dietaryPreference)) {
      setDietaryPreferences([...dietaryPreferences, dietaryPreference]);
      setDietaryPreference("");
    }
  };

  const addAllergen = () => {
    if (allergen && !allergens.includes(allergen)) {
      setAllergens([...allergens, allergen]);
      setAllergen("");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Generator Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                AI Meal Planner Pro
              </CardTitle>
              <CardDescription>
                Generate personalized meal plans based on your goals (50 credits)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <ChefHat className="h-4 w-4 text-primary" />
              {credits ? `${credits.credits_remaining} AI credits` : 'Loading...'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Plan Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Weight Loss Plan"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                min={1}
                max={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Daily Calories *</Label>
              <Input
                id="calories"
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
                min={500}
                max={5000}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Macro Goals (optional)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Protein (g)"
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(Number(e.target.value))}
              />
              <Input
                placeholder="Carbs (g)"
                type="number"
                value={targetCarbs}
                onChange={(e) => setTargetCarbs(Number(e.target.value))}
              />
              <Input
                placeholder="Fats (g)"
                type="number"
                value={targetFats}
                onChange={(e) => setTargetFats(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dietary Preferences</Label>
            <div className="flex gap-2">
              <Input
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                placeholder="e.g. Vegetarian, Keto"
                onKeyPress={(e) => e.key === 'Enter' && addDietaryPreference()}
              />
              <Button type="button" onClick={addDietaryPreference} variant="outline">
                Add
              </Button>
            </div>
            {dietaryPreferences.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {dietaryPreferences.map((pref, idx) => (
                  <Badge key={idx} variant="secondary">
                    {pref}
                    <button
                      onClick={() => setDietaryPreferences(dietaryPreferences.filter((_, i) => i !== idx))}
                      className="ml-2"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Allergens</Label>
            <div className="flex gap-2">
              <Input
                value={allergen}
                onChange={(e) => setAllergen(e.target.value)}
                placeholder="e.g. Nuts, Dairy"
                onKeyPress={(e) => e.key === 'Enter' && addAllergen()}
              />
              <Button type="button" onClick={addAllergen} variant="outline">
                Add
              </Button>
            </div>
            {allergens.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {allergens.map((all, idx) => (
                  <Badge key={idx} variant="destructive">
                    {all}
                    <button
                      onClick={() => setAllergens(allergens.filter((_, i) => i !== idx))}
                      className="ml-2"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={
              generateMutation.isPending || 
              !title ||
              !credits ||
              credits.credits_remaining < 50
            }
            className="w-full gap-2"
            size="lg"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ChefHat className="h-5 w-5" />
                Generate Meal Plan (50 credits)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Meal Plan</CardTitle>
          <CardDescription>
            {generatedPlan ? "Your personalized meal plan is ready" : "Your plan will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedPlan ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{generatedPlan.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {generatedPlan.days} days • {generatedPlan.target_calories} cal/day
                </p>
              </div>
              
              {generatedPlan.plan_data && generatedPlan.plan_data.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedPlan.plan_data.map((day: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Day {day.day}</h4>
                      <div className="space-y-1 text-sm">
                        {day.meals.breakfast && (
                          <p><strong>Breakfast:</strong> {day.meals.breakfast.name} ({day.meals.breakfast.calories} cal)</p>
                        )}
                        {day.meals.lunch && (
                          <p><strong>Lunch:</strong> {day.meals.lunch.name} ({day.meals.lunch.calories} cal)</p>
                        )}
                        {day.meals.dinner && (
                          <p><strong>Dinner:</strong> {day.meals.dinner.name} ({day.meals.dinner.calories} cal)</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Plan
              </Button>
            </div>
          ) : (
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center space-y-2">
                <ChefHat className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Fill out the form to generate your plan</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
