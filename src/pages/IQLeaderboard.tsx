import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Loader2, Crown, Medal } from "lucide-react";
import { Helmet } from "react-helmet-async";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQLeaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["iq-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_iq_leaderboard", { _limit: 50 });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-muted-foreground font-bold w-5 text-center">{rank}</span>;
  };

  return (
    <>
      <FloatingHowItWorks title="How IQLeaderboard works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 py-12 px-4">
      <Helmet>
        <title>IQ Leaderboard — Top Scores | Unique IQ</title>
        <meta name="description" content="Top global IQ scores from the Unique IQ community." />
      </Helmet>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-primary" /> Global IQ Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">Top minds on Unique IQ</p>
        </div>

        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Top 50</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : !data || data.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No public scores yet. Be the first!</p>
            ) : (
              <div className="space-y-2">
                {data.map((row: any) => (
                  <Link
                    key={row.user_id}
                    to={`/iq/u/${row.share_slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <div className="w-8 flex justify-center">{rankIcon(Number(row.rank))}</div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={row.avatar_url ?? undefined} />
                      <AvatarFallback>{(row.display_name ?? "?")[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{row.display_name ?? "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">{row.total_tests} tests</p>
                    </div>
                    <Badge variant="outline" className="border-primary/40">{row.tier ?? "Bronze"}</Badge>
                    <p className="text-2xl font-black text-primary w-14 text-right">{row.best_iq}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
