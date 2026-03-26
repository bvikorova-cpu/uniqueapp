import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Calendar, ArrowRight, Crown, Swords } from "lucide-react";
import { motion } from "framer-motion";

interface BrandSponsor {
  id: string;
  name: string;
  logo: string;
  tier: string;
  category: string;
  total_votes: number;
  description: string;
  website: string;
}

interface TournamentBracketProps {
  sponsors: BrandSponsor[];
}

const SEASONS: { id: string; name: string; status: string; startDate: string; endDate: string; prizePool: string }[] = [];

const PHASES: { name: string; dates: string; status: string; description: string }[] = [];

export const TournamentBracket = ({ sponsors }: TournamentBracketProps) => {
  const sorted = [...sponsors].sort((a, b) => b.total_votes - a.total_votes);
  const top8 = sorted.slice(0, 8);

  // Simulate bracket pairs
  const quarterFinals = [
    [top8[0], top8[7]],
    [top8[1], top8[6]],
    [top8[2], top8[5]],
    [top8[3], top8[4]],
  ];

  const semiFinals = [
    [top8[0], top8[2]],
    [top8[1], top8[3]],
  ];

  return (
    <div className="space-y-8">
      {/* Season selector */}
      <div className="flex flex-wrap gap-3 justify-center">
        {SEASONS.map(season => (
          <Card
            key={season.id}
            className={`p-4 cursor-pointer transition-all ${
              season.status === "active"
                ? "border-primary ring-2 ring-primary/20"
                : "opacity-60"
            }`}
          >
            <div className="text-center">
              <Badge variant={season.status === "active" ? "default" : "secondary"} className="mb-2">
                {season.status === "active" ? "🔴 Live" : "Upcoming"}
              </Badge>
              <div className="font-bold">{season.name}</div>
              <div className="text-xs text-muted-foreground">{season.startDate} - {season.endDate}</div>
              <div className="text-sm font-semibold text-primary mt-1">{season.prizePool}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tournament phases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Tournament Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {PHASES.map((phase, i) => (
              <motion.div
                key={phase.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl border-2 ${
                  phase.status === "active"
                    ? "border-primary bg-primary/5"
                    : phase.status === "completed"
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-muted-foreground/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {phase.status === "completed" ? (
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  ) : phase.status === "active" ? (
                    <div className="h-6 w-6 rounded-full bg-primary animate-pulse flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">●</span>
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className="font-semibold text-sm">{phase.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{phase.dates}</p>
                <p className="text-xs">{phase.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual bracket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Elimination Bracket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-center overflow-x-auto">
            {/* Quarter Finals */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground text-center mb-2">Quarter Finals</h4>
              {quarterFinals.map(([a, b], i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
                  {[a, b].map(brand => brand && (
                    <div key={brand.id} className="flex items-center gap-2">
                      <span className="text-lg">{brand.logo.startsWith("http") ? "🏢" : brand.logo}</span>
                      <span className="text-xs font-medium truncate flex-1">{brand.name}</span>
                      <span className="text-xs font-bold text-primary">{brand.total_votes}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center justify-center gap-20">
              {[0, 1].map(i => (
                <ArrowRight key={i} className="h-5 w-5 text-muted-foreground" />
              ))}
            </div>

            {/* Semi Finals */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground text-center mb-2">Semi Finals</h4>
              {semiFinals.map(([a, b], i) => (
                <div key={i} className="bg-primary/5 rounded-lg p-3 space-y-2 border border-primary/20">
                  {[a, b].map(brand => brand && (
                    <div key={brand.id} className="flex items-center gap-2">
                      <span className="text-lg">{brand.logo.startsWith("http") ? "🏢" : brand.logo}</span>
                      <span className="text-xs font-medium truncate flex-1">{brand.name}</span>
                      <span className="text-xs font-bold text-primary">{brand.total_votes}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Finals */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground text-center mb-2">🏆 Grand Finale</h4>
              {top8.length >= 2 && (
                <div className="bg-gradient-to-br from-yellow-500/10 to-primary/10 rounded-lg p-4 space-y-3 border-2 border-yellow-500/30">
                  {[top8[0], top8[1]].map(brand => brand && (
                    <div key={brand.id} className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-bold truncate flex-1">{brand.name}</span>
                      <span className="text-sm font-black text-primary">{brand.total_votes}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
