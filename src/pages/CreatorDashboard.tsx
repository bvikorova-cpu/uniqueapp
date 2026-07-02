import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import {
  DollarSign,
  Users,
  Gift,
  TrendingUp,
  Crown,
  Plus,
} from "lucide-react";

interface CreatorProfile {
  id: string;
  display_name: string;
  bio: string;
  total_subscribers: number;
  total_earnings: number;
  is_verified: boolean;
}

interface GiftReceived {
  id: string;
  gift: {
    name: string;
    price: number;
  };
  sender_id: string;
  message: string;
  creator_earning: number;
  created_at: string;
}

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [gifts, setGifts] = useState<GiftReceived[]>([]);
  const [stats, setStats] = useState({
    monthlyEarnings: 0,
    totalGifts: 0,
    activeSubscribers: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get creator profile
      const { data: profileData, error: profileError } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        toast({
          title: "No Creator Profile",
          description: "Please create a creator profile first",
          variant: "destructive",
        });
        navigate("/membership-community");
        return;
      }

      setProfile(profileData);

      // Get gifts received
      const { data: giftsData } = await supabase
        .from("creator_gifts_sent")
        .select(`
          *,
          gift:virtual_gifts(name, price)
        `)
        .eq("recipient_creator_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setGifts(giftsData || []);

      // Calculate stats
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: monthlyGifts } = await supabase
        .from("creator_gifts_sent")
        .select("creator_earning")
        .eq("recipient_creator_id", profileData.id)
        .gte("created_at", monthStart.toISOString());

      const monthlyEarnings = monthlyGifts?.reduce((sum, g) => sum + Number(g.creator_earning), 0) || 0;

      const { count: subscribersCount } = await supabase
        .from("creator_memberships")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", profileData.id)
        .eq("status", "active");

      setStats({
        monthlyEarnings,
        totalGifts: giftsData?.length || 0,
        activeSubscribers: subscribersCount || 0,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FloatingHowItWorks
        title="How Creator Dashboard works"
        steps={[
          { title: 'Manage content', description: 'Publish, edit, and schedule posts.' },
          { title: 'Monetize', description: 'Enable subscriptions, tips, and PPV.' },
          { title: 'Engage fans', description: 'Respond to DMs and comments.' },
          { title: 'Cash out', description: 'Request payouts via Stripe Connect.' },
        ]}
      />
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {profile?.display_name}
                {profile?.is_verified && <Crown className="h-6 w-6 text-primary" />}
              </h1>
              <p className="text-muted-foreground mt-1">{profile?.bio}</p>
            </div>
            <Button onClick={() => { window.location.href = "/profile/edit"; }}>
              <Plus className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                ${profile?.total_earnings.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                ${stats.monthlyEarnings.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {stats.activeSubscribers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gifts Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                {stats.totalGifts}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="gifts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="gifts">Recent Gifts</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="tiers">Membership Tiers</TabsTrigger>
          </TabsList>

          <TabsContent value="gifts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Gifts</CardTitle>
                <CardDescription>Gifts you've received from your supporters</CardDescription>
              </CardHeader>
              <CardContent>
                {gifts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No gifts received yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {gifts.map((gift) => (
                      <div
                        key={gift.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{gift.gift.name}</h4>
                          {gift.message && (
                            <p className="text-sm text-muted-foreground mt-1">
                              "{gift.message}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(gift.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            +${gift.creator_earning.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            (${gift.gift.price} - 20% fee)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <CardTitle>Subscribers</CardTitle>
                <CardDescription>Manage your {stats.activeSubscribers} community members</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.activeSubscribers === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No subscribers yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Share your profile to get your first subscribers!</p>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    You have {stats.activeSubscribers} active subscribers
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Exclusive Content</CardTitle>
                <CardDescription>Share posts with your members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button onClick={() => toast({ title: "Create exclusive content for your subscribers!" })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers">
            <Card>
              <CardHeader>
                <CardTitle>Membership Tiers</CardTitle>
                <CardDescription>Create and manage subscription levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button onClick={() => toast({ title: "Create membership tiers to offer different subscription levels!" })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Tier
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}