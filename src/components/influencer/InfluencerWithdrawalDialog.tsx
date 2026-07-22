import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface InfluencerWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerId: string;
  availableBalance: number;
  onSuccess?: () => void;
}

export const InfluencerWithdrawalDialog = ({ open,
  onOpenChange,
  influencerId,
  availableBalance,
  onSuccess }: InfluencerWithdrawalDialogProps) => { const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "bank_transfer",
    accountHolder: "",
    iban: "",
    bankName: "",
    paypalEmail: "" });

  useEffect(() => {
    if (open) {
      loadUserIban();
    }
  }, [open]);

  const loadUserIban = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("iban")
        .eq("id", user.id)
        .single();

      if (profile?.iban) {
        setFormData((prev) => ({ ...prev, iban: profile.iban }));
      }
    } catch (error) {
      console.error("Error loading IBAN:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 10) {
      toast.error("Minimum withdrawal amount is €10");
      return;
    }

    if (amount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (formData.paymentMethod === "bank_transfer") {
      if (!formData.iban || !formData.accountHolder) {
        toast.error("Please provide IBAN and account holder name");
        return;
      }
    } else if (formData.paymentMethod === "paypal") {
      if (!formData.paypalEmail) {
        toast.error("Please provide PayPal email");
        return;
      }
    }

    try { setLoading(true);

      const paymentDetails =
        formData.paymentMethod === "bank_transfer"
          ? {
              accountHolder: formData.accountHolder,
              iban: formData.iban,
              bankName: formData.bankName }
          : { email: formData.paypalEmail };

      const { error } = await supabase
        .from("influencer_withdrawal_requests")
        .insert({ influencer_id: influencerId,
          amount,
          payment_method: formData.paymentMethod,
          payment_details: paymentDetails,
          status: "pending" });

      if (error) throw error;

      // Save IBAN to profile for future use
      if (formData.paymentMethod === "bank_transfer" && formData.iban) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ iban: formData.iban })
            .eq("id", user.id);
        }
      }

      toast.success("Withdrawal request submitted successfully");
      setFormData({ amount: "",
        paymentMethod: "bank_transfer",
        accountHolder: "",
        iban: "",
        bankName: "",
        paypalEmail: "" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting withdrawal request:", error);
      toast.error("Failed to submit withdrawal request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription>
            Request to withdraw your influencer earnings. Minimum amount: €10
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="10"
              max={availableBalance}
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="10.00"
              required
            />
            <p className="text-sm text-muted-foreground">
              Available: €{availableBalance.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, paymentMethod: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank_transfer" id="bank" />
                <Label htmlFor="bank" className="font-normal cursor-pointer">
                  Bank Transfer
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="font-normal cursor-pointer">
                  PayPal
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.paymentMethod === "bank_transfer" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input
                  id="accountHolder"
                  value={formData.accountHolder}
                  onChange={ (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accountHolder: e.target.value }))
                  }
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, iban: e.target.value }))
                  }
                  placeholder="SK89 3704 0000 0012 3456 7890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name (Optional)</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={ (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankName: e.target.value }))
                  }
                  placeholder="Bank Name"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="paypalEmail">PayPal Email</Label>
              <Input
                id="paypalEmail"
                type="email"
                value={formData.paypalEmail}
                onChange={ (e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paypalEmail: e.target.value }))
                }
                placeholder="your@email.com"
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
