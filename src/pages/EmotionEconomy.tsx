import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, Shield, Zap, Wallet, Users, Sparkles } from "lucide-react";
import { EmotionWallet } from "@/components/emotion-economy/EmotionWallet";
import { EmotionFeed } from "@/components/emotion-economy/EmotionFeed";
import { EmotionMarket } from "@/components/emotion-economy/EmotionMarket";
import { EmotionMining } from "@/components/emotion-economy/EmotionMining";
import { EmotionInsurance } from "@/components/emotion-economy/EmotionInsurance";
import { EmotionDrops } from "@/components/emotion-economy/EmotionDrops";

export default function EmotionEconomy() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-12 w-12 text-red-500 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Emotion Economy Network
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            A social network where emotions are currency - buy joy, sell sadness, trade motivation
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-5xl mx-auto">
            <Card className="border-red-500/20 hover:border-red-500/40 transition-all">
              <CardContent className="pt-4 pb-4 text-center">
                <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <h3 className="font-semibold text-sm mb-1">AI Emotion Detection</h3>
                <p className="text-xs text-muted-foreground">Content analyzed automatically</p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-500/20 hover:border-blue-500/40 transition-all">
              <CardContent className="pt-4 pb-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold text-sm mb-1">Emotion Trading</h3>
                <p className="text-xs text-muted-foreground">Buy, sell, exchange</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/20 hover:border-green-500/40 transition-all">
              <CardContent className="pt-4 pb-4 text-center">
                <Zap className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold text-sm mb-1">Emotion Mining</h3>
                <p className="text-xs text-muted-foreground">Earn 50% commission</p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-500/20 hover:border-purple-500/40 transition-all">
              <CardContent className="pt-4 pb-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <h3 className="font-semibold text-sm mb-1">Emotion Insurance</h3>
                <p className="text-xs text-muted-foreground">Protection plans</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works Section */}
        <Card className="max-w-5xl mx-auto border-primary/20 bg-background mb-8">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              How Emotion Economy Works
            </CardTitle>
            <CardDescription className="text-base">
              Your complete guide to the emotional marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Feed
                </h4>
                <p className="text-sm">
                  Share your thoughts and feelings. AI automatically detects the emotional content of your posts (joy, motivation, love, etc.) and rewards you with corresponding emotion tokens.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" /> Wallet
                </h4>
                <p className="text-sm">
                  Your emotional balance storage. Track all your emotion tokens (joy, motivation, love, sadness, etc.). Add funds, withdraw earnings, and monitor your emotional portfolio value.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Market
                </h4>
                <p className="text-sm">
                  Trade emotions like stocks. Buy low, sell high. Each emotion has real-time pricing based on supply and demand. Convert sadness to joy or invest in rare emotions.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Mining
                </h4>
                <p className="text-sm">
                  Create positive content that generates emotions for others. Earn 50% commission every time someone consumes emotions from your content. Top miners earn €500+/month.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Insurance
                </h4>
                <p className="text-sm">
                  Protect yourself from negativity. Subscription plans (€9.99-24.99/month) automatically block toxic emotions, backup your balance, and provide recovery guarantees.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" /> Drops
                </h4>
                <p className="text-sm">
                  Join massive emotion events. Pay €2.99-9.99 to participate in emotion waves where thousands of positive emotions are distributed to all participants simultaneously.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full max-w-5xl mx-auto gap-1 h-auto p-1">
            <TabsTrigger value="feed" className="px-2 py-2 text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="wallet" className="px-2 py-2 text-xs sm:text-sm">
              <Wallet className="h-4 w-4 mr-1" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="market" className="px-2 py-2 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              Market
            </TabsTrigger>
            <TabsTrigger value="mining" className="px-2 py-2 text-xs sm:text-sm">
              <Zap className="h-4 w-4 mr-1" />
              Mining
            </TabsTrigger>
            <TabsTrigger value="insurance" className="px-2 py-2 text-xs sm:text-sm">
              <Shield className="h-4 w-4 mr-1" />
              Insurance
            </TabsTrigger>
            <TabsTrigger value="drops" className="px-2 py-2 text-xs sm:text-sm">
              <Heart className="h-4 w-4 mr-1" />
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