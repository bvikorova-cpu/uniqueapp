import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function TrophyRoom({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ wins: 0, losses: 0, matches: 0, players: 0 });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("basketball_teams").select("*").eq("user_id", user.id).single(),
      supabase.from("basketball_players").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("basketball_matches").select("id", { count: "exact", head: true }),
    ]).then(([{ data: team }, { count: pc }, { count: mc }]) => {
      setStats({ wins: team?.wins || 0, losses: team?.losses || 0, matches: mc || 0, players: pc || 0 });
    });
  }, [user]);

  const trophies = [
    { name: "First Victory", desc: "Win your first match", earned: stats.wins >= 1, icon: "🏆" },
    { name: "Five Wins", desc: "Win 5 matches", earned: stats.wins >= 5, icon: "🥇" },
    { name: "Squad Builder", desc: "Own 5+ players", earned: stats.players >= 5, icon: "👥" },
    { name: "Veteran", desc: "Play 10 matches", earned: (stats.wins + stats.losses) >= 10, icon: "⭐" },
    { name: "Dynasty", desc: "Win 25 matches", earned: stats.wins >= 25, icon: "👑" },
    { name: "Legend", desc: "Win 100 matches", earned: stats.wins >= 100, icon: "🏀" },
  ];

  return (
    <><FloatingHowItWorks title="TrophyRoom — How it works" steps={[{title:"Open this section",desc:"Access TrophyRoom from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Medal className="h-5 w-5 text-primary" />Trophy Room</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-center"><div className="text-2xl font-bold">{stats.wins}</div><div className="text-xs text-muted-foreground">Wins</div></div>
            <div className="p-3 rounded-lg bg-red-500/10 text-center"><div className="text-2xl font-bold">{stats.losses}</div><div className="text-xs text-muted-foreground">Losses</div></div>
          </div>
          <div className="space-y-2">
            {trophies.map(t => (
              <div key={t.name} className={`flex items-center gap-3 p-3 rounded-lg border ${t.earned ? "bg-amber-500/10 border-amber-500/30" : "opacity-40 border-border/30"}`}>
                <span className="text-2xl">{t.icon}</span>
                <div><div className="font-bold text-sm">{t.name}</div><div className="text-xs text-muted-foreground">{t.desc}</div></div>
                {t.earned && <span className="ml-auto text-xs text-amber-400 font-bold">EARNED</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </>
  );
}
