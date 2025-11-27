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
import { DollarSign, Users, TrendingUp, CreditCard, Search, ChefHat, Mic2, ChevronRight } from "lucide-react";
import { VerificationRequestsWidget } from "@/components/admin/VerificationRequestsWidget";

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
          title: "Prístup zamietnutý",
          description: "Nemáte oprávnenie na prístup k admin panelu",
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
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
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
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <VerificationRequestsWidget />
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Celkový počet užívateľov</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Prémiový užívatelia</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Celkový príjem</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">MasterChef Provízie</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.masterchefEarnings.toFixed(2)}</div>
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm" 
                onClick={() => navigate('/admin/masterchef-payouts')}
              >
                Manage Payouts →
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mesačný príjem</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyRevenue.toFixed(2)} €</div>
            </CardContent>
          </Card>
        </div>

        {/* MasterChef Earnings Card */}
        <Card 
          className="mb-8 cursor-pointer hover:shadow-lg transition-shadow border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5"
          onClick={() => navigate('/admin/masterchef-payouts')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-500/20">
                  <ChefHat className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">MasterChef Platform Earnings</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total commissions from virtual gifts (20% per gift)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-600">
                  €{stats.masterchefEarnings.toFixed(2)}
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  View Details →
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Comedy Club Earnings Card */}
        <Card 
          className="mb-8 cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5"
          onClick={() => navigate('/admin/comedy-payouts')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Mic2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Comedy Club Platform Earnings</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Provízie z lístkov, tipov a clipov (25%)
                  </p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hľadať podľa emailu alebo mena..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subscriptions">Predplatné</TabsTrigger>
            <TabsTrigger value="transactions">Transakcie</TabsTrigger>
            <TabsTrigger value="messages">Správy</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Predplatné</CardTitle>
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
                        <TableCell>{parseFloat(sub.price).toFixed(2)} €</TableCell>
                        <TableCell>
                          <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(sub.started_at).toLocaleDateString('sk-SK')}</TableCell>
                        <TableCell>{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('sk-SK') : 'Neobmedzene'}</TableCell>
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
                <CardTitle>Transakcie</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Užívateľ/Kupec</TableHead>
                      <TableHead>Predajca</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Suma</TableHead>
                      <TableHead>Provízia €</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dátum</TableHead>
                      <TableHead>Akcie</TableHead>
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
                        <TableCell>{parseFloat(trans.amount || 0).toFixed(2)} €</TableCell>
                        <TableCell className="font-bold">{parseFloat(trans.commission_amount || 0).toFixed(2)} €</TableCell>
                        <TableCell>
                          <Badge variant={
                            trans.status === 'completed' ? 'default' :
                            trans.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {trans.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(trans.created_at).toLocaleDateString('sk-SK')}</TableCell>
                        <TableCell>
                          {trans.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateTransactionStatus(trans.id, 'completed')}
                              >
                                Schváliť
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateTransactionStatus(trans.id, 'refunded')}
                              >
                                Vrátiť
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
                <CardTitle>Kontaktné správy</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meno</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Predmet</TableHead>
                      <TableHead>Správa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dátum</TableHead>
                      <TableHead>Akcia</TableHead>
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
                            {msg.is_read ? 'Prečítané' : 'Nové'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(msg.created_at).toLocaleDateString('sk-SK')}</TableCell>
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
                              Označiť ako prečítané
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