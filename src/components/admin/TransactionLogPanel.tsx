import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Search, TrendingUp, DollarSign } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const TransactionLogPanel = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    transactionCount: 0,
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Load all transactions from multiple sources
      const [bazaarOrders, auctionBids, subscriptions] = await Promise.all([
        supabase
          .from('bazaar_orders')
          .select('id, amount, commission_amount, status, created_at, buyer_id, seller_id')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('auction_bids')
          .select('id, bid_amount, created_at, user_id, auction_id')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('subscriptions')
          .select('id, price, tier, status, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      // Combine and format transactions
      const allTransactions: any[] = [];

      bazaarOrders.data?.forEach(order => {
        allTransactions.push({
          id: order.id,
          type: 'Bazaar Order',
          amount: order.amount,
          commission: order.commission_amount,
          status: order.status,
          created_at: order.created_at,
          source: 'bazaar',
        });
      });

      auctionBids.data?.forEach(bid => {
        allTransactions.push({
          id: bid.id,
          type: 'Auction Bid',
          amount: bid.bid_amount,
          commission: bid.bid_amount * 0.1, // 10% commission
          status: 'completed',
          created_at: bid.created_at,
          source: 'auction',
        });
      });

      subscriptions.data?.forEach(sub => {
        if (sub.price > 0) {
          allTransactions.push({
            id: sub.id,
            type: `Subscription (${sub.tier})`,
            amount: sub.price,
            commission: sub.price, // Full amount for subscriptions
            status: sub.status,
            created_at: sub.created_at,
            source: 'subscription',
          });
        }
      });

      // Sort by date
      allTransactions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTransactions(allTransactions);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalRevenue = allTransactions.reduce((sum, t) => 
        sum + (parseFloat(t.commission) || 0), 0
      );

      const todayRevenue = allTransactions
        .filter(t => new Date(t.created_at) >= today)
        .reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0);

      setStats({
        totalRevenue,
        todayRevenue,
        transactionCount: allTransactions.length,
      });
    } catch (error) {
      console.error('Load transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'refunded': return 'bg-red-500/20 text-red-400';
      case 'active': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'bazaar': return 'bg-purple-500/20 text-purple-400';
      case 'auction': return 'bg-orange-500/20 text-orange-400';
      case 'subscription': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Transaction Log Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Transaction Log Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Transaction Log Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-500" />
          Real-Time Transaction Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </div>
            <div className="text-2xl font-bold text-green-400">
              €{stats.totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Today's Revenue
            </div>
            <div className="text-2xl font-bold text-blue-400">
              €{stats.todayRevenue.toFixed(2)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Transactions
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {stats.transactionCount}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => (
                  <TableRow key={`${t.source}-${t.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={getSourceColor(t.source)}>
                          {t.source}
                        </Badge>
                        <span className="text-sm">{t.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>€{parseFloat(t.amount).toFixed(2)}</TableCell>
                    <TableCell className="font-semibold text-green-400">
                      €{parseFloat(t.commission).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(t.status)}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(t.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
