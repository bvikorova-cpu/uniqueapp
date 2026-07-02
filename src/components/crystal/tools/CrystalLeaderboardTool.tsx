import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Loader2, Medal, Flame, Gem, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const CrystalLeaderboardTool = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [myStats, setMyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase as any).from("crystal_user_stats").select("*").order("total_points", { ascending: false }).limit(20);
      setLeaders(data || []);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: stats } = await (supabase as any).from("crystal_user_stats").select("*").eq("user_id", session.user.id).maybeSingle();
        setMyStats(stats);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <FloatingHowItWorks title={"Crystal Leaderboard Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Leaderboard Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Leaderboard Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Trophy className="w-5 h-5" /> Energy Leaderboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">Global rankings based on healing journey progress</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {myStats && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h4 className="text-xs font-semibold text-primary mb-2">Your Stats</h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center"><div className="text-lg font-black text-foreground">{myStats.total_points}</div><div className="text-[10px] text-muted-foreground">Points</div></div>
              <div className="text-center"><div className="text-lg font-black text-foreground">{myStats.current_streak}</div><div className="text-[10px] text-muted-foreground">Streak</div></div>
              <div className="text-center"><div className="text-lg font-black text-foreground">{myStats.total_readings}</div><div className="text-[10px] text-muted-foreground">Readings</div></div>
              <div className="text-center"><div className="text-lg font-black text-foreground">{myStats.crystals_collected}</div><div className="text-[10px] text-muted-foreground">Crystals</div></div>
            </div>
          </div>
        )}

        {leaders.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">No rankings yet. Start your healing journey to earn points!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((user: any, i: number) => (
              <div key={user.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${i < 3 ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/30"}`}>
                <div className="w-8 text-center font-black text-lg">
                  {i < 3 ? medals[i] : <span className="text-sm text-muted-foreground">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Healer #{user.user_id.slice(0, 6)}</span>
                    {user.current_streak >= 7 && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                  </div>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Brain className="w-2.5 h-2.5" /> {user.total_readings} readings</span>
                    <span className="flex items-center gap-0.5"><Gem className="w-2.5 h-2.5" /> {user.crystals_collected} crystals</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-primary">{user.total_points}</div>
                  <div className="text-[10px] text-muted-foreground">pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
