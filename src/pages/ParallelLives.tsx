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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 mt-8">
          <TabsList className="grid w-full grid-cols-6 max-w-5xl mx-auto">
            <TabsTrigger value="my-lives">
              <Users className="h-4 w-4 mr-2" />
              My Lives
            </TabsTrigger>
            <TabsTrigger value="create">
              <Sparkles className="h-4 w-4 mr-2" />
              Create Life
            </TabsTrigger>
            <TabsTrigger value="explore">
              <Globe className="h-4 w-4 mr-2" />
              Explore
            </TabsTrigger>
            <TabsTrigger value="reveal">
              <GitBranch className="h-4 w-4 mr-2" />
              Reveal
            </TabsTrigger>
            <TabsTrigger value="merge">
              <Merge className="h-4 w-4 mr-2" />
              Merge
            </TabsTrigger>
            <TabsTrigger value="subscription">
              Subscription
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