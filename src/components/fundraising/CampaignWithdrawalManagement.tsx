import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, DollarSign, Eye } from "lucide-react";
import { StripePayoutButton } from "@/components/admin/StripePayoutButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface WithdrawalRequest {
  id: string;
  campaign_id: string;
  campaign_type: string;
  creator_id: string;
  amount: number;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  iban: string | null;
  swift_code: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export function CampaignWithdrawalManagement() {
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
      const { data, error } = await supabase
        .from('withdrawal_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data as any) || []);
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

  const handleProcess = async (action: 'approve' | 'reject' | 'complete') => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('process-withdrawal-request', {
        body: {
          withdrawalId: selectedRequest.id,
          action,
          adminNotes: adminNotes || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Withdrawal request ${action}d successfully`,
      });

      setShowDetailsDialog(false);
      setSelectedRequest(null);
      setAdminNotes("");
      loadRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Campaign Withdrawal Management - How it works"} steps={[{ title: 'Open', desc: 'Access the Campaign Withdrawal Management section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Campaign Withdrawal Management.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </>
  );
  }

  return (
    <>
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No withdrawal requests found</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>€{request.amount.toFixed(2)}</CardTitle>
                    <CardDescription>
                      {request.campaign_type} Campaign - {request.campaign_id.slice(0, 8)}...
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <strong>Bank:</strong> {request.bank_name}
                  </p>
                  <p className="text-sm">
                    <strong>Account:</strong> {request.bank_account_number}
                  </p>
                  <p className="text-sm">
                    <strong>Account Name:</strong> {request.bank_account_name}
                  </p>
                  {request.iban && (
                    <p className="text-sm">
                      <strong>IBAN:</strong> {request.iban}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Requested: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>

                  {request.status === 'pending' && (
                    <>
                      <StripePayoutButton
                        kind="campaign"
                        withdrawalId={request.id}
                        amount={Number(request.amount)}
                        onPaid={loadRequests}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          handleProcess('approve');
                        }}
                        disabled={processing}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve only
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsDialog(true);
                        }}
                        disabled={processing}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}

                  {request.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        handleProcess('complete');
                      }}
                      disabled={processing}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Request Details</DialogTitle>
            <DialogDescription>
              Review and process this withdrawal request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>Amount</Label>
                <p className="text-2xl font-bold">€{selectedRequest.amount.toFixed(2)}</p>
              </div>

              <div>
                <Label>Campaign</Label>
                <p>{selectedRequest.campaign_type} - {selectedRequest.campaign_id}</p>
              </div>

              <div>
                <Label>Bank Details</Label>
                <p><strong>Bank:</strong> {selectedRequest.bank_name}</p>
                <p><strong>Account:</strong> {selectedRequest.bank_account_number}</p>
                <p><strong>Name:</strong> {selectedRequest.bank_account_name}</p>
                {selectedRequest.iban && <p><strong>IBAN:</strong> {selectedRequest.iban}</p>}
                {selectedRequest.swift_code && <p><strong>SWIFT:</strong> {selectedRequest.swift_code}</p>}
              </div>

              <div>
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                />
              </div>

              <div className="flex gap-2">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleProcess('approve')}
                      disabled={processing}
                    >
                      {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleProcess('reject')}
                      disabled={processing}
                    >
                      {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Reject
                    </Button>
                  </>
                )}
                {selectedRequest.status === 'approved' && (
                  <Button
                    onClick={() => handleProcess('complete')}
                    disabled={processing}
                  >
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
