import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignWithdrawalManagement } from "@/components/fundraising/CampaignWithdrawalManagement";
import { MusicianWithdrawalManagement } from "@/components/musician/MusicianWithdrawalManagement";
import { ChefWithdrawalManagement } from "@/components/masterchef/ChefWithdrawalManagement";
import { AdminAuctionWithdrawals } from "@/components/auction/AdminAuctionWithdrawals";
import { AdminReferralWithdrawals } from "@/components/referral/AdminReferralWithdrawals";
import { Banknote } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function WithdrawalRequests() {
  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Campaign & Creator Withdrawals"
          subtitle="Process withdrawal requests across musicians, chefs, fundraisers, auctions and referrals."
          icon={Banknote}
          badge="Multi-Hub"
          breadcrumbs={[{ label: "Campaign Withdrawals" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <Tabs defaultValue="musicians" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1 h-auto">
              <TabsTrigger value="musicians">Musicians</TabsTrigger>
              <TabsTrigger value="chefs">KitchenStars</TabsTrigger>
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
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
