import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Vote, Loader2, RefreshCw, Flame, Trophy } from "lucide-react";
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
  };

  if (!matchup) {
    return (
      <Card className="text-center p-8">
        <p className="text-muted-foreground">Not enough brands for a matchup yet.</p>
      </Card>
    );
  }

  const [brandA, brandB] = matchup;
  const totalVotes = brandA.total_votes + brandB.total_votes;
  const pctA = totalVotes > 0 ? Math.round((brandA.total_votes / totalVotes) * 100) : 50;
  const pctB = 100 - pctA;

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardHeader className="text-center bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Swords className="h-5 w-5 text-primary" />
          Head-to-Head Battle
        </CardTitle>
        <p className="text-sm text-muted-foreground">Pick your winner — who deserves your vote?</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Brand A */}
          <motion.div
            className={`text-center p-6 rounded-2xl cursor-pointer transition-all ${
              voted === brandA.id
                ? "bg-primary/15 ring-2 ring-primary"
                : voted ? "opacity-50" : "hover:bg-muted/80 bg-muted/40"
            }`}
            whileHover={!voted ? { scale: 1.03 } : {}}
            whileTap={!voted ? { scale: 0.97 } : {}}
            onClick={() => !voted && handleVote(brandA)}
          >
            {brandA.logo.startsWith("http") ? (
              <img src={brandA.logo} alt={brandA.name} className="w-20 h-20 object-cover rounded-xl mx-auto mb-3" />
            ) : (
              <div className="text-5xl mb-3">{brandA.logo}</div>
            )}
            <h3 className="font-bold text-lg mb-1">{brandA.name}</h3>
            <Badge variant="secondary" className="text-xs">{brandA.category}</Badge>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{brandA.description}</p>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3"
              >
                <div className="text-2xl font-black text-primary">{brandA.total_votes}</div>
                <div className="text-xs text-muted-foreground">votes ({pctA}%)</div>
              </motion.div>
            )}
            {voted === brandA.id && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                <Badge className="bg-primary text-primary-foreground gap-1">
                  <Trophy className="h-3 w-3" /> Your Pick
                </Badge>
              </motion.div>
            )}
          </motion.div>

          {/* VS Divider */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-primary-foreground font-black text-lg">VS</span>
            </motion.div>
            {showResult && (
              <div className="w-full">
                <div className="flex h-2 rounded-full overflow-hidden bg-muted mt-2" style={{ width: 56 }}>
                  <div className="bg-primary transition-all" style={{ width: `${pctA}%` }} />
                  <div className="bg-accent transition-all" style={{ width: `${pctB}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Brand B */}
          <motion.div
            className={`text-center p-6 rounded-2xl cursor-pointer transition-all ${
              voted === brandB.id
                ? "bg-accent/15 ring-2 ring-accent"
                : voted ? "opacity-50" : "hover:bg-muted/80 bg-muted/40"
            }`}
            whileHover={!voted ? { scale: 1.03 } : {}}
            whileTap={!voted ? { scale: 0.97 } : {}}
            onClick={() => !voted && handleVote(brandB)}
          >
            {brandB.logo.startsWith("http") ? (
              <img src={brandB.logo} alt={brandB.name} className="w-20 h-20 object-cover rounded-xl mx-auto mb-3" />
            ) : (
              <div className="text-5xl mb-3">{brandB.logo}</div>
            )}
            <h3 className="font-bold text-lg mb-1">{brandB.name}</h3>
            <Badge variant="secondary" className="text-xs">{brandB.category}</Badge>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{brandB.description}</p>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3"
              >
                <div className="text-2xl font-black text-accent">{brandB.total_votes}</div>
                <div className="text-xs text-muted-foreground">votes ({pctB}%)</div>
              </motion.div>
            )}
            {voted === brandB.id && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                <Badge className="bg-accent text-accent-foreground gap-1">
                  <Trophy className="h-3 w-3" /> Your Pick
                </Badge>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Next matchup */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-6"
          >
            <Button onClick={nextMatchup} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Next Matchup
            </Button>
          </motion.div>
        )}

        {!isAuthenticated && (
          <p className="text-center text-sm text-muted-foreground mt-4">Sign in to vote in matchups</p>
        )}
      </CardContent>
    </Card>
  );
};
