import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSSCIENCEADMIN_STEPS = [
  { title: 'Review experiments', desc: 'See all uploaded experiments and their moderation status.' },
  { title: 'Approve or reject', desc: 'Only approved experiments are visible to kids.' },
  { title: 'Manage categories', desc: 'Organise experiments by topic and age.' },
  { title: 'Audit safety', desc: 'Ensure every experiment is age-safe.' }
];
const __HIW_KIDSSCIENCEADMIN = { title: 'Science Lab Admin', intro: 'Admin view for managing Kids Science Lab content.', steps: __HIW_KIDSSCIENCEADMIN_STEPS };


interface SubscriptionStats {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  totalExperiments: number;
}

interface UserSubscription {
  user_id: string;
  email: string;
  full_name: string;
  subscription_status: string;
  product_id: string | null;
  subscription_end: string | null;
  experiments_this_month: number;
  created_at: string;
}

export default function KidsScienceAdmin() {
  const [stats, setStats] = useState<SubscriptionStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    monthlyRevenue: 0,
    totalExperiments: 0,
  });
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchUsers();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchStats = async () => {
    try {
      const { data: usageData } = await supabase
        .from("kids_science_usage")
        .select("*");

      if (usageData) {
        const activeSubscribers = usageData.filter(u => u.subscription_status === 'active').length;
        const totalExperiments = usageData.reduce((sum, u) => sum + (u.experiments_this_month || 0), 0);
        
        setStats({
          totalSubscribers: usageData.length,
          activeSubscribers,
          monthlyRevenue: activeSubscribers * 5, // €5 per subscriber
          totalExperiments,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users with their usage data
      const { data: usageData } = await supabase
        .from("kids_science_usage")
        .select("*")
        .order("created_at", { ascending: false });

      if (usageData) {
        // Get user emails and names from auth.users
        const userIds = usageData.map(u => u.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        const usersWithDetails = usageData.map(usage => {
          const profile = profiles?.find(p => p.id === usage.user_id);
          return {
            user_id: usage.user_id,
            email: profile?.email || "N/A",
            full_name: profile?.full_name || "N/A",
            subscription_status: usage.subscription_status || 'inactive',
            product_id: usage.product_id,
            subscription_end: usage.subscription_end,
            experiments_this_month: usage.experiments_this_month || 0,
            created_at: usage.created_at,
          };
        });

        setUsers(usersWithDetails);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetUserUsage = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("kids_science_usage")
        .update({ experiments_this_month: 0 })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User usage reset successfully",
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset user usage",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingHowItWorks title={__HIW_KIDSSCIENCEADMIN.title} intro={__HIW_KIDSSCIENCEADMIN.intro} steps={__HIW_KIDSSCIENCEADMIN.steps} />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Kids Science Lab Admin</h1>
          <p className="text-muted-foreground">Manage subscriptions and view statistics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscribers}</div>
              <p className="text-xs text-muted-foreground">Premium members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.monthlyRevenue}</div>
              <p className="text-xs text-muted-foreground">Recurring revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Experiments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExperiments}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Subscriptions</CardTitle>
            <CardDescription>Manage and monitor user subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading users...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Experiments</TableHead>
                    <TableHead>Subscription End</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.subscription_status === 'active' ? (
                          <Badge variant="default">Premium</Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.experiments_this_month}</TableCell>
                      <TableCell>
                        {user.subscription_end
                          ? new Date(user.subscription_end).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetUserUsage(user.user_id)}
                        >
                          Reset Usage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
