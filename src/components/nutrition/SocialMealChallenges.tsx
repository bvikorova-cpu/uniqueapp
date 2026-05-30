import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Loader2, ArrowLeft, Sparkles, Trophy, Users, Flame, Target } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";

interface Props { onBack: () => void; }

export default function SocialMealChallenges({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [goal, setGoal] = useState("lose_weight");
  const [duration, setDuration] = useState("7");
  const [participants, setParticipants] = useState("4");
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const credited = await spendCredit('custom_generation', 'Meal Challenge');
      if (!credited) throw new Error('Not enough credits (8 required)');
      const { data, error } = await supabase.functions.invoke('nutrition-meal-challenge', {
        body: { goal, duration_days: Number(duration), max_participants: Number(participants) }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setResult(data.challenge); toast.success("Challenge generated!"); },
    onError: (e: any) => toast.error(e.message || "Error generating challenge"),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 drop-shadow-md">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20">
                <Swords className="h-5 w-5 text-pink-500" />
              </div>
              Social Meal Challenges
            </CardTitle>
            <CardDescription>AI-generated competitive healthy eating leagues (8 credits)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Challenge Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Weight Loss Challenge</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Building Sprint</SelectItem>
                  <SelectItem value="clean_eating">Clean Eating Marathon</SelectItem>
                  <SelectItem value="plant_based">Plant-Based Week</SelectItem>
                  <SelectItem value="calorie_deficit">Calorie Deficit Race</SelectItem>
                  <SelectItem value="hydration">Hydration Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Participants</Label>
                <Input type="number" value={participants} onChange={(e) => setParticipants(e.target.value)} min="2" max="20" className="bg-background/50" />
              </div>
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !credits || credits.credits_remaining < 8} className="w-full gap-2" size="lg">
              {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating Challenge...</> : <><Sparkles className="h-5 w-5" /> Generate Challenge (8 credits)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader><CardTitle>Challenge Details</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-h-[500px] overflow-y-auto">
                <div className="p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-500/20 text-center">
                  <Trophy className="h-8 w-8 mx-auto text-pink-500 mb-1" />
                  <p className="text-xl font-black">{result.challenge_name || "Epic Challenge"}</p>
                  <p className="text-sm text-muted-foreground">{result.tagline || "Compete for the crown!"}</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-muted/50 rounded-xl text-center">
                    <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Players</p>
                    <p className="font-bold">{participants}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl text-center">
                    <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                    <p className="text-xs text-muted-foreground">Days</p>
                    <p className="font-bold">{duration}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl text-center">
                    <Target className="h-4 w-4 mx-auto mb-1 text-green-500" />
                    <p className="text-xs text-muted-foreground">XP Reward</p>
                    <p className="font-bold">{result.xp_reward || 500}</p>
                  </div>
                </div>

                {result.daily_tasks && Array.isArray(result.daily_tasks) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">📋 Daily Tasks</h4>
                    {result.daily_tasks.map((task: any, i: number) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-xl border border-border/30">
                        <p className="font-medium text-sm">{task.day ? `Day ${task.day}` : `Task ${i + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{task.task || task.description || task}</p>
                        {task.points && <span className="text-[10px] font-bold text-primary">+{task.points} XP</span>}
                      </div>
                    ))}
                  </div>
                )}

                {result.rules && Array.isArray(result.rules) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">📜 Rules</h4>
                    {result.rules.map((rule: string, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">• {rule}</p>
                    ))}
                  </div>
                )}

                {result.rewards && Array.isArray(result.rewards) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🏆 Rewards</h4>
                    {result.rewards.map((reward: any, i: number) => (
                      <div key={i} className="p-2.5 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl border border-yellow-500/20 flex justify-between">
                        <span className="text-sm font-medium">{reward.place || `#${i + 1}`}</span>
                        <span className="text-sm text-muted-foreground">{reward.reward || reward}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Swords className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Your meal challenge will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
