import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Sparkles, ShoppingBag, Trophy, Info, Star, Zap, CheckCircle } from "lucide-react";
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
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 py-4 sm:py-6 pt-16 sm:pt-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium">AI Fashion Design Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Create Your Fashion Vision
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              Design clothing with AI - from wedding dresses to summer swimwear
            </p>
            
            {/* Credits Display */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 pt-2">
              <Card className="p-2 sm:p-3 bg-background/50 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Palette className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">AI Credits</p>
                    <p className="text-lg sm:text-xl font-bold">
                      {creditsLoading ? "..." : credits?.credits_remaining || 0}
                    </p>
                  </div>
                </div>
              </Card>
              
              {(!credits || credits.credits_remaining < 50) && (
                <Button 
                  onClick={() => navigate('/ai-credits-store')}
                  variant="default"
                  size="sm"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                  Buy Credits
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="container mx-auto px-3 sm:px-4 py-4">
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border-purple-500/20">
          <div className="flex items-start gap-3 mb-4">
            <Info className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">What is AI Fashion Design Studio?</h3>
              <p className="text-sm text-muted-foreground">
                AI Fashion Design Studio is your creative partner for designing unique clothing. Use advanced AI to generate stunning fashion designs, from elegant wedding dresses to casual streetwear. Browse the community gallery, sell your designs in the marketplace, and compete in fashion challenges to showcase your creativity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                How to Use
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>• <strong>Generator:</strong> Create AI-powered fashion designs</li>
                <li>• <strong>Gallery:</strong> Browse and discover community creations</li>
                <li>• <strong>Marketplace:</strong> Buy and sell unique designs</li>
                <li>• <strong>Challenges:</strong> Compete in themed fashion contests</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                Key Features
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> AI-powered clothing generation</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Multiple styles and categories</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Community marketplace</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Fashion design challenges</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-background/50 rounded-lg p-3">
            <strong>Tip:</strong> Be specific with your design descriptions for better AI results. Include details like style, color, fabric, and occasion to get the most accurate fashion designs.
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-4 lg:w-[600px] mx-auto">
              <TabsTrigger value="generator" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Generator</span>
                <span className="sm:hidden">Gen</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Marketplace</span>
                <span className="sm:hidden">Market</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Challenges</span>
                <span className="sm:hidden">Chal</span>
              </TabsTrigger>
            </TabsList>
          </div>

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