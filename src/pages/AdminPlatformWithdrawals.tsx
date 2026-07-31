import { Banknote } from "lucide-react";
import { AdminPlatformWithdrawals } from "@/components/admin/AdminPlatformWithdrawals";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminPlatformWithdrawalsPage() {
  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Platform Withdrawals"
          subtitle="Available funds, pending withdrawal requests and the full payout history across all hubs."
          icon={Banknote}
          badge="Finance"
          breadcrumbs={[{ label: "Platform Withdrawals" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <AdminPlatformWithdrawals />
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
