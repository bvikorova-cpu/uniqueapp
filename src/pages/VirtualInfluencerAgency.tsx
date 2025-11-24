import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Users, DollarSign } from "lucide-react";
import CreateInfluencer from "@/components/virtual-influencer/CreateInfluencer";
import InfluencerCard from "@/components/virtual-influencer/InfluencerCard";
import InfluencerDashboard from "@/components/virtual-influencer/InfluencerDashboard";
import { useToast } from "@/hooks/use-toast";

const VirtualInfluencerAgency = () => {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);

  const { data: influencers, isLoading } = useQuery({
    queryKey: ["virtual-influencers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("virtual_influencers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: totalEarnings } = useQuery({
    queryKey: ["total-earnings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from("influencer_earnings")
        .select("net_amount")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.reduce((sum, earning) => sum + Number(earning.net_amount), 0);
    },
  });

  const totalFollowers = influencers?.reduce((sum, inf) => sum + (inf.followers || 0), 0) || 0;
  const avgEngagement = influencers?.length
    ? (influencers.reduce((sum, inf) => sum + Number(inf.engagement_rate || 0), 0) / influencers.length).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 mt-16">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Virtual Influencer Agency
          </h1>
          <p className="text-muted-foreground mb-6">
            Create AI-powered virtual influencers that generate content and earn money for you
          </p>
          
          <div className="bg-card border rounded-lg p-6 text-left space-y-4 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold">How It Works</h2>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Create Your Influencer:</strong> Design a virtual influencer by choosing their name, niche (Fashion, Fitness, Technology, etc.), and personality type. AI generates a unique avatar for your influencer.
              </p>
              
              <p>
                <strong className="text-foreground">2. Generate Content:</strong> Use AI to automatically create Instagram posts, stories, reels, and videos. Each content type costs credits: Stories (3 credits), Posts (5 credits), Reels (8 credits), Videos (10 credits).
              </p>
              
              <p>
                <strong className="text-foreground">3. Publish & Earn:</strong> When you publish content, it simulates real engagement (likes, comments, shares) based on your influencer's follower count and engagement rate. You earn money from views - the platform takes 20% commission.
              </p>
              
              <p>
                <strong className="text-foreground">4. Track Performance:</strong> Monitor your influencer's growth through the dashboard - see follower count, engagement rates, content library, and detailed earnings breakdowns with transaction history.
              </p>
              
              <p>
                <strong className="text-foreground">5. Scale Up:</strong> Create multiple influencers across different niches to diversify your income streams. Each influencer operates independently with its own audience and earnings.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Influencers</p>
                <p className="text-2xl font-bold">{influencers?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Followers</p>
                <p className="text-2xl font-bold">{totalFollowers.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Engagement</p>
                <p className="text-2xl font-bold">{avgEngagement}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">€{totalEarnings?.toFixed(2) || "0.00"}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="influencers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="influencers">My Influencers</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="influencers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Virtual Influencers</h2>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Influencer
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">Loading your influencers...</div>
            ) : influencers && influencers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {influencers.map((influencer) => (
                  <InfluencerCard
                    key={influencer.id}
                    influencer={influencer}
                    onSelect={() => setSelectedInfluencer(influencer.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No influencers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first virtual influencer and start earning
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Influencer
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            {selectedInfluencer ? (
              <InfluencerDashboard influencerId={selectedInfluencer} />
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Select an influencer to view their dashboard
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateInfluencer open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
};

export default VirtualInfluencerAgency;
