import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Utensils, Zap, TrendingUp, Activity } from "lucide-react";

export default function WorkoutMatcher() {
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string | null>(null);

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

  const sampleWorkoutPlans = [
    {
      id: '1',
      title: 'Beginner Full Body',
      duration_weeks: 4,
      description: '3 days/week strength training',
      matched_meal_plan: 'High protein meal plan (2200 cal)'
    },
    {
      id: '2',
      title: 'Advanced Fat Loss',
      duration_weeks: 8,
      description: '5 days HIIT + 2 days strength',
      matched_meal_plan: 'Calorie deficit plan (1800 cal)'
    },
    {
      id: '3',
      title: 'Muscle Gain Program',
      duration_weeks: 12,
      description: '4 days strength training',
      matched_meal_plan: 'Calorie surplus plan (2800 cal)'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            FitFuel Combo
          </CardTitle>
          <CardDescription>
            AI matches your workout with perfect nutrition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Select Your Workout Type</h3>
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

      <Card>
        <CardHeader>
          <CardTitle>Pre-Made Workout Programs</CardTitle>
          <CardDescription>
            Complete programs with matched meal plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sampleWorkoutPlans.map((plan) => (
            <div key={plan.id} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{plan.title}</h4>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <Badge variant="secondary">{plan.duration_weeks} weeks</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Utensils className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{plan.matched_meal_plan}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                View Program
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Beast Mode Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Personal AI trainer with video analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Dynamic meal plans that adapt to your workouts</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm">Real-time macro adjustments</span>
          </div>
          <Button variant="default" className="w-full mt-4">
            Upgrade to Beast Mode ($29.99/month)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
