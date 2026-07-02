import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface PayoutRow {
  competition_id: string;
  user_id: string;
  rank: number;
  credits_awarded: number;
  created_at: string;
  iq_competitions: { title: string | null; finalized_at: string | null } | null;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

const rankIcon = (r: number) =>
  r === 1 ? <Trophy className="h-4 w-4 text-yellow-400" /> :
  r === 2 ? <Medal className="h-4 w-4 text-slate-300" /> :
            <Award className="h-4 w-4 text-amber-600" />;

export default function IQHallOfFame() {
  const { data, isLoading } = useQuery({
    queryKey: ["iq-hall-of-fame"],
    queryFn: async (): Promise<PayoutRow[]> => {
      const { data: payouts } = await supabase
        .from("iq_tournament_payouts")
        .select("competition_id, user_id, rank, credits_awarded, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      const rows = (payouts ?? []) as any[];
      const compIds = Array.from(new Set(rows.map(r => r.competition_id)));
      const userIds = Array.from(new Set(rows.map(r => r.user_id)));

      const [{ data: comps }, { data: profs }] = await Promise.all([
        compIds.length
          ? supabase.from("iq_competitions").select("id, title, finalized_at").in("id", compIds)
          : Promise.resolve({ data: [] as any[] }),
        userIds.length
          ? (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", userIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const compMap = new Map((comps ?? []).map((c: any) => [c.id, c]));
      const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));

      return rows.map(r => ({
        ...r,
        iq_competitions: compMap.get(r.competition_id) ?? null,
        profiles: profMap.get(r.user_id) ?? null,
      }));
    },
    staleTime: 60_000,
  });

  // Group by competition
  const grouped = (data ?? []).reduce<Record<string, PayoutRow[]>>((acc, row) => {
    (acc[row.competition_id] ||= []).push(row);
    return acc;
  }, {});
  const compIds = Object.keys(grouped);

  return (
    <>
      <FloatingHowItWorks title="How IQHall Of Fame works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-400" /> Hall of Fame
      </h2>
      <Card className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border-yellow-500/20">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Recent Tournament Champions</CardTitle>
          <CardDescription className="text-xs">Winners of finalized IQ tournaments</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-4" />
          ) : compIds.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No finalized tournaments yet — be the first champion!
            </p>
          ) : (
            compIds.slice(0, 8).map((cid, i) => {
              const winners = grouped[cid].sort((a, b) => a.rank - b.rank);
              const title = winners[0]?.iq_competitions?.title ?? "Tournament";
              return (
                <motion.div
                  key={cid}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg bg-background/50 border border-border/30"
                >
                  <p className="text-sm font-semibold mb-2 truncate">🏆 {title}</p>
                  <div className="space-y-1.5">
                    {winners.map(w => (
                      <div key={w.user_id} className="flex items-center gap-2 text-xs">
                        {rankIcon(w.rank)}
                        <span className="flex-1 truncate">
                          {w.profiles?.full_name ?? "Anonymous"}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          +{w.credits_awarded} credits
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
