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
import { DollarSign, Users, TrendingUp, CreditCard, Search } from "lucide-react";

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
  });
  
  // Data
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
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

      setStats({
        totalUsers,
        premiumUsers,
        totalRevenue,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Load data error:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať dáta",
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
        title: "Úspech",
        description: "Status transakcie bol aktualizovaný",
      });
      
      await loadData();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa aktualizovať status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Načítavam...</div>;
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Mesačný príjem</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyRevenue.toFixed(2)} €</div>
            </CardContent>
          </Card>
        </div>

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
                      <TableHead>Užívateľ</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Cena</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Začiatok</TableHead>
                      <TableHead>Koniec</TableHead>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;