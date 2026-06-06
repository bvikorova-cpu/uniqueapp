import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Heart, MessageCircle, Eye, TrendingUp, Star, Image as ImageIcon, Zap } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface Stats {
  likesSent: number;
  likesReceived: number;
  superLikesSent: number;
  superLikesReceived: number;
  matches: number;
  messagesSent: number;
  messagesReceived: number;
  passes: number;
  conversionLikeToMatch: number;
  conversionMatchToChat: number;
  topPhotos: { url: string; likes: number }[];
  daily: { date: string; likes: number; matches: number; messages: number }[];
}

export const DatingAnalyticsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const since = subDays(new Date(), 30).toISOString();
    const [swipesSent, swipesRecv, superSent, superRecv, matches, msgs, photoLikes] = await Promise.all([
      supabase.from("dating_swipes").select("action,swiped_id,created_at").eq("swiper_id", user.id).gte("created_at", since),
      supabase.from("dating_swipes").select("action,created_at").eq("swiped_id", user.id).eq("action", "like").gte("created_at", since),
      supabase.from("dating_super_likes").select("created_at").eq("swiper_id", user.id).gte("created_at", since),
      supabase.from("dating_super_likes").select("created_at").eq("swiped_id", user.id).gte("created_at", since),
      supabase.from("dating_matches").select("id,created_at,first_message_at").or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`).gte("created_at", since),
      supabase.from("dating_messages").select("sender_id,created_at,match_id").gte("created_at", since),
      supabase.from("dating_photo_likes").select("photo_url").eq("to_user_id", user.id),
    ]);

    const sent = swipesSent.data || [];
    const likesSent = sent.filter(s => s.action === "like").length;
    const passes = sent.filter(s => s.action === "pass").length;
    const likesReceived = (swipesRecv.data || []).length;
    const matchList = matches.data || [];
    const allMsgs = msgs.data || [];
    const myMatchIds = new Set(matchList.map(m => m.id));
    const messagesSent = allMsgs.filter(m => m.sender_id === user.id && myMatchIds.has(m.match_id)).length;
    const messagesReceived = allMsgs.filter(m => m.sender_id !== user.id && myMatchIds.has(m.match_id)).length;
    const matchesWithChat = matchList.filter(m => m.first_message_at).length;

    // Top photos
    const photoCounts: Record<string, number> = {};
    (photoLikes.data || []).forEach((p: any) => { photoCounts[p.photo_url] = (photoCounts[p.photo_url] || 0) + 1; });
    const topPhotos = Object.entries(photoCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([url, likes]) => ({ url, likes }));

    // Daily aggregation last 14 days
    const days: Record<string, { likes: number; matches: number; messages: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const key = format(subDays(new Date(), i), "MM-dd");
      days[key] = { likes: 0, matches: 0, messages: 0 };
    }
    sent.filter(s => s.action === "like").forEach(s => {
      const k = format(new Date(s.created_at), "MM-dd");
      if (days[k]) days[k].likes++;
    });
    matchList.forEach(m => {
      const k = format(new Date(m.created_at), "MM-dd");
      if (days[k]) days[k].matches++;
    });
    allMsgs.filter(m => m.sender_id === user.id).forEach(m => {
      const k = format(new Date(m.created_at), "MM-dd");
      if (days[k]) days[k].messages++;
    });

    setStats({
      likesSent, likesReceived, passes,
      superLikesSent: (superSent.data || []).length,
      superLikesReceived: (superRecv.data || []).length,
      matches: matchList.length,
      messagesSent, messagesReceived,
      conversionLikeToMatch: likesSent > 0 ? Math.round((matchList.length / likesSent) * 100) : 0,
      conversionMatchToChat: matchList.length > 0 ? Math.round((matchesWithChat / matchList.length) * 100) : 0,
      topPhotos,
      daily: Object.entries(days).map(([date, v]) => ({ date, ...v })),
    });
    setLoading(false);
  };

  if (loading) return <Card><CardContent className="p-6 text-center text-muted-foreground">Loading analytics…</CardContent></Card>;
  if (!stats) return <Card><CardContent className="p-6 text-center">Sign in to view analytics.</CardContent></Card>;

  const kpis = [
    { icon: Heart, label: "Likes Sent", value: stats.likesSent, color: "text-pink-500" },
    { icon: Eye, label: "Likes Received", value: stats.likesReceived, color: "text-purple-500" },
    { icon: Star, label: "Super Likes In", value: stats.superLikesReceived, color: "text-yellow-500" },
    { icon: Zap, label: "Matches", value: stats.matches, color: "text-primary" },
    { icon: MessageCircle, label: "Messages Sent", value: stats.messagesSent, color: "text-blue-500" },
    { icon: TrendingUp, label: "Messages In", value: stats.messagesReceived, color: "text-green-500" },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Your Stats (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {kpis.map(k => (
              <div key={k.label} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><k.icon className={`h-4 w-4 ${k.color}`} />{k.label}</div>
                <div className="text-2xl font-bold mt-1">{k.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Likes → Matches</span><Badge variant="secondary">{stats.conversionLikeToMatch}%</Badge></div>
            <Progress value={stats.conversionLikeToMatch} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Matches → Conversation</span><Badge variant="secondary">{stats.conversionMatchToChat}%</Badge></div>
            <Progress value={stats.conversionMatchToChat} />
          </div>
          <div className="text-xs text-muted-foreground pt-2">
            {stats.passes} passes · {stats.superLikesSent} super likes sent
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Activity (14 days)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="likes" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="matches" stroke="hsl(var(--accent))" strokeWidth={2} />
                <Line type="monotone" dataKey="messages" stroke="hsl(330 100% 60%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {stats.topPhotos.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Top Performing Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {stats.topPhotos.map((p, i) => (
                <div key={p.url} className="relative rounded-lg overflow-hidden border">
                  <img src={p.url} alt={`Top photo ${i + 1}`} className="w-full aspect-square object-cover" />
                  <div className="absolute top-1 left-1 bg-background/90 rounded-full px-2 py-0.5 text-xs font-semibold">#{i + 1}</div>
                  <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardContent className="p-4 text-xs text-muted-foreground">
          💡 Tip: Profiles with voice intros get 3× more matches. Try adding one in your Profile tab.
        </CardContent>
      </Card>
    </div>
  );
};
