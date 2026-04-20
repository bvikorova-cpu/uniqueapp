import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCampaignApplications } from "@/components/brand/AdminCampaignApplications";
import { Megaphone } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminBrandCampaigns() {
  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Brand Campaigns"
          subtitle="Approve influencer applications for active brand collaborations."
          icon={Megaphone}
          badge="Brands"
          breadcrumbs={[{ label: "Brand Campaigns" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-1 max-w-md">
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>
            <TabsContent value="applications" className="mt-6">
              <AdminCampaignApplications />
            </TabsContent>
          </Tabs>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
