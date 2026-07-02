import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ComedianEarningsProps {
  earnings: any;
  comedianId: string;
  onRefresh: () => void;
}

export function ComedianEarnings({ earnings, comedianId, onRefresh }: ComedianEarningsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    paymentMethod: "bank_transfer",
    paymentDetails: "",
  });

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalData.amount);
    
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (amount > earnings?.pendingPayout) {
      toast.error("Insufficient balance");
      return;
    }

    if (amount < 50) {
      toast.error("Minimum withdrawal is €50");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("comedian_withdrawal_requests")
        .insert({
          comedian_id: comedianId,
          amount,
          payment_method: withdrawalData.paymentMethod,
          payment_details: { details: withdrawalData.paymentDetails },
          status: "pending",
        });

      if (error) throw error;

      toast.success("Withdrawal request submitted! Admin will process it soon.");
      setOpen(false);
      setWithdrawalData({ amount: "", paymentMethod: "bank_transfer", paymentDetails: "" });
      onRefresh();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Comedian Earnings - How it works"} steps={[{ title: 'Open', desc: 'Access the Comedian Earnings section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comedian Earnings.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-3xl font-bold">
                €{earnings?.totalEarned?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Total earnings from all sources (after 25% platform fee)
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold text-green-500">
                €{earnings?.pendingPayout?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" disabled={!earnings?.pendingPayout || earnings.pendingPayout < 50}>
                Request Withdrawal (Min €50)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
                <DialogDescription>
                  Available balance: €{earnings?.pendingPayout?.toFixed(2)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (€)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="50"
                    max={earnings?.pendingPayout}
                    value={withdrawalData.amount}
                    onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="method">Payment Method</Label>
                  <Select
                    value={withdrawalData.paymentMethod}
                    onValueChange={(value) => setWithdrawalData({ ...withdrawalData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="details">Payment Details</Label>
                  <Input
                    id="details"
                    placeholder="IBAN, PayPal email, etc."
                    value={withdrawalData.paymentDetails}
                    onChange={(e) => setWithdrawalData({ ...withdrawalData, paymentDetails: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleWithdrawal} disabled={loading}>
                  {loading ? "Processing..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Earnings History</h3>
        <div className="space-y-3">
          {earnings?.history?.map((earning: any) => (
            <div key={earning.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{earning.source}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(earning.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-500">
                  +€{parseFloat(earning.net_amount).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  (Total: €{parseFloat(earning.total_earned).toFixed(2)})
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </>
  );
}
