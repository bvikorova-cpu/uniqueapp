import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Sparkles, Users, MessageCircle, TrendingUp } from "lucide-react";
import { CloneCreator } from "@/components/ai-clone/CloneCreator";
import { MyClones } from "@/components/ai-clone/MyClones";
import { CloneMarketplace } from "@/components/ai-clone/CloneMarketplace";
import { CloneDating } from "@/components/ai-clone/CloneDating";
import { CloneSubscriptions } from "@/components/ai-clone/CloneSubscriptions";

export default function AIClone() {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Personality Clone Network
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create a digital copy of your personality that communicates for you 24/7 while you sleep or work
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="pt-6 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">24/7 Communication</h3>
                <p className="text-sm text-muted-foreground">Your AI clone chats and responds</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Build Relationships</h3>
                <p className="text-sm text-muted-foreground">Your clone networks while you rest</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Learning AI</h3>
                <p className="text-sm text-muted-foreground">Grows smarter from your interactions</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="create">
              <Sparkles className="h-4 w-4 mr-2" />
              Create Clone
            </TabsTrigger>
            <TabsTrigger value="my-clones">
              <Bot className="h-4 w-4 mr-2" />
              My Clones
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              <Users className="h-4 w-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="dating">
              <MessageCircle className="h-4 w-4 mr-2" />
              Clone Dating
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <TrendingUp className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <CloneCreator />
          </TabsContent>

          <TabsContent value="my-clones" className="space-y-6">
            <MyClones />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <CloneMarketplace />
          </TabsContent>

          <TabsContent value="dating" className="space-y-6">
            <CloneDating />
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <CloneSubscriptions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}