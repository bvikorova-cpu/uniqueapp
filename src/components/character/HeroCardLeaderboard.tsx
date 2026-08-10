import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Crown, Medal, Trophy, Loader2 } from "lucide-react";

const TOTAL_CARDS = 200;

interface Row {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  unique_cards: number;
  total_cards: number;
}

const rankIcon = (i: number) => {
  if (i === 0) return <Crown className="h-5 w-5 text-amber-400" />;
  if (i === 1) return <Medal className="h-5 w-5 text-zinc-400" />;
  if (i === 2) return <Medal className="h-5 w-5 text-orange-400" />;
  return <span className="text-sm font-black text-muted-foreground">#{i + 1}</span>;
};

/** Global ranking of hero card collectors — most unique cards wins. */
export const HeroCardLeaderboard = () => {
  const { data: me } = useQuery({
    queryKey: ["hero-lb-me"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["hero-card-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("hero_card_leaderboard" as never, { _limit: 25 } as never);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading collectors…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Trophy className="h-10 w-10 mx-auto text-amber-400/70 mb-3" />
        <p className="font-bold">No collectors yet</p>
        <p className="text-sm text-muted-foreground">Draw your first card to top the ranking.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-black">Top Collectors</h3>
        <Badge variant="outline" className="ml-auto text-[10px]">Unique cards</Badge>
      </div>

      {rows.map((r, i) => (
        <Card
          key={r.user_id}
          className={`flex items-center gap-3 p-3 ${r.user_id === me ? "border-primary/60 bg-primary/5" : ""}`}
        >
          <div className="w-8 flex items-center justify-center shrink-0">{rankIcon(i)}</div>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={r.avatar_url ?? undefined} alt={r.display_name ?? "collector"} />
            <AvatarFallback>{(r.display_name ?? "?").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate">
              {r.display_name || "Anonymous collector"}
              {r.user_id === me && <span className="ml-2 text-[10px] text-primary font-black">YOU</span>}
            </p>
            <Progress value={(r.unique_cards / TOTAL_CARDS) * 100} className="h-1.5 mt-1" />
            <p className="text-[11px] text-muted-foreground mt-1">{r.total_cards} cards drawn</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-black">{r.unique_cards}</p>
            <p className="text-[10px] text-muted-foreground">/ {TOTAL_CARDS}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default HeroCardLeaderboard;
