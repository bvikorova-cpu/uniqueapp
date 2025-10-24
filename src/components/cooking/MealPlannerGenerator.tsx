import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';

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
      toast.success('Jedálny plán bol úspešne vygenerovaný!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Chyba pri generovaní plánu');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Generátor jedálneho plánu
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Počet dní</label>
            <Input
              type="number"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cieľ kalórií/deň</label>
            <Input
              type="number"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(e.target.value)}
            />
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !credits || credits.credits < 3}
            className="w-full"
          >
            {generateMutation.isPending ? 'Generujem...' : 'Vygeneruj plán (3 kredity)'}
          </Button>
        </div>
      </Card>

      {mealPlan && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Váš jedálny plán</h3>
          <div className="space-y-4">
            {mealPlan.meal_plan?.days?.map((day: any, idx: number) => (
              <div key={idx} className="border-b pb-4 last:border-0">
                <h4 className="font-semibold">Deň {day.day}</h4>
                <div className="mt-2 space-y-2 text-sm">
                  <p><strong>Raňajky:</strong> {day.meals?.breakfast?.name}</p>
                  <p><strong>Obed:</strong> {day.meals?.lunch?.name}</p>
                  <p><strong>Večera:</strong> {day.meals?.dinner?.name}</p>
                  <p className="text-muted-foreground">Celkom: {day.total_calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
