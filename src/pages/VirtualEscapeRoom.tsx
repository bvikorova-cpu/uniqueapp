import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Trophy, Users, GraduationCap, Briefcase } from "lucide-react";
import RoomGallery from "@/components/escape-room/RoomGallery";
import RoomBuilder from "@/components/escape-room/RoomBuilder";
import GamePlay from "@/components/escape-room/GamePlay";
import Leaderboard from "@/components/escape-room/Leaderboard";
import SubscriptionPlans from "@/components/escape-room/SubscriptionPlans";
import { useToast } from "@/hooks/use-toast";

const VirtualEscapeRoom = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const roomId = params.get('roomId');
    
    if (success === 'true' && roomId) {
      toast({
        title: "Payment Successful!",
        description: "Starting your escape room adventure..."
      });
      setSelectedRoomId(roomId);
      window.history.replaceState({}, '', '/virtual-escape-room');
    }
  }, [toast]);

  if (selectedRoomId) {
    return <GamePlay roomId={selectedRoomId} onExit={() => setSelectedRoomId(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Virtual Escape Rooms
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Challenge yourself or your team with immersive online escape rooms. Solve puzzles, race against time, and compete on the leaderboard!
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
            <TabsTrigger value="browse" className="gap-2">
              <Lock className="h-4 w-4" />
              Browse Rooms
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Users className="h-4 w-4" />
              Create Room
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Premium
            </TabsTrigger>
            <TabsTrigger value="corporate" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Corporate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <RoomGallery onSelectRoom={setSelectedRoomId} />
          </TabsContent>

          <TabsContent value="create">
            <RoomBuilder />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionPlans />
          </TabsContent>

          <TabsContent value="corporate">
            <div className="bg-card rounded-lg p-8 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4">Corporate Team Building</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Custom branded escape rooms for your team. Boost collaboration, problem-solving skills, and team morale with our corporate packages.
              </p>
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Starter Package</h3>
                  <p className="text-2xl font-bold mb-2">€50</p>
                  <p className="text-sm text-muted-foreground">Up to 10 players</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
                  <h3 className="font-semibold mb-2">Business Package</h3>
                  <p className="text-2xl font-bold mb-2">€100</p>
                  <p className="text-sm text-muted-foreground">Up to 30 players + Analytics</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Enterprise</h3>
                  <p className="text-2xl font-bold mb-2">€200</p>
                  <p className="text-sm text-muted-foreground">Unlimited + Custom Branding</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default VirtualEscapeRoom;
