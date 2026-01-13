import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vote, Loader2, ExternalLink, Crown, Star, Award } from "lucide-react";

interface BrandSponsor {
  id: string;
  name: string;
  logo: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  category: string;
  total_votes: number;
  description: string;
  website: string;
}

interface FeaturedBrandCardProps {
  sponsor: BrandSponsor;
  rank: number;
  onVote: (brandId: string, brandName: string) => void;
  isVoting: boolean;
  canVote: boolean;
  isAuthenticated: boolean;
}

const TIER_COLORS = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-purple-400 to-purple-600",
};

const RANK_STYLES = {
  1: {
    medal: "🥇",
    cardClass: "md:scale-105 shadow-2xl ring-2 ring-yellow-500/50",
    bgGradient: "from-yellow-500/20 to-amber-500/10",
    textColor: "text-yellow-500",
  },
  2: {
    medal: "🥈",
    cardClass: "shadow-xl ring-1 ring-gray-400/30",
    bgGradient: "from-gray-400/20 to-gray-500/10",
    textColor: "text-gray-400",
  },
  3: {
    medal: "🥉",
    cardClass: "shadow-lg ring-1 ring-amber-600/30",
    bgGradient: "from-amber-600/20 to-orange-500/10",
    textColor: "text-amber-600",
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
    <Card
      className={`relative overflow-hidden bg-gradient-to-br ${rankStyle.bgGradient} ${rankStyle.cardClass} transition-all hover:scale-[1.02]`}
    >
      {/* Tier indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tierColor}`} />
      
      {/* Rank badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className={`text-5xl drop-shadow-lg ${rank === 1 ? "animate-pulse" : ""}`}>
          {rankStyle.medal}
        </div>
      </div>

      <CardHeader className="text-center pb-3 pt-6">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          {sponsor.logo.startsWith("http") ? (
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              className="w-28 h-28 object-cover rounded-xl shadow-lg"
            />
          ) : (
            <div className="text-7xl">{sponsor.logo}</div>
          )}
        </div>

        {/* Rank title */}
        <div className={`text-sm font-bold uppercase tracking-wider ${rankStyle.textColor} mb-1`}>
          {rank === 1 ? "🏆 Current Leader" : rank === 2 ? "Runner Up" : "Bronze Medal"}
        </div>

        <CardTitle className="text-2xl">{sponsor.name}</CardTitle>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {sponsor.description}
        </p>

        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="secondary">{sponsor.category}</Badge>
          <Badge className={`bg-gradient-to-r ${tierColor} text-white border-0`}>
            {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vote count */}
        <div className="text-center p-4 bg-background/50 rounded-xl">
          <div className={`text-4xl font-bold ${rankStyle.textColor}`}>
            {sponsor.total_votes.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">total votes</div>
        </div>

        {/* Vote button */}
        <Button
          onClick={() => onVote(sponsor.id, sponsor.name)}
          className="w-full min-h-[48px] text-base"
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
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Visit website
          </a>
        )}
      </CardContent>
    </Card>
  );
};
