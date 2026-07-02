import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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
  chef_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: any;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  chef_name?: string;
  chef_email?: string;
}

export const ChefWithdrawalManagement = () => {
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
        .from("masterchef_withdrawal_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get chef profiles
      const chefIds = [...new Set(data?.map(r => r.chef_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", chefIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enrichedRequests = (data || []).map(req => ({
        ...req,
        chef_name: profilesMap.get(req.chef_id)?.full_name || "Unknown Chef",
        chef_email: profilesMap.get(req.chef_id)?.email || "N/A",
      }));

      setRequests(enrichedRequests);
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

      const { error } = await supabase.rpc("process_masterchef_withdrawal", {
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
        <FloatingHowItWorks title="How Chef Withdrawal Management works" steps={[
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
    <>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {["all", "pending", "approved", "completed", "rejected"].map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterRequests(status).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No {status !== "all" && status} requests found
                </CardContent>
              </Card>
            ) : (
              filterRequests(status).map(request => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.chef_name}</CardTitle>
                        <CardDescription>{request.chef_email}</CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-2xl font-bold flex items-center gap-1">
                          <DollarSign className="h-5 w-5" />€{request.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-medium capitalize">
                          {request.payment_method?.replace("_", " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Requested</p>
                        <p className="text-sm">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {request.processed_at && (
                        <div>
                          <p className="text-sm text-muted-foreground">Processed</p>
                          <p className="text-sm">
                            {new Date(request.processed_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {request.payment_details && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Payment Details:</p>
                        {request.payment_method === "bank_transfer" ? (
                          <div className="text-sm space-y-1">
                            <p><span className="text-muted-foreground">Account Holder:</span> {request.payment_details.accountHolder}</p>
                            <p><span className="text-muted-foreground">IBAN:</span> {request.payment_details.iban}</p>
                            {request.payment_details.bankName && (
                              <p><span className="text-muted-foreground">Bank:</span> {request.payment_details.bankName}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Email:</span> {request.payment_details.email}
                          </p>
                        )}
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Admin Notes:</p>
                        <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                      </div>
                    )}

                    {request.status === "pending" && (
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminNotes(request.admin_notes || "");
                        }}
                        className="w-full"
                      >
                        Process Request
                      </Button>
                    )}

                    {request.status === "approved" && (
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminNotes(request.admin_notes || "");
                        }}
                        className="w-full"
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Withdrawal Request</DialogTitle>
            <DialogDescription>
              Review and process the withdrawal request from {selectedRequest?.chef_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">€{selectedRequest?.amount.toFixed(2)}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this withdrawal..."
                className="mt-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              {selectedRequest?.status === "pending" && (
                <>
                  <StripePayoutButton
                    kind="masterchef"
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
                    className="w-full"
                  >
                    Approve only (no payout)
                  </Button>
                  <Button
                    onClick={() => handleProcessRequest("rejected")}
                    disabled={processing}
                    variant="destructive"
                    className="w-full"
                  >
                    Reject Request
                  </Button>
                </>
              )}

              {selectedRequest?.status === "approved" && (
                <Button
                  onClick={() => handleProcessRequest("completed")}
                  disabled={processing}
                  className="w-full"
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
