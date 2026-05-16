import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Item = { id: string; category: string; title: string; ended_at: string | null; rank: "champion" | "finalist" | "semifinalist" };

const RANK_META = {
  champion: { icon: Crown, color: "text-yellow-500", bg: "from-yellow-500/20 to-amber-500/10", label: "Champion" },
  finalist: { icon: Medal, color: "text-slate-300", bg: "from-slate-300/20 to-slate-500/10", label: "Finalist" },
  semifinalist: { icon: Award, color: "text-orange-400", bg: "from-orange-400/20 to-amber-700/10", label: "Semi-finalist" },
};

const MegatalentTrophyCase = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: parts } = await supabase
        .from("battle_royale_participants")
        .select("id, tournament_id, eliminated_round")
        .eq("user_id", userId);
      if (!parts?.length) return;

      const tIds = [...new Set(parts.map((p: any) => p.tournament_id))];
      const { data: tours } = await supabase
        .from("battle_royale_tournaments")
        .select("id, category, status, ends_at, champion_participant_id, current_round")
        .in("id", tIds);

      const out: Item[] = [];
      (tours || []).forEach((t: any) => {
        const mine = parts.find((p: any) => p.tournament_id === t.id) as any;
        if (!mine) return;
        let rank: Item["rank"] | null = null;
        if (t.champion_participant_id === mine.id) rank = "champion";
        else if (t.status === "completed" && mine.eliminated_round === t.current_round) rank = "finalist";
        else if (mine.eliminated_round && t.current_round - mine.eliminated_round <= 1 && t.status === "completed") rank = "semifinalist";
        if (rank) out.push({ id: t.id, category: t.category, title: `${t.category} Battle Royale`, ended_at: t.ends_at, rank });
      });
      setItems(out);
    };
    load();
  }, [userId]);

  if (!items.length) return null;

  return (
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
              <motion.div key={it.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`rounded-xl p-3 bg-gradient-to-br ${meta.bg} border border-border/40 text-center`}>
                <Icon className={`h-8 w-8 mx-auto mb-1 ${meta.color}`} />
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{meta.label}</div>
                <div className="text-xs font-bold truncate">{it.category}</div>
                {it.ended_at && <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(it.ended_at).toLocaleDateString()}</div>}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MegatalentTrophyCase;
