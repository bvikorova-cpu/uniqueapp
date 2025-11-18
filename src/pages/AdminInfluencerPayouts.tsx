import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminInfluencerWithdrawals } from "@/components/influencer/AdminInfluencerWithdrawals";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function AdminInfluencerPayouts() {
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
        <h1 className="text-3xl font-bold">Influencer Withdrawal Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and process influencer withdrawal requests
        </p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-1 max-w-md">
          <TabsTrigger value="requests">Withdrawal Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          <AdminInfluencerWithdrawals />
        </TabsContent>
      </Tabs>
    </div>
  );
}
