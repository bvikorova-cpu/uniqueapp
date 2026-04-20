import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Download, TrendingUp, CreditCard, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const AdminPaymentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [creditType, setCreditType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7");

  // Fetch payment statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["payment-stats", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-payment-statistics", {
        body: { days: parseInt(dateRange) }
      });
      if (error) throw error;
      return data;
    },
  });

  // Fetch all credit payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["all-payments", creditType, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("credit_payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (creditType !== "all") {
        query = query.eq("credit_type", creditType);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch user profiles separately
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      
      // Merge profiles with payments
      const paymentsWithProfiles = data.map(payment => ({
        ...payment,
        profile: profiles?.find(p => p.id === payment.user_id)
      }));
      
      return paymentsWithProfiles;
    },
  });

  // Fetch conversion analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["payment-analytics", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-payment-analytics", {
        body: { days: parseInt(dateRange) }
      });
      if (error) throw error;
      return data;
    },
  });

  const filteredPayments = payments?.filter(payment => 
    searchTerm === "" || 
    payment.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    if (!filteredPayments) return;
    
    const headers = ["Date", "User", "Credit Type", "Credits", "Amount", "Currency", "Session ID"];
    const rows = filteredPayments.map(p => [
      format(new Date(p.created_at), "yyyy-MM-dd HH:mm"),
      p.profile?.email || "N/A",
      p.credit_type,
      p.credits,
      (p.amount / 100).toFixed(2),
      p.currency.toUpperCase(),
      p.session_id
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Payment Dashboard"
          subtitle="Monitor payments, credits and conversion analytics in real time."
          icon={CreditCard}
          badge="Finance"
          breadcrumbs={[{ label: "Payment Dashboard" }]}
          stats={[
            { label: "Revenue", value: `€${((stats?.totalRevenue || 0) / 100).toFixed(0)}`, accent: "emerald" },
            { label: "Transactions", value: stats?.totalTransactions || 0, accent: "cyan" },
            { label: "Customers", value: stats?.uniqueCustomers || 0, accent: "purple" },
            { label: `Last ${dateRange}d`, value: "•", accent: "amber" },
          ]}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    €{((stats?.totalRevenue || 0) / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last {dateRange} days
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Last {dateRange} days
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.uniqueCustomers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Last {dateRange} days
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    €{((stats?.avgTransaction || 0) / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last {dateRange} days
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments">All Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="credits">Credits Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <CardTitle>Payment Transactions</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={creditType} onValueChange={setCreditType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Credit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ai_credits">AI Credits</SelectItem>
                        <SelectItem value="analyzer_credits">Analyzer</SelectItem>
                        <SelectItem value="cooking_credits">Cooking</SelectItem>
                        <SelectItem value="video_ad_credits">Video Ad</SelectItem>
                        <SelectItem value="iq_credits">IQ Test</SelectItem>
                        <SelectItem value="photo_credits">Photo</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by email or session..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Button onClick={exportToCSV} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Credit Type</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Session ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments?.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {format(new Date(payment.created_at), "MMM dd, yyyy HH:mm")}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {payment.profile?.full_name || "Unknown"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {payment.profile?.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {payment.credit_type.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>{payment.credits}</TableCell>
                            <TableCell>
                              €{(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {payment.session_id.substring(0, 20)}...
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {analytics?.conversionRate?.toFixed(2)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            €{((analytics?.revenuePerUser || 0) / 100).toFixed(2)}
                          </div>
                          <p className="text-sm text-muted-foreground">Revenue per User</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {analytics?.repeatCustomerRate?.toFixed(2)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Repeat Customer Rate</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Top Selling Credit Types</h3>
                      <div className="space-y-2">
                        {analytics?.topCreditTypes?.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Badge>{item.credit_type.replace(/_/g, " ")}</Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{item.count} purchases</div>
                              <div className="text-sm text-muted-foreground">
                                €{((item.revenue || 0) / 100).toFixed(2)} revenue
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits">
            <Card>
              <CardHeader>
                <CardTitle>Credits Breakdown by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics?.creditBreakdown?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{item.credit_type.replace(/_/g, " ")}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.total_credits} credits sold
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            €{((item.total_revenue || 0) / 100).toFixed(2)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.transaction_count} transactions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminPageShell>
    </AdminGuard>
  );
};

export default AdminPaymentDashboard;
