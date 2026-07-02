import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const ReferralWithdrawalRequest = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: earnings } = useQuery({
    queryKey: ["referral-earnings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("megatalent_referral_earnings")
        .select("amount, paid")
        .eq("referrer_id", user.id);
      
      const totalEarnings = data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const paidEarnings = data?.filter(e => e.paid).reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const availableBalance = totalEarnings - paidEarnings;
      
      return { availableBalance, totalEarnings };
    },
    enabled: !!user?.id,
  });

  const { data: requests } = useQuery({
    queryKey: ["referral-withdrawal-requests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("referral_withdrawal_requests")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createRequest = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const requestAmount = parseFloat(amount);
      if (isNaN(requestAmount) || requestAmount < 10) {
        throw new Error("Minimum withdrawal amount is €10");
      }

      if (requestAmount > (earnings?.availableBalance || 0)) {
        throw new Error("Insufficient balance");
      }

      const paymentDetails = paymentMethod === "paypal" 
        ? { paypal_email: paypalEmail }
        : {
            account_number: accountNumber,
            account_name: accountName,
            bank_name: bankName,
            swift_code: swiftCode,
          };

      const { data, error } = await supabase
        .from("referral_withdrawal_requests")
        .insert({
          referrer_id: user.id,
          amount: requestAmount,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
        })
        .select()
        .single();

      if (error) throw error;

      // Notify admins
      await supabase.functions.invoke("notify-admin-referral-withdrawal", {
        body: {
          requestId: data.id,
          referrerName: profile?.full_name || "User",
          amount: requestAmount,
        },
      });

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      });
      setAmount("");
      setAccountNumber("");
      setAccountName("");
      setBankName("");
      setSwiftCode("");
      setPaypalEmail("");
      queryClient.invalidateQueries({ queryKey: ["referral-withdrawal-requests"] });
      queryClient.invalidateQueries({ queryKey: ["referral-earnings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "approved":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Referral Withdrawal Request"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Referral Earnings</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(earnings?.availableBalance || 0)}
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
            <p className="text-2xl font-bold">
              {formatCurrency(earnings?.totalEarnings || 0)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Withdrawal Amount (€) - Minimum €10</Label>
            <Input
              id="amount"
              type="number"
              min="10"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "bank_transfer" ? (
            <>
              <div>
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Full name on account"
                />
              </div>
              <div>
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Name of your bank"
                />
              </div>
              <div>
                <Label htmlFor="account-number">Account Number / IBAN</Label>
                <Input
                  id="account-number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Your account number or IBAN"
                />
              </div>
              <div>
                <Label htmlFor="swift-code">SWIFT/BIC Code</Label>
                <Input
                  id="swift-code"
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value)}
                  placeholder="Bank SWIFT code"
                />
              </div>
            </>
          ) : (
            <div>
              <Label htmlFor="paypal-email">PayPal Email</Label>
              <Input
                id="paypal-email"
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="your@paypal.email"
              />
            </div>
          )}

          <Button
            onClick={() => createRequest.mutate()}
            disabled={
              createRequest.isPending ||
              !amount ||
              parseFloat(amount) < 10 ||
              (paymentMethod === "bank_transfer" && (!accountNumber || !accountName || !bankName || !swiftCode)) ||
              (paymentMethod === "paypal" && !paypalEmail)
            }
            className="w-full"
          >
            {createRequest.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Request Withdrawal"
            )}
          </Button>
        </div>
      </Card>

      {requests && requests.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Withdrawal History</h3>
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 border rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <p className="font-semibold">{formatCurrency(Number(request.amount))}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.requested_at).toLocaleDateString()} - {request.payment_method}
                    </p>
                    {request.admin_notes && (
                      <p className="text-sm text-muted-foreground italic">
                        Note: {request.admin_notes}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium capitalize">{request.status}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};