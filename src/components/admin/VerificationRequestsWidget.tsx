import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileCheck, ArrowRight, AlertCircle } from "lucide-react";

export function VerificationRequestsWidget() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCount();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('verification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employer_verifications',
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingCount = async () => {
    try {
      const { count, error } = await supabase
        .from('employer_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');

      if (error) throw error;
      setPendingCount(count || 0);
    } catch (error) {
      console.error('Error fetching verification count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/verifications')}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Verification Requests
        </CardTitle>
        <FileCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {loading ? "..." : pendingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending employer verifications
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Action needed
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-4 justify-between"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/admin/verifications');
          }}
        >
          View all requests
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
