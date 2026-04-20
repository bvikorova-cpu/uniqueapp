import { TrendingUp } from "lucide-react";
import { AdminPlatformEarnings } from "@/components/admin/AdminPlatformEarnings";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminPlatformEarningsPage() {
  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Platform Earnings"
          subtitle="Real-time commission overview across InfluKing, MasterChef and Sports verticals."
          icon={TrendingUp}
          badge="Finance"
          breadcrumbs={[{ label: "Platform Earnings" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <AdminPlatformEarnings />
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
