import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Euro, TrendingUp, Clock, CheckCircle, ShoppingBag, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

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
  profiles?: {
    full_name: string | null;
  } | null;
}

interface EarningsStats {
  totalEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  totalSales: number;
}

const Earnings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasIban, setHasIban] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUserId(user.id);
    
    // Check if user has IBAN
    const { data: profile } = await supabase
      .from('profiles')
      .select('iban')
      .eq('id', user.id)
      .single();
    
    setHasIban(!!profile?.iban);
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

      setTransactions(data as any || []);
      calculateStats(data as any || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať transakcie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions: Transaction[]) => {
    const totalEarnings = transactions.reduce((sum, t) => sum + t.seller_amount, 0);
    const pendingPayouts = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.seller_amount, 0);
    const completedPayouts = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.seller_amount, 0);

    setStats({
      totalEarnings,
      pendingPayouts,
      completedPayouts,
      totalSales: transactions.length,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" />Čaká sa</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Vyplatené</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getItemTypeName = (type: string) => {
    switch (type) {
      case 'bazaar':
        return 'Bazár';
      case 'auction':
        return 'Aukcia';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Načítavam...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Moje zárobky</h1>
          <p className="text-muted-foreground">Prehľad vašich predajov a výplat</p>
        </div>
        {!hasIban && (
          <Button onClick={() => navigate('/edit-profile')}>
            Pridať IBAN
          </Button>
        )}
      </div>

      {!hasIban && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pre prijímanie platieb musíte pridať svoj IBAN v nastaveniach profilu.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkové zárobky</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Zo {stats.totalSales} predajov
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Čakajúce výplaty</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">€{stats.pendingPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Spracováva sa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vyplatené</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{stats.completedPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Už na účte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Počet predajov</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Úspešných transakcií
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>História transakcií</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Všetky</TabsTrigger>
              <TabsTrigger value="pending">Čakajúce</TabsTrigger>
              <TabsTrigger value="completed">Vyplatené</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <TransactionsTable transactions={transactions} formatDate={formatDate} getStatusBadge={getStatusBadge} getItemTypeName={getItemTypeName} />
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <TransactionsTable 
                transactions={transactions.filter(t => t.status === 'pending')} 
                formatDate={formatDate} 
                getStatusBadge={getStatusBadge}
                getItemTypeName={getItemTypeName}
              />
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <TransactionsTable 
                transactions={transactions.filter(t => t.status === 'completed')} 
                formatDate={formatDate} 
                getStatusBadge={getStatusBadge}
                getItemTypeName={getItemTypeName}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface TransactionsTableProps {
  transactions: Transaction[];
  formatDate: (date: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
  getItemTypeName: (type: string) => string;
}

const TransactionsTable = ({ transactions, formatDate, getStatusBadge, getItemTypeName }: TransactionsTableProps) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Žiadne transakcie
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dátum</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Kupujúci</TableHead>
            <TableHead>Suma celkom</TableHead>
            <TableHead>Provízia</TableHead>
            <TableHead>Váš zisk</TableHead>
            <TableHead>Stav</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="text-sm">{formatDate(transaction.created_at)}</TableCell>
              <TableCell>
                <Badge variant="outline">{getItemTypeName(transaction.item_type)}</Badge>
              </TableCell>
              <TableCell>ID: {transaction.buyer_id.slice(0, 8)}...</TableCell>
              <TableCell>€{transaction.amount.toFixed(2)}</TableCell>
              <TableCell className="text-red-600">-€{(transaction.commission_amount || 0).toFixed(2)}</TableCell>
              <TableCell className="font-bold text-green-600">€{transaction.seller_amount.toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Earnings;
