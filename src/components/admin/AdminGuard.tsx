import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface Props {
  children: ReactNode;
}

/** Shared admin-only gate with cinematic loader */
export const AdminGuard = ({ children }: Props) => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useIsAdmin();

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground font-medium tracking-wide">
            Authorizing admin access…
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
};
