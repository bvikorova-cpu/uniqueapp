import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignWithdrawalManagement } from "@/components/fundraising/CampaignWithdrawalManagement";
import { MusicianWithdrawalManagement } from "@/components/musician/MusicianWithdrawalManagement";
import { ChefWithdrawalManagement } from "@/components/masterchef/ChefWithdrawalManagement";
import { AdminAuctionWithdrawals } from "@/components/auction/AdminAuctionWithdrawals";
import { AdminReferralWithdrawals } from "@/components/referral/AdminReferralWithdrawals";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function WithdrawalRequests() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useIsAdmin();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Withdrawal Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and process withdrawal requests from campaigns, musicians, and auction sellers
        </p>
      </div>

      <Tabs defaultValue="musicians" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-4xl">
          <TabsTrigger value="musicians">Musicians</TabsTrigger>
          <TabsTrigger value="chefs">MasterChefs</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="auctions">Auctions</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="musicians" className="mt-6">
          <MusicianWithdrawalManagement />
        </TabsContent>

        <TabsContent value="chefs" className="mt-6">
          <ChefWithdrawalManagement />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignWithdrawalManagement />
        </TabsContent>

        <TabsContent value="auctions" className="mt-6">
          <AdminAuctionWithdrawals />
        </TabsContent>

        <TabsContent value="referrals" className="mt-6">
          <AdminReferralWithdrawals />
        </TabsContent>
      </Tabs>
    </div>
  );
}
