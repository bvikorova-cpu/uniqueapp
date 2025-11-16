import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, DollarSign, TrendingUp, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CampaignDashboard() {
  const { campaignType, campaignId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    iban: "",
    swiftCode: "",
  });

  useEffect(() => {
    loadData();
  }, [campaignId, campaignType]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('campaign_balances' as any)
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('campaign_type', campaignType)
        .single();

      if (balanceError) throw balanceError;
      setBalance(balanceData);

      // Load donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('campaign_donations' as any)
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('campaign_type', campaignType)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (donationsError) throw donationsError;
      setDonations(donationsData || []);

      // Load withdrawal requests
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawal_requests' as any)
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('campaign_type', campaignType)
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;
      setWithdrawalRequests(withdrawalsData || []);
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

  const handleWithdrawalRequest = async () => {
    try {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }

      if (!bankDetails.bankName || !bankDetails.bankAccountNumber || !bankDetails.bankAccountName) {
        toast({
          title: "Missing information",
          description: "Please fill in all required bank details",
          variant: "destructive",
        });
        return;
      }

      const availableBalance = balance.current_balance - balance.pending_withdrawal;
      if (amount > availableBalance) {
        toast({
          title: "Insufficient balance",
          description: `Maximum available: €${availableBalance.toFixed(2)}`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke('request-campaign-withdrawal', {
        body: {
          campaignId,
          campaignType,
          amount,
          bankAccountName: bankDetails.bankAccountName,
          bankAccountNumber: bankDetails.bankAccountNumber,
          bankName: bankDetails.bankName,
          iban: bankDetails.iban || null,
          swiftCode: bankDetails.swiftCode || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      });

      setShowWithdrawDialog(false);
      setWithdrawAmount("");
      setBankDetails({
        bankName: "",
        bankAccountNumber: "",
        bankAccountName: "",
        iban: "",
        swiftCode: "",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const availableBalance = balance ? balance.current_balance - balance.pending_withdrawal : 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Campaign Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your {campaignType} campaign finances
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{balance?.total_raised.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{availableBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawal</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              €{balance?.pending_withdrawal.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{balance?.total_withdrawn.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Button */}
      <div className="mb-6">
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogTrigger asChild>
            <Button size="lg" disabled={availableBalance <= 0}>
              <DollarSign className="mr-2 h-5 w-5" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
              <DialogDescription>
                Available balance: €{availableBalance.toFixed(2)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  placeholder="e.g., Slovenská sporiteľňa"
                />
              </div>

              <div>
                <Label htmlFor="accountName">Account Holder Name *</Label>
                <Input
                  id="accountName"
                  value={bankDetails.bankAccountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankAccountName: e.target.value })}
                  placeholder="Full name on bank account"
                />
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={bankDetails.bankAccountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankAccountNumber: e.target.value })}
                  placeholder="e.g., 123456789/0900"
                />
              </div>

              <div>
                <Label htmlFor="iban">IBAN (Optional)</Label>
                <Input
                  id="iban"
                  value={bankDetails.iban}
                  onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                  placeholder="e.g., SK31 1200 0000 1987 4263 7541"
                />
              </div>

              <div>
                <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
                <Input
                  id="swiftCode"
                  value={bankDetails.swiftCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, swiftCode: e.target.value })}
                  placeholder="e.g., GIBASKBX"
                />
              </div>

              <Button onClick={handleWithdrawalRequest} className="w-full">
                Submit Withdrawal Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Withdrawal Requests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Your withdrawal requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No withdrawal requests yet</p>
          ) : (
            <div className="space-y-4">
              {withdrawalRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">€{request.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    className={
                      request.status === 'completed'
                        ? 'bg-green-500'
                        : request.status === 'rejected'
                        ? 'bg-red-500'
                        : request.status === 'approved'
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Latest contributions to your campaign</CardDescription>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No donations yet</p>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">
                      {donation.is_anonymous ? 'Anonymous' : donation.donor_name || donation.donor_email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(donation.created_at).toLocaleDateString()}
                      {donation.is_monthly && ' • Monthly'}
                    </p>
                    {donation.message && (
                      <p className="text-sm italic mt-1">{donation.message}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+€{donation.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      Net: €{donation.net_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
