import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StripePayoutButton } from "@/components/admin/StripePayoutButton";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const AdminReferralWithdrawals = () => {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-referral-withdrawals"],
    queryFn: async () => {
      const { data: withdrawalRequests } = await supabase
        .from("referral_withdrawal_requests")
        .select("*")
        .order("requested_at", { ascending: false });
      
      if (!withdrawalRequests) return [];

      // Fetch profiles separately
      const requestsWithProfiles = await Promise.all(
        withdrawalRequests.map(async (request) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", request.referrer_id)
            .single();
          
          return {
            ...request,
            profile
          };
        })
      );

      return requestsWithProfiles;
    },
  });

  const processRequest = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: string }) => {
      const { error } = await supabase.functions.invoke("process-referral-withdrawal", {
        body: { requestId, action, adminNotes },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal request processed successfully",
      });
      setSelectedRequest(null);
      setAdminNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin-referral-withdrawals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
      <FloatingHowItWorks
        title={"Admin Referral Withdrawals"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "approved":
        return "text-blue-600";
      default:
        return "text-yellow-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5" />;
      case "rejected":
        return <XCircle className="h-5 w-5" />;
      case "approved":
        return <Clock className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {requests?.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No withdrawal requests yet</p>
        </Card>
      ) : (
        requests?.map((request) => (
          <Card key={request.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {request.profile?.full_name || "Unknown User"}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(Number(request.amount))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Requested: {new Date(request.requested_at).toLocaleString()}
                  </p>
                </div>
                <div className={`flex items-center gap-2 ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="font-medium capitalize">{request.status}</span>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium">Payment Details:</p>
                <p className="text-sm">
                  <span className="font-medium">Method:</span>{" "}
                  {request.payment_method === "bank_transfer" ? "Bank Transfer" : "PayPal"}
                </p>
                {request.payment_method === "bank_transfer" ? (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Account Name:</span>{" "}
                      {(request.payment_details as any)?.account_name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Bank:</span>{" "}
                      {(request.payment_details as any)?.bank_name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Account/IBAN:</span>{" "}
                      {(request.payment_details as any)?.account_number}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">SWIFT/BIC:</span>{" "}
                      {(request.payment_details as any)?.swift_code}
                    </p>
                  </>
                ) : (
                  <p className="text-sm">
                    <span className="font-medium">PayPal Email:</span>{" "}
                    {(request.payment_details as any)?.paypal_email}
                  </p>
                )}
              </div>

              {request.admin_notes && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-1">Admin Notes:</p>
                  <p className="text-sm">{request.admin_notes}</p>
                </div>
              )}

              {request.status === "pending" && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add notes (optional)"
                    value={selectedRequest === request.id ? adminNotes : ""}
                    onChange={(e) => {
                      setSelectedRequest(request.id);
                      setAdminNotes(e.target.value);
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <StripePayoutButton
                      kind="referral"
                      withdrawalId={request.id}
                      amount={Number(request.amount)}
                      onPaid={() => queryClient.invalidateQueries({ queryKey: ["admin-referral-withdrawals"] })}
                    />
                    <Button
                      onClick={() => processRequest.mutate({ requestId: request.id, action: "approve" })}
                      disabled={processRequest.isPending}
                      variant="outline"
                    >
                      Approve only
                    </Button>
                    <Button
                      onClick={() => processRequest.mutate({ requestId: request.id, action: "reject" })}
                      disabled={processRequest.isPending}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {request.status === "approved" && (
                <Button
                  onClick={() => processRequest.mutate({ requestId: request.id, action: "complete" })}
                  disabled={processRequest.isPending}
                >
                  {processRequest.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Mark as Completed"
                  )}
                </Button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
};