import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyHoroscope } from "@/components/astrology/DailyHoroscope";
import { CompatibilityChecker } from "@/components/astrology/CompatibilityChecker";
import { TarotReader } from "@/components/astrology/TarotReader";
import { NumerologyCalculator } from "@/components/astrology/NumerologyCalculator";
import { BirthChartAnalyzer } from "@/components/astrology/BirthChartAnalyzer";
import { Star, Heart, Sparkles, Calculator, MapPin } from "lucide-react";

const Astrology = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-purple-950/10 to-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              Astrology Suite ⭐
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover your cosmic path with personalized astrology readings, horoscopes, and mystical insights
            </p>
          </div>

          <Tabs defaultValue="horoscope" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="horoscope" className="gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Horoscope</span>
              </TabsTrigger>
              <TabsTrigger value="compatibility" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Love Match</span>
              </TabsTrigger>
              <TabsTrigger value="tarot" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Tarot</span>
              </TabsTrigger>
              <TabsTrigger value="numerology" className="gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Numbers</span>
              </TabsTrigger>
              <TabsTrigger value="birthchart" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Birth Chart</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="horoscope">
              <DailyHoroscope />
            </TabsContent>

            <TabsContent value="compatibility">
              <CompatibilityChecker />
            </TabsContent>

            <TabsContent value="tarot">
              <TarotReader />
            </TabsContent>

            <TabsContent value="numerology">
              <NumerologyCalculator />
            </TabsContent>

            <TabsContent value="birthchart">
              <BirthChartAnalyzer />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Astrology;
