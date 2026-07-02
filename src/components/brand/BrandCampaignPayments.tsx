import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function BrandCampaignPayments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: approvedApplications, isLoading } = useQuery({
    queryKey: ["brand-approved-applications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("campaign_applications")
        .select(`
          *,
          brand_campaigns!inner (
            id,
            campaign_name,
            brand_name,
            budget_min,
            budget_max,
            user_id
          ),
          campaign_payments (
            id,
            status,
            amount,
            created_at
          )
        `)
        .eq("status", "approved")
        .eq("brand_campaigns.user_id", user.id)
        .order("approved_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ applicationId, amount }: { applicationId: string; amount: number }) => {
      const { data, error } = await supabase.functions.invoke("create-campaign-payment-checkout", {
        body: { applicationId, amount },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to payment...");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create checkout");
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.functions.invoke("verify-campaign-payment", {
        body: { sessionId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-approved-applications"] });
      toast.success("Payment verified successfully!");
      setSearchParams({});
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to verify payment");
      setSearchParams({});
    },
  });

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const paymentStatus = searchParams.get("payment");

    if (paymentStatus === "success" && sessionId) {
      verifyPaymentMutation.mutate(sessionId);
    } else if (paymentStatus === "canceled") {
      toast.info("Payment was canceled");
      setSearchParams({});
    }
  }, [searchParams]);

  const handlePayment = () => {
    if (!selectedApplication || !paymentAmount) {
      toast.error("Please enter a payment amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    checkoutMutation.mutate({ applicationId: selectedApplication, amount });
  };

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Brand Campaign Payments - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Campaign Payments section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Campaign Payments.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </>
  );
  }

  const pendingPayments = approvedApplications?.filter(
    (app) => !app.campaign_payments || app.campaign_payments.length === 0 || 
    app.campaign_payments.every((p) => p.status !== "completed")
  ) || [];

  const completedPayments = approvedApplications?.filter(
    (app) => app.campaign_payments && app.campaign_payments.some((p) => p.status === "completed")
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Campaign Payments</h2>
        <p className="text-muted-foreground">Process payments for approved influencer applications</p>
      </div>

      {pendingPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Payments ({pendingPayments.length})</h3>
          <div className="grid gap-4">
            {pendingPayments.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Application #{app.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Campaign: {app.brand_campaigns?.campaign_name || "Unknown Campaign"}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Payment Required
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium mb-1">Budget Range:</p>
                    <p className="text-lg font-bold">
                      €{app.brand_campaigns?.budget_min?.toLocaleString()} - €
                      {app.brand_campaigns?.budget_max?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      20% platform fee will be deducted
                    </p>
                  </div>

                  {selectedApplication === app.id ? (
                    <div className="space-y-3 p-3 bg-muted rounded-lg">
                      <div>
                        <Label htmlFor={`amount-${app.id}`}>Payment Amount (EUR)</Label>
                        <Input
                          id={`amount-${app.id}`}
                          type="number"
                          min={app.brand_campaigns?.budget_min}
                          max={app.brand_campaigns?.budget_max}
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="mt-1"
                        />
                        {paymentAmount && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Influencer will receive: €{(parseFloat(paymentAmount) * 0.8).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedApplication(null);
                            setPaymentAmount("");
                          }}
                          disabled={checkoutMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePayment}
                          disabled={checkoutMutation.isPending}
                          className="flex-1"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Proceed to Payment
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedApplication(app.id);
                        setPaymentAmount(app.brand_campaigns?.budget_min?.toString() || "");
                      }}
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Make Payment
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Completed Payments ({completedPayments.length})</h3>
          <div className="grid gap-4">
            {completedPayments.map((app) => {
              const completedPayment = app.campaign_payments?.find((p) => p.status === "completed");
              return (
                <Card key={app.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Application #{app.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Campaign: {app.brand_campaigns?.campaign_name || "Unknown Campaign"}
                        </CardDescription>
                      </div>
                      <Badge className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Paid
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Amount Paid:</span>
                        <span className="text-lg font-bold">€{completedPayment?.amount?.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Paid on {completedPayment?.created_at ? new Date(completedPayment.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!approvedApplications || approvedApplications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No approved applications yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}