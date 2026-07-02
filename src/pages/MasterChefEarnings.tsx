import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Euro, TrendingUp, Gift, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Earning {
  id: string;
  total_amount: number;
  chef_amount: number;
  commission_amount: number;
  commission_rate: number;
  status: string;
  created_at: string;
}

export default function MasterChefEarnings() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    totalGifts: 0,
    averageCommission: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to view this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      await loadEarnings();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    }
  };

  const loadEarnings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("masterchef_platform_earnings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEarnings(data || []);

      // Calculate stats
      const total = (data || []).reduce((sum, e) => sum + Number(e.commission_amount), 0);
      const pending = (data || [])
        .filter((e) => e.status === "pending")
        .reduce((sum, e) => sum + Number(e.commission_amount), 0);
      const avgCommission = data && data.length > 0 ? total / data.length : 0;

      setStats({
        totalEarnings: total,
        pendingEarnings: pending,
        totalGifts: data?.length || 0,
        averageCommission: avgCommission,
      });
    } catch (error) {
      console.error("Error loading earnings:", error);
      toast({
        title: "Error",
        description: "Failed to load earnings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Master Chef Earnings works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
        <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading earnings...</p>
        </div>
      </div>
      </>
      );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Platform Earnings
          </h1>
          <p className="text-muted-foreground">KitchenStars gift commissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <Euro className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.pendingEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">To be paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Gifts</CardTitle>
              <Gift className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGifts}</div>
              <p className="text-xs text-muted-foreground">Processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.averageCommission.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per gift</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {earnings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No earnings yet</p>
            ) : (
              <div className="space-y-4">
                {earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="h-4 w-4 text-primary" />
                        <span className="font-medium">Gift Commission</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            earning.status === "pending"
                              ? "bg-orange-500/20 text-orange-600"
                              : "bg-green-500/20 text-green-600"
                          }`}
                        >
                          {earning.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString()} at{" "}
                        {new Date(earning.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-600">
                        +€{earning.commission_amount.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {earning.commission_rate}% of €{earning.total_amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chef gets: €{earning.chef_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
