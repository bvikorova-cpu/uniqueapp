import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dumbbell, Utensils, Zap, TrendingUp, Activity, ChefHat, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
    { id: 'strength', name: 'Strength', icon: Dumbbell, calories: 300, macros: 'High protein, moderate carbs', mealSuggestion: 'Chicken & brown rice, protein shake', gradient: 'from-red-500/20 to-rose-500/20' },
    { id: 'cardio', name: 'Cardio', icon: Activity, calories: 500, macros: 'High carbs, moderate protein', mealSuggestion: 'Pasta with lean meat, banana', gradient: 'from-blue-500/20 to-cyan-500/20' },
    { id: 'hiit', name: 'HIIT', icon: Zap, calories: 400, macros: 'Balanced macros', mealSuggestion: 'Quinoa bowl with chicken', gradient: 'from-orange-500/20 to-amber-500/20' },
    { id: 'yoga', name: 'Yoga', icon: TrendingUp, calories: 150, macros: 'Light, balanced', mealSuggestion: 'Greek yogurt with berries', gradient: 'from-green-500/20 to-emerald-500/20' },
  ];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
        body: { workoutType: selectedWorkoutType, goal, experienceLevel, daysPerWeek, sessionDuration, equipment }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedPlan(data.plan);
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast.success("Workout plan generated!");
    },
    onError: (error: any) => toast.error(error.message || "Error generating plan"),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <FloatingHowItWorks title="WorkoutMatcher — How it works" steps={[{title:"Open this tool",desc:"Access WorkoutMatcher within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20">
                  <Dumbbell className="h-5 w-5 text-red-500" />
                </div>
                AI Workout + Nutrition Planner
              </CardTitle>
              <CardDescription>AI generates personalized workout plans with meal pairing (30 credits)</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <ChefHat className="h-3 w-3 text-primary" />
              {credits ? `${credits.credits_remaining}` : '...'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Workout Type *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {workoutTypes.map((workout) => {
                const Icon = workout.icon;
                return (
                  <motion.button key={workout.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedWorkoutType(workout.id)}
                    className={`p-4 rounded-xl border-2 transition-all bg-gradient-to-br ${workout.gradient} ${
                      selectedWorkoutType === workout.id ? 'border-primary shadow-lg shadow-primary/20' : 'border-border/40 hover:border-primary/50'
                    }`}>
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-medium text-center">{workout.name}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fitness Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
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
              <Label>Experience Level</Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Days Per Week</Label>
              <Select value={daysPerWeek.toString()} onValueChange={(v) => setDaysPerWeek(Number(v))}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3,4,5,6].map(d => <SelectItem key={d} value={d.toString()}>{d} days</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Session Duration</Label>
              <Select value={sessionDuration.toString()} onValueChange={(v) => setSessionDuration(Number(v))}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[30,45,60,90].map(d => <SelectItem key={d} value={d.toString()}>{d} min</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Equipment</Label>
              <Select value={equipment} onValueChange={setEquipment}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                  <SelectItem value="minimal">Minimal (dumbbells, bands)</SelectItem>
                  <SelectItem value="full_gym">Full Gym</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedWorkoutType && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
              {(() => {
                const selected = workoutTypes.find(w => w.id === selectedWorkoutType);
                if (!selected) return null;
                const Icon = selected.icon;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">{selected.name} Training</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>🔥 <strong>Burn:</strong> ~{selected.calories} calories</p>
                      <p>📊 <strong>Macros:</strong> {selected.macros}</p>
                      <p>🍽️ <strong>Meal:</strong> {selected.mealSuggestion}</p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          <Button onClick={() => { if (!selectedWorkoutType) { toast.error("Select a workout type"); return; } if (!credits || credits.credits_remaining < 30) { toast.error('Need 30 credits'); return; } generateMutation.mutate(); }}
            disabled={generateMutation.isPending || !selectedWorkoutType} className="w-full gap-2" size="lg">
            {generateMutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</> : <><Sparkles className="h-5 w-5" /> Generate Plan (30 credits)</>}
          </Button>

          {generatedPlan && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-muted/50 rounded-xl border border-border/40 space-y-3 max-h-96 overflow-y-auto">
              <h4 className="font-bold">Your Workout Plan</h4>
              <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{typeof generatedPlan === 'string' ? generatedPlan : JSON.stringify(generatedPlan, null, 2)}</pre>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
