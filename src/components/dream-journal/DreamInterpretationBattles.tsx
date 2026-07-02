import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Swords, ArrowLeft, ThumbsUp, ThumbsDown, Send, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface DreamInterpretationBattlesProps {
  onBack: () => void;
}

interface BattleDream {
  id: string;
  dream_text: string;
  user_id: string;
  created_at: string;
  interpretations: BattleInterpretation[];
}

interface BattleInterpretation {
  id: string;
  interpretation_text: string;
  user_id: string;
  votes: number;
  created_at: string;
}

const DreamInterpretationBattles = ({ onBack }: DreamInterpretationBattlesProps) => {
  const [newDream, setNewDream] = useState("");
  const [interpretationTexts, setInterpretationTexts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: battles = [], isLoading } = useQuery({
    queryKey: ["dream-battles"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data: dreams, error } = await supabase
        .from("dream_battle_dreams" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const dreamsWithInterpretations = await Promise.all(
        (dreams || []).map(async (dream: any) => {
          const { data: interps } = await supabase
            .from("dream_battle_interpretations" as any)
            .select("*")
            .eq("dream_id", dream.id)
            .order("votes", { ascending: false });
          return { ...dream, interpretations: interps || [] };
        })
      );

      return dreamsWithInterpretations as BattleDream[];
    },
  });

  const submitDream = async () => {
    if (!newDream.trim()) {
      toast.error("Please describe your dream");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("dream_battle_dreams" as any)
        .insert({ dream_text: newDream, user_id: session.user.id });

      if (error) throw error;
      setNewDream("");
      queryClient.invalidateQueries({ queryKey: ["dream-battles"] });
      toast.success("Dream submitted for interpretation battle!");
    } catch (err: any) {
      toast.error(err.message || "Error submitting dream");
    } finally {
      setSubmitting(false);
    }
  };

  const submitInterpretation = async (dreamId: string) => {
    const text = interpretationTexts[dreamId];
    if (!text?.trim()) {
      toast.error("Write your interpretation first");
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("dream_battle_interpretations" as any)
        .insert({ dream_id: dreamId, interpretation_text: text, user_id: session.user.id, votes: 0 });

      if (error) throw error;
      setInterpretationTexts(prev => ({ ...prev, [dreamId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["dream-battles"] });
      toast.success("Interpretation submitted!");
    } catch (err: any) {
      toast.error(err.message || "Error submitting");
    }
  };

  const voteInterpretation = async (interpId: string, _currentVotes: number) => {
    try {
      const { data, error } = await supabase.functions.invoke("dream-battle-vote", {
        body: { interpretationId: interpId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      queryClient.invalidateQueries({ queryKey: ["dream-battles"] });
    } catch (err: any) {
      toast.error(err.message || "Error voting");
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Dream Interpretation Battles'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Dream Interpretation Battles panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              Dream Interpretation Battles
              <span className="text-xs font-normal text-muted-foreground ml-auto">Free</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share a dream and let the community compete to provide the best interpretation. Vote for the most insightful analyses!
            </p>
            <Textarea
              value={newDream}
              onChange={(e) => setNewDream(e.target.value)}
              placeholder="Share a mysterious dream for others to interpret..."
              className="min-h-[80px] bg-background/50"
            />
            <Button onClick={submitDream} disabled={submitting} className="w-full gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Dream for Battle
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {battles.map((battle, i) => (
        <motion.div key={battle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-border/50">
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm font-medium italic">"{battle.dream_text}"</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(battle.created_at).toLocaleDateString()} • {battle.interpretations.length} interpretations
              </p>

              {battle.interpretations.map((interp, j) => (
                <div key={interp.id} className="flex items-start gap-2 p-2 rounded-lg bg-background/30 border border-border/20">
                  {j === 0 && <Crown className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />}
                  <p className="text-xs flex-1">{interp.interpretation_text}</p>
                  <Button size="sm" variant="ghost" className="h-6 px-2 gap-1 text-xs"
                    onClick={() => voteInterpretation(interp.id, interp.votes)}>
                    <ThumbsUp className="h-3 w-3" /> {interp.votes}
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Textarea
                  value={interpretationTexts[battle.id] || ""}
                  onChange={(e) => setInterpretationTexts(prev => ({ ...prev, [battle.id]: e.target.value }))}
                  placeholder="Your interpretation..."
                  className="min-h-[50px] text-xs bg-background/50"
                />
                <Button size="sm" onClick={() => submitInterpretation(battle.id)} className="self-end">
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {!isLoading && battles.length === 0 && (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <Swords className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No dream battles yet. Be the first to submit a dream!</p>
        </Card>
      )}
    </div>
    </>
  );
};

export default DreamInterpretationBattles;
