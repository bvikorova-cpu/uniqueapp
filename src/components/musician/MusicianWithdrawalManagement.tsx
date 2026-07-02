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

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface WithdrawalRequest {
  id: string;
  musician_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: any;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  musician_profiles: {
    stage_name: string;
    user_id: string;
  };
}

export const MusicianWithdrawalManagement = () => {
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
        .from("musician_withdrawal_requests")
        .select(`
          *,
          musician_profiles(stage_name, user_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error("Error loading requests:", error);
      toast.error("Error loading withdrawal requests");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (status: "approved" | "rejected" | "completed") => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase.rpc("process_musician_withdrawal", {
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
      toast.error("Error processing request: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { icon: Clock, color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
      approved: { icon: CheckCircle, color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
      completed: { icon: CheckCircle, color: "bg-green-500/20 text-green-700 dark:text-green-400" },
      rejected: { icon: XCircle, color: "bg-red-500/20 text-red-700 dark:text-red-400" },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;
    return (
      <>
        <FloatingHowItWorks title="How Musician Withdrawal Management works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
        <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
      </>
      );
  };

  const filterRequests = (status: string) => {
    if (status === "all") return requests;
    return requests.filter(r => r.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({filterRequests("pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({filterRequests("approved").length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({filterRequests("completed").length})</TabsTrigger>
          <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
        </TabsList>

        {["pending", "approved", "completed", "all"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4 mt-6">
            {filterRequests(status === "all" ? "all" : status).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No {status} requests</p>
                </CardContent>
              </Card>
            ) : (
              filterRequests(status === "all" ? "all" : status).map((request) => (
                <Card key={request.id} className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setSelectedRequest(request)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {request.musician_profiles.stage_name}
                        </CardTitle>
                        <CardDescription>
                          {new Date(request.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <span className="text-2xl font-bold">€{request.amount.toFixed(2)}</span>
                      </div>
                      <Badge variant="outline">{request.payment_method}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Withdrawal Request Details</DialogTitle>
              <DialogDescription>
                Review and process musician withdrawal request
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Musician</p>
                  <p className="font-semibold">{selectedRequest.musician_profiles.stage_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-2xl">€{selectedRequest.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-semibold">{selectedRequest.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested</p>
                  <p className="font-semibold">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
                {selectedRequest.processed_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Processed</p>
                    <p className="font-semibold">{new Date(selectedRequest.processed_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedRequest.payment_details && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(selectedRequest.payment_details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="font-mono text-sm">{value as string}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {selectedRequest.admin_notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Admin Notes</p>
                  <p className="text-sm p-3 bg-muted rounded-lg">{selectedRequest.admin_notes}</p>
                </div>
              )}

              {selectedRequest.status === "pending" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Notes (optional)</label>
                    <Textarea
                      placeholder="Add notes about this request..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <StripePayoutButton
                      kind="musician"
                      withdrawalId={selectedRequest.id}
                      amount={selectedRequest.amount}
                      onPaid={() => {
                        setSelectedRequest(null);
                        loadRequests();
                      }}
                    />
                    <Button
                      onClick={() => handleProcessRequest("approved")}
                      disabled={processing}
                      variant="outline"
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve only
                    </Button>
                    <Button
                      onClick={() => handleProcessRequest("rejected")}
                      disabled={processing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.status === "approved" && (
                <Button
                  onClick={() => handleProcessRequest("completed")}
                  disabled={processing}
                  className="w-full"
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
