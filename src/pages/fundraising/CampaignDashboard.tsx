import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
  Loader2, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  CreditCard,
  Settings,
  RefreshCw,
  Pencil
} from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface StripeConnectStatus {
  connected: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction: boolean;
  stripeBalance?: {
    available: number;
    pending: number;
    currency: string;
  };
}

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
  const [processingWithdraw, setProcessingWithdraw] = useState(false);
  
  // Stripe Connect state
  const [connectStatus, setConnectStatus] = useState<StripeConnectStatus | null>(null);
  const [loadingConnect, setLoadingConnect] = useState(true);
  const [connectingStripe, setConnectingStripe] = useState(false);

  useEffect(() => {
    loadData();
    loadConnectStatus();
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

      // Load donations — only public-safe columns; donor_email is masked
      // through get_public_campaign_donations for the public-facing detail
      // view, but here the campaign owner does need a list. Restrict columns
      // and rely on RLS to ensure only campaign owner / admin reads it.
      const { data: donationsData, error: donationsError } = await supabase
        .from('campaign_donations' as any)
        .select('id, amount, net_amount, is_monthly, is_anonymous, donor_name, message, status, created_at, subscription_status, next_billing_at')
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

  const loadConnectStatus = async () => {
    try {
      setLoadingConnect(true);
      const { data, error } = await supabase.functions.invoke('stripe-connect-status');
      
      if (error) throw error;
      setConnectStatus(data);
    } catch (error: any) {
      console.error("Failed to load Connect status:", error);
    } finally {
      setLoadingConnect(false);
    }
  };

  const handleSetupStripeConnect = async () => {
    try {
      setConnectingStripe(true);
      
      const currentUrl = window.location.href;
      const returnUrl = currentUrl;
      const refreshUrl = currentUrl;

      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
        body: { returnUrl, refreshUrl },
      });

      if (error) throw error;

      if (data.onboardingComplete) {
        toast({
          title: "Already Connected",
          description: "Your Stripe account is already set up for payouts!",
        });
        loadConnectStatus();
      } else if (data.onboardingUrl) {
        // Redirect to Stripe onboarding
        { const __w = window.open(data.onboardingUrl, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.onboardingUrl; }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-dashboard');
      
      if (error) throw error;
      
      if (data.dashboardUrl) {
        window.open(data.dashboardUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleWithdrawalRequest = async () => {
    try {
      setProcessingWithdraw(true);
      const amount = parseFloat(withdrawAmount);
      
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount",
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

      if (!connectStatus?.payoutsEnabled) {
        toast({
          title: "Setup Required",
          description: "Please complete your Stripe account setup before requesting a withdrawal.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('request-campaign-payout', {
        body: {
          campaign_id: campaignId,
          campaign_type: campaignType,
          amount_cents: Math.round(amount * 100),
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: data.message || "Funds transferred to your Stripe account.",
      });

      setShowWithdrawDialog(false);
      setWithdrawAmount("");
      loadData();
      loadConnectStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingWithdraw(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FloatingHowItWorks
          title="Campaign Dashboard"
          intro="Manage your campaign, donors and updates."
          steps={[
            { title: "Track donations", desc: "Live totals, donor list and payout status." },
          { title: "Post updates", desc: "Keep donors engaged with progress posts." },
          { title: "Reply to donors", desc: "Send thank-you messages directly." },
          { title: "Request payout", desc: "Stripe Connect transfers to your bank." },
          { title: "Close or extend", desc: "Mark the goal reached or extend the deadline." }
          ]}
        />
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const availableBalance = balance ? balance.current_balance - balance.pending_withdrawal : 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate('/fundraising/dashboard');
        }}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Campaign Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your {campaignType} campaign finances
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/fundraising/${campaignType}/${campaignId}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" /> Edit campaign
        </Button>
      </div>

      {/* Prominent onboarding banner — only when Connect not fully ready */}
      {!loadingConnect && !(connectStatus?.connected && connectStatus?.payoutsEnabled) && (
        <Alert className="mb-6 border-2 border-primary/40 bg-primary/5">
          <CreditCard className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            {connectStatus?.connected ? "Finish your Stripe Connect setup" : "Activate payouts — Stripe Connect onboarding"}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p className="text-sm">
              Beneficiaries must complete a one-time Stripe Connect onboarding before any payout can be released.
              Funds raised before onboarding are held on the platform balance and released after admin review.
            </p>
            <ol className="text-sm space-y-1 list-none">
              <li className="flex items-center gap-2">
                {connectStatus?.connected ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="h-4 w-4 rounded-full border border-muted-foreground/40 inline-block" />}
                <span>1. Create Stripe Connect account</span>
              </li>
              <li className="flex items-center gap-2">
                {connectStatus?.detailsSubmitted ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="h-4 w-4 rounded-full border border-muted-foreground/40 inline-block" />}
                <span>2. Submit identity & business details</span>
              </li>
              <li className="flex items-center gap-2">
                {connectStatus?.chargesEnabled ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="h-4 w-4 rounded-full border border-muted-foreground/40 inline-block" />}
                <span>3. Verify bank account (charges enabled)</span>
              </li>
              <li className="flex items-center gap-2">
                {connectStatus?.payoutsEnabled ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="h-4 w-4 rounded-full border border-muted-foreground/40 inline-block" />}
                <span>4. Payouts enabled — ready to withdraw</span>
              </li>
            </ol>
            <Button
              onClick={handleSetupStripeConnect}
              disabled={connectingStripe}
              size="sm"
              className="mt-2"
            >
              {connectingStripe ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening Stripe…</>
              ) : (
                <><ExternalLink className="mr-2 h-4 w-4" />{connectStatus?.connected ? "Continue onboarding" : "Start Stripe Connect onboarding"}</>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stripe Connect Payout Settings */}
      <Card className="mb-6 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Payout Settings</CardTitle>
            </div>
            {loadingConnect ? (
              <Badge variant="secondary">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Loading...
              </Badge>
            ) : connectStatus?.connected && connectStatus.payoutsEnabled ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Stripe Connected
              </Badge>
            ) : connectStatus?.connected && !connectStatus.payoutsEnabled ? (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Action Required
              </Badge>
            ) : (
              <Badge variant="outline">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
          <CardDescription>
            Connect your bank account via Stripe to receive payouts securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!connectStatus?.connected ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Setup Required</AlertTitle>
              <AlertDescription className="mt-2">
                To receive payouts from your campaign, you need to set up a Stripe Connect account. 
                Stripe will securely handle your bank details and identity verification.
              </AlertDescription>
              <Button 
                onClick={handleSetupStripeConnect} 
                className="mt-4"
                disabled={connectingStripe}
              >
                {connectingStripe ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Set Up Stripe Account
                  </>
                )}
              </Button>
            </Alert>
          ) : connectStatus.requiresAction ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Complete Your Setup</AlertTitle>
              <AlertDescription className="mt-2">
                Your Stripe account setup is incomplete. Please complete the verification to enable payouts.
              </AlertDescription>
              <Button 
                onClick={handleSetupStripeConnect} 
                variant="destructive"
                className="mt-4"
                disabled={connectingStripe}
              >
                {connectingStripe ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Complete Setup
                  </>
                )}
              </Button>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    ✓ Your Stripe account is ready for payouts
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Account ID: {connectStatus.accountId?.slice(0, 12)}...
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleOpenStripeDashboard}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Stripe Dashboard
                </Button>
              </div>
              
              {connectStatus.stripeBalance && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Stripe Available</p>
                    <p className="text-xl font-bold text-green-600">
                      €{connectStatus.stripeBalance.available.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Stripe Pending</p>
                    <p className="text-xl font-bold text-yellow-600">
                      €{connectStatus.stripeBalance.pending.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              
              <Button variant="ghost" size="sm" onClick={loadConnectStatus}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{balance?.total_raised?.toFixed(2) || '0.00'}
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
              €{balance?.pending_withdrawal?.toFixed(2) || '0.00'}
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
              €{balance?.total_withdrawn?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Button */}
      <div className="mb-6">
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              disabled={availableBalance <= 0 || !connectStatus?.payoutsEnabled}
            >
              <DollarSign className="mr-2 h-5 w-5" />
              Transfer to Bank via Stripe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Funds to Your Bank</DialogTitle>
              <DialogDescription>
                Available balance: €{availableBalance.toFixed(2)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Funds will be transferred to your connected Stripe account and then deposited to your bank according to your Stripe payout schedule (usually 2-7 business days).
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="amount">Amount (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  max={availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <Button 
                onClick={handleWithdrawalRequest} 
                className="w-full"
                disabled={processingWithdraw}
              >
                {processingWithdraw ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Transfer €{withdrawAmount || '0.00'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {!connectStatus?.payoutsEnabled && availableBalance > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            ⚠️ Complete your Stripe account setup to enable withdrawals
          </p>
        )}
      </div>

      {/* Withdrawal History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Your withdrawal requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No withdrawals yet</p>
          ) : (
            <div className="space-y-4">
              {withdrawalRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">€{request.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    {request.stripe_transfer_id && (
                      <p className="text-xs text-muted-foreground">
                        Transfer: {request.stripe_transfer_id.slice(0, 12)}...
                      </p>
                    )}
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
                      {donation.is_anonymous ? 'Anonymous' : (donation.donor_name || 'Supporter')}
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
                    <p className="font-bold text-green-600">+€{Number(donation.amount ?? 0).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      Net: €{Number(donation.net_amount ?? donation.amount ?? 0).toFixed(2)}
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
