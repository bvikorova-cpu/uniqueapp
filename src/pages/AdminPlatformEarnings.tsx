import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminPlatformEarnings } from "@/components/admin/AdminPlatformEarnings";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function AdminPlatformEarningsPage() {
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
        <h1 className="text-3xl font-bold">Platform Earnings</h1>
        <p className="text-muted-foreground mt-2">
          Overview of all platform commissions from InfluKing, MasterChef, and Sports sections
        </p>
      </div>

      <AdminPlatformEarnings />
    </div>
  );
}
