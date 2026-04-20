import { Image as ImageIcon } from "lucide-react";
import { ImageTextRemover } from "@/components/kids/ImageTextRemover";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const AdminImageEditor = () => {
  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="AI Image Editor"
          subtitle="Remove text from images, retouch and prepare assets for the platform."
          icon={ImageIcon}
          badge="AI Tools"
          breadcrumbs={[{ label: "Image Editor" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <ImageTextRemover />
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
};

export default AdminImageEditor;
