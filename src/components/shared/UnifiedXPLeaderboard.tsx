import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Sparkles, ChefHat, GraduationCap, Star } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Row = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  megatalent_xp: number;
  kitchenstars_xp: number;
  proclass_xp: number;
};

interface Props {
  /** Which hub the leaderboard is being shown on — that hub's XP is emphasised */
  hub?: "megatalent" | "kitchenstars" | "proclass";
  limit?: number;
}

const hubMeta = {
  megatalent: { icon: Sparkles, label: "Megatalent", color: "text-primary" },
  kitchenstars: { icon: ChefHat, label: "KitchenStars", color: "text-orange-400" },
  proclass: { icon: GraduationCap, label: "ProClass", color: "text-blue-400" },
} as const;

export const UnifiedXPLeaderboard = ({ hub, limit = 10 }: Props) => {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["unified-xp-leaderboard", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_unified_xp_leaderboard", { _limit: limit });
      if (error) throw error;
      return (
    <>
      <FloatingHowItWorks title={"Unified X P Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Unified X P Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Unified X P Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      data ?? []
    </>
  ) as Row[];
    },
    staleTime: 60_000,
  });

  const rankIcon = (i: number) =>
    i === 0 ? <Crown className="h-5 w-5 text-yellow-500" /> :
    i === 1 ? <Medal className="h-5 w-5 text-zinc-300" /> :
    i === 2 ? <Medal className="h-5 w-5 text-amber-600" /> : null;

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Cross-Hub Top Creators
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" /> Megatalent · KitchenStars · ProClass
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[0,1,2,3,4].map(i => <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-10">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">No XP earned across hubs yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Compete in Megatalent, KitchenStars Arena and ProClass to climb the unified ranking.
            </p>
          </div>
        ) : (
          <ol className="space-y-2">
            {rows.map((r, i) => (
              <motion.li
                key={r.user_id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  i < 3
                    ? "bg-gradient-to-r from-primary/15 to-accent/10 border-primary/30"
                    : "bg-muted/30 border-border/30"
                }`}
              >
                <div className="w-7 text-center font-bold flex items-center justify-center">
                  {rankIcon(i) ?? <span className="text-xs">#{i + 1}</span>}
                </div>
                <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                  <AvatarImage src={r.avatar_url ?? undefined} />
                  <AvatarFallback>{(r.full_name ?? "?").slice(0,1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">{r.full_name ?? "Anonymous"}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                    {(["megatalent","kitchenstars","proclass"] as const).map(h => {
                      const Meta = hubMeta[h];
                      const val = r[`${h}_xp` as const];
                      const emphasised = hub === h;
                      return (
                        <span key={h} className={`inline-flex items-center gap-1 ${emphasised ? Meta.color : ""}`}>
                          <Meta.icon className="h-3 w-3" />
                          {val.toLocaleString()}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{Number(r.total_xp).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">total XP</p>
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedXPLeaderboard;
