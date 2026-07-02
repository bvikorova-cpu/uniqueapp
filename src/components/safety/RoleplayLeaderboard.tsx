import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Crown, Medal } from "lucide-react";
import { useLeaderboard } from "@/hooks/useSafetyExtras";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function RoleplayLeaderboard() {
  const { data = [], isLoading } = useLeaderboard();

  return (
    <>
      <FloatingHowItWorks title={"Roleplay Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Roleplay Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Roleplay Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-card/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-amber-400" /> Top Defenders Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground text-sm py-4">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">Be the first — play a roleplay session!</div>
        ) : (
          <div className="space-y-2">
            {data.slice(0, 10).map((row: any, i: number) => {
              const Icon = i === 0 ? Crown : i < 3 ? Medal : Trophy;
              const color = i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-muted-foreground";
              return (
                <div key={row.user_id} className="flex items-center justify-between p-2 rounded-lg bg-card/40 border border-border/40">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-xs font-bold text-foreground">#{i + 1}</span>
                    <span className="text-sm text-foreground">{row.handle}</span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="font-bold text-amber-300">{row.total_score} pts</span>
                    <span className="text-muted-foreground">{row.sessions_played} games</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
