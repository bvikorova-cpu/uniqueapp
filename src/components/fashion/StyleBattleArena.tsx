import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Swords, Trophy, ThumbsUp, Plus, Clock } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const ENTRY_CREDIT_COST = 5;

export default function StyleBattleArena() {
  const queryClient = useQueryClient();
  const { credits, spendCredit } = useAICredits();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [hours, setHours] = useState("24");
  const [entryText, setEntryText] = useState("");
  const [selectedBattle, setSelectedBattle] = useState<string | null>(null);

  const { data: battles, isLoading } = useQuery({
    queryKey: ["fashion-battles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fashion_style_battles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: entries } = useQuery({
    queryKey: ["fashion-battle-entries", selectedBattle],
    queryFn: async () => {
      if (!selectedBattle) return [];
      const { data, error } = await supabase
        .from("fashion_battle_entries")
        .select("*")
        .eq("battle_id", selectedBattle)
        .order("vote_count", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBattle,
  });

  const createBattle = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const endsAt = new Date(Date.now() + parseInt(hours) * 3600000).toISOString();
      const { error } = await supabase.from("fashion_style_battles").insert({
        title, theme, ends_at: endsAt, created_by: session.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Battle created!");
      queryClient.invalidateQueries({ queryKey: ["fashion-battles"] });
      setShowCreate(false);
      setTitle("");
      setTheme("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const submitEntry = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let i = 0; i < ENTRY_CREDIT_COST; i++) {
        const ok = await spendCredit("custom_generation", "Style Battle Entry + AI Score");
        if (!ok && i === 0) throw new Error("Insufficient credits");
      }

      const battle = battles?.find(b => b.id === selectedBattle);
      const { data: scoreData, error: scoreError } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "battle-score", outfitDescription: entryText, battleTheme: battle?.theme || "" },
      });
      if (scoreError) throw scoreError;

      const { error } = await supabase.from("fashion_battle_entries").insert({
        battle_id: selectedBattle!,
        user_id: session.user.id,
        outfit_description: entryText,
        ai_score: scoreData.score?.overall_score || 0,
        ai_feedback: scoreData.score?.judge_commentary || "",
      });
      if (error) throw error;
      return scoreData.score;
    },
    onSuccess: (score) => {
      toast.success(`Entry submitted! AI Score: ${score?.overall_score || "?"}/100`);
      queryClient.invalidateQueries({ queryKey: ["fashion-battle-entries"] });
      setEntryText("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const vote = useMutation({
    mutationFn: async (entryId: string) => {
      const { data, error } = await supabase.functions.invoke("fashion-battle-vote", { body: { entryId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast.success("Vote cast!");
      queryClient.invalidateQueries({ queryKey: ["fashion-battle-entries"] });
    },
    onError: (e: any) => toast.error(e.message || "Vote failed"),
  });

  return (
    <>
      <FloatingHowItWorks title="How Style Battle Arena works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Style Battle Arena</h2>
              <p className="text-sm text-muted-foreground">Compete head-to-head in themed outfit battles • {ENTRY_CREDIT_COST} Credits/entry</p>
            </div>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> New Battle
          </Button>
        </div>

        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Battle title..." />
            <Input value={theme} onChange={e => setTheme(e.target.value)} placeholder="Theme (e.g., Y2K Revival, Monochrome, Festival)" />
            <div className="flex gap-2 items-center">
              <Input type="number" value={hours} onChange={e => setHours(e.target.value)} className="w-24" min="1" max="168" />
              <span className="text-sm text-muted-foreground">hours</span>
              <Button onClick={() => createBattle.mutate()} disabled={!title || !theme || createBattle.isPending} className="ml-auto">
                {createBattle.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Battle"}
              </Button>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {battles?.map((battle) => (
              <Card
                key={battle.id}
                className={`p-4 cursor-pointer transition-all hover:border-primary/40 ${selectedBattle === battle.id ? "border-primary bg-primary/5" : "bg-card/60 border-white/10"}`}
                onClick={() => setSelectedBattle(battle.id)}
              >
                <h4 className="font-bold text-sm">{battle.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">Theme: {battle.theme}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(battle.ends_at) > new Date()
                    ? `Ends ${formatDistanceToNow(new Date(battle.ends_at), { addSuffix: true })}`
                    : "Ended"}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {selectedBattle && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
          <h3 className="text-lg font-bold mb-4">Submit Your Entry</h3>
          <div className="space-y-3">
            <Textarea
              value={entryText}
              onChange={e => setEntryText(e.target.value)}
              placeholder="Describe your outfit in detail: colors, fabrics, accessories, shoes..."
              rows={3}
            />
            <Button
              onClick={() => submitEntry.mutate()}
              disabled={!entryText.trim() || submitEntry.isPending || (credits?.credits_remaining || 0) < ENTRY_CREDIT_COST}
              className="w-full gap-2"
            >
              {submitEntry.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> AI Scoring...</> : <><Swords className="h-4 w-4" /> Submit & Get AI Score ({ENTRY_CREDIT_COST} Credits)</>}
            </Button>
          </div>

          {entries && entries.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-bold">Leaderboard</h4>
              {entries.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 bg-card/60 border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {i === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                          <span className="font-bold text-sm">#{i + 1}</span>
                          {entry.ai_score && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">AI: {Number(entry.ai_score)}/100</span>}
                        </div>
                        <p className="text-sm line-clamp-2">{entry.outfit_description}</p>
                        {entry.ai_feedback && <p className="text-xs text-muted-foreground mt-1 italic">"{entry.ai_feedback}"</p>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => vote.mutate(entry.id)} className="gap-1 shrink-0">
                        <ThumbsUp className="h-3 w-3" />
                        {entry.vote_count || 0}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
    </>
    );
}
