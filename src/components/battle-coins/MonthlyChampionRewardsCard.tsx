import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal, Sparkles, Shirt, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CHAMPION_REWARDS, championRankClasses } from "@/hooks/useChampionBadges";

type ChampionRow = {
  rank: number;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  points: number;
  credits_awarded: number;
  perks: string[];
  period: string;
};

interface Props {
  module: "kitchenstars" | "reel_battles" | "megatalent";
  accent?: "orange" | "primary";
}

const ICONS = [Crown, Medal, Medal];

export default function MonthlyChampionRewardsCard({ module, accent = "primary" }: Props) {
  const [champions, setChampions] = useState<ChampionRow[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.rpc("get_module_champions", { _module: module });
      if (active) setChampions((data as ChampionRow[]) || []);
    })();
    return () => {
      active = false;
    };
  }, [module]);

  const accentText = accent === "orange" ? "text-orange-600" : "text-primary";

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className={`h-5 w-5 ${accentText}`} />
          Monthly champion rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          On the 1st of every month the TOP 3 of the leaderboard get fixed rewards — no share of entry fees, just prizes
          from the platform.
        </p>

        <div className="space-y-2">
          {CHAMPION_REWARDS.map((r, i) => {
            const Icon = ICONS[i];
            const c = championRankClasses(r.rank);
            return (
              <div key={r.rank} className={`rounded-xl border ${c.border} bg-muted/40 p-3`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`flex items-center gap-2 text-sm font-bold ${c.text}`}>
                    <Icon className="h-4 w-4" />
                    {r.rank}. {r.title}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    <Sparkles className={`h-3.5 w-3.5 ${accentText}`} />
                    {r.credits.toLocaleString()} AI credits
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.perks.map((p) => (
                    <Badge key={p} variant="secondary" className="gap-1 text-[10px]">
                      {p.toLowerCase().includes("shirt") || p.toLowerCase().includes("cap") ? (
                        <Shirt className="h-3 w-3" />
                      ) : (
                        <BadgeCheck className="h-3 w-3" />
                      )}
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {champions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current champions ({champions[0].period.slice(0, 7)})
            </p>
            {champions.map((ch) => {
              const c = championRankClasses(ch.rank);
              return (
                <div key={ch.user_id} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                  <Avatar className={`h-8 w-8 ${c.ring}`}>
                    <AvatarImage src={ch.avatar_url || undefined} alt={ch.display_name || "Champion"} />
                    <AvatarFallback>{(ch.display_name || "P").slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${c.text}`}>{ch.display_name || "Player"}</p>
                    <p className="text-[11px] text-muted-foreground">{ch.points.toLocaleString()} pts</p>
                  </div>
                  <span className="text-xs font-semibold">+{ch.credits_awarded.toLocaleString()} cr</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
