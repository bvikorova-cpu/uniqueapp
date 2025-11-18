import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Users, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

interface EarningStats {
  total: number;
  count: number;
  avgPerTransaction: number;
}

interface SectionEarnings {
  influking: EarningStats;
  masterchef: EarningStats;
  sports: EarningStats;
}

export function AdminPlatformEarnings() {
  // Fetch InfluKing earnings
  const { data: influkingEarnings } = useQuery({
    queryKey: ["admin-influking-earnings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_platform_earnings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch MasterChef earnings
  const { data: masterchefEarnings } = useQuery({
    queryKey: ["admin-masterchef-earnings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("masterchef_platform_earnings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch Sports earnings
  const { data: sportsEarnings } = useQuery({
    queryKey: ["admin-sports-earnings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports_platform_earnings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate statistics
  const calculateStats = (earnings: any[], commissionField: string): EarningStats => {
    if (!earnings || earnings.length === 0) {
      return { total: 0, count: 0, avgPerTransaction: 0 };
    }
    
    const total = earnings.reduce((sum, e) => sum + (e[commissionField] || 0), 0);
    const count = earnings.length;
    const avgPerTransaction = count > 0 ? total / count : 0;
    
    return { total, count, avgPerTransaction };
  };

  const influkingStats = calculateStats(influkingEarnings || [], "commission_amount");
  const masterchefStats = calculateStats(masterchefEarnings || [], "commission_amount");
  const sportsStats = calculateStats(sportsEarnings || [], "platform_commission");

  const totalEarnings = influkingStats.total + masterchefStats.total + sportsStats.total;
  const totalTransactions = influkingStats.count + masterchefStats.count + sportsStats.count;

  // Prepare chart data
  const pieData = [
    { name: "InfluKing", value: influkingStats.total, color: "#8B5CF6" },
    { name: "MasterChef", value: masterchefStats.total, color: "#F59E0B" },
    { name: "Sports", value: sportsStats.total, color: "#10B981" },
  ].filter(item => item.value > 0);

  // Prepare timeline data (last 7 days)
  const getLast7DaysData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      const influkingDaily = (influkingEarnings || [])
        .filter(e => e.created_at?.startsWith(dateStr))
        .reduce((sum, e) => sum + (e.commission_amount || 0), 0);
      
      const masterchefDaily = (masterchefEarnings || [])
        .filter(e => e.created_at?.startsWith(dateStr))
        .reduce((sum, e) => sum + (e.commission_amount || 0), 0);
      
      const sportsDaily = (sportsEarnings || [])
        .filter(e => e.created_at?.startsWith(dateStr))
        .reduce((sum, e) => sum + (e.platform_commission || 0), 0);
      
      days.push({
        date: format(date, "MMM dd"),
        InfluKing: influkingDaily,
        MasterChef: masterchefDaily,
        Sports: sportsDaily,
        Total: influkingDaily + masterchefDaily + sportsDaily,
      });
    }
    return days;
  };

  const timelineData = getLast7DaysData();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <h3 className="text-2xl font-bold mt-1">€{totalEarnings.toFixed(2)}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <h3 className="text-2xl font-bold mt-1">{totalTransactions}</h3>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Commission</p>
              <h3 className="text-2xl font-bold mt-1">
                €{totalTransactions > 0 ? (totalEarnings / totalTransactions).toFixed(2) : "0.00"}
              </h3>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Last 7 Days</p>
              <h3 className="text-2xl font-bold mt-1">
                €{timelineData.reduce((sum, day) => sum + day.Total, 0).toFixed(2)}
              </h3>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Earnings by Section</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Earnings Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="InfluKing" stroke="#8B5CF6" strokeWidth={2} />
              <Line type="monotone" dataKey="MasterChef" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" dataKey="Sports" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Section Details */}
      <Tabs defaultValue="influking" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="influking">
            InfluKing (€{influkingStats.total.toFixed(2)})
          </TabsTrigger>
          <TabsTrigger value="masterchef">
            MasterChef (€{masterchefStats.total.toFixed(2)})
          </TabsTrigger>
          <TabsTrigger value="sports">
            Sports (€{sportsStats.total.toFixed(2)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="influking" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Commission</p>
                  <p className="text-xl font-bold">€{influkingStats.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gifts Sent</p>
                  <p className="text-xl font-bold">{influkingStats.count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg per Gift</p>
                  <p className="text-xl font-bold">€{influkingStats.avgPerTransaction.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-4">Recent Transactions</h4>
                <div className="space-y-2">
                  {(influkingEarnings || []).slice(0, 10).map((earning) => (
                    <div key={earning.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">€{earning.total_amount?.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {earning.created_at ? format(new Date(earning.created_at), "PPp") : "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">€{earning.commission_amount?.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Your Commission (20%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="masterchef" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Commission</p>
                  <p className="text-xl font-bold">€{masterchefStats.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gifts Sent</p>
                  <p className="text-xl font-bold">{masterchefStats.count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg per Gift</p>
                  <p className="text-xl font-bold">€{masterchefStats.avgPerTransaction.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-4">Recent Transactions</h4>
                <div className="space-y-2">
                  {(masterchefEarnings || []).slice(0, 10).map((earning) => (
                    <div key={earning.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">€{earning.total_amount?.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {earning.created_at ? format(new Date(earning.created_at), "PPp") : "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">€{earning.commission_amount?.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Your Commission (20%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sports" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Commission</p>
                  <p className="text-xl font-bold">€{sportsStats.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-bold">{sportsStats.count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg per Transaction</p>
                  <p className="text-xl font-bold">€{sportsStats.avgPerTransaction.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-4">Recent Transactions</h4>
                <div className="space-y-2">
                  {(sportsEarnings || []).slice(0, 10).map((earning) => (
                    <div key={earning.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">€{earning.total_amount?.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {earning.created_at ? format(new Date(earning.created_at), "PPp") : "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">€{earning.platform_commission?.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Your Commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
