import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminInfluencerWithdrawals } from "@/components/influencer/AdminInfluencerWithdrawals";
import { Sparkles } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function AdminInfluencerPayouts() {
  return (
    <>
      <FloatingHowItWorks
        title="How Admin Payouts works"
        steps={[
          { title: 'Review queue', description: 'See pending payout requests.' },
          { title: 'Verify identity', description: 'Confirm KYC and account status.' },
          { title: 'Approve or reject', description: 'Trigger Stripe transfer or flag issues.' },
          { title: 'Audit log', description: 'Every action is logged for compliance.' },
        ]}
      />
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Influencer Payouts"
          subtitle="Review and process withdrawal requests from creators on InfluKing."
          icon={Sparkles}
          badge="Payouts"
          breadcrumbs={[{ label: "Influencer Payouts" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-1 max-w-md">
              <TabsTrigger value="requests">Withdrawal Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="requests" className="mt-6">
              <AdminInfluencerWithdrawals />
            </TabsContent>
          </Tabs>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
    </>
  );
}
