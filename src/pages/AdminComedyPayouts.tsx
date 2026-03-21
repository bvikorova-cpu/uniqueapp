import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { DollarSign, Check, X } from "lucide-react";

export default function AdminComedyPayouts() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from("comedian_withdrawal_requests")
      .select(`
        *,
        comedian:comedian_profiles(
          stage_name,
          user_id
        )
      `)
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("Error loading requests:", error);
      toast.error("Failed to load payout requests");
      return;
    }

    setRequests(data || []);
    setLoading(false);
  };

  const handleProcess = async (status: "approved" | "rejected" | "completed") => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = {
        status,
        admin_notes: adminNotes,
        processed_by: user?.id,
        processed_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("comedian_withdrawal_requests")
        .update(updateData)
        .eq("id", selectedRequest.id);

      if (updateError) throw updateError;

      // If completed, deduct from comedian's pending balance
      if (status === "completed") {
        const { error: balanceError } = await supabase.rpc("deduct_comedian_balance", {
          p_comedian_id: selectedRequest.comedian_id,
          p_amount: selectedRequest.amount
        });

        if (balanceError) {
          console.error("Error updating balance:", balanceError);
          toast.error("Request updated but failed to update balance");
        }
      }

      toast.success(`Request ${status}!`);
      setSelectedRequest(null);
      setAdminNotes("");
      loadRequests();
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error("Failed to process request");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 mt-16">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Comedy Club Payouts</h1>
            <p className="text-muted-foreground">Manage comedian withdrawal requests</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <p className="text-3xl font-bold">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Pending Amount</p>
            <p className="text-3xl font-bold text-yellow-500">
              €{requests
                .filter(r => r.status === 'pending')
                .reduce((sum, r) => sum + r.amount, 0)
                .toFixed(2)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Completed Today</p>
            <p className="text-3xl font-bold text-green-500">
              {requests.filter(r => 
                r.status === 'completed' && 
                new Date(r.processed_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-black mb-4">Withdrawal Requests</h2>
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">
                        {request.comedian?.stage_name}
                      </h3>
                      <Badge
                        variant={
                          request.status === "completed"
                            ? "default"
                            : request.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-green-500">
                      €{request.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Method: {request.payment_method}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {format(new Date(request.requested_at), "PPP p")}
                    </p>
                    {request.admin_notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Admin notes: {request.admin_notes}
                      </p>
                    )}
                  </div>
                  
                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Process
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Withdrawal Request</DialogTitle>
              <DialogDescription>
                {selectedRequest?.comedian?.stage_name} - €{selectedRequest?.amount.toFixed(2)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Payment Method:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest?.payment_method}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Payment Details:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest?.payment_details?.details || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this payout..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                onClick={() => handleProcess("rejected")}
                disabled={processing}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                variant="outline"
                onClick={() => handleProcess("approved")}
                disabled={processing}
              >
                Approve
              </Button>
              <Button
                onClick={() => handleProcess("completed")}
                disabled={processing}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark as Paid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
