import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mic2, ArrowLeft, ThumbsUp, Clock, Users, Star, Coins } from "lucide-react";
import { useComedyCurrency } from "@/hooks/useComedy";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  onBack: () => void;
}

export const ComedyOpenMicNight = ({ onBack }: Props) => {
  const { currency, refetch } = useComedyCurrency();
  const [performances, setPerformances] = useState<any[]>([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [title, setTitle] = useState("");
  const [joke, setJoke] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    loadPerformances();
  }, []);

  const loadPerformances = async () => {
    const { data } = await (supabase as any)
      .from("comedy_open_mic")
      .select("*")
      .order("votes", { ascending: false })
      .limit(20);
    setPerformances(data || []);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !joke.trim()) { toast.error("Fill in all fields!"); return; }
    if (!currency || currency.coins < 5) { toast.error("You need 5 coins to perform!"); return; }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("comedy_currency").update({ coins: currency.coins - 5 }).eq("user_id", user.id);

      await (supabase as any).from("comedy_open_mic").insert({
        user_id: user.id,
        title,
        content: joke,
        votes: 0,
      });

      refetch();
      setTitle("");
      setJoke("");
      setShowSubmit(false);
      loadPerformances();
      toast.success("You're on stage! 🎤");
    } catch (error) {
      toast.error("Failed to submit performance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (perfId: string) => {
    if (!currency || currency.coins < 2) { toast.error("You need 2 coins to vote!"); return; }

    setVoting(perfId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("comedy_currency").update({ coins: currency.coins - 2 }).eq("user_id", user.id);

      const perf = performances.find(p => p.id === perfId);
      await (supabase as any).from("comedy_open_mic").update({ votes: (perf?.votes || 0) + 1 }).eq("id", perfId);

      refetch();
      loadPerformances();
      toast.success("Vote cast! 👍");
    } catch (error) {
      toast.error("Failed to vote");
    } finally {
      setVoting(null);
    }
  };

  const maxVotes = Math.max(...performances.map(p => p.votes || 0), 1);

  return (
    <>
      <FloatingHowItWorks title={"Comedy Open Mic Night - How it works"} steps={[{ title: 'Open', desc: 'Access the Comedy Open Mic Night section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comedy Open Mic Night.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Mic2 className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl sm:text-3xl font-black">Open Mic Night</h2>
        </div>
        <Button onClick={() => setShowSubmit(!showSubmit)} className="bg-gradient-to-r from-green-500 to-emerald-500">
          <Mic2 className="h-4 w-4 mr-2" /> Take the Stage
        </Button>
      </div>

      {showSubmit && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="p-4 sm:p-6 border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-lg">Your Performance</h3>
              <Badge variant="outline" className="text-green-500 border-green-500/30">
                <Coins className="h-3 w-3 mr-1" /> 5 Coins
              </Badge>
            </div>
            <div className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your act a title..." />
              <Textarea value={joke} onChange={(e) => setJoke(e.target.value)} placeholder="Write your comedy bit..." rows={5} />
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Perform! 🎤"}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{performances.length} Performances Tonight</span>
          <span className="mx-2">•</span>
          <Clock className="h-4 w-4" />
          <span>2 coins per vote</span>
        </div>

        {performances.map((perf, i) => (
          <motion.div
            key={perf.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {i === 0 && <Star className="h-4 w-4 text-yellow-500" />}
                    <h4 className="font-bold">{perf.title}</h4>
                    {i < 3 && <Badge variant="secondary" className="text-xs">Top {i + 1}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line line-clamp-3">{perf.content}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(perf.votes / maxVotes) * 100} className="h-2 flex-1" />
                    <span className="text-xs font-bold text-primary">{perf.votes || 0} votes</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(perf.id)}
                  disabled={voting === perf.id}
                  className="shrink-0"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Vote
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}

        {performances.length === 0 && (
          <Card className="p-8 text-center">
            <Mic2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No performances yet tonight. Be the first to take the stage!</p>
          </Card>
        )}
      </div>
    </div>
    </>
  );
};
