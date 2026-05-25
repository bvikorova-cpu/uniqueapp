import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Check, X, Eye } from "lucide-react";
import { StripePayoutButton } from "@/components/admin/StripePayoutButton";

interface InstructorProfile {
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface WithdrawalRequest {
  id: string;
  instructor_id: string;
  amount: number;
  payment_method: string;
  payment_details: any;
  status: string;
  admin_notes: string | null;
  created_at: string;
  instructor_profiles: InstructorProfile | null;
}

export function AdminWithdrawalManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // First get withdrawal requests with instructor profile
      const { data: requestsData, error: requestsError } = await supabase
        .from("instructor_withdrawal_requests")
        .select(`
          *,
          instructor_profiles!inner (
            user_id
          )
        `)
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      // Then get profiles for each instructor
      if (requestsData && requestsData.length > 0) {
        const userIds = requestsData.map(r => r.instructor_profiles.user_id);
        const { data: profilesData } = await (supabase as any)
          .from("profiles_public").select("id, full_name, email")
          .in("id", userIds);

        // Merge the data
        const enrichedRequests = requestsData.map(request => ({
          ...request,
          instructor_profiles: {
            ...request.instructor_profiles,
            profiles: profilesData?.find(p => p.id === request.instructor_profiles.user_id) || null
          }
        }));

        setRequests(enrichedRequests as any);
      } else {
        setRequests([]);
      }
    } catch (error: any) {
      console.error("Error loading requests:", error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processRequest = async (status: "completed" | "rejected") => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("process_withdrawal_request", {
        p_request_id: selectedRequest.id,
        p_admin_id: user.id,
        p_status: status,
        p_admin_notes: adminNotes || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Withdrawal request ${status}`,
      });

      setShowDetailsDialog(false);
      setSelectedRequest(null);
      setAdminNotes("");
      loadRequests();
    } catch (error: any) {
      console.error("Error processing request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const openDetailsDialog = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setShowDetailsDialog(true);
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
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests Management</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No withdrawal requests
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">
                        {request.instructor_profiles?.profiles?.full_name || "Unknown"}
                      </p>
                      <Badge variant={getStatusColor(request.status) as any}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.instructor_profiles?.profiles?.email || "N/A"}
                    </p>
                    <p className="text-lg font-bold mt-2">
                      {formatCurrency(request.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested on {format(new Date(request.created_at), "PPP")}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      via {request.payment_method.replace("_", " ")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailsDialog(request)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    {request.status === "pending" && (
                      <>
                        <StripePayoutButton
                          kind="instructor"
                          withdrawalId={request.id}
                          amount={request.amount}
                          onPaid={loadRequests}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            processRequest("completed");
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark paid
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withdrawal Request Details</DialogTitle>
            <DialogDescription>
              Review and process the withdrawal request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>Instructor</Label>
                <p className="text-sm">
                  {selectedRequest.instructor_profiles?.profiles?.full_name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedRequest.instructor_profiles?.profiles?.email || "N/A"}
                </p>
              </div>

              <div>
                <Label>Amount</Label>
                <p className="text-lg font-bold">
                  {formatCurrency(selectedRequest.amount)}
                </p>
              </div>

              <div>
                <Label>Payment Method</Label>
                <p className="text-sm capitalize">
                  {selectedRequest.payment_method.replace("_", " ")}
                </p>
              </div>

              <div>
                <Label>Payment Details</Label>
                <div className="text-sm space-y-1 bg-muted p-3 rounded">
                  {selectedRequest.payment_details.accountHolder && (
                    <p>Account Holder: {selectedRequest.payment_details.accountHolder}</p>
                  )}
                  {selectedRequest.payment_details.iban && (
                    <p>IBAN: {selectedRequest.payment_details.iban}</p>
                  )}
                  {selectedRequest.payment_details.bic && (
                    <p>BIC: {selectedRequest.payment_details.bic}</p>
                  )}
                  {selectedRequest.payment_details.bankName && (
                    <p>Bank: {selectedRequest.payment_details.bankName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  rows={3}
                />
              </div>

              {selectedRequest.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => processRequest("rejected")}
                    disabled={processing}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => processRequest("completed")}
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? "Processing..." : "Approve"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
