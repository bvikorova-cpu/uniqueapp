import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, TrendingUp, Star, Award, MessageSquare, Users, ArrowLeftRight, Zap, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";
import heroVideo from "@/assets/skill-swap-hero.mp4.asset.json";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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
    totalExchanges: 0, averageRating: 0, totalReviews: 0,
    activeOfferings: 0, pendingExchanges: 0, completedThisMonth: 0,
  });
  const [popularSkills, setPopularSkills] = useState<PopularSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }

      const { data: profile } = await supabase.from('profiles')
        .select('completed_exchanges, rating_average, total_reviews')
        .eq('id', session.user.id).single();

      const { count: offeringsCount } = await supabase.from('skill_offerings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id).eq('is_active', true);

      const { count: pendingCount } = await supabase.from('skill_swap_conversations')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
        .eq('status', 'active');

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      const { count: monthlyCount } = await supabase.from('skill_swap_conversations')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
        .eq('status', 'completed')
        .gte('completed_at', firstDayOfMonth.toISOString());

      const { data: offerings } = await supabase.from('skill_offerings')
        .select('id, title, category')
        .eq('user_id', session.user.id).eq('is_active', true);

      const skillsWithCounts = await Promise.all(
        (offerings || []).map(async (offering) => {
          const { count } = await supabase.from('skill_swap_conversations')
            .select('*', { count: 'exact', head: true }).eq('offering_id', offering.id);
          return { ...offering, request_count: count || 0 };
        })
      );

      setStats({
        totalExchanges: profile?.completed_exchanges || 0,
        averageRating: profile?.rating_average || 0,
        totalReviews: profile?.total_reviews || 0,
        activeOfferings: offeringsCount || 0,
        pendingExchanges: pendingCount || 0,
        completedThisMonth: monthlyCount || 0,
      });
      setPopularSkills(skillsWithCounts.sort((a, b) => b.request_count - a.request_count).slice(0, 5));
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Failed to load dashboard");
    } finally { setLoading(false); }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }

  const statCards = [
    { icon: Award, label: "Total Exchanges", value: stats.totalExchanges, sub: `${stats.completedThisMonth} this month`, color: "text-amber-400" },
    { icon: Star, label: "Average Rating", value: stats.averageRating.toFixed(1), sub: `From ${stats.totalReviews} reviews`, color: "text-yellow-400" },
    { icon: ArrowLeftRight, label: "Active Offerings", value: stats.activeOfferings, sub: `${stats.pendingExchanges} pending`, color: "text-emerald-400" },
  ];

  return (
    <>
      <FloatingHowItWorks title="How Skill Swap Dashboard works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-7xl relative z-10">
        {/* Mini Hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ filter: "brightness(0.8) saturate(1.2)" }}>
              <source src={heroVideo.url} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
          </div>
          <div className="relative z-10 p-6 sm:p-10">
            <Button variant="ghost" size="sm" onClick={() => navigate('/skill-swap')} className="mb-4 text-white/80 hover:text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Skill Swap
            </Button>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2" style={{ textShadow: "0 2px 15px rgba(251,146,60,0.3)" }}>
              📊 Your Dashboard
            </h1>
            <p className="text-white/70 font-medium">Track your skill exchange journey and performance</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium">{stat.label}</p>
                    <p className="text-3xl font-black">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{stat.sub}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Popular Skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <Card className="p-5 sm:p-6 bg-card/80 backdrop-blur-xl border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
                <h2 className="text-lg font-black">Most Requested Skills</h2>
              </div>
              {popularSkills.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No skills offered yet. Add your first skill to get started!</p>
              ) : (
                <div className="space-y-3">
                  {popularSkills.map((skill, index) => (
                    <motion.div key={skill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm font-black">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{skill.title}</p>
                          <Badge variant="secondary" className="mt-0.5 text-[10px]">{skill.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">{skill.request_count}</p>
                        <p className="text-[10px] text-muted-foreground">requests</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Quick Actions Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/10"><Zap className="h-5 w-5 text-primary" /></div>
                <h2 className="text-lg font-black">Quick Actions</h2>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Users, label: "Browse Skills", path: "/skill-swap", color: "from-primary to-accent" },
                  { icon: MessageSquare, label: "View Messages", path: "/skill-swap?tab=messages", color: "from-emerald-500 to-teal-500" },
                  { icon: BookOpen, label: "Edit Profile", path: "/skill-swap/profile/edit", color: "from-amber-500 to-orange-500" },
                ].map((action, i) => (
                  <motion.div key={action.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.05 }}>
                    <Button onClick={() => navigate(action.path)} variant="outline" size="sm"
                      className="w-full justify-start gap-2 text-xs h-10 hover:border-primary/30">
                      <action.icon className="h-4 w-4 text-primary" /> {action.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Activity Summary */}
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50 mt-4">
              <h3 className="font-black text-sm mb-3">This Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Exchanges Completed</span>
                  <span className="font-black text-primary">{stats.completedThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pending Requests</span>
                  <span className="font-black text-amber-500">{stats.pendingExchanges}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Active Offerings</span>
                  <span className="font-black text-emerald-500">{stats.activeOfferings}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
    </>
    );
}
