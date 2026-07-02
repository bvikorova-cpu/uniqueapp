import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StripePayoutButton } from "@/components/admin/StripePayoutButton";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface WithdrawalRequest {
  id: string;
  amount: number;
  payment_method: string;
  payment_details: any;
  status: string;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
  seller_id: string;
}

export function AdminAuctionWithdrawals() {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [action, setAction] = useState<'approve' | 'complete' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [stripePayoutId, setStripePayoutId] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['admin-auction-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auction_withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as WithdrawalRequest[];
    }
  });

  const handleProcess = async () => {
    if (!selectedRequest || !action) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('process-auction-withdrawal', {
        body: {
          withdrawalId: selectedRequest.id,
          action,
          adminNotes,
          stripePayoutId: action === 'complete' ? stripePayoutId : undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Withdrawal request ${action}d successfully`,
      });

      setSelectedRequest(null);
      setAction(null);
      setAdminNotes("");
      setStripePayoutId("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (request: WithdrawalRequest, actionType: 'approve' | 'complete' | 'reject') => {
    setSelectedRequest(request);
    setAction(actionType);
    setAdminNotes(request.admin_notes || "");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      approved: { variant: "default", icon: CheckCircle },
      completed: { variant: "success", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
    <>
      <FloatingHowItWorks title={"Admin Auction Withdrawals - How it works"} steps={[{ title: 'Open', desc: 'Access the Admin Auction Withdrawals section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Admin Auction Withdrawals.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Badge variant={config.variant as any}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    </>
  );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const approvedRequests = requests?.filter(r => r.status === 'approved') || [];
  const completedRequests = requests?.filter(r => r.status === 'completed') || [];
  const rejectedRequests = requests?.filter(r => r.status === 'rejected') || [];

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>New withdrawal requests awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">€{Number(request.amount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm capitalize">{request.payment_method.replace('_', ' ')}</p>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StripePayoutButton
                      kind="auction"
                      withdrawalId={request.id}
                      amount={Number(request.amount)}
                      onPaid={() => refetch()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(request, 'approve')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Manual
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDialog(request, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Requests */}
      {approvedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Approved Requests</CardTitle>
            <CardDescription>Process payments for these requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">€{Number(request.amount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Approved: {request.processed_at && new Date(request.processed_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm capitalize">{request.payment_method.replace('_', ' ')}</p>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(request, 'complete')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark as Completed
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Requests */}
      {completedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Requests</CardTitle>
            <CardDescription>Successfully processed withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">€{Number(request.amount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed: {request.processed_at && new Date(request.processed_at).toLocaleDateString()}
                    </p>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog for processing requests */}
      <Dialog open={!!selectedRequest} onOpenChange={() => {
        setSelectedRequest(null);
        setAction(null);
        setAdminNotes("");
        setStripePayoutId("");
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' && 'Approve Withdrawal Request'}
              {action === 'complete' && 'Complete Withdrawal'}
              {action === 'reject' && 'Reject Withdrawal Request'}
            </DialogTitle>
            <DialogDescription>
              Amount: €{selectedRequest?.amount.toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">Payment Method</Label>
                <p className="font-medium capitalize">
                  {selectedRequest?.payment_method.replace('_', ' ')}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Requested Date</Label>
                <p className="font-medium">
                  {selectedRequest && new Date(selectedRequest.requested_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedRequest?.payment_method === 'bank_transfer' && (
              <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-semibold">Bank Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Account Holder:</span>
                    <p className="font-medium">{selectedRequest.payment_details.accountHolder}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IBAN:</span>
                    <p className="font-medium">{selectedRequest.payment_details.iban}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bank Name:</span>
                    <p className="font-medium">{selectedRequest.payment_details.bankName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SWIFT/BIC:</span>
                    <p className="font-medium">{selectedRequest.payment_details.swiftBic || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedRequest?.payment_method === 'paypal' && (
              <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-semibold">PayPal Details</h4>
                <div className="text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{selectedRequest.payment_details.paypalEmail}</p>
                </div>
              </div>
            )}

            {action === 'complete' && (
              <div>
                <Label htmlFor="stripePayoutId">Stripe Payout ID (Optional)</Label>
                <Input
                  id="stripePayoutId"
                  value={stripePayoutId}
                  onChange={(e) => setStripePayoutId(e.target.value)}
                  placeholder="po_1234567890"
                />
              </div>
            )}

            <div>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this withdrawal..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null);
                setAction(null);
                setAdminNotes("");
                setStripePayoutId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={loading}
              variant={action === 'reject' ? 'destructive' : 'default'}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {action === 'approve' && 'Approve'}
              {action === 'complete' && 'Mark as Completed'}
              {action === 'reject' && 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
