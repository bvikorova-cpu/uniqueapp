import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { StripePayoutButton } from "@/components/admin/StripePayoutButton";

interface WithdrawalRequest {
  id: string;
  influencer_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: any;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  influencer_name?: string;
  influencer_email?: string;
}

export const AdminInfluencerWithdrawals = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("influencer_withdrawal_requests")
        .select(`
          *,
          influencer_profiles!inner (
            user_id,
            display_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user emails
      const userIds = [...new Set(data?.map(r => r.influencer_profiles.user_id) || [])];
      const { data: profiles } = await (supabase as any)
        .from("profiles_public").select("id, email")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enrichedRequests = (data || []).map(req => ({
        ...req,
        influencer_name: req.influencer_profiles.display_name || "Unknown Influencer",
        influencer_email: profilesMap.get(req.influencer_profiles.user_id)?.email || "N/A",
      }));

      setRequests(enrichedRequests);
    } catch (error: any) {
      console.error("Error loading requests:", error);
      toast.error("Error loading withdrawal requests");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (status: "completed" | "rejected") => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase.rpc("process_influencer_withdrawal", {
        p_request_id: selectedRequest.id,
        p_admin_id: session.user.id,
        p_status: status,
        p_admin_notes: adminNotes || null,
      });

      if (error) throw error;

      toast.success(`Request ${status}!`);
      setSelectedRequest(null);
      setAdminNotes("");
      loadRequests();
    } catch (error: any) {
      console.error("Error processing request:", error);
      toast.error("Failed to process request: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "processing":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending" || r.status === "processing");
  const completedRequests = requests.filter(r => r.status === "completed" || r.status === "rejected");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No pending withdrawal requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.influencer_name}</CardTitle>
                      <CardDescription className="mt-1">
                        {request.influencer_email}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-bold flex items-center gap-1">
                        <DollarSign className="h-5 w-5" />
                        €{Number(request.amount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-medium capitalize">{request.payment_method.replace("_", " ")}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Payment Details</p>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      {request.payment_method === "bank_transfer" ? (
                        <>
                          <p><strong>Account Holder:</strong> {request.payment_details.accountHolder}</p>
                          <p><strong>IBAN:</strong> {request.payment_details.iban}</p>
                          {request.payment_details.bankName && (
                            <p><strong>Bank:</strong> {request.payment_details.bankName}</p>
                          )}
                        </>
                      ) : (
                        <p><strong>PayPal Email:</strong> {request.payment_details.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Requested</p>
                    <p className="text-sm">{new Date(request.created_at).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <StripePayoutButton
                      kind="influencer"
                      withdrawalId={request.id}
                      amount={Number(request.amount)}
                      onPaid={loadRequests}
                    />
                    <Button
                      onClick={() => setSelectedRequest(request)}
                      variant="outline"
                      className="w-full"
                    >
                      Manual process / reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No completed requests yet</p>
              </CardContent>
            </Card>
          ) : (
            completedRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.influencer_name}</CardTitle>
                      <CardDescription>{request.influencer_email}</CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">€{Number(request.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="capitalize">{request.payment_method.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processed:</span>
                    <span className="text-sm">
                      {request.processed_at ? new Date(request.processed_at).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  {request.admin_notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Admin Notes:</p>
                      <p className="text-sm">{request.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Withdrawal Request</DialogTitle>
            <DialogDescription>
              Review and process this withdrawal request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p><strong>Influencer:</strong> {selectedRequest.influencer_name}</p>
                <p><strong>Amount:</strong> €{Number(selectedRequest.amount).toFixed(2)}</p>
                <p><strong>Method:</strong> {selectedRequest.payment_method.replace("_", " ")}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (Optional)</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this transaction..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleProcessRequest("rejected")}
                  disabled={processing}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleProcessRequest("completed")}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Complete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
