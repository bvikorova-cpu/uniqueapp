import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setHasAccess(false);
        setIsChecking(false);
        toast({
          title: "Prístup zamietnutý",
          description: "Musíte byť prihlásený",
          variant: "destructive",
        });
        return;
      }

      if (requireAdmin) {
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('Error checking admin role:', error);
          setHasAccess(false);
        } else {
          setHasAccess(!!roleData);
          if (!roleData) {
            toast({
              title: "Prístup zamietnutý",
              description: "Nemáte oprávnenie na prístup k tejto stránke",
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
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
