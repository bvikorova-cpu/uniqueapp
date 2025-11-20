import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComedianGoLiveButton } from "@/components/comedy/ComedianGoLiveButton";
import { ComedyVideoUpload } from "@/components/comedy/ComedyVideoUpload";
import { ComedianEarnings } from "@/components/comedy/ComedianEarnings";
import { useComedianProfile } from "@/hooks/useComedy";
import { Mic2, Video, DollarSign, Calendar, TrendingUp } from "lucide-react";
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

    if (profile) {
      loadDashboardData();
    }
  }, [profile, isLoading, navigate]);

  const loadDashboardData = async () => {
    if (!profile) return;

    const { data: earningsData } = await supabase
      .from("comedian_earnings")
      .select("*")
      .eq("comedian_id", profile.id)
      .order("created_at", { ascending: false });

    if (earningsData && earningsData.length > 0) {
      const totalEarned = earningsData.reduce((sum, e) => sum + parseFloat(e.total_earned || 0), 0);
      const pendingPayout = parseFloat(earningsData[0]?.pending_payout || 0);
      setEarnings({ totalEarned, pendingPayout, history: earningsData });
    }

    const { data: showsData } = await supabase
      .from("comedy_shows")
      .select("*")
      .eq("comedian_id", profile.id)
      .order("scheduled_at", { ascending: false })
      .limit(10);

    setShows(showsData || []);

    const { data: clipsData } = await supabase
      .from("comedy_clips")
      .select("*")
      .eq("comedian_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10);

    setClips(clipsData || []);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mt-16">
          <div>
            <h1 className="text-4xl font-bold">🎤 Comedian Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {profile.stage_name}!
            </p>
          </div>
          <ComedianGoLiveButton comedianId={profile.id} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">
                  €{earnings?.totalEarned?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payout</p>
                <p className="text-2xl font-bold text-green-500">
                  €{earnings?.pendingPayout?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Shows</p>
                <p className="text-2xl font-bold">{shows.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Video className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clips</p>
                <p className="text-2xl font-bold">{clips.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="earnings" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="earnings">
              <DollarSign className="mr-2 h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="shows">
              <Mic2 className="mr-2 h-4 w-4" />
              My Shows
            </TabsTrigger>
            <TabsTrigger value="clips">
              <Video className="mr-2 h-4 w-4" />
              My Clips
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Video className="mr-2 h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <ComedianEarnings 
              earnings={earnings} 
              comedianId={profile.id}
              onRefresh={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="shows">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">My Shows</h3>
              <div className="space-y-3">
                {shows.map((show) => (
                  <Card key={show.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{show.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(show.scheduled_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{show.ticket_price_coins} coins</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {show.status}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="clips">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">My Clips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clips.map((clip) => (
                  <Card key={clip.id} className="p-4">
                    <h4 className="font-bold mb-2">{clip.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {clip.price_coins} coins
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sales: {clip.sales_count || 0}
                    </p>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <ComedyVideoUpload 
              comedianId={profile.id}
              onUploadSuccess={loadDashboardData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
