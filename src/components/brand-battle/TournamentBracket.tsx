import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, ArrowRight, Crown, Swords, Shield, Zap, Flame, Timer, Target } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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

const SEASON_INFO = {
  name: "Season Q2 2026",
  status: "active",
  startDate: "Apr 1",
  endDate: "Jun 30",
  prizePool: "€10,000",
};

export const TournamentBracket = ({ sponsors }: TournamentBracketProps) => {
  const sorted = [...sponsors].sort((a, b) => b.total_votes - a.total_votes);
  const top8 = sorted.slice(0, 8);

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

  if (top8.length < 2) {
    return (
    <>
      <FloatingHowItWorks title={"Tournament Bracket - How it works"} steps={[{ title: 'Open', desc: 'Access the Tournament Bracket section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tournament Bracket.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-12 text-center backdrop-blur-xl bg-card/80">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-bold text-2xl mb-2">Bracket Awaiting Challengers</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            At least 2 brands are needed to start a tournament bracket. Invite brands to join and compete for glory!
          </p>
        </motion.div>
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-8">
      {/* Season banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="backdrop-blur-xl bg-gradient-to-r from-primary/10 via-card/80 to-accent/10 border-primary/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Trophy className="h-8 w-8 text-primary-foreground" />
                </motion.div>
                <div>
                  <div className="font-black text-xl">{SEASON_INFO.name}</div>
                  <div className="text-sm text-muted-foreground">{SEASON_INFO.startDate} – {SEASON_INFO.endDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-sm px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2" />
                  Live Now
                </Badge>
                <div className="text-center">
                  <div className="text-2xl font-black text-primary">{SEASON_INFO.prizePool}</div>
                  <div className="text-xs text-muted-foreground">Prize Pool</div>
                </div>
              </div>
            </div>

            {/* Tournament phases */}
            <div className="grid grid-cols-4 gap-2 mt-5">
              {[
                { name: "Qualifiers", status: "completed", icon: Target },
                { name: "Quarter Finals", status: "active", icon: Swords },
                { name: "Semi Finals", status: "upcoming", icon: Flame },
                { name: "Grand Finale", status: "upcoming", icon: Crown },
              ].map((phase, i) => (
                <motion.div
                  key={phase.name}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-3 rounded-xl text-center border-2 ${
                    phase.status === "active"
                      ? "border-primary bg-primary/10"
                      : phase.status === "completed"
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-muted-foreground/10 bg-muted/10"
                  }`}
                >
                  <phase.icon className={`h-5 w-5 mx-auto mb-1 ${
                    phase.status === "active" ? "text-primary" : phase.status === "completed" ? "text-green-500" : "text-muted-foreground/40"
                  }`} />
                  <div className="text-xs font-semibold">{phase.name}</div>
                  {phase.status === "active" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse mx-auto mt-1" />
                  )}
                  {phase.status === "completed" && (
                    <span className="text-[10px] text-green-500">✓</span>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Visual bracket */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/10 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Elimination Bracket
            <Badge variant="outline" className="text-xs ml-2">Live Rankings</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-center overflow-x-auto">
            {/* Quarter Finals */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground text-center mb-2 uppercase tracking-wider">Quarter Finals</h4>
              {quarterFinals.map(([a, b], i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-muted/30 backdrop-blur-sm rounded-xl p-3 space-y-2 border border-primary/5 hover:border-primary/20 hover:shadow-md transition-all"
                >
                  {[a, b].map(brand => brand && (
                    <div key={brand.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                      <span className="text-lg flex-shrink-0">{brand.logo.startsWith("http") ? "🏢" : brand.logo}</span>
                      <span className="text-xs font-medium truncate flex-1">{brand.name}</span>
                      <span className="text-xs font-black text-primary">{brand.total_votes}</span>
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center justify-center gap-20">
              {[0, 1].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <ArrowRight className="h-5 w-5 text-primary/50" />
                </motion.div>
              ))}
            </div>

            {/* Semi Finals */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground text-center mb-2 uppercase tracking-wider">Semi Finals</h4>
              {semiFinals.map(([a, b], i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-primary/5 backdrop-blur-sm rounded-xl p-3 space-y-2 border border-primary/20 shadow-sm"
                >
                  {[a, b].map(brand => brand && (
                    <div key={brand.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                      <span className="text-lg flex-shrink-0">{brand.logo.startsWith("http") ? "🏢" : brand.logo}</span>
                      <span className="text-xs font-medium truncate flex-1">{brand.name}</span>
                      <span className="text-xs font-black text-primary">{brand.total_votes}</span>
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                <ArrowRight className="h-5 w-5 text-primary/50" />
              </motion.div>
            </div>

            {/* Finals */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground text-center mb-2 uppercase tracking-wider">🏆 Grand Finale</h4>
              {top8.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-br from-yellow-500/15 to-primary/10 backdrop-blur-sm rounded-xl p-4 space-y-3 border-2 border-yellow-500/30 shadow-xl shadow-yellow-500/10"
                >
                  {[top8[0], top8[1]].map((brand, idx) => brand && (
                    <motion.div
                      key={brand.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-yellow-500/10 transition-colors"
                      animate={idx === 0 ? { x: [0, 2, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm font-bold truncate flex-1">{brand.name}</span>
                      <span className="text-sm font-black text-primary">{brand.total_votes}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Swords, title: "Real-Time Rankings", desc: "Bracket positions update live based on actual vote counts", color: "from-primary/10 to-primary/5" },
          { icon: Trophy, title: "Quarterly Seasons", desc: "New tournament seasons start every quarter with fresh brackets", color: "from-yellow-500/10 to-yellow-500/5" },
          { icon: Zap, title: "Elimination Format", desc: "Top 8 brands compete through quarter-finals to the grand finale", color: "from-accent/10 to-accent/5" },
        ].map((info, i) => (
          <motion.div
            key={info.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`backdrop-blur-xl bg-gradient-to-br ${info.color} border-primary/10 hover:border-primary/20 transition-all hover:shadow-lg`}>
              <CardContent className="p-6 text-center">
                <info.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-bold text-sm mb-1">{info.title}</h4>
                <p className="text-xs text-muted-foreground">{info.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};