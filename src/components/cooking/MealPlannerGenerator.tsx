import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const MealPlannerGenerator = () => {
  const [days, setDays] = useState(7);
  const [calorieTarget, setCalorieTarget] = useState('2000');
  const [mealPlan, setMealPlan] = useState<any>(null);
  const { data: credits } = useCookingCredits();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-weekly-meal-plan', {
        body: { 
          days, 
          dietary_preferences: [],
          calorie_target: parseInt(calorieTarget)
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setMealPlan(data.meal_plan);
      toast.success('Meal plan generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error generating meal plan');
    }
  });

  return (
    <>
      <FloatingHowItWorks title="How Meal Planner Generator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Meal Plan Generator
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Number of days</label>
            <Input
              type="number"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Daily calorie target</label>
            <Input
              type="number"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(e.target.value)}
            />
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !credits || credits.credits < 5}
            className="w-full"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Plan (5 credits)'}
          </Button>
          {credits && credits.credits < 5 && (
            <p className="text-sm text-destructive mt-2">
              You need 5 credits to generate a meal plan. You have {credits.credits} credits.
            </p>
          )}
        </div>
      </Card>

      {mealPlan && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Your Meal Plan</h3>
          <div className="space-y-4">
            {mealPlan.meal_plan?.days?.map((day: any, idx: number) => (
              <div key={idx} className="border-b pb-4 last:border-0">
                <h4 className="font-semibold">Day {day.day}</h4>
                <div className="mt-2 space-y-2 text-sm">
                  <p><strong>Breakfast:</strong> {day.meals?.breakfast?.name}</p>
                  <p><strong>Lunch:</strong> {day.meals?.lunch?.name}</p>
                  <p><strong>Dinner:</strong> {day.meals?.dinner?.name}</p>
                  <p className="text-muted-foreground">Total: {day.total_calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
    </>
    );
};