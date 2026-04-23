import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Loader2, CreditCard, Lock, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

export default function RewardsMysteryBadges() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [currentBadges, setCurrentBadges] = useState("");
  const [activityHistory, setActivityHistory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("rewards-ai", {
        body: { action: "mystery_badges", current_badges: currentBadges, activity_history: activityHistory, difficulty_preference: difficulty },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const mysteryEvents = [
    { emoji: "🔮", title: "Mystic Badge", status: "Active", time: "Ends in 2d 14h", rarity: "Legendary" },
    { emoji: "🌙", title: "Night Owl", status: "Active", time: "Ends in 5d", rarity: "Epic" },
    { emoji: "❄️", title: "Ice Breaker", status: "Scheduled", time: "Starts Apr 20", rarity: "Rare" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Active Mystery Events */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {mysteryEvents.map((event, i) => (
          <motion.div key={event.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-md border-purple-400/20 hover:border-purple-400/40 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/10 to-transparent" />
              <div className="text-2xl mb-2">{event.emoji}</div>
              <h4 className="font-bold text-sm">{event.title}</h4>
              <p className="text-[10px] text-purple-400 font-bold">{event.rarity}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{event.time}</p>
              <span className={`inline-block mt-2 text-[9px] px-2 py-0.5 rounded-full font-bold ${event.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                {event.status}
              </span>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-5 bg-card/90 backdrop-blur-md border-purple-400/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Mystery Badge Solver</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> 5 credits — AI decodes riddles</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input placeholder="Badges you already have" value={currentBadges} onChange={e => setCurrentBadges(e.target.value)} />
          <Textarea placeholder="Describe your recent activities & patterns" value={activityHistory} onChange={e => setActivityHistory(e.target.value)} rows={2} />
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue placeholder="Riddle difficulty preference" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy — Clear hints</SelectItem>
              <SelectItem value="medium">Medium — Cryptic clues</SelectItem>
              <SelectItem value="hard">Hard — Deep riddles</SelectItem>
              <SelectItem value="legendary">Legendary — Almost impossible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Decoding...</> : <><Eye className="h-4 w-4 mr-2" /> Decode Mystery Badges — 5 Credits</>}
        </Button>
      </Card>

      {result && (
        <Card className="p-5 bg-card/90 backdrop-blur-md border-purple-400/20">
          <h4 className="font-bold mb-3 text-purple-500">🔮 Mystery Badge Hints</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
        </Card>
      )}
    </motion.div>
  );
}
