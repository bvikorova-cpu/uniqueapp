import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const LeagueSystem = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("football_leagues").select("*").order("created_at", { ascending: false }).then(({ data }) => setLeagues(data || []));
  }, []);

  const loadStandings = async (leagueId: string) => {
    setSelectedLeague(leagueId);
    const { data } = await supabase.from("football_league_standings").select("*, football_teams(name, wins, draws, losses)").eq("league_id", leagueId).order("points", { ascending: false });
    setStandings(data || []);
  };

  const joinLeague = async (leagueId: string) => {
    if (!user) { toast.error("Sign in first"); return; }
    const { data: team } = await supabase.from("football_teams").select("*").eq("user_id", user.id).single();
    if (!team) { toast.error("Create your team first!"); return; }
    const { error } = await supabase.from("football_league_standings").insert({ league_id: leagueId, team_id: team.id });
    if (error) { toast.error(error.message?.includes("duplicate") ? "Already joined!" : error.message); return; }
    toast.success("Joined league!");
    loadStandings(leagueId);
  };

  return (
    <><FloatingHowItWorks title="LeagueSystem — How it works" steps={[{title:"Open this section",desc:"Access LeagueSystem from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🏆 League System</h2>
      {leagues.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No leagues available yet. Leagues will be created by admins.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {leagues.map(league => (
            <Card key={league.id} className="border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-lg font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-400" /> {league.name}</p>
                    <p className="text-sm text-muted-foreground">{league.season}</p>
                  </div>
                  <Badge>{league.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                  <div className="p-2 rounded bg-muted/50"><p className="font-bold">{league.entry_fee}</p><p className="text-xs text-muted-foreground">Entry Fee</p></div>
                  <div className="p-2 rounded bg-muted/50"><p className="font-bold">{league.prize_pool}</p><p className="text-xs text-muted-foreground">Prize Pool</p></div>
                  <div className="p-2 rounded bg-muted/50"><p className="font-bold">{league.max_teams}</p><p className="text-xs text-muted-foreground">Max Teams</p></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => joinLeague(league.id)} className="flex-1">Join League</Button>
                  <Button variant="outline" onClick={() => loadStandings(league.id)}>Standings</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {selectedLeague && standings.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Standings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {standings.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="font-bold w-6">{i + 1}</span>
                  {i < 3 && <Medal className={`h-4 w-4 ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-400" : "text-orange-400"}`} />}
                  <span className="flex-1 font-semibold">{s.football_teams?.name || "Unknown"}</span>
                  <span className="font-bold">{s.points} pts</span>
                  <span className="text-sm text-muted-foreground">{s.goals_for}-{s.goals_against}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  </>
  );
};
