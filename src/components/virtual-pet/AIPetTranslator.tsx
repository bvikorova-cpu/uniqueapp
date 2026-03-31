import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Languages, Loader2, Volume2, Sparkles } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const behaviors = [
  "Tail wagging rapidly", "Slow tail wag", "Ears flattened back", "Purring loudly",
  "Hissing softly", "Circling before lying down", "Pawing at door", "Head tilting",
  "Yawning repeatedly", "Rolling on back", "Staring intensely", "Chirping sounds",
  "Whimpering", "Zoomies around room", "Licking paws obsessively", "Hiding under furniture",
  "Nudging hand with nose", "Arched back", "Slow blinking", "Barking at nothing",
];

const species = ["Dog", "Cat", "Dragon", "Phoenix", "Unicorn", "Wolf", "Fox", "Rabbit", "Parrot", "Hamster"];

export const AIPetTranslator = ({ onBack }: Props) => {
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedBehavior, setSelectedBehavior] = useState("");
  const [customBehavior, setCustomBehavior] = useState("");
  const [translation, setTranslation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits, useCredit } = useAICredits();

  const handleTranslate = async () => {
    if (!selectedSpecies) return toast.error("Select a species first");
    const behavior = customBehavior || selectedBehavior;
    if (!behavior) return toast.error("Describe or select a behavior");

    const hasCredits = await useCredit("custom_generation", "Pet Translator");
    if (!hasCredits) return toast.error("Not enough credits! Purchase more to continue.");

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pet-translator", {
        body: { species: selectedSpecies, behavior },
      });
      if (error) throw error;
      setTranslation(data);
      toast.success("Translation complete!");
    } catch (e: any) {
      toast.error(e.message || "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" />Back to Dashboard</Button>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
          <Languages className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black">AI Pet Translator</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Decode your pet's behaviors and sounds into human language. Understand what your companion is really trying to tell you.
        </p>
        <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">3 Credits per translation</span>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-lg">Translate Behavior</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Pet Species</label>
            <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
              <SelectTrigger><SelectValue placeholder="Select species..." /></SelectTrigger>
              <SelectContent>{species.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Common Behaviors</label>
            <Select value={selectedBehavior} onValueChange={setSelectedBehavior}>
              <SelectTrigger><SelectValue placeholder="Select a behavior..." /></SelectTrigger>
              <SelectContent>{behaviors.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Or describe custom behavior</label>
            <Textarea value={customBehavior} onChange={e => setCustomBehavior(e.target.value)}
              placeholder="e.g. My pet keeps scratching the wall and meowing at 3am..." className="min-h-[80px]" />
          </div>

          <Button onClick={handleTranslate} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            {loading ? "Translating..." : "Translate Behavior"}
          </Button>
        </CardContent>
      </Card>

      {translation && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Translation Result</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-background/80 border border-border/40">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">💬 What Your Pet Is Saying</p>
                  <p className="text-sm font-medium">{translation.translation}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/80 border border-border/40">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">🧠 Emotional State</p>
                  <p className="text-sm">{translation.emotional_state}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/80 border border-border/40">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">🎯 Recommended Response</p>
                  <p className="text-sm">{translation.recommended_response}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/80 border border-border/40">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">📚 Fun Fact</p>
                  <p className="text-sm">{translation.fun_fact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
