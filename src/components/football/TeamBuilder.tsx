import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const formations = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1", "5-3-2", "3-4-3"];

export const TeamBuilder = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [teamName, setTeamName] = useState("");
  const [formation, setFormation] = useState("4-3-3");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: t } = await supabase.from("football_teams").select("*").eq("user_id", user.id).single();
      if (t) { setTeam(t); setTeamName(t.name); setFormation(t.formation); }
      const { data: p } = await supabase.from("football_players").select("*").eq("user_id", user.id).order("overall_rating", { ascending: false });
      setPlayers(p || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const saveTeam = async () => {
    if (!user) return;
    if (!teamName.trim()) { toast.error("Enter team name"); return; }
    if (team) {
      await supabase.from("football_teams").update({ name: teamName, formation }).eq("id", team.id);
      setTeam({ ...team, name: teamName, formation });
      toast.success("Team updated!");
    } else {
      const { data, error } = await supabase.from("football_teams").insert({ user_id: user.id, name: teamName, formation }).select().single();
      if (error) { toast.error(error.message); return; }
      setTeam(data);
      toast.success("Team created!");
    }
  };

  const assignPlayer = async (playerId: string) => {
    if (!team) { toast.error("Create your team first"); return; }
    await supabase.from("football_players").update({ team_id: team.id }).eq("id", playerId);
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, team_id: team.id } : p));
    toast.success("Player assigned!");
  };

  const squadPlayers = players.filter(p => p.team_id === team?.id);
  const benchPlayers = players.filter(p => p.team_id !== team?.id);

  if (!user) return <div className="space-y-4"><Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button><p className="text-center py-8">Sign in to build your team</p></div>;

  return (
    <><FloatingHowItWorks title="TeamBuilder — How it works" steps={[{title:"Open this section",desc:"Access TeamBuilder from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🛡️ Team Builder</h2>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Team Setup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Team name..." value={teamName} onChange={e => setTeamName(e.target.value)} />
          <Select value={formation} onValueChange={setFormation}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{formations.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={saveTeam} className="w-full bg-gradient-to-r from-emerald-600 to-green-600">{team ? "Update Team" : "Create Team"}</Button>
        </CardContent>
      </Card>
      {team && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Squad ({squadPlayers.length}/11)</CardTitle></CardHeader>
            <CardContent>
              {squadPlayers.length === 0 ? <p className="text-center text-muted-foreground py-4">No players in squad. Assign players below.</p> : (
                <div className="space-y-2">
                  {squadPlayers.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.position} • OVR {p.overall_rating}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          {benchPlayers.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Available Players</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {benchPlayers.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.position} • OVR {p.overall_rating}</p></div>
                    <Button size="sm" onClick={() => assignPlayer(p.id)}>Add to Squad</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  </>
  );
};
