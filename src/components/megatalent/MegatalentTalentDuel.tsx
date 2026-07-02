import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Crown, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  category?: string;
  categories?: string[];
}

interface Contender {
  id: string;
  user_id: string;
  title: string;
  media_url: string;
  media_type: string;
  votes_count: number;
}

export default function MegatalentTalentDuel({ category, categories }: Props) {
  const [pair, setPair] = useState<[Contender, Contender] | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const loadDuel = async () => {
    setLoading(true);
    setWinnerId(null);
    try {
      const cats = categories?.length ? categories : category ? [category] : null;
      const { data, error } = await supabase.rpc("mt_get_duel_pair", {
        _categories: cats as any,
      });
      if (error) throw error;
      const rows = (data || []) as Contender[];
      if (rows.length < 2) {
        setPair(null);
      } else {
        setPair([rows[0], rows[1]]);
      }
    } catch (e) {
      console.error("Duel load", e);
      setPair(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDuel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, categories?.join(",")]);

  const voteFor = async (c: Contender) => {
    if (voting || winnerId) return;
    setVoting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sign in to vote");
        return;
      }
      const { error } = await supabase
        .from("talent_votes")
        .insert({ submission_id: c.id, user_id: user.id, vote_type: "like" });
      if (error && !String(error.message).includes("duplicate")) throw error;
      setWinnerId(c.id);
      toast.success(`You voted for "${c.title}"!`);
    } catch (e: any) {
      toast.error(e.message || "Vote failed");
    } finally {
      setVoting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Talent Duel - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Talent Duel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Talent Duel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="backdrop-blur-xl bg-gradient-to-br from-card/90 to-card/60 border-accent/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Swords className="h-5 w-5 text-accent" />
          Daily Talent Duel
          <Badge variant="secondary" className="ml-auto text-[10px]">1v1</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={loadDuel}
            disabled={loading || voting}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
          </div>
        ) : !pair ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Not enough talents yet for a duel.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {pair.map((c) => {
              const isWinner = winnerId === c.id;
              const isLoser = winnerId && winnerId !== c.id;
              return (
                <motion.button
                  key={c.id}
                  whileHover={!winnerId ? { scale: 1.03 } : {}}
                  whileTap={!winnerId ? { scale: 0.97 } : {}}
                  onClick={() => voteFor(c)}
                  disabled={!!winnerId || voting}
                  className={`relative overflow-hidden rounded-xl border transition-all text-left ${
                    isWinner
                      ? "border-accent ring-2 ring-accent shadow-lg shadow-accent/30"
                      : isLoser
                      ? "border-border/30 opacity-50"
                      : "border-border/30 hover:border-accent/50"
                  }`}
                >
                  {c.media_type === "video" ? (
                    <video src={c.media_url} className="w-full aspect-square object-cover" muted />
                  ) : (
                    <img src={c.media_url} alt={c.title} className="w-full aspect-square object-cover" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs font-semibold text-white truncate">{c.title}</p>
                    <p className="text-[10px] text-white/70">{c.votes_count} votes</p>
                  </div>
                  <AnimatePresence>
                    {isWinner && (
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute top-2 right-2 bg-accent rounded-full p-1.5"
                      >
                        <Crown className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        )}
        {winnerId && (
          <Button onClick={loadDuel} variant="outline" size="sm" className="w-full mt-3">
            Next Duel
          </Button>
        )}
      </CardContent>
    </Card>
    </>
  );
}
