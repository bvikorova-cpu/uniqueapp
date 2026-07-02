import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Vote, Loader2, RefreshCw, Trophy, Zap, BarChart3, Timer, Flame, Crown } from "lucide-react";
import confetti from "canvas-confetti";
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

interface HeadToHeadProps {
  sponsors: BrandSponsor[];
  onVote: (brandId: string, brandName: string) => void;
  isVoting: boolean;
  canVote: boolean;
  isAuthenticated: boolean;
}

export const HeadToHead = ({ sponsors, onVote, isVoting, canVote, isAuthenticated }: HeadToHeadProps) => {
  const [matchup, setMatchup] = useState<[BrandSponsor, BrandSponsor] | null>(() => getRandomMatchup(sponsors));
  const [voted, setVoted] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [winStreak, setWinStreak] = useState(0);

  function getRandomMatchup(list: BrandSponsor[]): [BrandSponsor, BrandSponsor] | null {
    if (list.length < 2) return null;
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }

  // Countdown timer for urgency
  useEffect(() => {
    if (voted || !matchup) return;
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [matchup, voted]);

  const handleVote = (brand: BrandSponsor) => {
    if (!canVote || !isAuthenticated || isVoting) return;
    setVoted(brand.id);
    setShowResult(true);
    onVote(brand.id, brand.name);

    // Check if voted for the leader
    const other = matchup?.find(b => b.id !== brand.id);
    if (other && brand.total_votes >= other.total_votes) {
      setWinStreak(prev => prev + 1);
    } else {
      setWinStreak(0);
    }

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["hsl(var(--primary))", "#FFD700", "#FF6B00", "#7C3AED"],
    });
  };

  const nextMatchup = () => {
    setVoted(null);
    setShowResult(false);
    setMatchup(getRandomMatchup(sponsors));
    setMatchCount(prev => prev + 1);
  };

  if (!matchup) {
    return (
      <Card className="text-center p-12 backdrop-blur-xl bg-card/80">
        <Swords className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-bold text-xl mb-2">Arena Awaits</h3>
        <p className="text-muted-foreground">Not enough brands for a matchup yet. Invite brands to join the battle!</p>
      </Card>
    );
  }

  const [brandA, brandB] = matchup;
  const totalVotes = brandA.total_votes + brandB.total_votes;
  const pctA = totalVotes > 0 ? Math.round((brandA.total_votes / totalVotes) * 100) : 50;
  const pctB = 100 - pctA;

  const renderBrand = (brand: BrandSponsor, pct: number, side: "left" | "right") => {
    const isSelected = voted === brand.id;
    const isOther = voted && !isSelected;
    const sideGradient = side === "left"
      ? "from-primary/10 to-transparent"
      : "from-transparent to-accent/10";

    return (
      <motion.div
        className={`relative text-center p-6 md:p-8 rounded-2xl cursor-pointer transition-all ${
          isSelected
            ? "bg-primary/15 ring-2 ring-primary shadow-2xl shadow-primary/20"
            : isOther
            ? "opacity-30 grayscale scale-95"
            : `hover:bg-muted/60 bg-gradient-to-br ${sideGradient} border border-transparent hover:border-primary/20 hover:shadow-xl`
        }`}
        whileHover={!voted ? { scale: 1.04, y: -6 } : {}}
        whileTap={!voted ? { scale: 0.96 } : {}}
        onClick={() => !voted && handleVote(brand)}
        layout
      >
        {/* Glow pulse on selection */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/5"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        <div className="relative z-10">
          <motion.div
            className="mx-auto mb-4"
            animate={!voted ? { y: [0, -4, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {brand.logo.startsWith("http") ? (
              <img src={brand.logo} alt={brand.name} className="w-28 h-28 object-cover rounded-2xl mx-auto shadow-lg border border-primary/10" />
            ) : (
              <div className="text-7xl">{brand.logo}</div>
            )}
          </motion.div>

          <h3 className="font-black text-xl mb-1">{brand.name}</h3>
          <Badge variant="secondary" className="text-xs mb-2">{brand.category}</Badge>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{brand.description}</p>

          {/* Pre-vote hint */}
          {!voted && (
            <motion.div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Vote className="h-3 w-3" /> Click to vote
            </motion.div>
          )}

          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-primary/10"
            >
              <div className="text-4xl font-black text-primary">{brand.total_votes}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
                <BarChart3 className="h-3 w-3" />
                {pct}% of votes
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isSelected ? "bg-primary" : "bg-muted-foreground/30"}`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {isSelected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <Badge className="bg-primary text-primary-foreground gap-1 shadow-lg text-sm px-3 py-1">
                <Crown className="h-3.5 w-3.5" /> Your Pick
              </Badge>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="overflow-hidden border border-primary/20 backdrop-blur-xl bg-card/80">
      <CardHeader className="text-center bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pb-4">
        <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Swords className="h-5 w-5 text-primary" />
            Head-to-Head Battle
          </CardTitle>
          {matchCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Match #{matchCount + 1}
            </Badge>
          )}
          {winStreak >= 2 && (
            <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-xs">
              <Flame className="h-3 w-3 mr-1" />
              {winStreak} Win Streak!
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Pick your winner — who deserves your vote?</p>

        {/* Countdown timer */}
        {!voted && (
          <motion.div
            className="flex items-center justify-center gap-1.5 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Timer className={`h-4 w-4 ${countdown <= 10 ? "text-red-500" : "text-muted-foreground"}`} />
            <span className={`text-sm font-mono font-bold ${countdown <= 10 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}>
              {countdown}s
            </span>
          </motion.div>
        )}
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-center">
          {renderBrand(brandA, pctA, "left")}

          {/* VS Divider */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl shadow-primary/30"
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-primary-foreground font-black text-xl">VS</span>
            </motion.div>

            {showResult && (
              <div className="w-20">
                <div className="flex h-3 rounded-full overflow-hidden bg-muted shadow-inner">
                  <motion.div
                    className="bg-primary"
                    initial={{ width: "50%" }}
                    animate={{ width: `${pctA}%` }}
                    transition={{ duration: 1 }}
                  />
                  <motion.div
                    className="bg-accent"
                    initial={{ width: "50%" }}
                    animate={{ width: `${pctB}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] font-bold text-primary">{pctA}%</span>
                  <span className="text-[10px] font-bold text-accent">{pctB}%</span>
                </div>
              </div>
            )}
          </div>

          {renderBrand(brandB, pctB, "right")}
        </div>

        {/* Next matchup */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mt-10"
            >
              <Button onClick={nextMatchup} className="gap-2 px-8 shadow-lg shadow-primary/10" size="lg">
                <RefreshCw className="h-4 w-4" />
                Next Matchup
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Uses 1 vote per matchup</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!isAuthenticated && (
          <div className="text-center mt-6 p-4 rounded-xl bg-muted/30 border border-primary/10">
            <p className="text-sm text-muted-foreground">Sign in to vote in matchups and climb the leaderboard</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};