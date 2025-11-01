import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AstrologyCreditsDisplay } from "@/components/astrology/AstrologyCreditsDisplay";
import { TarotReader } from "@/components/astrology/TarotReader";
import { DailyHoroscope } from "@/components/astrology/DailyHoroscope";
import { DreamInterpretation } from "@/components/astrology/DreamInterpretation";
import { NumerologyCalculator } from "@/components/astrology/NumerologyCalculator";
import { PalmistryReader } from "@/components/astrology/PalmistryReader";
import { CompatibilityChecker } from "@/components/astrology/CompatibilityChecker";
import { YesNoOracle } from "@/components/astrology/YesNoOracle";
import { RuneReader } from "@/components/astrology/RuneReader";

const Astrology = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl pt-20">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
            ✨ Astrology & Mystical Readings
          </h1>
        </div>

        <div className="mb-6">
          <AstrologyCreditsDisplay />
        </div>

        <Tabs defaultValue="horoscope" className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-9 gap-2 h-auto p-2">
            <TabsTrigger value="horoscope">Horoscope ⭐</TabsTrigger>
            <TabsTrigger value="tarot">Tarot 💳</TabsTrigger>
            <TabsTrigger value="dream">Dreams 💭</TabsTrigger>
            <TabsTrigger value="numerology">Numerology 🔢</TabsTrigger>
            <TabsTrigger value="palmistry">Palmistry 🖐️</TabsTrigger>
            <TabsTrigger value="compatibility">Love Match 💕</TabsTrigger>
            <TabsTrigger value="yesno">Yes/No ❓</TabsTrigger>
            <TabsTrigger value="rune">Rune 🗿</TabsTrigger>
            <TabsTrigger value="birthchart">Birth Chart 🌌</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="horoscope">
              <DailyHoroscope />
            </TabsContent>

            <TabsContent value="tarot">
              <TarotReader />
            </TabsContent>

            <TabsContent value="dream">
              <DreamInterpretation />
            </TabsContent>

            <TabsContent value="numerology">
              <NumerologyCalculator />
            </TabsContent>

            <TabsContent value="palmistry">
              <PalmistryReader />
            </TabsContent>

            <TabsContent value="compatibility">
              <CompatibilityChecker />
            </TabsContent>

            <TabsContent value="yesno">
              <YesNoOracle />
            </TabsContent>

            <TabsContent value="rune">
              <RuneReader />
            </TabsContent>

            <TabsContent value="birthchart">
              <div className="text-foreground text-center p-8">
                Birth Chart feature coming soon! 🌌
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Astrology;
