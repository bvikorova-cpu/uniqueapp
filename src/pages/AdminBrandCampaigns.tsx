import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCampaignApplications } from "@/components/brand/AdminCampaignApplications";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function AdminBrandCampaigns() {
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
        <h1 className="text-3xl font-bold">Brand Campaign Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve influencer applications for brand campaigns
        </p>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-1 max-w-md">
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-6">
          <AdminCampaignApplications />
        </TabsContent>
      </Tabs>
    </div>
  );
}