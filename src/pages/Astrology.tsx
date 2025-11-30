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
import { BirthChartAnalyzer } from "@/components/astrology/BirthChartAnalyzer";
import { LiveChatWithAI } from "@/components/astrology/LiveChatWithAI";

const Astrology = () => {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-6xl pt-16 sm:pt-20">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent px-2">
            ✨ Astrology & Mystical Readings
          </h1>
        </div>

        <div className="mb-4 sm:mb-6">
          <AstrologyCreditsDisplay />
        </div>

        <Tabs defaultValue="horoscope" className="w-full">
          <TabsList className="flex overflow-x-auto gap-1 sm:gap-2 h-auto p-1 sm:p-2 w-full">
            <TabsTrigger value="horoscope" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0">⭐ Horoscope</TabsTrigger>
            <TabsTrigger value="tarot" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0">💳 Tarot</TabsTrigger>
            <TabsTrigger value="dream" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0">💭 Dreams</TabsTrigger>
            <TabsTrigger value="numerology" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0">🔢 Numerology</TabsTrigger>
            <TabsTrigger value="palmistry" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0">🖐️ Palmistry</TabsTrigger>
            <TabsTrigger value="compatibility" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0">💕 Love</TabsTrigger>
            <TabsTrigger value="yesno" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0">❓ Yes/No</TabsTrigger>
            <TabsTrigger value="rune" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0">🗿 Rune</TabsTrigger>
            <TabsTrigger value="birthchart" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0">🌌 Birth</TabsTrigger>
            <TabsTrigger value="livechat" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0">💬 Chat</TabsTrigger>
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
              <BirthChartAnalyzer />
            </TabsContent>

            <TabsContent value="livechat">
              <LiveChatWithAI />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Astrology;
