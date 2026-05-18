import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FeatureFlagsPanel } from "@/components/admin/FeatureFlagsPanel";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";
import { BulkUserActions } from "@/components/admin/BulkUserActions";
import { FreeTierSettingsPanel } from "@/components/admin/FreeTierSettingsPanel";
import { SeedContentPanel } from "@/components/admin/SeedContentPanel";

export default function AdminOpsTools() {
  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Ops Tools"
          subtitle="Feature flags, email templates and bulk user operations."
          icon={Wrench}
          badge="Admin"
          breadcrumbs={[{ label: "Ops Tools" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <Tabs defaultValue="flags" className="w-full">
            <TabsList className="grid grid-cols-5 max-w-3xl">
              <TabsTrigger value="flags">Feature Flags</TabsTrigger>
              <TabsTrigger value="templates">Email Templates</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
              <TabsTrigger value="freetier">Free Tier</TabsTrigger>
              <TabsTrigger value="seed">Seed Content</TabsTrigger>
            </TabsList>
            <TabsContent value="flags" className="mt-6"><FeatureFlagsPanel /></TabsContent>
            <TabsContent value="templates" className="mt-6"><EmailTemplateEditor /></TabsContent>
            <TabsContent value="bulk" className="mt-6"><BulkUserActions /></TabsContent>
            <TabsContent value="freetier" className="mt-6"><FreeTierSettingsPanel /></TabsContent>
            <TabsContent value="seed" className="mt-6"><SeedContentPanel /></TabsContent>
          </Tabs>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
