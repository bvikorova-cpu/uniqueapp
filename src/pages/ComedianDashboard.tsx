import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ComedianGoLiveButton } from "@/components/comedy/ComedianGoLiveButton";
import { ComedyVideoUpload } from "@/components/comedy/ComedyVideoUpload";
import { ComedianEarnings } from "@/components/comedy/ComedianEarnings";
import { useComedianProfile } from "@/hooks/useComedy";
import { Mic2, Video, DollarSign, Calendar, TrendingUp, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ComedianDashboard() {
  const navigate = useNavigate();
  const { profile, isLoading } = useComedianProfile();
  const [earnings, setEarnings] = useState<any>(null);
  const [shows, setShows] = useState<any[]>([]);
  const [clips, setClips] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !profile) {
      toast.error("You need to create a comedian profile first");
      navigate("/comedy-club");
      return;
    }
    if (profile) loadDashboardData();
  }, [profile, isLoading, navigate]);

  const loadDashboardData = async () => {
    if (!profile) return;

    const { data: earningsData } = await supabase
      .from("comedian_earnings")
      .select("*")
      .eq("comedian_id", profile.id)
      .order("created_at", { ascending: false });

    if (earningsData && earningsData.length > 0) {
      const totalEarned = earningsData.reduce((sum, e) => sum + (e.net_amount || 0), 0);
      const pendingPayout = earningsData[0]?.pending_payout || 0;
      setEarnings({ totalEarned, pendingPayout, history: earningsData });
    }

    const { data: showsData } = await supabase.from("comedy_shows").select("*").eq("comedian_id", profile.id).order("scheduled_at", { ascending: false }).limit(10);
    setShows(showsData || []);

    const { data: clipsData } = await supabase.from("comedy_clips").select("*").eq("comedian_id", profile.id).order("created_at", { ascending: false }).limit(10);
    setClips(clipsData || []);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!profile) return null;

  const statCards = [
    { icon: DollarSign, label: "Total Earned", value: `€${earnings?.totalEarned?.toFixed(2) || '0.00'}`, color: "text-primary", bg: "bg-primary/10" },
    { icon: TrendingUp, label: "Pending Payout", value: `€${earnings?.pendingPayout?.toFixed(2) || '0.00'}`, color: "text-green-500", bg: "bg-green-500/10" },
    { icon: Calendar, label: "Total Shows", value: String(shows.length), color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Video, label: "Total Clips", value: String(clips.length), color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 mt-14 sm:mt-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/comedy-club")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Comedian Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Welcome back, {profile.stage_name}!</p>
            </div>
          </div>
          <ComedianGoLiveButton comedianId={profile.id} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-2 sm:p-3 ${stat.bg} rounded-full`}>
                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="earnings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="earnings" className="text-xs sm:text-sm py-2 flex-col sm:flex-row gap-1">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Earnings</span><span className="sm:hidden">Earn</span>
            </TabsTrigger>
            <TabsTrigger value="shows" className="text-xs sm:text-sm py-2 flex-col sm:flex-row gap-1">
              <Mic2 className="h-3 w-3 sm:h-4 sm:w-4" /> Shows
            </TabsTrigger>
            <TabsTrigger value="clips" className="text-xs sm:text-sm py-2 flex-col sm:flex-row gap-1">
              <Video className="h-3 w-3 sm:h-4 sm:w-4" /> Clips
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm py-2 flex-col sm:flex-row gap-1">
              <Video className="h-3 w-3 sm:h-4 sm:w-4" /> Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <ComedianEarnings earnings={earnings} comedianId={profile.id} onRefresh={loadDashboardData} />
          </TabsContent>

          <TabsContent value="shows">
            <Card className="p-4 sm:p-6">
              <h3 className="text-xl font-black mb-4">My Shows</h3>
              <div className="space-y-3">
                {shows.map((show) => (
                  <Card key={show.id} className="p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{show.title}</h4>
                        <p className="text-sm text-muted-foreground">{new Date(show.scheduled_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{show.ticket_price_coins} coins</p>
                        <Badge variant="secondary">{show.status}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="clips">
            <Card className="p-4 sm:p-6">
              <h3 className="text-xl font-black mb-4">My Clips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clips.map((clip) => (
                  <Card key={clip.id} className="p-4">
                    <h4 className="font-bold mb-2">{clip.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{clip.price_coins} coins</p>
                    <p className="text-xs text-muted-foreground">Sales: {clip.sales_count || 0}</p>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <ComedyVideoUpload comedianId={profile.id} onUploadSuccess={loadDashboardData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
