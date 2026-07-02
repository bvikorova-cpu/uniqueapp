import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Item = {
  tournamentId: string;
  category: string;
  endedAt: string | null;
  rank: "champion" | "finalist" | "semifinalist";
};

const RANK_META = {
  champion: { icon: Crown, color: "text-yellow-500", bg: "from-yellow-500/20 to-amber-500/10", label: "Champion" },
  finalist: { icon: Medal, color: "text-slate-300", bg: "from-slate-300/20 to-slate-500/10", label: "Finalist" },
  semifinalist: { icon: Award, color: "text-orange-400", bg: "from-orange-400/20 to-amber-700/10", label: "Semi-finalist" },
};

const MegatalentTrophyCase = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // 1. My participations
      const { data: parts } = await supabase
        .from("battle_royale_participants")
        .select("id, tournament_id, eliminated_round")
        .eq("user_id", userId);

      if (!parts?.length) { setItems([]); setLoading(false); return; }

      const tIds = [...new Set(parts.map((p: any) => p.tournament_id))];
      // 2. Only completed tournaments
      const { data: tours } = await supabase
        .from("battle_royale_tournaments")
        .select("id, category, status, ends_at, champion_participant_id")
        .in("id", tIds)
        .eq("status", "completed");

      if (!tours?.length) { setItems([]); setLoading(false); return; }

      // 3. Max round per tournament (= final round)
      const { data: maxRounds } = await supabase
        .from("battle_royale_matches")
        .select("tournament_id, round")
        .in("tournament_id", tours.map((t: any) => t.id));

      const finalRoundByTour: Record<string, number> = {};
      (maxRounds || []).forEach((m: any) => {
        finalRoundByTour[m.tournament_id] = Math.max(finalRoundByTour[m.tournament_id] || 0, m.round);
      });

      const out: Item[] = [];
      tours.forEach((t: any) => {
        const mine = parts.find((p: any) => p.tournament_id === t.id) as any;
        if (!mine) return;
        const finalRound = finalRoundByTour[t.id] || 0;
        let rank: Item["rank"] | null = null;
        if (t.champion_participant_id === mine.id) rank = "champion";
        else if (mine.eliminated_round === finalRound) rank = "finalist";
        else if (finalRound >= 2 && mine.eliminated_round === finalRound - 1) rank = "semifinalist";
        if (rank) out.push({ tournamentId: t.id, category: t.category, endedAt: t.ends_at, rank });
      });

      out.sort((a, b) => new Date(b.endedAt || 0).getTime() - new Date(a.endedAt || 0).getTime());
      setItems(out);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) return (
    <Card><CardContent className="p-5 flex items-center gap-2 text-muted-foreground text-sm">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading trophies…
    </CardContent></Card>
  );
  if (!items.length) return null;

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Trophy Case - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Trophy Case section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Trophy Case.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-bold">Trophy Case</h3>
          <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((it, i) => {
            const meta = RANK_META[it.rank];
            const Icon = meta.icon;
            return (
              <motion.div key={it.tournamentId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`rounded-xl p-3 bg-gradient-to-br ${meta.bg} border border-border/40 text-center`}>
                <Icon className={`h-8 w-8 mx-auto mb-1 ${meta.color}`} />
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{meta.label}</div>
                <div className="text-xs font-bold truncate">{it.category}</div>
                {it.endedAt && <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(it.endedAt).toLocaleDateString()}</div>}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default MegatalentTrophyCase;
