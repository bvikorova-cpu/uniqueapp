import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface WithdrawalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  musicianId: string;
  availableBalance: number;
  onSuccess?: () => void;
}

export const WithdrawalRequestDialog = ({
  open,
  onOpenChange,
  musicianId,
  availableBalance,
  onSuccess,
}: WithdrawalRequestDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    payment_method: "",
    payment_details: {
      account_holder: "",
      iban: "",
      bank_name: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 50) {
      toast.error("Minimum withdrawal amount is €50");
      return;
    }

    if (amount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!formData.payment_method) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("musician_withdrawal_requests")
        .insert({
          musician_id: musicianId,
          amount: amount,
          payment_method: formData.payment_method,
          payment_details: formData.payment_details,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Withdrawal request submitted! We'll process it within 3-5 business days.");
      onOpenChange(false);
      setFormData({
        amount: "",
        payment_method: "",
        payment_details: {
          account_holder: "",
          iban: "",
          bank_name: "",
        },
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting withdrawal:", error);
      toast.error("Error submitting request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Withdrawal Request Dialog works" steps={[
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
            Withdraw your earnings to your bank account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (€) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="50"
              max={availableBalance}
              placeholder="50.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Available: €{availableBalance.toFixed(2)} • Minimum: €50.00
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">
              Payment Method <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer (SEPA)</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.payment_method === "bank_transfer" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="account_holder">Account Holder Name *</Label>
                <Input
                  id="account_holder"
                  placeholder="John Doe"
                  value={formData.payment_details.account_holder}
                  onChange={(e) => setFormData({
                    ...formData,
                    payment_details: { ...formData.payment_details, account_holder: e.target.value }
                  })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban">IBAN *</Label>
                <Input
                  id="iban"
                  placeholder="SK89 3704 0000 0012 3456 7890"
                  value={formData.payment_details.iban}
                  onChange={(e) => setFormData({
                    ...formData,
                    payment_details: { ...formData.payment_details, iban: e.target.value }
                  })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Input
                  id="bank_name"
                  placeholder="e.g. Tatra Banka"
                  value={formData.payment_details.bank_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    payment_details: { ...formData.payment_details, bank_name: e.target.value }
                  })}
                  required
                />
              </div>
            </>
          )}

          {formData.payment_method === "paypal" && (
            <div className="space-y-2">
              <Label htmlFor="paypal_email">PayPal Email *</Label>
              <Input
                id="paypal_email"
                type="email"
                placeholder="your@email.com"
                value={formData.payment_details.account_holder}
                onChange={(e) => setFormData({
                  ...formData,
                  payment_details: { account_holder: e.target.value, iban: "", bank_name: "" }
                })}
                required
              />
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
            <p className="font-semibold">Processing Time:</p>
            <p>• Bank Transfer: 3-5 business days</p>
            <p>• PayPal: 1-2 business days</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
    );
};
