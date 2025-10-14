import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Moon, Dumbbell, Briefcase, Users, Brain, TrendingUp, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAICredits } from "@/hooks/useAICredits";
import { Badge } from "@/components/ui/badge";

interface RoutineEntry {
  sleep_hours?: number;
  workout_minutes?: number;
  work_hours?: number;
  social_hours?: number;
  energy_level?: number;
  mood_score?: number;
  notes?: string;
}

interface Optimization {
  sleep_recommendation: string;
  workout_recommendation: string;
  work_recommendation: string;
  social_recommendation: string;
  habit_stacking_suggestions: any;
  energy_insights: string;
  balance_score: number;
  is_premium: boolean;
  created_at: string;
}

const RoutineOptimizer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits, loading: creditsLoading, useCredit, refresh: refreshCredits } = useAICredits();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [todayEntry, setTodayEntry] = useState<RoutineEntry>({});
  const [latestOptimization, setLatestOptimization] = useState<Optimization | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
  };

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [todayRes, entriesRes, optRes] = await Promise.all([
        supabase
          .from('routine_entries')
          .select('*')
          .eq('entry_date', today)
          .maybeSingle(),
        supabase
          .from('routine_entries')
          .select('*')
          .order('entry_date', { ascending: false })
          .limit(7),
        supabase
          .from('ai_routine_optimizations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (todayRes.data) {
        setTodayEntry(todayRes.data);
      }
      if (entriesRes.data) setEntries(entriesRes.data);
      if (optRes.data) setLatestOptimization(optRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('routine_entries')
        .upsert({
          user_id: user.id,
          entry_date: today,
          ...todayEntry
        });

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Today's routine has been saved.",
      });

      await loadData();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save entry.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOptimize = async (isPremium: boolean) => {
    try {
      setOptimizing(true);

      const creditsNeeded = isPremium ? 5 : 2;
      const currentCredits = typeof credits === 'number' ? credits : credits.credits_remaining;

      if (currentCredits < creditsNeeded) {
        toast({
          title: "Insufficient Credits",
          description: `You need ${creditsNeeded} credits. Redirecting to store.`,
          variant: "destructive",
        });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('optimize-routine', {
        body: { isPremium },
      });

      if (error) throw error;

      if (data.success) {
        // Deduct credits manually
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('ai_credits').update({
            credits_remaining: currentCredits - creditsNeeded
          }).eq('user_id', user.id);
          
          await supabase.from('ai_usage_history').insert({
            user_id: user.id,
            usage_type: 'routine_optimization',
            credits_used: creditsNeeded,
            description: `${isPremium ? 'Premium' : 'Basic'} routine optimization`
          });
        }
        
        await loadData();
        await refreshCredits();
        
        toast({
          title: "✨ Optimization Complete!",
          description: "Check your personalized recommendations below.",
        });
      }
    } catch (error) {
      console.error('Error optimizing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to optimize routine.",
        variant: "destructive",
      });
    } finally {
      setOptimizing(false);
    }
  };

  if (loading || creditsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="h-12 w-12 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Personalized Routine Optimizer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Analyze your day and optimize your routine for maximum productivity and wellbeing
          </p>
        </div>

        {/* Today's Entry Form */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Today's Routine</CardTitle>
            </div>
            <CardDescription>Record your day for personalized analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sleep" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" /> Sleep (hours)
                </Label>
                <Input
                  id="sleep"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={todayEntry.sleep_hours || ''}
                  onChange={(e) => setTodayEntry({...todayEntry, sleep_hours: parseFloat(e.target.value)})}
                  placeholder="7.5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workout" className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" /> Workout (minúty)
                </Label>
                <Input
                  id="workout"
                  type="number"
                  min="0"
                  value={todayEntry.workout_minutes || ''}
                  onChange={(e) => setTodayEntry({...todayEntry, workout_minutes: parseInt(e.target.value)})}
                  placeholder="30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="work" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Work (hours)
                </Label>
                <Input
                  id="work"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={todayEntry.work_hours || ''}
                  onChange={(e) => setTodayEntry({...todayEntry, work_hours: parseFloat(e.target.value)})}
                  placeholder="8"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="social" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Social (hodiny)
                </Label>
                <Input
                  id="social"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={todayEntry.social_hours || ''}
                  onChange={(e) => setTodayEntry({...todayEntry, social_hours: parseFloat(e.target.value)})}
                  placeholder="2"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="energy">Energy Level (1-10)</Label>
                <Input
                  id="energy"
                  type="number"
                  min="1"
                  max="10"
                  value={todayEntry.energy_level || ''}
                  onChange={(e) => setTodayEntry({...todayEntry, energy_level: parseInt(e.target.value)})}
                  placeholder="7"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mood">Mood Score (1-10)</Label>
                <Input
                  id="mood"
                  type="number"
                  min="1"
                  max="10"
                  value={todayEntry.mood_score || ''}
                  onChange={(e) => setTodayEntry({...todayEntry, mood_score: parseInt(e.target.value)})}
                  placeholder="8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={todayEntry.notes || ''}
                onChange={(e) => setTodayEntry({...todayEntry, notes: e.target.value})}
                placeholder="How I'm feeling today, what I achieved..."
                rows={3}
              />
            </div>
            
            <Button onClick={handleSaveEntry} disabled={saving} className="w-full">
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                "Save Today's Routine"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Optimization */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Optimization</CardTitle>
            </div>
            <CardDescription>
              {entries.length >= 3 
                ? `You have ${entries.length} days of data. Run the analysis!`
                : `You need at least 3 days of data for optimization (currently: ${entries.length})`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleOptimize(false)}
                disabled={optimizing || entries.length < 3}
                variant="outline"
                className="h-auto flex-col items-start p-4"
              >
                <div className="font-bold mb-1">Basic Optimization</div>
                <div className="text-sm text-muted-foreground">2 credits</div>
                <div className="text-xs mt-2">Basic recommendations and insights</div>
              </Button>
              
              <Button
                onClick={() => handleOptimize(true)}
                disabled={optimizing || entries.length < 3}
                className="h-auto flex-col items-start p-4 bg-gradient-to-r from-primary to-purple-600"
              >
                <div className="font-bold mb-1 flex items-center gap-2">
                  Premium Optimization <Zap className="h-4 w-4" />
                </div>
                <div className="text-sm">5 credits</div>
                <div className="text-xs mt-2">Detailed analysis, advanced insights</div>
              </Button>
            </div>
            
            {optimizing && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing your routine...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Optimization Results */}
        {latestOptimization && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Your Optimization Results</h2>
              {latestOptimization.is_premium && (
                <Badge className="bg-gradient-to-r from-primary to-purple-600">Premium</Badge>
              )}
            </div>

            {/* Balance Score */}
            <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Balance Score
                  <Badge variant="outline" className="text-lg">{latestOptimization.balance_score}/100</Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Moon className="h-5 w-5" /> Sleep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{latestOptimization.sleep_recommendation}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Dumbbell className="h-5 w-5" /> Workout
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{latestOptimization.workout_recommendation}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5" /> Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{latestOptimization.work_recommendation}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" /> Social
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{latestOptimization.social_recommendation}</p>
                </CardContent>
              </Card>
            </div>

            {/* Energy Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" /> Energy Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{latestOptimization.energy_insights}</p>
              </CardContent>
            </Card>

            {/* Habit Stacking */}
            {latestOptimization.habit_stacking_suggestions && Array.isArray(latestOptimization.habit_stacking_suggestions) && latestOptimization.habit_stacking_suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" /> Habit Stacking Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {latestOptimization.habit_stacking_suggestions.map((habit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm">{habit.suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default RoutineOptimizer;