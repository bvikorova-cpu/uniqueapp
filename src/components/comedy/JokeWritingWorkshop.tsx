import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PenTool, ArrowLeft, Sparkles, Coins, Lightbulb, MessageSquare } from "lucide-react";
import { useComedyCurrency } from "@/hooks/useComedy";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  onBack: () => void;
}

export const JokeWritingWorkshop = ({ onBack }: Props) => {
  const { currency, refetch } = useComedyCurrency();
  const [joke, setJoke] = useState("");
  const [style, setStyle] = useState("observational");
  const [feedback, setFeedback] = useState<any>(null);
  const [generatedJoke, setGeneratedJoke] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGetFeedback = async () => {
    if (!joke.trim()) { toast.error("Write a joke first!"); return; }
    if (!currency || currency.coins < 10) { toast.error("You need 10 coins!"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("comedy_currency").update({ coins: currency.coins - 10 }).eq("user_id", user.id);

      const { data, error } = await supabase.functions.invoke("comedy-ai-judge", {
        body: { type: "workshop_feedback", content: joke, style },
      });
      if (error) throw error;

      setFeedback(data);
      refetch();
      toast.success("AI Coach feedback ready!");
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to get feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJoke = async () => {
    if (!currency || currency.coins < 10) { toast.error("You need 10 coins!"); return; }

    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("comedy_currency").update({ coins: currency.coins - 10 }).eq("user_id", user.id);

      const { data, error } = await supabase.functions.invoke("comedy-ai-judge", {
        body: { type: "generate_joke", style },
      });
      if (error) throw error;

      setGeneratedJoke(data.joke);
      refetch();
      toast.success("Fresh joke generated!");
    } catch (error) {
      toast.error("Failed to generate joke");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Joke Writing Workshop - How it works"} steps={[{ title: 'Open', desc: 'Access the Joke Writing Workshop section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Joke Writing Workshop.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <PenTool className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl sm:text-3xl font-black">Joke Writing Workshop</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Write & Get Feedback */}
        <Card className="p-4 sm:p-6 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-black">Get AI Coach Feedback</h3>
            <Badge variant="outline" className="ml-auto text-blue-500 border-blue-500/30">
              <Coins className="h-3 w-3 mr-1" /> 10 Coins
            </Badge>
          </div>

          <div className="space-y-3">
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="observational">Observational</SelectItem>
                <SelectItem value="dark">Dark Humor</SelectItem>
                <SelectItem value="pun">Puns & Wordplay</SelectItem>
                <SelectItem value="deadpan">Deadpan</SelectItem>
                <SelectItem value="absurd">Absurdist</SelectItem>
                <SelectItem value="self-deprecating">Self-Deprecating</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              value={joke}
              onChange={(e) => setJoke(e.target.value)}
              placeholder="Write your joke here... Setup and punchline!"
              rows={5}
            />

            <Button onClick={handleGetFeedback} disabled={loading} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              {loading ? "Analyzing..." : "Get AI Feedback"}
            </Button>
          </div>

          {feedback && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-background/50 rounded text-center">
                  <p className="text-lg font-black text-blue-500">{feedback.timing || 0}/10</p>
                  <p className="text-xs text-muted-foreground">Timing</p>
                </div>
                <div className="p-2 bg-background/50 rounded text-center">
                  <p className="text-lg font-black text-purple-500">{feedback.originality || 0}/10</p>
                  <p className="text-xs text-muted-foreground">Originality</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{feedback.analysis}</p>
              {feedback.improved_version && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs font-medium text-green-500 mb-1">💡 Improved Version:</p>
                  <p className="text-sm">{feedback.improved_version}</p>
                </div>
              )}
            </motion.div>
          )}
        </Card>

        {/* AI Joke Generator */}
        <Card className="p-4 sm:p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-black">AI Joke Generator</h3>
            <Badge variant="outline" className="ml-auto text-purple-500 border-purple-500/30">
              <Coins className="h-3 w-3 mr-1" /> 10 Coins
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Need inspiration? Let AI generate a fresh joke in your chosen comedy style. Use it as a starting point or study the structure.
          </p>

          <Button onClick={handleGenerateJoke} disabled={generating} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Sparkles className="h-4 w-4 mr-2" />
            {generating ? "Writing..." : "Generate Fresh Joke ✨"}
          </Button>

          {generatedJoke && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-background/50 rounded-lg border"
            >
              <p className="text-sm whitespace-pre-line">{generatedJoke}</p>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
    </>
  );
};
