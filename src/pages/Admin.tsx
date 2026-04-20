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
  UserX, Shield, Terminal, Zap, Coins, Megaphone, Activity, Command
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

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
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

      // Load contact messages
      const { data: msgs } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      setMessages(msgs || []);

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

      // Load MasterChef earnings
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Terminal className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Unique Tech. Command Center
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Secure Admin Console • Full Platform Control
              </p>
            </div>
          </div>
        </div>

        {/* Power Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlobalAnnouncementPanel />
          <TransactionLogPanel />
        </div>

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
                    <CardTitle className="text-xl">MasterChef Earnings</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Platform commissions from virtual gifts (20%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-500">
                    €{stats.masterchefEarnings.toFixed(2)}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
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
              <CardContent>
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
              <CardContent>
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
              <CardContent>
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
                                onClick={() => updateTransactionStatus(trans.id, 'refunded')}
                              >
                                Refund
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
              <CardContent>
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
                                await supabase
                                  .from('contact_messages')
                                  .update({ is_read: true })
                                  .eq('id', msg.id);
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
