import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Loader2, Smile, Heart, Brain, Lightbulb, MessageCircle, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const moodPresets = [
  { label: "Happy", emoji: "😊", value: "happy and cheerful" },
  { label: "Stressed", emoji: "😰", value: "stressed and overwhelmed" },
  { label: "Lonely", emoji: "😔", value: "lonely and want company" },
  { label: "Motivated", emoji: "💪", value: "motivated and energetic" },
  { label: "Anxious", emoji: "😟", value: "anxious and worried" },
  { label: "Creative", emoji: "🎨", value: "creative and inspired" },
  { label: "Sad", emoji: "😢", value: "sad and need comfort" },
  { label: "Curious", emoji: "🤔", value: "curious and want to learn" },
];

export const MoodMatcher = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mood, setMood] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeMood = async () => {
    const moodText = customMood || mood;
    if (!moodText) {
      toast({ title: "Select a mood", description: "Choose a preset or describe how you feel", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("companion-ai", {
        body: { action: "mood-matcher", mood: moodText },
      });
      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to analyze mood", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const startChatWithRecommended = async (characterName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: chars } = await supabase.from("ai_characters").select("id").eq("name", characterName).single();
      if (!chars) { toast({ title: "Character not found", variant: "destructive" }); return; }

      const { data: convo, error } = await supabase
        .from("character_conversations")
        .insert({ user_id: user.id, character_id: chars.id })
        .select().single();

      if (error) throw error;
      navigate(`/companions/${convo.id}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Mood Matcher"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Mood Matcher
          </h1>
          <p className="text-muted-foreground mt-2">Tell us how you feel — AI will recommend the perfect companion</p>
          <Badge variant="outline" className="mt-2">3 Credits per analysis</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg">How are you feeling?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {moodPresets.map((preset) => (
              <Button
                key={preset.label}
                variant={mood === preset.value ? "default" : "outline"}
                onClick={() => { setMood(preset.value); setCustomMood(""); }}
                className="flex flex-col h-auto py-3 text-xs"
              >
                <span className="text-xl mb-1">{preset.emoji}</span>
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="text-center text-muted-foreground text-sm">— or describe your mood —</div>

          <Textarea
            value={customMood}
            onChange={(e) => { setCustomMood(e.target.value); setMood(""); }}
            placeholder="I'm feeling overwhelmed with work and need someone to help me relax..."
            rows={3}
          />

          <Button onClick={analyzeMood} disabled={loading} className="w-full" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Find My Companion</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-1">{result.recommended_companion}</h3>
                <p className="text-muted-foreground text-sm">{result.reason}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Conversation Starters:</h4>
                {result.conversation_starters?.map((starter: string, i: number) => (
                  <div key={i} className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    "{starter}"
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Mood Insight:</h4>
                <p className="text-sm text-muted-foreground">{result.mood_insight}</p>
              </div>

              <Button onClick={() => startChatWithRecommended(result.recommended_companion)} className="w-full" size="lg">
                <MessageCircle className="h-4 w-4 mr-2" /> Chat with {result.recommended_companion}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
