import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, Heart, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LeaderboardEntry {
  id: string;
  title: string;
  votes_count: number;
  user_id: string;
  category: string;
  media_url: string;
  profile?: { full_name: string; avatar_url: string | null };
  tier?: string;
}

export const LiveLeaderboardView = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState("all");
  const [timeRange, setTimeRange] = useState("month");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase.from("talent_submissions").select("id, title, votes_count, user_id, category, media_url").eq("is_active", true).order("votes_count", { ascending: false }).limit(20);

      if (category !== "all") query = query.eq("category", category as any);
      if (timeRange === "week") {
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (timeRange === "day") {
        const dayAgo = new Date(); dayAgo.setDate(dayAgo.getDate() - 1);
        query = query.gte("created_at", dayAgo.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(d => d.user_id))];
        const { data: profiles } = await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", userIds);
        const { data: subs } = await supabase.from("megatalent_subscriptions").select("user_id, tier").in("user_id", userIds).eq("status", "active");
        const tierMap: Record<string, string> = {};
        subs?.forEach(s => { tierMap[s.user_id] = s.tier; });

        setEntries(data.map(d => ({
          ...d,
          profile: profiles?.find(p => p.id === d.user_id) as any,
          tier: tierMap[d.user_id],
        })));
      } else { setEntries([]); }
    } catch (e) { console.error(e); toast({ title: "Error loading leaderboard", variant: "destructive" }); } finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaderboard(); }, [category, timeRange]);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank + 1}</span>;
  };

  return (
    <>
      <FloatingHowItWorks title={"Live Leaderboard View - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Leaderboard View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Leaderboard View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">Live Leaderboard</h2>
          <p className="text-muted-foreground mt-2">Real-time rankings across all talent categories</p>
        </div>
      </motion.div>

      <div className="flex items-center gap-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {["drawing", "singing", "dance", "photography", "cooking", "comedy", "training", "music_production", "digital_art", "magic"].map(c => (
              <SelectItem key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchLeaderboard} className="shrink-0"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading rankings...</div>
      ) : entries.length === 0 ? (
        <Card className="bg-card/80"><CardContent className="p-8 text-center text-muted-foreground">No submissions found for this filter.</CardContent></Card>
      ) : (
        <AnimatePresence>
          {entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`bg-card/80 backdrop-blur-xl border-border/30 ${i === 0 ? "border-yellow-500/40 shadow-lg shadow-yellow-500/10" : i < 3 ? "border-yellow-500/20" : ""}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center">{getRankIcon(i)}</div>
                  <Avatar className="h-10 w-10 border-2 border-border/30">
                    <AvatarImage src={entry.profile?.avatar_url || ""} />
                    <AvatarFallback>{entry.profile?.full_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate">{entry.title}</p>
                      {entry.tier === "top_premium" && <Badge className="bg-yellow-500 text-black text-[9px] h-4">TOP</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.profile?.full_name || "Anonymous"}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-red-500" />
                      <span className="font-black text-sm">{(entry.votes_count || 0).toLocaleString()}</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px]">{entry.category.replace("_", " ")}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
    </>
  );
};