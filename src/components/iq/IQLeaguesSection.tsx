import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Shield, Gem, Star, Medal, Award, Swords, Flame } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const leagues = [
  { name: "Bronze", icon: Shield, color: "text-amber-700", bg: "from-amber-700/20 to-amber-900/10", minIQ: 0, maxIQ: 89 },
  { name: "Silver", icon: Medal, color: "text-gray-400", bg: "from-gray-400/20 to-gray-600/10", minIQ: 90, maxIQ: 99 },
  { name: "Gold", icon: Star, color: "text-yellow-500", bg: "from-yellow-500/20 to-yellow-600/10", minIQ: 100, maxIQ: 109 },
  { name: "Platinum", icon: Gem, color: "text-cyan-400", bg: "from-cyan-400/20 to-cyan-600/10", minIQ: 110, maxIQ: 119 },
  { name: "Diamond", icon: Crown, color: "text-blue-400", bg: "from-blue-400/20 to-blue-600/10", minIQ: 120, maxIQ: 129 },
  { name: "Master", icon: Award, color: "text-purple-400", bg: "from-purple-400/20 to-purple-600/10", minIQ: 130, maxIQ: 139 },
  { name: "Grandmaster", icon: Swords, color: "text-red-400", bg: "from-red-400/20 to-red-600/10", minIQ: 140, maxIQ: 149 },
  { name: "Legend", icon: Flame, color: "text-orange-400", bg: "from-orange-400/20 to-orange-600/10", minIQ: 150, maxIQ: 999 },
];

interface IQLeaguesSectionProps {
  userIQ: number | null;
}

export default function IQLeaguesSection({ userIQ }: IQLeaguesSectionProps) {
  const currentLeague = userIQ ? leagues.find(l => userIQ >= l.minIQ && userIQ <= l.maxIQ) || leagues[0] : null;
  const nextLeague = currentLeague ? leagues[leagues.indexOf(currentLeague) + 1] : null;
  const progress = currentLeague && nextLeague && userIQ 
    ? ((userIQ - currentLeague.minIQ) / (nextLeague.minIQ - currentLeague.minIQ)) * 100
    : 0;

  return (
    <>
      <FloatingHowItWorks title="How IQLeagues Section works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🏆 IQ Leagues</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
        {leagues.map((league, i) => {
          const isActive = currentLeague?.name === league.name;
          return (
            <motion.div key={league.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className={`text-center p-3 transition-all ${isActive ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-105" : "opacity-60"}`}>
                <league.icon className={`h-6 w-6 mx-auto mb-1 ${league.color}`} />
                <p className="text-xs font-bold">{league.name}</p>
                <p className="text-[9px] text-muted-foreground">{league.minIQ}+ IQ</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {currentLeague && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <currentLeague.icon className={`h-8 w-8 ${currentLeague.color}`} />
              <div>
                <p className="font-bold text-lg">{currentLeague.name} League</p>
                <p className="text-xs text-muted-foreground">Your IQ: {userIQ}</p>
              </div>
              {nextLeague && (
                <Badge className="ml-auto" variant="outline">
                  Next: {nextLeague.name} ({nextLeague.minIQ} IQ)
                </Badge>
              )}
            </div>
            {nextLeague && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{currentLeague.name}</span>
                  <span>{nextLeague.name}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground mt-1">
                  {nextLeague.minIQ - (userIQ || 0)} IQ points to next league
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!currentLeague && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-6 text-center">
            <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Take your first IQ test to join a league!</p>
          </CardContent>
        </Card>
      )}
    </div>
    </>
    );
}

function Brain(props: any) {
  return <Award {...props} />;
}
