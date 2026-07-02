import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const TrophyRoom = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("football_teams").select("*").eq("user_id", user.id).single().then(({ data }) => setTeam(data));
    supabase.from("football_training_sessions").select("id", { count: "exact" }).eq("user_id", user.id).then(({ count }) => setMatches(count || 0));
  }, [user]);

  const trophies = [
    { name: "First Victory", icon: "🏆", desc: "Win your first match", unlocked: team?.wins > 0 },
    { name: "10 Wins", icon: "⭐", desc: "Win 10 matches", unlocked: team?.wins >= 10 },
    { name: "50 Wins", icon: "👑", desc: "Win 50 matches", unlocked: team?.wins >= 50 },
    { name: "Unbeatable", icon: "🔥", desc: "Win 100 matches", unlocked: team?.wins >= 100 },
    { name: "Trainer", icon: "🏋️", desc: "Complete 10 training sessions", unlocked: matches >= 10 },
    { name: "Master Trainer", icon: "💎", desc: "Complete 50 training sessions", unlocked: matches >= 50 },
    { name: "Builder", icon: "🏟️", desc: "Create your team", unlocked: !!team },
    { name: "Draw Master", icon: "🤝", desc: "Draw 5 matches", unlocked: team?.draws >= 5 },
  ];

  if (!user) return <div className="space-y-4"><Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button><p className="text-center py-8">Sign in first</p></div>;

  return (
    <><FloatingHowItWorks title="TrophyRoom — How it works" steps={[{title:"Open this section",desc:"Access TrophyRoom from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🏆 Trophy Room</h2>
      <div className="grid grid-cols-2 gap-3">
        {trophies.map(t => (
          <Card key={t.name} className={t.unlocked ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent" : "opacity-50"}>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl mb-2">{t.icon}</p>
              <p className="font-bold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
              {t.unlocked && <Star className="h-4 w-4 text-amber-400 mx-auto mt-2" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </>
  );
};
