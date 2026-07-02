import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Trophy, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ObserverEntry {
  id: string;
  user_id: string;
  display_name: string | null;
  observations_count: number;
  accuracy_score: number;
  streak_days: number;
  total_points: number;
}

export function ObserverLeaderboard({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<ObserverEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myEntry, setMyEntry] = useState<ObserverEntry | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("quantum_observer_leaderboard").select("*").order("total_points", { ascending: false }).limit(50);
    setEntries((data as ObserverEntry[]) || []);

    if (user) {
      const found = (data || []).find((e: any) => e.user_id === user.id);
      if (found) {
        setMyEntry(found as ObserverEntry);
      }
    }
    setLoading(false);
  };

  const claimSpot = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }

    const { error } = await supabase.from("quantum_observer_leaderboard").insert({
      user_id: user.id,
      display_name: `Observer_${user.id.slice(0, 6)}`,
      observations_count: 1,
      accuracy_score: 50,
      streak_days: 1,
      total_points: 10,
    });

    if (error?.code === "23505") {
      toast({ title: "Already on leaderboard!" });
    } else if (error) {
      toast({ title: "Error", variant: "destructive" });
    } else {
      toast({ title: "Welcome to the Leaderboard! 🏆" });
      fetchLeaderboard();
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <>
      <FloatingHowItWorks
        title='Observer Leaderboard'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Observer Leaderboard panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Eye className="h-5 w-5 text-blue-400" /> Observer Leaderboard</h2>
          <p className="text-xs text-muted-foreground">Top quantum observers ranked globally</p>
        </div>
      </div>

      {/* My stats */}
      {myEntry ? (
        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4">
          <p className="text-xs text-muted-foreground mb-2">Your Stats</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <Eye className="h-4 w-4 mx-auto text-blue-400 mb-1" />
              <p className="text-sm font-bold">{myEntry.observations_count}</p>
              <p className="text-[10px] text-muted-foreground">Observed</p>
            </div>
            <div className="text-center">
              <Target className="h-4 w-4 mx-auto text-cyan-400 mb-1" />
              <p className="text-sm font-bold">{myEntry.accuracy_score}%</p>
              <p className="text-[10px] text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center">
              <Flame className="h-4 w-4 mx-auto text-orange-400 mb-1" />
              <p className="text-sm font-bold">{myEntry.streak_days}d</p>
              <p className="text-[10px] text-muted-foreground">Streak</p>
            </div>
            <div className="text-center">
              <Trophy className="h-4 w-4 mx-auto text-amber-400 mb-1" />
              <p className="text-sm font-bold">{myEntry.total_points}</p>
              <p className="text-[10px] text-muted-foreground">Points</p>
            </div>
          </div>
        </div>
      ) : (
        <Button onClick={claimSpot} className="w-full bg-blue-600 hover:bg-blue-700">
          <Trophy className="h-4 w-4 mr-2" /> Join Observer Leaderboard
        </Button>
      )}

      {/* Rankings */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading rankings...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No observers yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`rounded-xl border p-3 flex items-center gap-3 ${
                i < 3 ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/2"
              } ${entry.user_id === myEntry?.user_id ? "ring-1 ring-blue-500/50" : ""}`}
            >
              <div className="text-lg font-bold w-8 text-center">{getRankIcon(i + 1)}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{entry.display_name || "Anonymous"}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{entry.observations_count} obs</span>
                  <span>{entry.accuracy_score}% acc</span>
                  <span>{entry.streak_days}d streak</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{entry.total_points} pts</Badge>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
