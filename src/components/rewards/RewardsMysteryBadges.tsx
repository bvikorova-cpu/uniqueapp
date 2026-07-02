import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Loader2, CreditCard, Eye, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

interface MysteryEvent {
  id: string;
  emoji: string;
  title: string;
  description: string;
  rarity: string;
  status: string;
  active_until: string;
  reward_xp: number;
}

export default function RewardsMysteryBadges() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [currentBadges, setCurrentBadges] = useState("");
  const [activityHistory, setActivityHistory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [events, setEvents] = useState<MysteryEvent[]>([]);
  const { toast } = useToast();

  // Load real mystery events + saved AI history
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const eventsRes = await supabase
        .from("mystery_badge_events")
        .select("*")
        .eq("status", "active")
        .gt("active_until", new Date().toISOString())
        .order("active_until", { ascending: true })
        .limit(3);
      if (eventsRes.data) setEvents(eventsRes.data as MysteryEvent[]);

      if (!user) return;
      const historyRes = await supabase
        .from("rewards_ai_history")
        .select("result, input")
        .eq("user_id", user.id)
        .eq("action", "mystery_badges")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (historyRes.data) {
        setResult(historyRes.data.result);
        setHistoryLoaded(true);
        const inp: any = historyRes.data.input || {};
        if (inp.current_badges) setCurrentBadges(inp.current_badges);
        if (inp.activity_history) setActivityHistory(inp.activity_history);
        if (inp.difficulty_preference) setDifficulty(inp.difficulty_preference);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setHistoryLoaded(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in");
      // Pass real active events into AI context so hints map to real badges
      const realEvents = events.map(e => `${e.emoji} ${e.title} (${e.rarity}, ${e.reward_xp} XP)`).join(", ");
      const { data, error } = await supabase.functions.invoke("rewards-ai", {
        body: {
          action: "mystery_badges",
          current_badges: currentBadges,
          activity_history: `${activityHistory}\n\nACTIVE MYSTERY EVENTS: ${realEvents || "none"}`,
          difficulty_preference: difficulty,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast({ title: "Saved", description: "Hints saved — view them again anytime free." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fmtDaysLeft = (until: string) => {
    const d = Math.max(0, Math.ceil((new Date(until).getTime() - Date.now()) / 86400000));
    return `${d}d left`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex justify-end"><HowItWorksButton variant="compact" title="Mystery Badges" intro="Solve limited-time riddles to earn exclusive hidden badges." steps={[
        { title: "New riddle appears", desc: "When an event is live, a mystery card shows a clue. Only the clue is visible — the badge is hidden." },
        { title: "Submit your guess", desc: "Type your answer in the input. You get a limited number of attempts per event." },
        { title: "Reveal the badge", desc: "A correct answer unlocks the badge in your collection and awards bonus XP." },
        { title: "Missed it?", desc: "Once the event ends the badge is gone forever — check back regularly for new mysteries." },
      ]} /></div>
      {/* Real active mystery events from DB */}
      {events.length === 0 ? (
        <Card className="p-4 bg-card/80 backdrop-blur-md border-purple-400/20 text-center">
          <HelpCircle className="h-6 w-6 mx-auto mb-1 text-purple-400/60" />
          <p className="text-sm font-bold">No active mystery events</p>
          <p className="text-[10px] text-muted-foreground">New events drop on the 1st of each month.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-4 bg-card/80 backdrop-blur-md border-purple-400/20 hover:border-purple-400/40 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/10 to-transparent" />
                <div className="text-2xl mb-2">{event.emoji}</div>
                <h4 className="font-bold text-sm">{event.title}</h4>
                <p className="text-[10px] text-purple-400 font-bold uppercase">{event.rarity} • {event.reward_xp} XP</p>
                <p className="text-[10px] text-muted-foreground mt-1">{event.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{fmtDaysLeft(event.active_until)}</p>
                <span className="inline-block mt-2 text-[9px] px-2 py-0.5 rounded-full font-bold bg-green-500/20 text-green-400">Active</span>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="p-5 bg-card/90 backdrop-blur-md border-purple-400/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Mystery Badge Solver</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> 5 credits — AI decodes the active events above</p>
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
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-purple-500">🔮 Mystery Badge Hints</h4>
            {historyLoaded && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><History className="h-3 w-3" /> Saved (free)</span>
            )}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
        </Card>
      )}
    </motion.div>
  );
}
