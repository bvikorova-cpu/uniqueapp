import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface ChefWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chefId: string;
  availableBalance: number;
  onSuccess?: () => void;
}

export const ChefWithdrawalDialog = ({
  open,
  onOpenChange,
  chefId,
  availableBalance,
  onSuccess,
}: ChefWithdrawalDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "bank_transfer",
    accountHolder: "",
    iban: "",
    bankName: "",
    paypalEmail: "",
  });

  useEffect(() => {
    if (open) {
      loadUserIban();
    }
  }, [open]);

  const loadUserIban = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("iban")
        .eq("id", chefId)
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

    try {
      setLoading(true);

      const paymentDetails =
        formData.paymentMethod === "bank_transfer"
          ? {
              accountHolder: formData.accountHolder,
              iban: formData.iban,
              bankName: formData.bankName,
            }
          : {
              email: formData.paypalEmail,
            };

      const { error } = await supabase
        .from("masterchef_withdrawal_requests")
        .insert({
          chef_id: chefId,
          amount,
          payment_method: formData.paymentMethod,
          payment_details: paymentDetails,
          status: "pending",
        });

      if (error) throw error;

      // Save IBAN to profile for future use
      if (formData.paymentMethod === "bank_transfer" && formData.iban) {
        await supabase
          .from("profiles")
          .update({ iban: formData.iban })
          .eq("id", chefId);
      }

      toast.success("Withdrawal request submitted successfully");
      setFormData({
        amount: "",
        paymentMethod: "bank_transfer",
        accountHolder: "",
        iban: "",
        bankName: "",
        paypalEmail: "",
      });
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
    <>
      <FloatingHowItWorks title="How Chef Withdrawal Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription>
            Request to withdraw your KitchenStars earnings. Minimum amount: €10
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Available Balance</Label>
            <div className="text-2xl font-bold text-primary">
              €{availableBalance.toFixed(2)}
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Withdrawal Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="10"
              max={availableBalance}
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="10.00"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum withdrawal: €10.00
            </p>
          </div>

          <div>
            <Label>Payment Method</Label>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) =>
                setFormData({ ...formData, paymentMethod: value })
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
              <div>
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input
                  id="accountHolder"
                  value={formData.accountHolder}
                  onChange={(e) =>
                    setFormData({ ...formData, accountHolder: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) =>
                    setFormData({ ...formData, iban: e.target.value })
                  }
                  placeholder="SK00 0000 0000 0000 0000 0000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bankName">Bank Name (Optional)</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Bank transfers typically take 3-5 business days
              </p>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="paypalEmail">PayPal Email</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={formData.paypalEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, paypalEmail: e.target.value })
                  }
                  placeholder="your@email.com"
                  required
                />
              </div>

              <p className="text-xs text-muted-foreground">
                PayPal transfers typically take 1-2 business days
              </p>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Withdrawal Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
    );
};
