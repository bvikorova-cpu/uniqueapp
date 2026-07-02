import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentGenerator from "./ContentGenerator";
import EarningsChart from "./EarningsChart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, DollarSign, ImageIcon } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface InfluencerDashboardProps {
  influencerId: string;
}

const InfluencerDashboard = ({ influencerId }: InfluencerDashboardProps) => {
  const { data: influencer } = useQuery({
    queryKey: ["influencer", influencerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("virtual_influencers")
        .select("*")
        .eq("id", influencerId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: content } = useQuery({
    queryKey: ["influencer-content", influencerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_content")
        .select("*")
        .eq("influencer_id", influencerId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const { data: earnings } = useQuery({
    queryKey: ["influencer-earnings", influencerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_earnings")
        .select("*")
        .eq("influencer_id", influencerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (!influencer) return <div>Loading...</div>;

  const totalContentEarnings = content?.reduce((sum, c) => sum + Number(c.earnings || 0), 0) || 0;
  const totalLikes = content?.reduce((sum, c) => sum + (c.likes || 0), 0) || 0;

  return (
    <>
      <FloatingHowItWorks title={"Influencer Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Influencer Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Influencer Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Influencer Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={influencer.avatar_url || ""} alt={influencer.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {influencer.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold mb-1">{influencer.name}</h2>
                <div className="flex gap-2 flex-wrap">
                  {influencer.niche && (
                    <Badge variant="secondary">{influencer.niche}</Badge>
                  )}
                  {influencer.personality && (
                    <Badge variant="outline">{influencer.personality}</Badge>
                  )}
                </div>
              </div>
              <Badge variant={influencer.status === "active" ? "default" : "secondary"}>
                {influencer.status}
              </Badge>
            </div>

            {influencer.description && (
              <p className="text-muted-foreground mb-4">{influencer.description}</p>
            )}

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Followers</p>
                <p className="font-bold text-lg">{influencer.followers.toLocaleString()}</p>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="font-bold text-lg">{Number(influencer.engagement_rate).toFixed(1)}%</p>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <ImageIcon className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Posts</p>
                <p className="font-bold text-lg">{content?.length || 0}</p>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Total Earned</p>
                <p className="font-bold text-lg">${Number(influencer.total_earnings).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Content</TabsTrigger>
          <TabsTrigger value="content">Content Library</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <ContentGenerator influencerId={influencerId} influencer={influencer} />
        </TabsContent>

        <TabsContent value="content">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Content</h3>
            {content && content.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <img
                      src={item.content_url}
                      alt="Content"
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                    <Badge variant="secondary" className="mb-2">
                      {item.content_type}
                    </Badge>
                    {item.caption && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.caption}
                      </p>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>❤️ {item.likes}</span>
                      <span>💬 {item.comments}</span>
                      <span>📤 {item.shares}</span>
                      <span className="font-semibold">${Number(item.earnings).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No content yet. Generate your first post!
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <EarningsChart earnings={earnings || []} />
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
};

export default InfluencerDashboard;
