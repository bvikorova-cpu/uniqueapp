import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Row {
  rank: number;
  user_id: string;
  name: string;
  pet: string;
  score: number;
  badge: string;
}

const badgeFor = (rank: number) => {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "⭐";
};

export default function PetLeaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("pet_game_scores")
        .select("user_id, pet_id, score")
        .order("score", { ascending: false })
        .limit(200);

      // Aggregate top score per user
      const grouped = new Map<string, { score: number; pet_id: string | null }>();
      (data || []).forEach((r: any) => {
        const cur = grouped.get(r.user_id);
        if (!cur || (Number(r.score) || 0) > cur.score) {
          grouped.set(r.user_id, { score: Number(r.score) || 0, pet_id: r.pet_id });
        }
      });

      const top = Array.from(grouped.entries())
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 8);
      const userIds = top.map(([id]) => id);
      const petIds = top.map(([, v]) => v.pet_id).filter(Boolean) as string[];

      const [{ data: profs }, { data: pets }] = await Promise.all([
        userIds.length
          ? (supabase as any).from("profiles_public").select("id, full_name").in("id", userIds)
          : Promise.resolve({ data: [] as any[] }),
        petIds.length
          ? supabase.from("pets").select("id, name, breed, species").in("id", petIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);
      const pmap = new Map<string, any>((profs || []).map((p: any) => [p.id, p.full_name]));
      const petMap = new Map<string, any>((pets || []).map((p: any) => [p.id, p]));

      const final: Row[] = top.map(([uid, v], i) => {
        const pet = v.pet_id ? petMap.get(v.pet_id) : null;
        return {
          rank: i + 1,
          user_id: uid,
          name: pmap.get(uid) || "User",
          pet: pet ? `${pet.name}${pet.breed ? ` (${pet.breed})` : ""}` : "—",
          score: v.score,
          badge: badgeFor(i + 1),
        };
      });

      if (!cancelled) {
        setRows(final);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <FloatingHowItWorks title="How Pet Leaderboard works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🏆 Pet Leaderboard</h2>
      <Card className="bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-purple-400" />
            <p className="text-sm font-bold">Top Pet Owners</p>
            <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
              <Sparkles className="h-3 w-3 mr-1" /> Live
            </Badge>
          </div>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              No pet scores yet — play a game with your pet to be first!
            </p>
          ) : (
            <div className="space-y-2">
              {rows.map((entry, i) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.rank <= 3
                      ? "bg-purple-500/10 border border-purple-500/20"
                      : "bg-card/50"
                  }`}
                >
                  <span className="text-lg w-8 text-center">{entry.badge}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{entry.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{entry.pet}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm">{entry.score.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
