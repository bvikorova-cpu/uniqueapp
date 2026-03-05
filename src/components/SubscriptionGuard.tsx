import { useEffect, useState, ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { safeInvoke } from '@/utils/safeInvoke';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Loader2 } from 'lucide-react';

interface SubscriptionGuardProps {
  children: ReactNode;
  checkFunction: string; // Edge function name to check subscription
  redirectTo: string; // Where to redirect if no subscription
  serviceName: string; // Display name for the service
}

export const SubscriptionGuard = ({ 
  children, 
  checkFunction, 
  redirectTo, 
  serviceName 
}: SubscriptionGuardProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkSubscription();
  }, [checkFunction]);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      // Check if user has admin role - admins bypass subscription check
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleData) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // Check subscription via edge function with safe error handling
      const { data, error } = await safeInvoke(checkFunction);
      
      if (error) {
        console.error('Subscription check error:', error);
        // On error, grant temporary access to avoid blocking users
        setHasAccess(true);
      } else {
        setHasAccess(data?.subscribed === true);
        
        if (!data?.subscribed) {
          toast({
            title: "Subscription Required",
            description: `You need an active ${serviceName} subscription to access this feature.`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Subscription check error:', error);
      // On unexpected error, grant access to avoid blocking
      setHasAccess(true);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Checking subscription...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background/95 to-background/90">
        <Card className="max-w-md w-full border-2 border-destructive/50 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Subscription Required</CardTitle>
            <CardDescription className="text-base">
              You need an active {serviceName} subscription to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate(redirectTo)}
              className="w-full"
              size="lg"
            >
              View Subscription Plans
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};