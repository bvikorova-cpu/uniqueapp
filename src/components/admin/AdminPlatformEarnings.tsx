import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, DollarSign, Users, Calendar, User } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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

interface InfluencerDetail {
  id: string;
  display_name: string;
  profile_photo_url: string | null;
  category: string;
  lifetime_earnings: number;
  pending_balance: number;
  total_withdrawn: number;
  pendingWithdrawals: number;
  availableBalance: number;
}

interface CreatorDetail {
  id: string;
  name: string;
  avatar_url: string | null;
  type: string;
  lifetime_earnings: number;
  pending_balance: number;
  total_withdrawn: number;
  pendingWithdrawals: number;
  availableBalance: number;
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

  // Fetch detailed influencer data with earnings
  const { data: influencerDetails } = useQuery({
    queryKey: ["admin-influencer-details"],
    queryFn: async () => {
      const { data: profiles, error: profileError } = await supabase
        .from("influencer_profiles")
        .select("*")
        .order("lifetime_earnings", { ascending: false });
      
      if (profileError) throw profileError;

      // Fetch pending withdrawal requests for each influencer
      const { data: withdrawals, error: withdrawalError } = await supabase
        .from("influencer_withdrawal_requests")
        .select("*")
        .eq("status", "pending");
      
      if (withdrawalError) throw withdrawalError;

      // Map influencer details with withdrawal info
      return (
    <>
      <FloatingHowItWorks title={"Admin Platform Earnings - How it works"} steps={[{ title: 'Open', desc: 'Access the Admin Platform Earnings section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Admin Platform Earnings.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      profiles || []
    </>
  ).map((profile) => {
        const pendingWithdrawals = (withdrawals || [])
          .filter((w) => w.influencer_id === profile.id)
          .reduce((sum, w) => sum + w.amount, 0);

        const availableBalance = (profile.lifetime_earnings || 0) - (profile.total_withdrawn || 0) - pendingWithdrawals;

        return {
          ...profile,
          pendingWithdrawals,
          availableBalance,
        } as InfluencerDetail;
      });
    },
  });

  // Fetch Musicians data with earnings
  const { data: musicianDetails } = useQuery({
    queryKey: ["admin-musician-details"],
    queryFn: async () => {
      const { data: profiles, error: profileError } = await supabase
        .from("musician_profiles")
        .select("*")
        .order("lifetime_earnings", { ascending: false });
      
      if (profileError) throw profileError;

      const { data: withdrawals, error: withdrawalError } = await supabase
        .from("musician_withdrawal_requests")
        .select("*")
        .eq("status", "pending");
      
      if (withdrawalError) throw withdrawalError;

      return (profiles || []).map((profile) => {
        const pendingWithdrawals = (withdrawals || [])
          .filter((w) => w.musician_id === profile.id)
          .reduce((sum, w) => sum + w.amount, 0);

        const availableBalance = (profile.lifetime_earnings || 0) - (profile.total_withdrawn || 0) - pendingWithdrawals;

        return {
          id: profile.id,
          name: profile.stage_name,
          avatar_url: profile.avatar_url,
          type: profile.genre || "Unknown",
          lifetime_earnings: profile.lifetime_earnings || 0,
          pending_balance: profile.pending_balance || 0,
          total_withdrawn: profile.total_withdrawn || 0,
          pendingWithdrawals,
          availableBalance,
        } as CreatorDetail;
      });
    },
  });

  // Fetch Instructors data with earnings
  const { data: instructorDetails } = useQuery({
    queryKey: ["admin-instructor-details"],
    queryFn: async () => {
      const { data: profiles, error: profileError } = await supabase
        .from("instructor_profiles")
        .select("*")
        .order("lifetime_earnings", { ascending: false });
      
      if (profileError) throw profileError;

      const { data: withdrawals, error: withdrawalError } = await supabase
        .from("instructor_withdrawal_requests")
        .select("*")
        .eq("status", "pending");
      
      if (withdrawalError) throw withdrawalError;

      return (profiles || []).map((profile) => {
        const pendingWithdrawals = (withdrawals || [])
          .filter((w) => w.instructor_id === profile.id)
          .reduce((sum, w) => sum + w.amount, 0);

        const availableBalance = (profile.lifetime_earnings || 0) - (profile.total_withdrawn || 0) - pendingWithdrawals;

        return {
          id: profile.id,
          name: `Instructor ${profile.id.slice(0, 8)}`,
          avatar_url: profile.profile_image_url,
          type: profile.expertise?.join(", ") || "General",
          lifetime_earnings: profile.lifetime_earnings || 0,
          pending_balance: profile.pending_balance || 0,
          total_withdrawn: profile.total_withdrawn || 0,
          pendingWithdrawals,
          availableBalance,
        } as CreatorDetail;
      });
    },
  });

  // Fetch KitchenStars earnings
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
    { name: "KitchenStars", value: masterchefStats.total, color: "#F59E0B" },
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
        KitchenStars: masterchefDaily,
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
              <Line type="monotone" dataKey="KitchenStars" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" dataKey="Sports" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Section Details */}
      <Tabs defaultValue="influencers" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="influencers">
            <User className="w-4 h-4 mr-2" />
            Influencers
          </TabsTrigger>
          <TabsTrigger value="musicians">
            Musicians
          </TabsTrigger>
          <TabsTrigger value="instructors">
            Instructors
          </TabsTrigger>
          <TabsTrigger value="influking">
            InfluKing (€{influkingStats.total.toFixed(2)})
          </TabsTrigger>
          <TabsTrigger value="masterchef">
            KitchenStars (€{masterchefStats.total.toFixed(2)})
          </TabsTrigger>
          <TabsTrigger value="sports">
            Sports (€{sportsStats.total.toFixed(2)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="influencers" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Influencer Earnings</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Influencer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Earnings</TableHead>
                    <TableHead className="text-right">Withdrawn</TableHead>
                    <TableHead className="text-right">Pending Withdrawals</TableHead>
                    <TableHead className="text-right">Available Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(influencerDetails || []).map((influencer) => (
                    <TableRow key={influencer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {influencer.profile_photo_url ? (
                            <img
                              src={influencer.profile_photo_url}
                              alt={influencer.display_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{influencer.display_name}</p>
                            <p className="text-xs text-muted-foreground">ID: {influencer.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {influencer.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        €{(influencer.lifetime_earnings || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        €{(influencer.total_withdrawn || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-amber-600">
                        €{influencer.pendingWithdrawals.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        €{influencer.availableBalance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!influencerDetails || influencerDetails.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No influencer data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="musicians" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Musician Earnings</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Musician</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead className="text-right">Total Earnings</TableHead>
                    <TableHead className="text-right">Withdrawn</TableHead>
                    <TableHead className="text-right">Pending Withdrawals</TableHead>
                    <TableHead className="text-right">Available Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(musicianDetails || []).map((musician) => (
                    <TableRow key={musician.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {musician.avatar_url ? (
                            <img
                              src={musician.avatar_url}
                              alt={musician.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{musician.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {musician.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {musician.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        €{musician.lifetime_earnings.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        €{musician.total_withdrawn.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-amber-600">
                        €{musician.pendingWithdrawals.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        €{musician.availableBalance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!musicianDetails || musicianDetails.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No musician data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="instructors" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Instructor Earnings</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Expertise</TableHead>
                    <TableHead className="text-right">Total Earnings</TableHead>
                    <TableHead className="text-right">Withdrawn</TableHead>
                    <TableHead className="text-right">Pending Withdrawals</TableHead>
                    <TableHead className="text-right">Available Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(instructorDetails || []).map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {instructor.avatar_url ? (
                            <img
                              src={instructor.avatar_url}
                              alt={instructor.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{instructor.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {instructor.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {instructor.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        €{instructor.lifetime_earnings.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        €{instructor.total_withdrawn.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-amber-600">
                        €{instructor.pendingWithdrawals.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        €{instructor.availableBalance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!instructorDetails || instructorDetails.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No instructor data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

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
