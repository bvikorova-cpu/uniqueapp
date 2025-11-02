import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, Shield, Zap, Wallet, Users } from "lucide-react";
import { EmotionWallet } from "@/components/emotion-economy/EmotionWallet";
import { EmotionFeed } from "@/components/emotion-economy/EmotionFeed";
import { EmotionMarket } from "@/components/emotion-economy/EmotionMarket";
import { EmotionMining } from "@/components/emotion-economy/EmotionMining";
import { EmotionInsurance } from "@/components/emotion-economy/EmotionInsurance";
import { EmotionDrops } from "@/components/emotion-economy/EmotionDrops";

export default function EmotionEconomy() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-12 w-12 text-red-500 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              Emotion Economy Network
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A social network where emotions are currency - buy joy, sell sadness, trade motivation
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 max-w-5xl mx-auto">
            <Card className="border-red-500/20 hover:border-red-500/40 transition-all">
              <CardContent className="pt-6 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <h3 className="font-semibold mb-1">AI Emotion Detection</h3>
                <p className="text-xs text-muted-foreground">Content analyzed automatically</p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-500/20 hover:border-blue-500/40 transition-all">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold mb-1">Emotion Trading</h3>
                <p className="text-xs text-muted-foreground">Buy, sell, and exchange emotions</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/20 hover:border-green-500/40 transition-all">
              <CardContent className="pt-6 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold mb-1">Emotion Mining</h3>
                <p className="text-xs text-muted-foreground">Create emotions, earn commission</p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-500/20 hover:border-purple-500/40 transition-all">
              <CardContent className="pt-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-semibold mb-1">Emotion Insurance</h3>
                <p className="text-xs text-muted-foreground">Protection from negativity</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-5xl mx-auto">
            <TabsTrigger value="feed">
              <Users className="h-4 w-4 mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="wallet">
              <Wallet className="h-4 w-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="market">
              <TrendingUp className="h-4 w-4 mr-2" />
              Market
            </TabsTrigger>
            <TabsTrigger value="mining">
              <Zap className="h-4 w-4 mr-2" />
              Mining
            </TabsTrigger>
            <TabsTrigger value="insurance">
              <Shield className="h-4 w-4 mr-2" />
              Insurance
            </TabsTrigger>
            <TabsTrigger value="drops">
              <Heart className="h-4 w-4 mr-2" />
              Drops
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <EmotionFeed />
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <EmotionWallet />
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <EmotionMarket />
          </TabsContent>

          <TabsContent value="mining" className="space-y-6">
            <EmotionMining />
          </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            <EmotionInsurance />
          </TabsContent>

          <TabsContent value="drops" className="space-y-6">
            <EmotionDrops />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}