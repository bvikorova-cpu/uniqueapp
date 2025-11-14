import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminWithdrawalManagement } from "@/components/instructor/AdminWithdrawalManagement";
import { PayoutBatchesView } from "@/components/instructor/PayoutBatchesView";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function AdminWithdrawals() {
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
        <h1 className="text-3xl font-bold">Withdrawal Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and process instructor withdrawal requests
        </p>
      </div>

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
    </div>
  );
}
