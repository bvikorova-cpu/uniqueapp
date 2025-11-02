import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Upload, Search, Package, Hammer, Shield } from "lucide-react";
import MyMemories from "@/components/memory-theft/MyMemories";
import ExploreMemories from "@/components/memory-theft/ExploreMemories";
import MemoryCollections from "@/components/memory-theft/MemoryCollections";
import MemoryAuctions from "@/components/memory-theft/MemoryAuctions";
import MemoryVerification from "@/components/memory-theft/MemoryVerification";

const MemoryTheft = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Memory Theft Social</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          "Steal" someone else's experience - relive it through AI simulation
        </p>
      </div>

      <Tabs defaultValue="explore" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="explore" className="gap-2">
            <Search className="h-4 w-4" />
            Explore
          </TabsTrigger>
          <TabsTrigger value="my-memories" className="gap-2">
            <Upload className="h-4 w-4" />
            My Memories
          </TabsTrigger>
          <TabsTrigger value="collections" className="gap-2">
            <Package className="h-4 w-4" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="auctions" className="gap-2">
            <Hammer className="h-4 w-4" />
            Auctions
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-2">
            <Shield className="h-4 w-4" />
            Verify
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explore">
          <ExploreMemories />
        </TabsContent>

        <TabsContent value="my-memories">
          <MyMemories />
        </TabsContent>

        <TabsContent value="collections">
          <MemoryCollections />
        </TabsContent>

        <TabsContent value="auctions">
          <MemoryAuctions />
        </TabsContent>

        <TabsContent value="verification">
          <MemoryVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemoryTheft;
