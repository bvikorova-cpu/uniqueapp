import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vote, Loader2, ExternalLink, Crown, TrendingUp, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface BrandSponsor {
  id: string;
  name: string;
  logo: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "enterprise";
  category: string;
  total_votes: number;
  description: string;
  website: string;
  featured?: boolean;
}

interface FeaturedBrandCardProps {
  sponsor: BrandSponsor;
  rank: number;
  onVote: (brandId: string, brandName: string) => void;
  isVoting: boolean;
  canVote: boolean;
  isAuthenticated: boolean;
}

const TIER_COLORS: Record<string, string> = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-purple-400 to-purple-600",
  enterprise: "from-amber-400 via-yellow-500 to-amber-600",
};

const RANK_STYLES = {
  1: {
    medal: "🥇",
    cardClass: "md:scale-105 shadow-2xl ring-2 ring-yellow-500/50",
    bgGradient: "from-yellow-500/15 to-amber-500/5",
    textColor: "text-yellow-500",
    label: "🏆 Current Leader",
    glowColor: "shadow-yellow-500/20",
  },
  2: {
    medal: "🥈",
    cardClass: "shadow-xl ring-1 ring-gray-400/30",
    bgGradient: "from-gray-400/10 to-gray-500/5",
    textColor: "text-gray-400",
    label: "Runner Up",
    glowColor: "shadow-gray-400/10",
  },
  3: {
    medal: "🥉",
    cardClass: "shadow-lg ring-1 ring-amber-600/30",
    bgGradient: "from-amber-600/10 to-orange-500/5",
    textColor: "text-amber-600",
    label: "Bronze Medal",
    glowColor: "shadow-amber-600/10",
  },
};

export const FeaturedBrandCard = ({
  sponsor,
  rank,
  onVote,
  isVoting,
  canVote,
  isAuthenticated,
}: FeaturedBrandCardProps) => {
  const rankStyle = RANK_STYLES[rank as keyof typeof RANK_STYLES];
  const tierColor = TIER_COLORS[sponsor.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (rank - 1) * 0.15, type: "spring" }}
      whileHover={{ y: -8 }}
    >
      <Card
        className={`relative overflow-hidden backdrop-blur-xl bg-card/80 bg-gradient-to-br ${rankStyle.bgGradient} ${rankStyle.cardClass} ${rankStyle.glowColor} transition-all`}
      >
        {/* Tier indicator bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tierColor}`} />

        {/* Animated background particles for #1 */}
        {rank === 1 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        {/* Rank badge */}
        <div className="absolute -top-2 -right-2 z-10">
          <motion.div
            className="text-5xl drop-shadow-lg"
            animate={rank === 1 ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {rankStyle.medal}
          </motion.div>
        </div>

        <CardHeader className="text-center pb-3 pt-6">
          <motion.div
            className="flex justify-center mb-3"
            whileHover={{ scale: 1.05 }}
          >
            {sponsor.logo.startsWith("http") ? (
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="w-28 h-28 object-cover rounded-2xl shadow-lg border-2 border-primary/10"
              />
            ) : (
              <div className="text-7xl">{sponsor.logo}</div>
            )}
          </motion.div>

          <div className={`text-sm font-bold uppercase tracking-wider ${rankStyle.textColor} mb-1`}>
            {rankStyle.label}
          </div>

          <CardTitle className="text-2xl">{sponsor.name}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{sponsor.description}</p>

          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary">{sponsor.category}</Badge>
            <Badge className={`bg-gradient-to-r ${tierColor} text-white border-0 shadow-sm`}>
              {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}
            </Badge>
            {(sponsor.featured || ["silver","gold","platinum","enterprise"].includes(sponsor.tier)) && (
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/40 gap-1">
                <Flame className="h-3 w-3" /> Featured
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Vote count with trend indicator */}
          <div className="text-center p-4 rounded-xl backdrop-blur-sm bg-background/40 border border-primary/10">
            <div className="flex items-center justify-center gap-2">
              <div className={`text-4xl font-black ${rankStyle.textColor}`}>
                {sponsor.total_votes.toLocaleString()}
              </div>
              {rank === 1 && (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </motion.div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">total votes</div>
            {rank === 1 && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-500 font-medium">Trending #1</span>
              </div>
            )}
          </div>

          {/* Vote button */}
          <Button
            onClick={() => onVote(sponsor.id, sponsor.name)}
            className="w-full min-h-[48px] text-base shadow-lg shadow-primary/10"
            size="lg"
            disabled={!isAuthenticated || isVoting || !canVote}
          >
            {isVoting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Voting...
              </>
            ) : (
              <>
                <Vote className="h-5 w-5 mr-2" />
                Vote for {sponsor.name}
              </>
            )}
          </Button>

          {/* Website link */}
          {sponsor.website && (
            <a
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors py-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visit website
            </a>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};