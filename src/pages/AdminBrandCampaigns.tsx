import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCampaignApplications } from "@/components/brand/AdminCampaignApplications";
import { Megaphone } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AdminBrandCampaigns() {
  return (
    <>
      <FloatingHowItWorks title="Admin: Brand Campaigns" intro="Review, approve and moderate all brand campaigns and creator applications." steps={[
    { title: "Open a campaign", desc: "Use the tabs to filter pending, active, or completed campaigns." },
    { title: "Review applications", desc: "Inspect each creator's application and content proof." },
    { title: "Approve or reject", desc: "Approve to release escrow, reject with a reason to notify the creator." },
    { title: "Escalate", desc: "Flag suspicious cases to the Brand Moderation queue for deeper review." }
  ]} />
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
    </>
  );
}
