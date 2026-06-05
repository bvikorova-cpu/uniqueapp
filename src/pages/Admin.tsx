import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, Users, TrendingUp, CreditCard, Search, ChefHat, Mic2, ChevronRight, 
  UserX, Shield, Terminal, Zap, Coins, Megaphone, Activity, Command, Download
} from "lucide-react";
import { ShadowBanToggle } from "@/components/admin/ShadowBanToggle";
import { CreditOverrideDialog } from "@/components/admin/CreditOverrideDialog";
import { GlobalAnnouncementPanel } from "@/components/admin/GlobalAnnouncementPanel";
import { TransactionLogPanel } from "@/components/admin/TransactionLogPanel";
import { AdminHero } from "@/components/admin/AdminHero";
import { RealtimeActivityFeed } from "@/components/admin/RealtimeActivityFeed";
import { AIInsightsPanel } from "@/components/admin/AIInsightsPanel";
import { RevenueCharts } from "@/components/admin/RevenueCharts";
import { SystemHealthMonitor } from "@/components/admin/SystemHealthMonitor";
import { CommandBar } from "@/components/admin/CommandBar";
import { AuditLogPanel } from "@/components/admin/AuditLogPanel";
import { ImpersonationPanel } from "@/components/admin/ImpersonationPanel";
import { ActivityHeatmap } from "@/components/admin/ActivityHeatmap";
import { AnomalyDetector } from "@/components/admin/AnomalyDetector";
import { QuickActionsDock } from "@/components/admin/QuickActionsDock";
import { BroadcastCenter } from "@/components/admin/BroadcastCenter";
import { TopUsersLeaderboard } from "@/components/admin/TopUsersLeaderboard";
import { HubPerformanceMatrix } from "@/components/admin/HubPerformanceMatrix";
import { PendingPayoutsCard } from "@/components/admin/PendingPayoutsCard";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    masterchefEarnings: 0,
  });
  
  // Data
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Server-side user search when admin types in the search box (so we're not
  // limited to the first 100 profiles). Debounced.
  useEffect(() => {
    if (!isAdmin) return;
    const term = searchTerm.trim();
    if (term.length < 2) return; // initial 100 already loaded
    const handle = setTimeout(async () => {
      const like = `%${term}%`;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.${like},email.ilike.${like},username.ilike.${like}`)
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setUsers((prev) => {
        const map = new Map<string, any>();
        [...prev, ...data].forEach((u: any) => map.set(u.id, u));
        return Array.from(map.values());
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [searchTerm, isAdmin]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has admin role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the Command Center",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await loadData();
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load subscriptions
      const { data: subs } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      setSubscriptions(subs || []);

      // Load transactions with seller and buyer profiles
      const { data: trans } = await supabase
        .from('transactions')
        .select(`
          *,
          user:user_id (
            id,
            email,
            full_name
          ),
          seller:seller_id (
            id,
            email,
            full_name
          ),
          buyer:buyer_id (
            id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      setTransactions(trans || []);

      // Load contact messages from BOTH tables (legacy contact_messages + new support_tickets)
      const [legacyMsgs, ticketMsgs] = await Promise.all([
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
      ]);

      const merged = [
        ...((legacyMsgs.data as any[]) || []).map((m) => ({ ...m, _source: 'contact_messages' as const })),
        ...((ticketMsgs.data as any[]) || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          email: t.email,
          subject: t.subject || `[${t.category || 'general'}] ticket #${t.ticket_number || ''}`,
          message: t.message,
          is_read: t.status === 'resolved' || t.status === 'closed',
          created_at: t.created_at,
          _source: 'support_tickets' as const,
          _status: t.status,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setMessages(merged);

      // Load users for user management
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setUsers(usersData || []);

      // Calculate stats
      const totalUsers = new Set(subs?.map(s => s.user_id) || []).size;
      const premiumUsers = subs?.filter(s => s.tier !== 'free' && s.status === 'active').length || 0;
      
      const totalRevenue = trans?.reduce((sum, t) => {
        const commission = parseFloat(String(t.commission_amount)) || 0;
        return sum + commission;
      }, 0) || 0;
      
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthlyRevenue = trans?.filter(t => new Date(t.created_at) >= monthStart)
        .reduce((sum, t) => {
          const commission = parseFloat(String(t.commission_amount)) || 0;
          return sum + commission;
        }, 0) || 0;

      // Load KitchenStars earnings
      const { data: masterchefData } = await supabase
        .from('masterchef_platform_earnings')
        .select('commission_amount');
      
      const masterchefEarnings = masterchefData?.reduce((sum, e) => {
        return sum + (parseFloat(String(e.commission_amount)) || 0);
      }, 0) || 0;

      setStats({
        totalUsers,
        premiumUsers,
        totalRevenue,
        monthlyRevenue,
        masterchefEarnings,
      });
    } catch (error) {
      console.error('Load data error:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    }
  };

  const updateTransactionStatus = async (transactionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction status updated",
      });
      
      await loadData();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Terminal className="h-12 w-12 mx-auto animate-pulse text-primary" />
          <p className="text-muted-foreground">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(trans =>
    trans.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trans.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trans.seller?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trans.buyer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trans.item_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Cinematic Hero */}
        <AdminHero
          totalUsers={stats.totalUsers}
          premiumUsers={stats.premiumUsers}
          monthlyRevenue={stats.monthlyRevenue}
        />

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            onClick={() => setCmdOpen(true)}
            variant="outline"
            className="gap-2 bg-card/60 backdrop-blur-md border-primary/30 hover:border-primary/60"
          >
            <Command className="h-4 w-4" />
            Quick Actions
            <kbd className="ml-2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
              ⌘K
            </kbd>
          </Button>
          <Button
            onClick={() => {
              const ts = new Date().toISOString();
              const rows = [
                ["metric", "value", "captured_at"],
                ["total_users", String(stats.totalUsers), ts],
                ["premium_users", String(stats.premiumUsers), ts],
                ["total_revenue_eur", stats.totalRevenue.toFixed(2), ts],
                ["monthly_revenue_eur", stats.monthlyRevenue.toFixed(2), ts],
                ["masterchef_earnings_eur", stats.masterchefEarnings.toFixed(2), ts],
                ["transactions_count", String(transactions.length), ts],
                ["subscriptions_count", String(subscriptions.length), ts],
                ["contact_messages_count", String(messages.length), ts],
              ];
              const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `admin-snapshot-${ts.slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast({ title: "Snapshot exported", description: "CSV downloaded" });
            }}
            variant="outline"
            className="gap-2 bg-card/60 backdrop-blur-md border-emerald-500/30 hover:border-emerald-500/60"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            Snapshot CSV
          </Button>
          <SystemHealthMonitor />
        </div>

        {/* Power Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GlobalAnnouncementPanel />
          <TransactionLogPanel />
        </div>

        {/* Pending Payouts + Hub Performance Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <PendingPayoutsCard />
          </div>
          <div className="lg:col-span-2">
            <HubPerformanceMatrix />
          </div>
        </div>

        {/* Heatmap + Anomaly Detector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ActivityHeatmap />
          <AnomalyDetector />
        </div>

        {/* AI Insights + Realtime Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIInsightsPanel stats={stats} />
          <RealtimeActivityFeed />
        </div>

        {/* Charts */}
        <div className="mb-6">
          <RevenueCharts />
        </div>

        {/* Broadcast + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BroadcastCenter />
          <TopUsersLeaderboard />
        </div>

        {/* Audit Log + Impersonation */}
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          <AuditLogPanel />
          <ImpersonationPanel />
        </div>

        <QuickActionsDock />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.monthlyRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <CommandBar open={cmdOpen} onOpenChange={setCmdOpen} />

        {/* Platform Earnings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5"
            onClick={() => navigate('/admin/masterchef-payouts')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-500/20">
                    <ChefHat className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">KitchenStars Earnings</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Platform commissions from virtual gifts (20%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-500">
                    €{stats.masterchefEarnings.toFixed(2)}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/admin/campaign-withdrawals')}>
                    Manage Payouts →
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5"
            onClick={() => navigate('/admin/comedy-payouts')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <Mic2 className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Comedy Club Earnings</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Commissions from tickets, tips, and clips (25%)
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Referral Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5"
            onClick={() => navigate('/admin/referral-funnel')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-500/20">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Referral Funnel</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clicks → signups → paid → payouts
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-red-500/30 bg-gradient-to-br from-red-500/5 to-orange-500/5"
            onClick={() => navigate('/admin/referral-fraud')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-red-500/20">
                    <Shield className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Referral Fraud Review</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Flagged attributions awaiting decision
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* PWA Install Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"
            onClick={() => navigate('/admin/pwa-stats')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-cyan-500/20">
                    <Download className="h-6 w-6 text-cyan-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">PWA Install Stats</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Banner impressions, install clicks, and accepted installs per platform
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"
            onClick={() => navigate('/admin/engagement')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">User Engagement</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      DAU / WAU / MAU, stickiness, and signup velocity
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="users" className="gap-1">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  User Management & Credit Control
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Shadow Ban</TableHead>
                      <TableHead>Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(user =>
                      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || 'Unknown'}</TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <ShadowBanToggle 
                            userId={user.id} 
                            userName={user.full_name || 'User'}
                          />
                        </TableCell>
                        <TableCell>
                          <CreditOverrideDialog
                            userId={user.id}
                            userName={user.full_name || 'User'}
                            onUpdate={loadData}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>{sub.profiles?.full_name || 'N/A'}</TableCell>
                        <TableCell>{sub.profiles?.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={sub.tier === 'free' ? 'secondary' : 'default'}>
                            {sub.tier.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>€{parseFloat(sub.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(sub.started_at).toLocaleDateString()}</TableCell>
                        <TableCell>{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Unlimited'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User/Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission €</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((trans) => (
                      <TableRow key={trans.id}>
                        <TableCell>{trans.user?.email || trans.buyer?.email || 'N/A'}</TableCell>
                        <TableCell>{trans.seller?.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {trans.item_type || trans.transaction_type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>€{parseFloat(trans.amount || 0).toFixed(2)}</TableCell>
                        <TableCell className="font-bold">€{parseFloat(trans.commission_amount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            trans.status === 'completed' ? 'default' :
                            trans.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {trans.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(trans.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {trans.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateTransactionStatus(trans.id, 'completed')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => navigate('/admin/refunds')}
                                title="Refunds are processed via Stripe in the Payments & Refunds dashboard"
                              >
                                Refund via Stripe
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.filter(msg =>
                      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((msg) => (
                      <TableRow key={msg.id} className={!msg.is_read ? 'font-bold' : ''}>
                        <TableCell>{msg.name}</TableCell>
                        <TableCell>{msg.email}</TableCell>
                        <TableCell>{msg.subject}</TableCell>
                        <TableCell className="max-w-md truncate">{msg.message}</TableCell>
                        <TableCell>
                          <Badge variant={msg.is_read ? 'secondary' : 'default'}>
                            {msg.is_read ? 'Read' : 'New'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {!msg.is_read && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                const src = (msg as any)._source || 'contact_messages';
                                if (src === 'support_tickets') {
                                  await supabase.from('support_tickets').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', msg.id);
                                } else {
                                  await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id);
                                }
                                await loadData();
                              }}
                            >
                              Mark Read
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
