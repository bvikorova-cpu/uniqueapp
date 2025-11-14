import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Wallet, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { WithdrawalRequestDialog } from "./WithdrawalRequestDialog";
import { PayoutHistory } from "./PayoutHistory";

interface InstructorStats {
  pending_balance: number;
  lifetime_earnings: number;
  total_withdrawn: number;
  total_students: number;
  active_courses: number;
}

export function EarningsDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your earnings",
          variant: "destructive",
        });
        return;
      }

      // Get instructor profile with earnings
      const { data: profile, error } = await supabase
        .from("instructor_profiles")
        .select(`
          id,
          pending_balance,
          lifetime_earnings,
          total_withdrawn,
          total_students
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!profile) {
        toast({
          title: "No Instructor Profile",
          description: "Please create an instructor profile first",
          variant: "destructive",
        });
        return;
      }

      setInstructorId(profile.id);

      // Get active courses count
      const { count: coursesCount } = await supabase
        .from("courses")
        .select("*", { count: 'exact', head: true })
        .eq("creator_id", user.id)
        .eq("is_published", true);

      setStats({
        ...profile,
        active_courses: coursesCount || 0,
      });
    } catch (error: any) {
      console.error("Error loading earnings:", error);
      toast({
        title: "Error",
        description: "Failed to load earnings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No earnings data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.pending_balance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.lifetime_earnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total revenue generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total_withdrawn)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully paid out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_students}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {stats.active_courses} courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Minimum withdrawal amount: €10.00
              </p>
              <p className="text-sm text-muted-foreground">
                Processing time: 3-5 business days
              </p>
            </div>
            <Button
              onClick={() => setShowWithdrawalDialog(true)}
              disabled={stats.pending_balance < 10}
            >
              Request Withdrawal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {instructorId && <PayoutHistory instructorId={instructorId} />}

      {/* Withdrawal Dialog */}
      {instructorId && (
        <WithdrawalRequestDialog
          open={showWithdrawalDialog}
          onOpenChange={setShowWithdrawalDialog}
          instructorId={instructorId}
          availableBalance={stats.pending_balance}
          onSuccess={loadEarningsData}
        />
      )}
    </div>
  );
}
