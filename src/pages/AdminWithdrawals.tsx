import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminWithdrawalManagement } from "@/components/instructor/AdminWithdrawalManagement";
import { PayoutBatchesView } from "@/components/instructor/PayoutBatchesView";
import { Wallet } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminWithdrawals() {
  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Instructor Withdrawals"
          subtitle="Review and process payout requests and grouped batches from instructors."
          icon={Wallet}
          badge="Payouts"
          breadcrumbs={[{ label: "Instructor Withdrawals" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="batches">Payout Batches</TabsTrigger>
            </TabsList>
            <TabsContent value="requests" className="mt-6">
              <AdminWithdrawalManagement />
            </TabsContent>
            <TabsContent value="batches" className="mt-6">
              <PayoutBatchesView />
            </TabsContent>
          </Tabs>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
