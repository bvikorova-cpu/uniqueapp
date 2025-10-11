import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, CheckCircle, Clock, Copy } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  stripe_payment_id: string;
  buyer_id: string;
  seller_id: string;
  item_id: string;
  item_type: string;
  total_amount: number;
  platform_fee: number;
  seller_amount: number;
  status: string;
  created_at: string;
  seller_profile?: {
    full_name: string;
    email: string;
    iban: string | null;
  };
  buyer_profile?: {
    full_name: string;
    email: string;
  };
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          seller_profile:profiles!transactions_seller_id_fkey(full_name, email, iban),
          buyer_profile:profiles!transactions_buyer_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions((data as any) || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Nepodarilo sa načítať transakcie");
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", transactionId);

      if (error) throw error;

      toast.success("Transakcia označená ako vyplatená");
      loadTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Nepodarilo sa aktualizovať transakciu");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Skopírované do schránky");
  };

  const totalPending = transactions
    .filter(t => t.status === "pending")
    .reduce((sum, t) => sum + Number(t.seller_amount), 0);

  const totalRevenue = transactions
    .reduce((sum, t) => sum + Number(t.platform_fee), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Správa transakcií</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            Všetky
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Čakajúce
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
          >
            Vyplatené
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Čakajúce vyplatenia</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Na vyplatenie predajcom
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Váš zisk (provízie)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Celkové provízie
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transakcie</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Načítavam...</p>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Žiadne transakcie</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dátum</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Predajca</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>Suma na vyplatenie</TableHead>
                    <TableHead>Vaša provízia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akcie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.created_at), "dd.MM.yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.item_type === "bazaar" ? "Bazár" : "Aukcia"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {transaction.seller_profile?.full_name || "Neznámy"}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            {transaction.seller_profile?.email}
                            {transaction.seller_profile?.email && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => copyToClipboard(transaction.seller_profile?.email || "")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.seller_profile?.iban ? (
                          <div className="flex items-center gap-1">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {transaction.seller_profile.iban}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(transaction.seller_profile?.iban || "")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Nie je zadaný</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        €{Number(transaction.seller_amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        €{Number(transaction.platform_fee).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {transaction.status === "pending" ? (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Čaká na vyplatenie
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Vyplatené
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaid(transaction.id)}
                          >
                            Označiť ako vyplatené
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTransactions;
