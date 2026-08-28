import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Loader2, Sparkles, Star, Trophy, Megaphone, BadgeCheck } from "lucide-react";

type WinnerRow = {
  month_start: string;
  brand_id: string;
  brand_name: string;
  brand_logo: string | null;
  brand_tier: string | null;
  brand_category: string | null;
  votes: number;
};

const PERKS = [
  { icon: Crown, title: "Champion Crown", text: "A golden crown badge on the brand card for the whole next month." },
  { icon: Megaphone, title: "Hero Spotlight", text: "Top placement in the arena hero and first row of the leaderboard." },
  { icon: BadgeCheck, title: "Verified Champion", text: "Permanent entry in the Hall of Champions with the winning month." },
  { icon: Star, title: "Free Tier Upgrade", text: "One month of the next sponsor tier at no extra cost." },
];

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function MonthlyChampions() {
  const { data: winners = [], isLoading } = useQuery({
    queryKey: ["brand-monthly-winners"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("brand_monthly_winners", { p_months: 12 });
      if (error) throw error;
      return (data ?? []) as WinnerRow[];
    },
  });

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-xl border-amber-500/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-black">
            <Trophy className="h-6 w-6 text-amber-500" /> Hall of Champions
          </CardTitle>
          <CardDescription>The brand with the most votes each month — and what it wins.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERKS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-background/50 p-3">
                  <Icon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold">{p.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : winners.length === 0 ? (
        <div className="rounded-xl border border-amber-500/20 bg-card/60 backdrop-blur p-10 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-amber-500/70" />
          <p className="text-muted-foreground">No monthly champion yet. Votes cast this month decide the first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {winners.map((w, i) => (
            <div
              key={`${w.month_start}-${w.brand_id}`}
              className="rounded-xl p-px bg-gradient-to-r from-amber-400/50 via-amber-500/20 to-transparent"
            >
              <div className="rounded-xl bg-zinc-950/90 backdrop-blur p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-amber-500/30">
                    {w.brand_logo?.startsWith("http") ? (
                      <img src={w.brand_logo} alt={w.brand_name} className="w-14 h-14 object-cover" />
                    ) : (
                      <div className="text-3xl w-14 h-14 flex items-center justify-center bg-zinc-900">
                        {w.brand_logo || "🏆"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300/70">
                      {monthLabel(w.month_start)}
                    </div>
                    <div className="font-bold text-amber-100 truncate flex items-center gap-2">
                      {w.brand_name}
                      {i === 0 && (
                        <Badge className="text-[9px] uppercase tracking-wider bg-gradient-to-r from-amber-300 to-amber-600 text-black border-0">
                          Reigning
                        </Badge>
                      )}
                    </div>
                    {w.brand_category && (
                      <Badge className="mt-1 text-[10px] uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {w.brand_category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <Crown className="h-6 w-6 text-amber-400" />
                  <div className="text-center">
                    <div className="font-serif text-2xl bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">
                      {w.votes}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-amber-100/40">votes</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
