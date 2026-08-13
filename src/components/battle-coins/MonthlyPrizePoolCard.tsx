import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Coins, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Split = { rank: number; percent: number; coins: number };

interface PoolData {
  pool_coins: number;
  duels_counted: number;
  winner_share_percent: number;
  pool_share_percent: number;
  splits: Split[];
}

interface Props {
  module: "kitchenstars" | "reel_battles";
  accent?: "orange" | "primary";
}

const MEDALS = ["🥇", "🥈", "🥉", "4.", "5."];

export default function MonthlyPrizePoolCard({ module, accent = "primary" }: Props) {
  const [data, setData] = useState<PoolData | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: res } = await supabase.rpc("get_battle_prize_pool", { _module: module });
      if (active && res) setData(res as unknown as PoolData);
    };
    load();
    const t = setInterval(load, 60000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [module]);

  const accentText = accent === "orange" ? "text-orange-600" : "text-primary";

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className={`h-5 w-5 ${accentText}`} />
          Monthly prize pool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Coins className="h-3.5 w-3.5" />
            {(data?.pool_coins ?? 0).toLocaleString()} coins collected
          </Badge>
          <Badge variant="outline">{data?.duels_counted ?? 0} duels this month</Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Every duel pays <span className="font-semibold text-foreground">{data?.winner_share_percent ?? 80}%</span> of
          the pot to its winner. The remaining{" "}
          <span className="font-semibold text-foreground">{data?.pool_share_percent ?? 20}%</span> grows this monthly
          pool, which is split between the TOP 5 of the leaderboard on the 1st of next month.
        </p>

        <div className="space-y-1.5">
          {(data?.splits ?? [
            { rank: 1, percent: 40, coins: 0 },
            { rank: 2, percent: 25, coins: 0 },
            { rank: 3, percent: 15, coins: 0 },
            { rank: 4, percent: 10, coins: 0 },
            { rank: 5, percent: 10, coins: 0 },
          ]).map((s) => (
            <div key={s.rank} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-6 text-center">{MEDALS[s.rank - 1]}</span>
                <span className="flex items-center gap-1 font-medium">
                  <Percent className="h-3.5 w-3.5" />
                  {s.percent}%
                </span>
              </span>
              <span className={`font-semibold ${accentText}`}>{s.coins.toLocaleString()} coins</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Amounts update live as new duels are settled — nothing is fixed in advance, the pool is always a share of what
          players actually put in.
        </p>
      </CardContent>
    </Card>
  );
}
