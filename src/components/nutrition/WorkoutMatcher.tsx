import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dumbbell, Utensils, Zap, TrendingUp, Activity, ChefHat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";

export default function WorkoutMatcher() {
  const queryClient = useQueryClient();
  const { credits } = useAICredits();
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string | null>(null);
  const [goal, setGoal] = useState("muscle_gain");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [equipment, setEquipment] = useState("full_gym");
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const workoutTypes = [
    {
      id: 'strength',
      name: 'Strength Training',
      icon: Dumbbell,
      calories: 300,
      macros: 'High protein, moderate carbs',
      mealSuggestion: 'Chicken & brown rice, protein shake'
    },
    {
      id: 'cardio',
      name: 'Cardio/Running',
      icon: Activity,
      calories: 500,
      macros: 'High carbs, moderate protein',
      mealSuggestion: 'Pasta with lean meat, banana'
    },
    {
      id: 'hiit',
      name: 'HIIT',
      icon: Zap,
      calories: 400,
      macros: 'Balanced macros',
      mealSuggestion: 'Quinoa bowl with chicken, sweet potato'
    },
    {
      id: 'yoga',
      name: 'Yoga/Stretching',
      icon: TrendingUp,
      calories: 150,
      macros: 'Light, balanced',
      mealSuggestion: 'Greek yogurt with berries, green smoothie'
    }
  ];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
        body: {
          workoutType: selectedWorkoutType,
          goal,
          experienceLevel,
          daysPerWeek,
          sessionDuration,
          equipment
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedPlan(data.plan);
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast.success("Workout plan generated successfully!");
    },
    onError: (error: any) => {
      console.error('Generation error:', error);
      toast.error(error.message || "Error generating workout plan");
    }
  });

  const handleGenerate = () => {
    if (!selectedWorkoutType) {
      toast.error("Please select a workout type");
      return;
    }

    if (!credits || credits.credits_remaining < 30) {
      toast.error('You need 30 AI credits to generate a workout plan. Please purchase credits.');
      return;
    }

    generateMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                AI Workout + Nutrition Planner
              </CardTitle>
              <CardDescription>
                AI generates personalized workout plans with meal pairing (30 credits)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <ChefHat className="h-4 w-4 text-primary" />
              {credits ? `${credits.credits_remaining} AI credits` : 'Loading...'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">Select Workout Type *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {workoutTypes.map((workout) => {
                  const Icon = workout.icon;
                  return (
                    <button
                      key={workout.id}
                      onClick={() => setSelectedWorkoutType(workout.id)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedWorkoutType === workout.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium text-center">{workout.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Fitness Goal</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger id="goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                    <SelectItem value="fat_loss">Fat Loss</SelectItem>
                    <SelectItem value="strength">Build Strength</SelectItem>
                    <SelectItem value="endurance">Improve Endurance</SelectItem>
                    <SelectItem value="general_fitness">General Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger id="experience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="days">Days Per Week</Label>
                <Select value={daysPerWeek.toString()} onValueChange={(v) => setDaysPerWeek(Number(v))}>
                  <SelectTrigger id="days">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="4">4 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="6">6 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Session Duration (min)</Label>
                <Select value={sessionDuration.toString()} onValueChange={(v) => setSessionDuration(Number(v))}>
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="equipment">Available Equipment</Label>
                <Select value={equipment} onValueChange={setEquipment}>
                  <SelectTrigger id="equipment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                    <SelectItem value="minimal">Minimal (dumbbells, bands)</SelectItem>
                    <SelectItem value="full_gym">Full Gym</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {selectedWorkoutType && (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              {(() => {
                const selected = workoutTypes.find(w => w.id === selectedWorkoutType);
                if (!selected) return null;
                const Icon = selected.icon;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">{selected.name}</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><strong>Burn:</strong> ~{selected.calories} calories</p>
                      <p><strong>Recommended macros:</strong> {selected.macros}</p>
                      <p className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Utensils className="h-4 w-4" />
                        <span><strong>Meal suggestion:</strong> {selected.mealSuggestion}</span>
                      </p>
                    </div>
                    <Button className="w-full gap-2 mt-2">
                      <Utensils className="h-4 w-4" />
                      Generate Matching Meal Plan
                    </Button>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
