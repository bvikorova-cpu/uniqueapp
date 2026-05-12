import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  EarningsHero,
  EarningsForecastChart,
  EarningsMilestones,
  EarningsTaxEstimator,
  EarningsInsights,
  EarningsExport,
  EarningsPayoutCard,
  EarningsLiveTicker,
  EarningsGoalTracker,
  EarningsTipsBanner,
  PayoutMethodsManager,
  StripeConnectBanner,
} from "@/components/earnings";

interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  commission_amount?: number;
  seller_amount: number;
  status: string;
  item_type: string;
  item_id: string;
  buyer_id: string;
}

const Earnings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    available: 0,
    monthEarnings: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasPayoutMethod, setHasPayoutMethod] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    const { count } = await supabase
      .from('payout_methods')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setHasPayoutMethod((count || 0) > 0);
    loadTransactions(user.id);
  };

  const loadTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const list = (data as any[]) || [];
      setTransactions(list);
      calculateStats(list);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({ title: "Error", description: "Failed to load transactions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (txs: Transaction[]) => {
    const totalEarnings = txs.reduce((s, t) => s + Number(t.seller_amount), 0);
    const pendingPayouts = txs.filter(t => t.status === 'pending').reduce((s, t) => s + Number(t.seller_amount), 0);
    const completedPayouts = txs.filter(t => t.status === 'completed').reduce((s, t) => s + Number(t.seller_amount), 0);
    const now = new Date();
    const monthEarnings = txs
      .filter(t => {
        const d = new Date(t.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + Number(t.seller_amount), 0);
    setStats({
      totalEarnings,
      pendingPayouts,
      completedPayouts,
      available: completedPayouts, // for demo: paid-out items represent available; real flow would use a balance table
      monthEarnings,
      totalSales: txs.length,
    });
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="border-yellow-500/50 text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'completed': return <Badge variant="outline" className="border-emerald-500/50 text-emerald-600"><CheckCircle className="w-3 h-3 mr-1" />Paid out</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getItemTypeName = (t: string) => t === 'bazaar' ? 'Bazaar' : t === 'auction' ? 'Auction' : t;

  const handlePayout = async () => {
    if (stats.available < 25) {
      toast({ title: "Below minimum", description: "Minimum payout is €25.", variant: "destructive" });
      return;
    }
    if (!hasPayoutMethod) {
      toast({ title: "No payout method", description: "Add a payout method first.", variant: "destructive" });
      return;
    }
    toast({
      title: "Use your hub-specific dashboard",
      description: "Withdrawals are processed per vertical (Auctions, Musicians, Chefs, Influencers, Instructors). Open the matching earnings page to request a payout.",
    });
  };

  const exportRows = transactions.map(t => ({
    Date: formatDate(t.created_at),
    Type: getItemTypeName(t.item_type),
    Buyer: t.buyer_id.slice(0, 8),
    Total: t.amount,
    Commission: t.commission_amount ?? 0,
    Net: t.seller_amount,
    Status: t.status,
  }));

  const history = transactions.map(t => ({
    created_at: t.created_at,
    amount: t.seller_amount,
    item_type: t.item_type,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-20 sm:pt-24 pb-8 px-4">
      <EarningsHero
        title="My Earnings"
        subtitle="Track every euro — payouts, forecasts, milestones, tax estimates."
        totalEarnings={stats.totalEarnings}
        available={stats.available}
        pending={stats.pendingPayouts}
        paidOut={stats.completedPayouts}
      />

      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <EarningsLiveTicker />
        <EarningsExport rows={exportRows} filename="my-earnings" />
      </div>

      <div className="mb-6">
        <PayoutMethodsManager onChange={setHasPayoutMethod} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <EarningsPayoutCard
          available={stats.available}
          minimum={25}
          hasPayoutMethod={hasPayoutMethod}
          onRequest={handlePayout}
          onSetupMethod={() => {
            const el = document.querySelector('[data-payout-manager]');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          methodLabel="PayPal · Wise · Crypto · Stripe Connect"
        />
        <EarningsGoalTracker monthEarnings={stats.monthEarnings} />
        <EarningsTipsBanner />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <EarningsForecastChart history={history} />
        </div>
        <EarningsInsights history={history} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <EarningsMilestones totalEarnings={stats.totalEarnings} />
        <EarningsTaxEstimator totalEarnings={stats.totalEarnings} />
      </div>

      <Card className="border-amber-500/20">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Paid out</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <TransactionsTable txs={transactions} formatDate={formatDate} getStatusBadge={getStatusBadge} getItemTypeName={getItemTypeName} />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <TransactionsTable txs={transactions.filter(t => t.status === 'pending')} formatDate={formatDate} getStatusBadge={getStatusBadge} getItemTypeName={getItemTypeName} />
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <TransactionsTable txs={transactions.filter(t => t.status === 'completed')} formatDate={formatDate} getStatusBadge={getStatusBadge} getItemTypeName={getItemTypeName} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface TableProps {
  txs: Transaction[];
  formatDate: (s: string) => string;
  getStatusBadge: (s: string) => JSX.Element;
  getItemTypeName: (t: string) => string;
}

const TransactionsTable = ({ txs, formatDate, getStatusBadge, getItemTypeName }: TableProps) => {
  if (txs.length === 0) return <div className="text-center py-8 text-muted-foreground">No transactions</div>;
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Your Profit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {txs.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="text-sm">{formatDate(t.created_at)}</TableCell>
              <TableCell><Badge variant="outline">{getItemTypeName(t.item_type)}</Badge></TableCell>
              <TableCell className="text-xs font-mono">{t.buyer_id.slice(0, 8)}…</TableCell>
              <TableCell>€{Number(t.amount).toFixed(2)}</TableCell>
              <TableCell className="text-rose-500">-€{Number(t.commission_amount || 0).toFixed(2)}</TableCell>
              <TableCell className="font-bold text-emerald-500">€{Number(t.seller_amount).toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(t.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Earnings;
