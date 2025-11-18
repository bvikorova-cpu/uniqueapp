import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Euro, TrendingUp, Gift, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InfluencerWithdrawalDialog } from "./InfluencerWithdrawalDialog";

interface ProfileEarnings {
  id: string;
  pending_balance: number;
  lifetime_earnings: number;
  total_withdrawn: number;
}

interface GiftEarning {
  id: string;
  amount: number;
  chef_amount: number;
  platform_commission: number;
  created_at: string;
  message: string | null;
  influencer_gifts: {
    name: string;
    icon: string;
  } | null;
}

export const InfluencerEarningsPage = () => {
  const [profile, setProfile] = useState<ProfileEarnings | null>(null);
  const [gifts, setGifts] = useState<GiftEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get influencer profile
      const { data: profileData, error: profileError } = await supabase
        .from("influencer_profiles")
        .select("id, pending_balance, lifetime_earnings, total_withdrawn")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        if (profileError.code === "PGRST116") {
          toast({
            title: "No Influencer Profile",
            description: "You need to create an influencer profile first",
            variant: "destructive",
          });
          navigate("/influ-king");
          return;
        }
        throw profileError;
      }

      setProfile(profileData);

      // Get gifts received
      const { data: giftsData, error: giftsError } = await supabase
        .from("influencer_sent_gifts")
        .select(`
          id,
          amount,
          chef_amount,
          platform_commission,
          created_at,
          message,
          influencer_gifts (
            name,
            icon
          )
        `)
        .eq("influencer_id", profileData.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(20);

      if (giftsError) throw giftsError;
      setGifts(giftsData || []);
    } catch (error: any) {
      console.error("Error loading earnings:", error);
      toast({
        title: "Error",
        description: "Failed to load earnings data",
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Influencer Earnings
          </h1>
          <p className="text-muted-foreground">Your gift income and withdrawals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{Number(profile.pending_balance).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{Number(profile.lifetime_earnings).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{Number(profile.total_withdrawn).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Paid out</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Gifts</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gifts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Gifts received</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Minimum withdrawal amount: €10.00
              </p>
              <Button
                onClick={() => setShowWithdrawalDialog(true)}
                disabled={Number(profile.pending_balance) < 10}
              >
                Request Withdrawal
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Gifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gifts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No gifts received yet
                </p>
              ) : (
                gifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{gift.influencer_gifts?.icon}</div>
                      <div>
                        <p className="font-medium">{gift.influencer_gifts?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(gift.created_at).toLocaleDateString()}
                        </p>
                        {gift.message && (
                          <p className="text-sm text-muted-foreground italic mt-1">
                            "{gift.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +€{Number(gift.chef_amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (€{Number(gift.platform_commission).toFixed(2)} fee)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <InfluencerWithdrawalDialog
          open={showWithdrawalDialog}
          onOpenChange={setShowWithdrawalDialog}
          influencerId={profile.id}
          availableBalance={Number(profile.pending_balance)}
          onSuccess={loadEarningsData}
        />
      </div>
    </div>
  );
};
