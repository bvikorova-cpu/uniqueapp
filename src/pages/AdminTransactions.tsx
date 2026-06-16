import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, CheckCircle, Clock, Copy, Receipt, Download } from "lucide-react";
import { format } from "date-fns";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { exportToCsv } from "@/lib/exportCsv";

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
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data: txData, error } = await query;
      if (error) throw error;

      const txs = (txData as any[]) || [];
      const userIds = Array.from(
        new Set(txs.flatMap((t) => [t.seller_id, t.buyer_id]).filter(Boolean))
      );

      let profilesById: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, iban")
          .in("id", userIds);
        profilesById = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      }

      const enriched = txs.map((t) => ({
        ...t,
        seller_profile: profilesById[t.seller_id] || null,
        buyer_profile: profilesById[t.buyer_id] || null,
      }));

      setTransactions(enriched as any);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Failed to load transactions");
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

      toast.success("Transaction marked as paid");
      loadTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const totalPending = transactions
    .filter(t => t.status === "pending")
    .reduce((sum, t) => sum + Number(t.seller_amount), 0);

  const totalRevenue = transactions
    .reduce((sum, t) => sum + Number(t.platform_fee), 0);

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Transactions"
          subtitle="Monitor bazaar and auction transactions, track commissions and pay sellers."
          icon={Receipt}
          badge="Finance"
          breadcrumbs={[{ label: "Transactions" }]}
          stats={[
            { label: "Pending €", value: `€${totalPending.toFixed(0)}`, accent: "amber" },
            { label: "Commission €", value: `€${totalRevenue.toFixed(0)}`, accent: "emerald" },
            { label: "Total Tx", value: transactions.length, accent: "cyan" },
            { label: "Filter", value: filter, accent: "purple" },
          ]}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                exportToCsv("transactions", transactions, [
                  { key: "created_at", label: "Date" },
                  { key: "item_type", label: "Type" },
                  { key: "seller_profile", label: "Seller", format: (s) => s?.email || "" },
                  { key: "buyer_profile", label: "Buyer", format: (b) => b?.email || "" },
                  { key: "total_amount", label: "Total €" },
                  { key: "platform_fee", label: "Commission €" },
                  { key: "seller_amount", label: "Payout €" },
                  { key: "status", label: "Status" },
                ])
              }
              className="bg-white/15 backdrop-blur-xl border border-white/30 text-white hover:bg-white/25"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
          }
        />

        <div className="flex justify-end gap-2 mb-4">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
            size="sm"
          >
            Paid
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              To be paid to sellers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Profit (Commission)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total commissions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>Amount to Pay</TableHead>
                    <TableHead>Your Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
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
                          {transaction.item_type === "bazaar" ? "Bazaar" : "Auction"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {transaction.seller_profile?.full_name || "Unknown"}
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
                          <span className="text-muted-foreground text-sm">Not provided</span>
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
                            Awaiting payout
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaid(transaction.id)}
                          >
                            Mark as paid
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
      </AdminPageShell>
    </AdminGuard>
  );
};

export default AdminTransactions;
