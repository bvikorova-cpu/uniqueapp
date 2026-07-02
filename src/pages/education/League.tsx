import { useState } from "react";
import { useLeague } from "@/hooks/useEducationGamification";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Medal } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_LEAGUE_STEPS = [
  { title: 'Earn XP all week', desc: 'Every quiz, challenge and tutor session counts.' },
  { title: 'Compete in your league', desc: "You're grouped with learners at your level." },
  { title: 'Get promoted', desc: 'Top ranks move up a league; the bottom drops down.' },
  { title: 'Season resets Sunday', desc: 'Weekly reset gives everyone a fresh chance.' }
];
const __HIW_LEAGUE = { title: 'Learning League', intro: 'Weekly leaderboards that promote top learners.', steps: __HIW_LEAGUE_STEPS };


const TIERS = [
  { id: "bronze", label: "Bronze", color: "text-amber-600" },
  { id: "silver", label: "Silver", color: "text-gray-400" },
  { id: "gold", label: "Gold", color: "text-yellow-500" },
  { id: "diamond", label: "Diamond", color: "text-cyan-400" },
];

export default function League() {
  const [tier, setTier] = useState("bronze");
  const { data, isLoading } = useLeague(tier);

  return (
    <>
      <FloatingHowItWorks title={__HIW_LEAGUE.title} intro={__HIW_LEAGUE.intro} steps={__HIW_LEAGUE.steps} />
      <Helmet><title>Weekly League · Education</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-3xl font-black">Weekly League</h1>
        </div>

        <Tabs value={tier} onValueChange={setTier} className="mb-6">
          <TabsList className="grid grid-cols-4">
            {TIERS.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : !data?.rows?.length ? (
          <Card className="backdrop-blur-xl bg-card/80">
            <CardContent className="p-10 text-center text-muted-foreground">
              No one ranked here yet this week. Complete a daily challenge!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {data.rows.map((row: any, i: number) => (
              <Card key={row.user_id} className={`backdrop-blur-xl ${i < 3 ? "bg-primary/5 border-primary/30" : "bg-card/80"}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 text-center font-black">
                    {i === 0 ? <Crown className="w-5 h-5 mx-auto text-yellow-500" /> :
                     i === 1 ? <Medal className="w-5 h-5 mx-auto text-gray-400" /> :
                     i === 2 ? <Medal className="w-5 h-5 mx-auto text-amber-600" /> :
                     <span className="text-sm text-muted-foreground">{i + 1}</span>}
                  </div>
                  <Avatar className="h-8 w-8"><AvatarImage src={row.avatar_url ?? undefined} /><AvatarFallback>{row.full_name?.[0] ?? "?"}</AvatarFallback></Avatar>
                  <div className="flex-1 text-sm font-medium">{row.full_name ?? "Learner"}</div>
                  <div className="text-sm font-black">{row.xp_this_week} XP</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
