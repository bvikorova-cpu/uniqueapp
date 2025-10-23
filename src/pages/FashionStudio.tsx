import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Sparkles, ShoppingBag, Trophy, Users } from "lucide-react";
import FashionGenerator from "@/components/fashion/FashionGenerator";
import FashionGallery from "@/components/fashion/FashionGallery";
import FashionMarketplace from "@/components/fashion/FashionMarketplace";
import FashionChallenges from "@/components/fashion/FashionChallenges";
import { useAICredits } from "@/hooks/useAICredits";

export default function FashionStudio() {
  const navigate = useNavigate();
  const { credits, loading: creditsLoading } = useAICredits();
  const [activeTab, setActiveTab] = useState("generator");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">AI Fashion Design Studio</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Vytvor Svoju Módnu Víziu
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Navrhuj oblečenie s pomocou AI - od svadobných šiat po letné plavky
            </p>
            
            {/* Credits Display */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <Card className="p-4 bg-background/50 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">AI Kredity</p>
                    <p className="text-2xl font-bold">
                      {creditsLoading ? "..." : credits?.credits_remaining || 0}
                    </p>
                  </div>
                </div>
              </Card>
              
              {(!credits || credits.credits_remaining < 50) && (
                <Button 
                  onClick={() => navigate('/megastore')}
                  variant="default"
                  size="lg"
                  className="gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Kúpiť Kredity
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mx-auto">
            <TabsTrigger value="generator" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generátor
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Palette className="h-4 w-4" />
              Galéria
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Trophy className="h-4 w-4" />
              Súťaže
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <FashionGenerator />
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <FashionGallery />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <FashionMarketplace />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <FashionChallenges />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}