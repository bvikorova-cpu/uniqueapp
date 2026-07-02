import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function AuctionWithdrawalRequest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    bankName: "",
    swiftBic: "",
    iban: "",
    paypalEmail: "",
    address: ""
  });

  // Get user's available balance from transactions
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['auction-seller-balance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get total earned from sales (seller_payout from completed transactions)
      const { data: transactions } = await supabase
        .from('bazaar_transactions')
        .select('seller_payout')
        .eq('seller_id', user.id)
        .eq('status', 'completed');

      const totalEarned = transactions?.reduce((sum, t) => sum + Number(t.seller_payout), 0) || 0;

      // Get total already withdrawn
      const { data: withdrawals } = await supabase
        .from('auction_withdrawal_requests')
        .select('amount')
        .eq('seller_id', user.id)
        .in('status', ['pending', 'approved', 'completed']);

      const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

      return {
        available: totalEarned - totalWithdrawn,
        totalEarned,
        totalWithdrawn
      };
    }
  });

  // Get withdrawal requests history
  const { data: requests, refetch } = useQuery({
    queryKey: ['auction-withdrawal-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('auction_withdrawal_requests')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const withdrawAmount = parseFloat(amount);
      if (withdrawAmount <= 0 || withdrawAmount > (balanceData?.available || 0)) {
        throw new Error('Invalid withdrawal amount');
      }

      if (!paymentMethod) {
        throw new Error('Please select a payment method');
      }

      // Prepare payment details based on method
      let details = {};
      if (paymentMethod === 'bank_transfer') {
        details = {
          accountHolder: paymentDetails.accountHolder,
          accountNumber: paymentDetails.accountNumber,
          bankName: paymentDetails.bankName,
          swiftBic: paymentDetails.swiftBic,
          iban: paymentDetails.iban
        };
      } else if (paymentMethod === 'paypal') {
        details = { paypalEmail: paymentDetails.paypalEmail };
      }

      // Create withdrawal request
      const { data: withdrawal, error } = await supabase
        .from('auction_withdrawal_requests')
        .insert({
          seller_id: user.id,
          amount: withdrawAmount,
          payment_method: paymentMethod,
          payment_details: details,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Notify admins
      await supabase.functions.invoke('notify-admin-auction-withdrawal', {
        body: {
          withdrawalId: withdrawal.id,
          sellerEmail: user.email,
          amount: withdrawAmount
        }
      });

      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal request has been submitted. An admin will review it shortly.",
      });

      setAmount("");
      setPaymentMethod("");
      setPaymentDetails({
        accountHolder: "",
        accountNumber: "",
        bankName: "",
        swiftBic: "",
        iban: "",
        paypalEmail: "",
        address: ""
      });
      refetch();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (balanceLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Auction Withdrawal Request - How it works"} steps={[{ title: 'Open', desc: 'Access the Auction Withdrawal Request section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Auction Withdrawal Request.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </>
  );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Your Balance
          </CardTitle>
          <CardDescription>
            Earnings from completed auction sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-2xl font-bold">€{balanceData?.totalEarned.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Withdrawn</p>
              <p className="text-2xl font-bold">€{balanceData?.totalWithdrawn.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-primary">€{balanceData?.available.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
          <CardDescription>
            Withdraw your available balance. Minimum withdrawal: €10
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(balanceData?.available || 0) < 10 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need at least €10 to request a withdrawal. Current balance: €{balanceData?.available.toFixed(2)}
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="10"
                  max={balanceData?.available}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'bank_transfer' && (
                <>
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      value={paymentDetails.accountHolder}
                      onChange={(e) => setPaymentDetails({...paymentDetails, accountHolder: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={paymentDetails.iban}
                      onChange={(e) => setPaymentDetails({...paymentDetails, iban: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={paymentDetails.bankName}
                      onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="swiftBic">SWIFT/BIC</Label>
                    <Input
                      id="swiftBic"
                      value={paymentDetails.swiftBic}
                      onChange={(e) => setPaymentDetails({...paymentDetails, swiftBic: e.target.value})}
                    />
                  </div>
                </>
              )}

              {paymentMethod === 'paypal' && (
                <div>
                  <Label htmlFor="paypalEmail">PayPal Email</Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    value={paymentDetails.paypalEmail}
                    onChange={(e) => setPaymentDetails({...paymentDetails, paypalEmail: e.target.value})}
                    required
                  />
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request Withdrawal
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {requests && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">€{Number(request.amount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {request.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      request.status === 'completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      request.status === 'approved' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                      request.status === 'pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                      'bg-red-50 text-red-700 ring-red-600/20'
                    }`}>
                      {request.status}
                    </span>
                    {request.admin_notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: {request.admin_notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
