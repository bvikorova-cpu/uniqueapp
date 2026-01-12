import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDisneyCastles, useUserVisits, useUserStamps } from "@/hooks/useDisneyCastles";
import { useUserCertificates } from "@/hooks/useCertificates";
import { Globe2, MapPin, Sparkles, Trophy, ArrowLeft, Award, Volume2 } from "lucide-react";
import { CastleVoiceNarration } from "@/components/disney/CastleVoiceNarration";
import cinderellaFlorida from "@/assets/disney/cinderella-castle-florida.jpg";
import sleepingBeautyCalifornia from "@/assets/disney/sleeping-beauty-castle-california.jpg";
import parisCastle from "@/assets/disney/paris-castle.jpg";
import hongkongCastle from "@/assets/disney/hongkong-castle.jpg";
import shanghaiCastle from "@/assets/disney/shanghai-castle.jpg";
import tokyoCastle from "@/assets/disney/tokyo-castle-exterior.jpg";

// Map castle names to their images
const castleImages: Record<string, string> = {
  "Cinderella Castle": cinderellaFlorida, // Florida and Tokyo both use this
  "Sleeping Beauty Castle": sleepingBeautyCalifornia,
  "Le Château de la Belle au Bois Dormant": parisCastle,
  "Castle of Magical Dreams": hongkongCastle,
  "Enchanted Storybook Castle": shanghaiCastle,
};

// Special handling for duplicate castle names
const getCastleImage = (name: string, parkName: string): string => {
  if (name === "Cinderella Castle") {
    return parkName.includes("Tokyo") ? tokyoCastle : cinderellaFlorida;
  }
  return castleImages[name] || "";
};

export default function DisneyCastles() {
  const navigate = useNavigate();
  const { castles, isLoading } = useDisneyCastles();
  const { visits } = useUserVisits();
  const { stamps } = useUserStamps();
  const { certificates } = useUserCertificates();

  const visitedCastleIds = visits?.map(v => v.castle_id) || [];
  const stampedCastleIds = stamps?.map(s => s.castle_id) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading magical castles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/kids-channel")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Kids Channel
            </Button>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/kids-channel/certificate-gallery")}
                className="gap-2"
              >
                <Award className="h-4 w-4" />
                My Certificates
                {certificates && certificates.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {certificates.length}
                  </Badge>
                )}
              </Button>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Your Progress</p>
                <p className="font-bold text-lg">
                  {stamps?.length || 0}/6 🏆 Stamps
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🏰 Disney Castle World Tour
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore all 6 magical Disney castles from around the world in stunning HD 360° panoramic views!
          </p>
        </div>

        {/* World Map Preview */}
        <Card className="p-6 mb-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Choose Your Destination</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <span className="text-3xl mb-2 block">🇺🇸</span>
              <p className="font-semibold">USA</p>
              <p className="text-sm text-muted-foreground">2 Castles</p>
            </div>
            <div className="p-4">
              <span className="text-3xl mb-2 block">🇫🇷</span>
              <p className="font-semibold">France</p>
              <p className="text-sm text-muted-foreground">1 Castle</p>
            </div>
            <div className="p-4">
              <span className="text-3xl mb-2 block">🇨🇳</span>
              <p className="font-semibold">China</p>
              <p className="text-sm text-muted-foreground">1 Castle</p>
            </div>
            <div className="p-4">
              <span className="text-3xl mb-2 block">🇭🇰</span>
              <p className="font-semibold">Hong Kong</p>
              <p className="text-sm text-muted-foreground">1 Castle</p>
            </div>
            <div className="p-4">
              <span className="text-3xl mb-2 block">🇯🇵</span>
              <p className="font-semibold">Japan</p>
              <p className="text-sm text-muted-foreground">1 Castle</p>
            </div>
          </div>
        </Card>

        {/* Castle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {castles?.map((castle: any) => {
            const isVisited = visitedCastleIds.includes(castle.id);
            const hasStamp = stampedCastleIds.includes(castle.id);

            return (
              <Card key={castle.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={getCastleImage(castle.name, castle.park_name)} 
                    alt={castle.name}
                    className="w-full h-full object-cover"
                  />
                  {hasStamp && (
                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                      <Trophy className="h-4 w-4 mr-1" />
                      Completed!
                    </Badge>
                  )}
                  {isVisited && !hasStamp && (
                    <Badge className="absolute top-4 right-4 bg-blue-500 text-white">
                      In Progress
                    </Badge>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-xl">{castle.name}</h3>
                    <span className="text-2xl">{getCountryFlag(castle.country_code)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{castle.park_name}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {castle.description}
                  </p>

                  {/* Fun Facts Preview */}
                  {castle.fun_facts && castle.fun_facts.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-600">Fun Fact</span>
                      </div>
                      <p className="text-xs">{castle.fun_facts[0]}</p>
                    </div>
                  )}

                  {/* Voice Narration Preview */}
                  {castle.description && (
                    <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-600">AI Audio Guide</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Listen in 8 languages: 🇬🇧 🇩🇪 🇫🇷 🇪🇸 🇸🇰 🇮🇹 🇵🇹 🇨🇳
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-yellow-600">
                        {castle.price_coins} coins
                      </span>
                    </div>
                    <Button
                      onClick={() => navigate(`/kids-channel/disney-castles/${castle.id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {isVisited ? "Continue" : "Start"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Achievement Section */}
        {(stamps?.length || 0) > 0 && (
          <Card className="mt-12 p-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Your Disney Explorer Collection</h2>
              <p className="text-muted-foreground mb-6">
                Collect all 6 castle stamps to become a Master Disney Explorer!
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                {castles?.map((castle: any) => (
                  <div
                    key={castle.id}
                    className={`p-4 rounded-lg border-2 ${
                      stampedCastleIds.includes(castle.id)
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50"
                        : "border-gray-200 bg-gray-50 dark:bg-gray-900 opacity-50"
                    }`}
                  >
                    <span className="text-4xl block mb-2">
                      {stampedCastleIds.includes(castle.id) ? "🏆" : "🔒"}
                    </span>
                    <p className="text-xs font-semibold">{getCountryFlag(castle.country_code)}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    US: "🇺🇸",
    FR: "🇫🇷",
    CN: "🇨🇳",
    HK: "🇭🇰",
    JP: "🇯🇵",
  };
  return flags[countryCode] || "🏰";
}
