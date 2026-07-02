import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { WithdrawalRequestDialog } from "./WithdrawalRequestDialog";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface EarningsDashboardProps {
  musicianId: string;
  pendingBalance: number;
  lifetimeEarnings: number;
  totalWithdrawn: number;
}

export const EarningsDashboard = ({ 
  musicianId, 
  pendingBalance, 
  lifetimeEarnings,
  totalWithdrawn 
}: EarningsDashboardProps) => {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [musicianId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load earnings history
      const { data: earningsData, error: earningsError } = await supabase
        .from("musician_earnings")
        .select("*")
        .eq("musician_id", musicianId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (earningsError) throw earningsError;
      setEarnings(earningsData || []);

      // Load withdrawal requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("musician_withdrawal_requests")
        .select("*")
        .eq("musician_id", musicianId)
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;
      setWithdrawalRequests(requestsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading earnings data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
      approved: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
      completed: "bg-green-500/20 text-green-700 dark:text-green-400",
      rejected: "bg-red-500/20 text-red-700 dark:text-red-400",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      ticket_sale: "Ticket Sale",
      gift: "Gift",
      tip: "Tip",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <>
      <FloatingHowItWorks title="How Earnings Dashboard works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{pendingBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{lifetimeEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalWithdrawn.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid out</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Earnings & Withdrawals</h3>
          <p className="text-sm text-muted-foreground">Manage your earnings and request payouts</p>
        </div>
        <Button 
          onClick={() => setShowWithdrawalDialog(true)}
          disabled={pendingBalance < 50}
        >
          Request Withdrawal
        </Button>
      </div>

      {pendingBalance < 50 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm">Minimum withdrawal amount is €50.00</p>
          </CardContent>
        </Card>
      )}

      {/* Withdrawal Requests */}
      {withdrawalRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
            <CardDescription>Your payout request history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withdrawalRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">€{request.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    {request.admin_notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: {request.admin_notes}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>Your latest transactions (80% of total)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4 text-muted-foreground">Loading...</p>
          ) : earnings.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No earnings yet</p>
          ) : (
            <div className="space-y-3">
              {earnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{getTransactionTypeLabel(earning.transaction_type)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(earning.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+€{earning.musician_amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      Total: €{earning.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WithdrawalRequestDialog
        open={showWithdrawalDialog}
        onOpenChange={setShowWithdrawalDialog}
        musicianId={musicianId}
        availableBalance={pendingBalance}
        onSuccess={() => {
          loadData();
          window.location.reload();
        }}
      />
    </div>
    </>
    );
};
