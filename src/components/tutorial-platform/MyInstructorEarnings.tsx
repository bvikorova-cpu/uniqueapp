import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Euro, Wallet, TrendingUp, ArrowUpRight, Loader2, History, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface InstructorProfile {
  id: string;
  pending_balance: number;
  lifetime_earnings: number;
  total_withdrawn: number;
  total_students: number;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  processed_at: string | null;
}

export const MyInstructorEarnings = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Load instructor profile
      const { data: profileData, error: profileError } = await supabase
        .from('instructor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      setProfile(profileData);

      // Load withdrawal requests
      if (profileData) {
        const { data: withdrawalData, error: withdrawalError } = await supabase
          .from('instructor_withdrawal_requests')
          .select('*')
          .eq('instructor_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (withdrawalError) throw withdrawalError;
        setWithdrawals(withdrawalData || []);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load earnings data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!profile || !withdrawAmount || !paymentDetails) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (amount > (profile.pending_balance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You cannot withdraw more than your available balance",
        variant: "destructive"
      });
      return;
    }

    setWithdrawing(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-instructor-withdrawal', {
        body: {
          amount,
          paymentMethod: 'bank_transfer',
          paymentDetails: { details: paymentDetails }
        }
      });

      if (error) throw error;

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted for processing",
      });

      setDialogOpen(false);
      setWithdrawAmount("");
      setPaymentDetails("");
      loadData();
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to request withdrawal",
        variant: "destructive"
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"My Instructor Earnings - How it works"} steps={[{ title: 'Open', desc: 'Access the My Instructor Earnings section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Instructor Earnings.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    </>
  );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Euro className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">You haven't created any courses yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create and publish courses to start earning
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Wallet className="w-12 h-12 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold">€{(profile.pending_balance || 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-12 h-12 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Lifetime Earnings</p>
              <p className="text-3xl font-bold">€{(profile.lifetime_earnings || 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <ArrowUpRight className="w-12 h-12 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Withdrawn</p>
              <p className="text-3xl font-bold">€{(profile.total_withdrawn || 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Euro className="w-12 h-12 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">{profile.total_students || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Withdrawal Button */}
      {(profile.pending_balance || 0) > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Request Withdrawal</h3>
              <p className="text-muted-foreground">
                Withdraw your available balance of €{(profile.pending_balance || 0).toFixed(2)}
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Wallet className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Withdrawal</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to withdraw and your payment details.
                    Available balance: €{(profile.pending_balance || 0).toFixed(2)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (€)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      max={profile.pending_balance || 0}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="details">Payment Details (IBAN / PayPal email)</Label>
                    <Textarea
                      id="details"
                      value={paymentDetails}
                      onChange={(e) => setPaymentDetails(e.target.value)}
                      placeholder="Enter your IBAN or PayPal email for payment"
                      rows={3}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleWithdrawalRequest}
                    disabled={withdrawing}
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      )}

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Withdrawal History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div 
                  key={withdrawal.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">€{withdrawal.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {new Date(withdrawal.created_at).toLocaleDateString()}
                    </p>
                    {withdrawal.processed_at && (
                      <p className="text-sm text-muted-foreground">
                        Processed: {new Date(withdrawal.processed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
