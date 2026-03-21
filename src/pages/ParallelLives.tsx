import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Users, Sparkles, GitBranch, Merge } from "lucide-react";
import { MyLives } from "@/components/parallel-lives/MyLives";
import { CreateLife } from "@/components/parallel-lives/CreateLife";
import { ExploreLives } from "@/components/parallel-lives/ExploreLives";
import { CrossRealityReveal } from "@/components/parallel-lives/CrossRealityReveal";
import { RealityMerge } from "@/components/parallel-lives/RealityMerge";
import { ParallelSubscriptions } from "@/components/parallel-lives/ParallelSubscriptions";

export default function ParallelLives() {
  const [activeTab, setActiveTab] = useState("my-lives");

  return (
    <div className="min-h-screen bg-background
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-20 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Parallel Lives Network
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Live multiple parallel lives simultaneously - each profile is an alternative version of you
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Multiple Identities</h3>
                <p className="text-sm text-muted-foreground">CEO, rockstar, nomad - be them all</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="pt-6 text-center">
                <GitBranch className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Separate Realities</h3>
                <p className="text-sm text-muted-foreground">Followers know you in only one reality</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="pt-6 text-center">
                <Merge className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Cross-Reality Actions</h3>
                <p className="text-sm text-muted-foreground">Reveal & merge your parallel worlds</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works Section */}
        <Card className="max-w-4xl mx-auto border-primary/20 bg-background
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              How Parallel Lives Works
            </CardTitle>
            <CardDescription className="text-base">
              Your complete guide to living multiple realities simultaneously
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> My Lives
                </h4>
                <p className="text-sm">
                  View and manage all your parallel identities. Each life has its own profile, followers, and content - completely separated from your other realities.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Create Life
                </h4>
                <p className="text-sm">
                  Build a new alternate version of yourself. Choose a persona (CEO, Artist, Traveler, etc.), customize your profile, and start living that reality.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> Explore
                </h4>
                <p className="text-sm">
                  Discover other users' parallel lives. Follow them in specific realities - you'll only see their content from that particular life.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" /> Cross-Reality Reveal
                </h4>
                <p className="text-sm">
                  Dramatically reveal to your followers that you're the same person living multiple lives. Create epic "plot twist" moments!
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Merge className="h-4 w-4 text-primary" /> Reality Merge
                </h4>
                <p className="text-sm">
                  Combine two or more of your parallel lives into one unified identity. All followers from merged realities will see your combined content going forward.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 mt-8">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full max-w-5xl mx-auto gap-1 h-auto p-1">
            <TabsTrigger value="my-lives" className="px-2 py-2 text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1" />
              Lives
            </TabsTrigger>
            <TabsTrigger value="create" className="px-2 py-2 text-xs sm:text-sm">
              <Sparkles className="h-4 w-4 mr-1" />
              Create
            </TabsTrigger>
            <TabsTrigger value="explore" className="px-2 py-2 text-xs sm:text-sm">
              <Globe className="h-4 w-4 mr-1" />
              Explore
            </TabsTrigger>
            <TabsTrigger value="reveal" className="px-2 py-2 text-xs sm:text-sm">
              <GitBranch className="h-4 w-4 mr-1" />
              Reveal
            </TabsTrigger>
            <TabsTrigger value="merge" className="px-2 py-2 text-xs sm:text-sm">
              <Merge className="h-4 w-4 mr-1" />
              Merge
            </TabsTrigger>
            <TabsTrigger value="subscription" className="px-2 py-2 text-xs sm:text-sm">
              Sub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-lives" className="space-y-6">
            <MyLives />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <CreateLife />
          </TabsContent>

          <TabsContent value="explore" className="space-y-6">
            <ExploreLives />
          </TabsContent>

          <TabsContent value="reveal" className="space-y-6">
            <CrossRealityReveal />
          </TabsContent>

          <TabsContent value="merge" className="space-y-6">
            <RealityMerge />
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <ParallelSubscriptions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}