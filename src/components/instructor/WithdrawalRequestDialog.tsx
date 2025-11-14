import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface WithdrawalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructorId: string;
  availableBalance: number;
  onSuccess: () => void;
}

export function WithdrawalRequestDialog({
  open,
  onOpenChange,
  instructorId,
  availableBalance,
  onSuccess,
}: WithdrawalRequestDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentDetails, setPaymentDetails] = useState({
    accountHolder: "",
    iban: "",
    bic: "",
    bankName: "",
  });

  // Calculate next payout date
  const getNextPayoutDate = () => {
    const today = new Date();
    const day = today.getDate();
    
    if (day < 15) {
      // Next payout is 15th of current month
      return new Date(today.getFullYear(), today.getMonth(), 15);
    } else {
      // Next payout is 1st of next month
      return new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }
  };

  const nextPayoutDate = getNextPayoutDate();
  const formattedPayoutDate = nextPayoutDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawalAmount = parseFloat(amount);
    
    // Validation
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount < 10) {
      toast({
        title: "Amount Too Low",
        description: "Minimum withdrawal amount is €10.00",
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You cannot withdraw more than your available balance",
        variant: "destructive",
      });
      return;
    }

    if (!paymentDetails.accountHolder || !paymentDetails.iban) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required payment details",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("instructor_withdrawal_requests")
        .insert({
          instructor_id: instructorId,
          amount: withdrawalAmount,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your withdrawal request has been submitted successfully",
      });

      // Reset form
      setAmount("");
      setPaymentDetails({
        accountHolder: "",
        iban: "",
        bic: "",
        bankName: "",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting withdrawal request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
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
            Available balance: {formatCurrency(availableBalance)}
            <br />
            <span className="text-xs mt-1 inline-block">
              Scheduled payout date: {formattedPayoutDate}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="10"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum: €10.00 | Maximum: {formatCurrency(availableBalance)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "bank_transfer" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="account-holder">Account Holder Name *</Label>
                <Input
                  id="account-holder"
                  value={paymentDetails.accountHolder}
                  onChange={(e) =>
                    setPaymentDetails({ ...paymentDetails, accountHolder: e.target.value })
                  }
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban">IBAN *</Label>
                <Input
                  id="iban"
                  value={paymentDetails.iban}
                  onChange={(e) =>
                    setPaymentDetails({ ...paymentDetails, iban: e.target.value })
                  }
                  placeholder="SK12 3456 7890 1234 5678 9012"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bic">BIC/SWIFT Code</Label>
                <Input
                  id="bic"
                  value={paymentDetails.bic}
                  onChange={(e) =>
                    setPaymentDetails({ ...paymentDetails, bic: e.target.value })
                  }
                  placeholder="TATRSKBX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={paymentDetails.bankName}
                  onChange={(e) =>
                    setPaymentDetails({ ...paymentDetails, bankName: e.target.value })
                  }
                  placeholder="Bank name"
                />
              </div>
            </>
          )}

          {paymentMethod === "paypal" && (
            <div className="space-y-2">
              <Label htmlFor="paypal-email">PayPal Email *</Label>
              <Input
                id="paypal-email"
                type="email"
                value={paymentDetails.accountHolder}
                onChange={(e) =>
                  setPaymentDetails({ ...paymentDetails, accountHolder: e.target.value })
                }
                placeholder="your@email.com"
                required
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
