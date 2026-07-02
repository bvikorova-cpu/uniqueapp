import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PayoutRecord {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  balance_after: number;
  created_at: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  scheduled_payout_date: string | null;
  payout_batch_id: string | null;
}

interface PayoutHistoryProps {
  instructorId: string;
}

export function PayoutHistory({ instructorId }: PayoutHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PayoutRecord[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  useEffect(() => {
    loadHistory();
  }, [instructorId]);

  const loadHistory = async () => {
    try {
      setLoading(true);

      // Load transaction history
      const { data: historyData, error: historyError } = await supabase
        .from("instructor_payout_history")
        .select("*")
        .eq("instructor_id", instructorId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (historyError) throw historyError;

      // Load withdrawal requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("instructor_withdrawal_requests")
        .select("*")
        .eq("instructor_id", instructorId)
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      setHistory(historyData || []);
      setWithdrawalRequests(requestsData || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Payout History - How it works"} steps={[{ title: 'Open', desc: 'Access the Payout History section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Payout History.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-4">
      {/* Withdrawal Requests */}
      {withdrawalRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withdrawalRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">{formatCurrency(request.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.created_at), "PPP")}
                      </p>
                      {request.payment_method && (
                        <p className="text-xs text-muted-foreground capitalize">
                          via {request.payment_method.replace("_", " ")}
                        </p>
                      )}
                      {request.scheduled_payout_date && (
                        <p className="text-xs text-muted-foreground">
                          Scheduled for: {format(new Date(request.scheduled_payout_date), "MMM d, yyyy")}
                        </p>
                      )}
                      {request.admin_notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Note: {request.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(request.status) as any}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      {record.transaction_type === "course_sale" ? (
                        <ArrowUpRight className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {record.transaction_type.replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(record.created_at), "PPP")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        record.amount > 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {record.amount > 0 ? "+" : ""}
                      {formatCurrency(Math.abs(record.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: {formatCurrency(record.balance_after)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
