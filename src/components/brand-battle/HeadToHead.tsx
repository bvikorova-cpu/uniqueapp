import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Vote, Loader2, RefreshCw, Trophy, Zap, BarChart3 } from "lucide-react";
import confetti from "canvas-confetti";

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

  function getRandomMatchup(list: BrandSponsor[]): [BrandSponsor, BrandSponsor] | null {
    if (list.length < 2) return null;
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }

  const handleVote = (brand: BrandSponsor) => {
    if (!canVote || !isAuthenticated || isVoting) return;
    setVoted(brand.id);
    setShowResult(true);
    onVote(brand.id, brand.name);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["hsl(var(--primary))", "#FFD700", "#FF6B00"],
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
      <Card className="text-center p-8 backdrop-blur-xl bg-card/80">
        <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Not enough brands for a matchup yet. Check back soon!</p>
      </Card>
    );
  }

  const [brandA, brandB] = matchup;
  const totalVotes = brandA.total_votes + brandB.total_votes;
  const pctA = totalVotes > 0 ? Math.round((brandA.total_votes / totalVotes) * 100) : 50;
  const pctB = 100 - pctA;

  const renderBrand = (brand: BrandSponsor, pct: number, isLeft: boolean) => {
    const isSelected = voted === brand.id;
    const isOther = voted && !isSelected;

    return (
      <motion.div
        className={`relative text-center p-6 rounded-2xl cursor-pointer transition-all backdrop-blur-sm ${
          isSelected
            ? "bg-primary/15 ring-2 ring-primary shadow-lg shadow-primary/10"
            : isOther ? "opacity-40 grayscale" : "hover:bg-muted/60 bg-muted/30 border border-transparent hover:border-primary/20"
        }`}
        whileHover={!voted ? { scale: 1.03, y: -4 } : {}}
        whileTap={!voted ? { scale: 0.97 } : {}}
        onClick={() => !voted && handleVote(brand)}
        layout
      >
        {/* Glow effect on selection */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="relative z-10">
          {brand.logo.startsWith("http") ? (
            <img src={brand.logo} alt={brand.name} className="w-24 h-24 object-cover rounded-xl mx-auto mb-3 shadow-md" />
          ) : (
            <div className="text-6xl mb-3">{brand.logo}</div>
          )}
          <h3 className="font-bold text-lg mb-1">{brand.name}</h3>
          <Badge variant="secondary" className="text-xs mb-2">{brand.category}</Badge>
          <p className="text-sm text-muted-foreground line-clamp-2">{brand.description}</p>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-3 rounded-xl bg-background/50"
            >
              <div className="text-3xl font-black text-primary">{brand.total_votes}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                {pct}% of votes
              </div>
              {/* Vote bar */}
              <div className="w-full h-2 rounded-full bg-muted mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {isSelected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <Badge className="bg-primary text-primary-foreground gap-1 shadow-md">
                <Trophy className="h-3 w-3" /> Your Pick
              </Badge>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="overflow-hidden border border-primary/20 backdrop-blur-xl bg-card/80">
      <CardHeader className="text-center bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
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
        </div>
        <p className="text-sm text-muted-foreground">Pick your winner — who deserves your vote?</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {renderBrand(brandA, pctA, true)}

          {/* VS Divider */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20"
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-primary-foreground font-black text-lg">VS</span>
            </motion.div>
            {showResult && (
              <div className="w-full">
                <div className="flex h-2 rounded-full overflow-hidden bg-muted mt-2" style={{ width: 64 }}>
                  <motion.div
                    className="bg-primary"
                    initial={{ width: "50%" }}
                    animate={{ width: `${pctA}%` }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.div
                    className="bg-accent"
                    initial={{ width: "50%" }}
                    animate={{ width: `${pctB}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            )}
          </div>

          {renderBrand(brandB, pctB, false)}
        </div>

        {/* Next matchup */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mt-8"
            >
              <Button onClick={nextMatchup} className="gap-2 px-6" size="lg">
                <RefreshCw className="h-4 w-4" />
                Next Matchup
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {!isAuthenticated && (
          <p className="text-center text-sm text-muted-foreground mt-4">Sign in to vote in matchups</p>
        )}
      </CardContent>
    </Card>
  );
};
