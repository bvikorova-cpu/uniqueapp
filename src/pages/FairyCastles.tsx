import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDisneyCastles, useUserVisits, useUserStamps } from "@/hooks/useDisneyCastles";
import { useUserCertificates } from "@/hooks/useCertificates";
import { useUserDisneyCollectibles } from "@/hooks/useCollectibles";
import { ArrowLeft, Award, BookOpen } from "lucide-react";
import { CastleHero } from "@/components/disney/CastleHero";
import { InteractiveWorldMap } from "@/components/disney/InteractiveWorldMap";
import { PremiumCastleCard } from "@/components/disney/PremiumCastleCard";
import { StampCollection } from "@/components/disney/StampCollection";
import { CastleLeaderboard } from "@/components/disney/CastleLeaderboard";
import { CollectiblesAlbum } from "@/components/disney/CollectiblesAlbum";
import cinderellaFlorida from "@/assets/disney/cinderella-castle-florida.jpg";
import sleepingBeautyCalifornia from "@/assets/disney/sleeping-beauty-castle-california.jpg";
import parisCastle from "@/assets/disney/paris-castle.jpg";
import hongkongCastle from "@/assets/disney/hongkong-castle.jpg";
import shanghaiCastle from "@/assets/disney/shanghai-castle.jpg";
import tokyoCastle from "@/assets/disney/tokyo-castle-exterior.jpg";

const castleImages: Record<string, string> = {
  "Cinderella Castle": cinderellaFlorida,
  "Sleeping Beauty Castle": sleepingBeautyCalifornia,
  "Le Château de la Belle au Bois Dormant": parisCastle,
  "Castle of Magical Dreams": hongkongCastle,
  "Enchanted Storybook Castle": shanghaiCastle,
};

const getCastleImage = (name: string, parkName: string): string => {
  if (name === "Tokyo Cinderella Castle") return tokyoCastle;
  if (name === "Cinderella Castle") return cinderellaFlorida;
  return castleImages[name] || "";
};

function getCountryFlag(countryCode: string): string {
  return { US: "🇺🇸", FR: "🇫🇷", CN: "🇨🇳", HK: "🇭🇰", JP: "🇯🇵" }[countryCode] || "🏰";
}

export default function DisneyCastles() {
  const navigate = useNavigate();
  const { castles, isLoading } = useDisneyCastles();
  const { visits } = useUserVisits();
  const { stamps } = useUserStamps();
  const { certificates } = useUserCertificates();
  const { data: userCollectibles } = useUserDisneyCollectibles();
  const [showAlbum, setShowAlbum] = useState(false);

  const visitedCastleIds = visits?.map(v => v.castle_id) || [];
  const stampedCastleIds = stamps?.map(s => s.castle_id) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading magical castles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-950">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/kids-channel")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowAlbum(true)} className="gap-1.5">
                ✨ Collectibles
                {userCollectibles && userCollectibles.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{userCollectibles.length}</Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/kids-channel/certificate-gallery")}
                className="gap-1.5"
              >
                <Award className="h-4 w-4" /> Certificates
                {certificates && certificates.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{certificates.length}</Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-16">
        {/* Hero */}
        <CastleHero
          stampsCount={stampedCastleIds.length}
          totalCastles={castles?.length || 6}
          visitedCount={visitedCastleIds.length}
        />

        {/* World Map */}
        <InteractiveWorldMap
          castles={castles || []}
          stampedIds={stampedCastleIds}
          visitedIds={visitedCastleIds}
          onCastleClick={(id) => navigate(`/kids-channel/disney-castles/${id}`)}
        />

        {/* Castle Cards */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              All Castles
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {castles?.map((castle: any, i: number) => (
              <PremiumCastleCard
                key={castle.id}
                castle={castle}
                image={getCastleImage(castle.name, castle.park_name)}
                isVisited={visitedCastleIds.includes(castle.id)}
                hasStamp={stampedCastleIds.includes(castle.id)}
                countryFlag={getCountryFlag(castle.country_code)}
                onExplore={() => navigate(`/kids-channel/disney-castles/${castle.id}`)}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* Stamp Collection */}
        <StampCollection castles={castles || []} stampedIds={stampedCastleIds} />

        {/* Leaderboard & Challenges */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">
            🏆{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Leaderboard & Challenges
            </span>
          </h2>
          <CastleLeaderboard userStamps={stampedCastleIds.length} />
        </div>
      </div>

      {/* Collectibles Album Modal */}
      <CollectiblesAlbum
        collectibles={userCollectibles || []}
        collectedIds={userCollectibles?.map((c: any) => c.collectible_id) || []}
        isVisible={showAlbum}
        onClose={() => setShowAlbum(false)}
      />
    </div>
  );
}
