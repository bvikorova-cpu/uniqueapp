import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, TrendingUp, Star, Award, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DashboardStats {
  totalExchanges: number;
  averageRating: number;
  totalReviews: number;
  activeOfferings: number;
  pendingExchanges: number;
  completedThisMonth: number;
}

interface PopularSkill {
  id: string;
  title: string;
  category: string;
  request_count: number;
}

export default function SkillSwapDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalExchanges: 0,
    averageRating: 0,
    totalReviews: 0,
    activeOfferings: 0,
    pendingExchanges: 0,
    completedThisMonth: 0,
  });
  const [popularSkills, setPopularSkills] = useState<PopularSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Fetch user profile with stats
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('completed_exchanges, rating_average, total_reviews')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch active offerings count
      const { count: offeringsCount, error: offeringsError } = await supabase
        .from('skill_offerings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_active', true);

      if (offeringsError) throw offeringsError;

      // Fetch pending exchanges
      const { count: pendingCount, error: pendingError } = await supabase
        .from('skill_swap_conversations')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
        .eq('status', 'active');

      if (pendingError) throw pendingError;

      // Fetch completed exchanges this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: monthlyCount, error: monthlyError } = await supabase
        .from('skill_swap_conversations')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
        .eq('status', 'completed')
        .gte('completed_at', firstDayOfMonth.toISOString());

      if (monthlyError) throw monthlyError;

      // Fetch popular skills (most requested)
      const { data: offerings, error: skillsError } = await supabase
        .from('skill_offerings')
        .select('id, title, category')
        .eq('user_id', session.user.id)
        .eq('is_active', true);

      if (skillsError) throw skillsError;

      // Count requests for each offering
      const skillsWithCounts = await Promise.all(
        (offerings || []).map(async (offering) => {
          const { count } = await supabase
            .from('skill_swap_conversations')
            .select('*', { count: 'exact', head: true })
            .eq('offering_id', offering.id);

          return {
            ...offering,
            request_count: count || 0,
          };
        })
      );

      const sortedSkills = skillsWithCounts.sort((a, b) => b.request_count - a.request_count).slice(0, 5);

      setStats({
        totalExchanges: profile?.completed_exchanges || 0,
        averageRating: profile?.rating_average || 0,
        totalReviews: profile?.total_reviews || 0,
        activeOfferings: offeringsCount || 0,
        pendingExchanges: pendingCount || 0,
        completedThisMonth: monthlyCount || 0,
      });

      setPopularSkills(sortedSkills);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/skill-swap')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Skill Swap
          </Button>
          <h1 className="text-4xl font-black mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Track your skill exchange journey and performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Exchanges</p>
                <p className="text-3xl font-bold">{stats.totalExchanges}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completedThisMonth} this month
                </p>
              </div>
              <Award className="h-12 w-12 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {stats.totalReviews} reviews
                </p>
              </div>
              <Star className="h-12 w-12 text-yellow-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Offerings</p>
                <p className="text-3xl font-bold">{stats.activeOfferings}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingExchanges} pending exchanges
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-primary opacity-50" />
            </div>
          </Card>
        </div>

        {/* Popular Skills */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Most Requested Skills</h2>
          </div>
          {popularSkills.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No skills offered yet. Add your first skill to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {popularSkills.map((skill, index) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{skill.title}</p>
                      <Badge variant="secondary" className="mt-1">
                        {skill.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{skill.request_count}</p>
                    <p className="text-xs text-muted-foreground">requests</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/skill-swap')}
            className="w-full"
          >
            Browse Available Skills
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/skill-swap?tab=messages')}
            className="w-full"
          >
            View Messages
          </Button>
        </div>
      </div>
    </div>
  );
}