import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface InfluencerWithdrawalFormProps {
  influencerId: string;
  availableBalance: number;
  onSuccess: () => void;
}

export const InfluencerWithdrawalForm = ({
  influencerId,
  availableBalance,
  onSuccess,
}: InfluencerWithdrawalFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal" | "bank_transfer">("stripe");
  const [paymentDetails, setPaymentDetails] = useState({
    email: "",
    iban: "",
    accountName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const withdrawalAmount = parseFloat(amount);

      if (withdrawalAmount < 50) {
        throw new Error("Minimum withdrawal amount is €50");
      }

      if (withdrawalAmount > availableBalance) {
        throw new Error("Amount exceeds available balance");
      }

      const details: any = {};
      if (paymentMethod === "stripe" || paymentMethod === "paypal") {
        details.email = paymentDetails.email;
      } else if (paymentMethod === "bank_transfer") {
        details.iban = paymentDetails.iban;
        details.accountName = paymentDetails.accountName;
      }

      const { data, error } = await supabase.functions.invoke("request-influencer-withdrawal", {
        body: {
          influencerId,
          amount: withdrawalAmount,
          paymentMethod,
          paymentDetails: details,
        },
      });

      if (error) throw error;

      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal request has been submitted and is pending admin approval.",
      });

      onSuccess();
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

  return (
    <>
      <FloatingHowItWorks title={"Influencer Withdrawal Form - How it works"} steps={[{ title: 'Open', desc: 'Access the Influencer Withdrawal Form section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Influencer Withdrawal Form.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="amount">Withdrawal Amount (€)</Label>
          <Input
            id="amount"
            type="number"
            min="50"
            max={availableBalance}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Minimum €50"
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Available: €{availableBalance.toFixed(2)}
          </p>
        </div>

        <div>
          <Label>Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="stripe" id="stripe" />
              <Label htmlFor="stripe" className="font-normal cursor-pointer">
                Stripe (Recommended) - 2.9% + €0.30 fee
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="font-normal cursor-pointer">
                PayPal - €1 + 1% fee
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
              <Label htmlFor="bank_transfer" className="font-normal cursor-pointer">
                Bank Transfer (€100+ only) - €2-5 fee
              </Label>
            </div>
          </RadioGroup>
        </div>

        {(paymentMethod === "stripe" || paymentMethod === "paypal") && (
          <div>
            <Label htmlFor="email">
              {paymentMethod === "stripe" ? "Stripe" : "PayPal"} Email
            </Label>
            <Input
              id="email"
              type="email"
              value={paymentDetails.email}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, email: e.target.value })}
              placeholder="your@email.com"
              required
            />
          </div>
        )}

        {paymentMethod === "bank_transfer" && (
          <>
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={paymentDetails.accountName}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, accountName: e.target.value })}
                placeholder="Full name on account"
                required
              />
            </div>
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                value={paymentDetails.iban}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, iban: e.target.value })}
                placeholder="DE89 3704 0044 0532 0130 00"
                required
              />
            </div>
          </>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Request Withdrawal"
          )}
        </Button>
      </form>
    </Card>
    </>
  );
};