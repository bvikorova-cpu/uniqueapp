import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const PLAYSTYLES = ["Balanced", "West Coast", "Spread Offense", "Power Run", "Air Raid", "Pro Style"];

export function TeamBuilder({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [teamName, setTeamName] = useState("");
  const [playstyle, setPlaystyle] = useState("Balanced");

  useEffect(() => {
    if (!user) return;
    supabase.from("american_football_teams").select("*").eq("user_id", user.id).single().then(({ data }) => { setTeam(data); if (data) { setTeamName(data.name); setPlaystyle(data.playstyle); } });
    supabase.from("american_football_players").select("*").eq("user_id", user.id).order("overall_rating", { ascending: false }).then(({ data }) => setPlayers(data || []));
  }, [user]);

  const saveTeam = async () => {
    if (!user || !teamName.trim()) return;
    if (team) {
      await supabase.from("american_football_teams").update({ name: teamName, playstyle }).eq("id", team.id);
    } else {
      const { data } = await supabase.from("american_football_teams").insert({ user_id: user.id, name: teamName, playstyle }).select().single();
      setTeam(data);
    }
    toast.success("Team saved!");
  };

  const toggleStarter = async (player: any) => {
    const starters = players.filter(p => p.is_starter && p.id !== player.id);
    if (!player.is_starter && starters.length >= 11) { toast.error("Max 11 starters!"); return; }
    await supabase.from("american_football_players").update({ is_starter: !player.is_starter }).eq("id", player.id);
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, is_starter: !p.is_starter } : p));
  };

  return (
    <><FloatingHowItWorks title="TeamBuilder — How it works" steps={[{title:"Open this section",desc:"Access TeamBuilder from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Team Builder</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Team name..." value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          <Select value={playstyle} onValueChange={setPlaystyle}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PLAYSTYLES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          <Button className="w-full" onClick={saveTeam}>Save Team</Button>
          {team && <div className="text-sm text-muted-foreground">W{team.wins} L{team.losses} D{team.draws} | Points: {team.league_points}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Roster ({players.length})</CardTitle></CardHeader>
        <CardContent>
          {players.length === 0 ? <p className="text-sm text-muted-foreground">No players yet. Create or draft some!</p> :
            <div className="space-y-2">
              {players.map(p => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${p.is_starter ? "bg-primary/10 border-primary/30" : "border-border/50"}`}>
                  <div>
                    <span className="font-bold text-sm">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{p.position} | OVR {p.overall_rating}</span>
                  </div>
                  <Button size="sm" variant={p.is_starter ? "default" : "outline"} onClick={() => toggleStarter(p)}>
                    {p.is_starter ? "Starter" : "Bench"}
                  </Button>
                </div>
              ))}
            </div>
          }
        </CardContent>
      </Card>
    </div>
  </>
  );
}
