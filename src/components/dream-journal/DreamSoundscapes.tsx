import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { Loader2, Volume2, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface DreamSoundscapesProps {
  onBack: () => void;
}

const DreamSoundscapes = ({ onBack }: DreamSoundscapesProps) => {
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [dreamTheme, setDreamTheme] = useState("");
  const [mood, setMood] = useState("calm");
  const [result, setResult] = useState<string | null>(null);

  const moods = [
    { value: "calm", label: "Calm & Peaceful" },
    { value: "mysterious", label: "Mysterious & Ethereal" },
    { value: "adventurous", label: "Adventurous & Epic" },
    { value: "dark", label: "Dark & Intense" },
    { value: "romantic", label: "Romantic & Dreamy" },
    { value: "cosmic", label: "Cosmic & Transcendent" },
  ];

  const handleGenerate = async () => {
    if (!dreamTheme.trim()) {
      toast.error("Please describe your dream theme");
      return;
    }
    if ((credits?.credits_remaining || 0) < 2) {
      toast.error("Insufficient credits (2 required). Please purchase more.");
      return;
    }
    setLoading(true);
    try {
      const used = await spendCredit("effect", "Dream Soundscape Generation");
      if (!used) throw new Error("Failed to use credits");

      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("dream-ai", {
        body: { action: "soundscapes", dreamTheme, mood },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      setResult(data.soundscape);
      toast.success("Soundscape guide created!");
    } catch (err: any) {
      toast.error(err.message || "Error generating soundscape");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Dream Soundscapes
              <span className="text-xs font-normal text-muted-foreground ml-auto">2 Credits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Describe your dream and AI will create a personalized ambient soundscape recipe — complete with layered audio recommendations, binaural beat frequencies, and guided meditation scripts to recreate the dream atmosphere.
            </p>

            <div>
              <label className="text-sm font-medium mb-2 block">Dream Theme / Scene</label>
              <Textarea
                value={dreamTheme}
                onChange={(e) => setDreamTheme(e.target.value)}
                placeholder="Flying over an endless crystal forest at twilight, with distant waterfalls echoing..."
                className="min-h-[100px] bg-background/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Desired Mood</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moods.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Composing Soundscape..." : "Generate Soundscape Guide (2 Credits)"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">🔊 Your Dream Soundscape</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DreamSoundscapes;
