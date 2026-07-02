import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Brain, Calendar, Clock, TrendingUp, Sparkles, Loader2, Zap, Target } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AIContentPlannerProps {
  onBack: () => void;
}

const TRENDING_TOPICS = [
  { topic: "AI in everyday life", category: "Technology", heat: 95 },
  { topic: "Morning routines that work", category: "Lifestyle", heat: 88 },
  { topic: "Street style summer 2026", category: "Fashion", heat: 92 },
  { topic: "Home workout challenges", category: "Fitness", heat: 85 },
  { topic: "Budget travel hacks", category: "Travel", heat: 78 },
  { topic: "Plant-based recipes", category: "Food", heat: 82 },
  { topic: "Gaming setup tours", category: "Gaming", heat: 90 },
  { topic: "Mental health awareness", category: "Education", heat: 87 },
];

const OPTIMAL_TIMES = [
  { day: "Monday", time: "8:00 AM", engagement: "High" },
  { day: "Tuesday", time: "12:00 PM", engagement: "Very High" },
  { day: "Wednesday", time: "6:00 PM", engagement: "Peak" },
  { day: "Thursday", time: "9:00 AM", engagement: "High" },
  { day: "Friday", time: "3:00 PM", engagement: "Very High" },
  { day: "Saturday", time: "11:00 AM", engagement: "Peak" },
  { day: "Sunday", time: "7:00 PM", engagement: "High" },
];

const AIContentPlanner = ({ onBack }: AIContentPlannerProps) => {
  const { toast } = useToast();
  const [niche, setNiche] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: credits } = useQuery({
    queryKey: ["ai-credits-influking"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const generatePlan = async () => {
    if (!niche.trim()) {
      toast({ title: "Enter your niche", description: "Describe your content niche to get AI suggestions", variant: "destructive" });
      return;
    }

    if (!credits || credits.credits_remaining < 5) {
      toast({ title: "Insufficient Credits", description: "You need 5 AI credits. Purchase more to continue.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Deduct credits
      await supabase.rpc("deduct_ai_credits" as any, { p_user_id: user.id, p_amount: 5 });

      // Generate content plan based on niche
      const weekPlan = generateWeeklyPlan(niche);
      setGeneratedPlan(weekPlan);

      await supabase.from("ai_usage_history").insert({
        user_id: user.id,
        usage_type: "content_planner",
        credits_used: 5,
        description: `Content plan generated for niche: ${niche}`,
      });

      toast({ title: "✅ Plan Generated!", description: "Your 7-day content plan is ready (5 credits used)" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWeeklyPlan = (nicheInput: string): string => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const contentTypes = ["Photo Carousel", "Short Video (Reel)", "Story Series", "Live Q&A", "Behind-the-Scenes", "Tutorial Post", "Collab Post"];
    const hooks = [
      `"Did you know this about ${nicheInput}?"`,
      `"3 mistakes everyone makes in ${nicheInput}"`,
      `"My honest take on ${nicheInput} trends"`,
      `"Transform your ${nicheInput} game in 60 seconds"`,
      `"The truth about ${nicheInput} nobody talks about"`,
      `"Day in the life: ${nicheInput} edition"`,
      `"Weekend ${nicheInput} challenge — who's in?"`,
    ];

    return days.map((day, i) => 
      `📅 ${day}\n   Type: ${contentTypes[i]}\n   Hook: ${hooks[i]}\n   Best time: ${OPTIMAL_TIMES[i].time}\n   Expected engagement: ${OPTIMAL_TIMES[i].engagement}`
    ).join("\n\n");
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Content Planner - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Content Planner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Content Planner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Content Planner</h2>
            <p className="text-muted-foreground">Smart content calendar powered by AI — 5 credits per plan</p>
          </div>
          <Badge className="ml-auto bg-primary/20 text-primary border-primary/30">
            <Zap className="h-3 w-3 mr-1" /> {credits?.credits_remaining || 0} Credits
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generate Weekly Content Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Describe your niche & audience</label>
                <Textarea
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Fitness for busy professionals, vegan cooking for beginners, tech reviews for gamers..."
                  rows={3}
                />
              </div>
              <Button onClick={generatePlan} disabled={isGenerating} className="w-full gap-2">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {isGenerating ? "Generating Plan..." : "Generate 7-Day Plan (5 Credits)"}
              </Button>

              {generatedPlan && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 bg-muted/50 rounded-lg border border-primary/10">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> Your 7-Day Content Plan
                  </h4>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">{generatedPlan}</pre>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending Topics Sidebar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TRENDING_TOPICS.map((topic, i) => (
                <motion.div key={topic.topic} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setNiche(topic.topic)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{topic.topic}</p>
                    <Badge variant="secondary" className="text-[10px] mt-1">{topic.category}</Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Target className="h-3 w-3 text-red-500" />
                    <span className="text-xs font-bold text-red-500">{topic.heat}%</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Optimal Posting Times */}
          <Card className="backdrop-blur-xl bg-card/80 border-primary/10 mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-cyan-500" />
                Best Posting Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {OPTIMAL_TIMES.map((slot) => (
                <div key={slot.day} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{slot.day}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{slot.time}</span>
                    <Badge variant={slot.engagement === "Peak" ? "default" : "secondary"} className="text-[10px]">
                      {slot.engagement}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default AIContentPlanner;
