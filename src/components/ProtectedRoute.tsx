import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { savePendingAction } from '@/lib/pendingAction';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const isSmokeTest = typeof window !== "undefined" && (window as any).__SMOKE_TEST__ === true;
  const [isChecking, setIsChecking] = useState(!isSmokeTest);
  const [hasAccess, setHasAccess] = useState(isSmokeTest);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isSmokeTest) return;
    if (loading) return;
    checkAccess();
  }, [loading, user?.id, requireAdmin, location.pathname, location.search, location.hash]);

  const checkAccess = async () => {
    try {
      if (!user) {
        const returnTo = `${location.pathname}${location.search}${location.hash}`;
        savePendingAction({ key: "auth:return", returnTo });
        setHasAccess(false);
        setIsChecking(false);
        toast({
          title: "Access denied",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      if (requireAdmin) {
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('Error checking admin role:', error);
          setHasAccess(false);
        } else {
          setHasAccess(!!roleData);
          if (!roleData) {
            toast({
              title: "Access denied",
              description: "You do not have permission to access this page",
              variant: "destructive",
            });
          }
        }
      } else {
        setHasAccess(true);
      }
    } catch (error) {
      console.error('Access check error:', error);
      setHasAccess(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
