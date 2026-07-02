import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function LeagueSystem({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("tennis_leagues").select("*").order("created_at", { ascending: false }).then(({ data }) => setLeagues(data || []));
  }, []);

  const joinLeague = async (league: any) => {
    if (!user) return;
    const { data: team } = await supabase.from("tennis_teams").select("*").eq("user_id", user.id).single();
    if (!team) { toast.error("Create a team first!"); return; }
    if (league.entry_fee > 0) {
      const { data: coins } = await supabase.from("tennis_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < league.entry_fee) { toast.error("Not enough coins for entry fee!"); return; }
      await supabase.from("tennis_coins").update({ balance: coins.balance - league.entry_fee, total_spent: coins.total_spent + league.entry_fee }).eq("user_id", user.id);
    }
    await supabase.from("tennis_league_standings").insert({ league_id: league.id, team_id: team.id });
    toast.success(`Joined ${league.name}!`);
  };

  return (
    <><FloatingHowItWorks title="LeagueSystem — How it works" steps={[{title:"Open this section",desc:"Access LeagueSystem from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" />Tennis Leagues</CardTitle></CardHeader>
        <CardContent>
          {leagues.length === 0 ? <p className="text-sm text-muted-foreground">No active leagues. Check back soon!</p> :
            <div className="space-y-3">{leagues.map(l => (
              <div key={l.id} className="p-3 rounded-lg border border-border/50">
                <div className="flex justify-between items-start">
                  <div><h3 className="font-bold text-sm">{l.name}</h3><p className="text-xs text-muted-foreground">Season {l.season} | {l.max_teams} teams max</p></div>
                  <Button size="sm" onClick={() => joinLeague(l)} disabled={l.status !== "open"}>{l.entry_fee > 0 ? `Join (${l.entry_fee} coins)` : "Join Free"}</Button>
                </div>
                {l.prize_pool > 0 && <p className="text-xs text-primary mt-1">🏆 Prize Pool: {l.prize_pool} coins</p>}
              </div>
            ))}</div>
          }
        </CardContent>
      </Card>
    </div>
  </>
  );
}
