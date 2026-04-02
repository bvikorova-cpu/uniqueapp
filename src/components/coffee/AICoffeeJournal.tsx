import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, BookOpen, Smile, Frown, Meh, Coffee, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

const MOODS = [
  { value: "energized", label: "☕ Energized", icon: Smile },
  { value: "relaxed", label: "😌 Relaxed", icon: Meh },
  { value: "focused", label: "🎯 Focused", icon: Star },
  { value: "tired", label: "😴 Tired", icon: Frown },
  { value: "social", label: "🤝 Social", icon: Smile },
];

export const AICoffeeJournal = ({ onBack }: { onBack: () => void }) => {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("");
  const [coffeeDrunk, setCoffeeDrunk] = useState("");
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: journalEntries, refetch } = useQuery({
    queryKey: ["coffee-journal"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("activity_feed")
        .select("*")
        .eq("user_id", user.id)
        .eq("activity_type", "coffee_journal")
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const handleSaveAndAnalyze = async () => {
    if (!entry.trim() || !mood) { toast.error("Please write your journal entry and select your mood"); return; }
    setLoading(true); setAiInsight("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }

      // Save journal entry
      await supabase.from("activity_feed").insert({
        user_id: user.id,
        activity_type: "coffee_journal",
        metadata: { entry, mood, coffee_drunk: coffeeDrunk, date: new Date().toISOString() },
      });

      // Get AI sentiment analysis (paid - 3 credits)
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "journal_analysis", entry, mood, coffeeDrunk }
      });
      if (error) throw error;
      setAiInsight(data?.result || "Journal saved! AI analysis unavailable.");
      setSaved(true);
      refetch();
      toast.success("Journal entry saved!");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits for AI analysis" : "Entry saved, AI analysis failed");
      setSaved(true);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-400" />
            AI Coffee Journal
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Track your daily coffee experience and get AI-powered mood & habit insights</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mood Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map(m => (
                <motion.button
                  key={m.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMood(m.value)}
                  className={`p-2 rounded-lg text-center text-xs transition-all border ${
                    mood === m.value 
                      ? "border-amber-500 bg-amber-500/20 text-amber-400" 
                      : "border-amber-500/10 bg-card hover:border-amber-500/30"
                  }`}
                >
                  {m.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Coffee Count */}
          <Select value={coffeeDrunk} onValueChange={setCoffeeDrunk}>
            <SelectTrigger><SelectValue placeholder="Cups of coffee today" /></SelectTrigger>
            <SelectContent>
              {["1 cup", "2 cups", "3 cups", "4 cups", "5+ cups"].map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Journal Entry */}
          <Textarea
            value={entry}
            onChange={e => setEntry(e.target.value)}
            placeholder="Write about your coffee experience today... What did you drink? How did it taste? Any new discoveries? What cafe did you visit?"
            rows={5}
          />

          <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-800" onClick={handleSaveAndAnalyze} disabled={loading || saved}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : saved ? "✓ Saved" : "Save & Get AI Insights"}
          </Button>

          {aiInsight && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 whitespace-pre-wrap text-sm">
              <p className="font-bold text-amber-400 mb-2">☕ AI Insight</p>
              {aiInsight}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Past Entries */}
      {journalEntries && journalEntries.length > 0 && (
        <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Coffee className="h-4 w-4 text-amber-400" />Recent Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {journalEntries.map((e: any) => (
              <div key={e.id} className="p-3 rounded-lg bg-background/50 border border-amber-500/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</span>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                    {(e.metadata as any)?.mood || "—"}
                  </span>
                </div>
                <p className="text-sm line-clamp-2">{(e.metadata as any)?.entry || ""}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
