import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, ArrowUp, ArrowDown, Minus, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const TIERS = [
  { id: "bronze", label: "Bronze", color: "from-amber-700 to-amber-900", text: "text-amber-300" },
  { id: "silver", label: "Silver", color: "from-slate-400 to-slate-600", text: "text-slate-200" },
  { id: "gold", label: "Gold", color: "from-yellow-400 to-yellow-600", text: "text-yellow-200" },
  { id: "platinum", label: "Platinum", color: "from-cyan-300 to-cyan-500", text: "text-cyan-100" },
  { id: "diamond", label: "Diamond", color: "from-fuchsia-400 to-purple-600", text: "text-fuchsia-100" },
];

const PROMOTE = 7;
const RELEGATE_FROM = 25;

export default function RewardsLeagues() {
  const { user } = useAuth();
  const [season, setSeason] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [group, setGroup] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase
        .from("league_seasons")
        .select("*")
        .eq("is_active", true)
        .order("starts_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSeason(s);
      if (!s || !user) { setLoading(false); return; }

      let { data: mine } = await supabase
        .from("user_league_standings")
        .select("*")
        .eq("user_id", user.id)
        .eq("season_id", s.id)
        .maybeSingle();

      if (!mine) {
        const ins = await supabase
          .from("user_league_standings")
          .insert({ user_id: user.id, season_id: s.id, tier: "bronze", group_number: 1, weekly_xp: 0 })
          .select()
          .single();
        mine = ins.data;
      }
      setMe(mine);

      if (mine) {
        const { data: g } = await supabase
          .from("user_league_standings")
          .select("user_id, weekly_xp, tier, rank, profile:profiles(full_name, avatar_url)")
          .eq("season_id", s.id)
          .eq("tier", mine.tier)
          .eq("group_number", mine.group_number)
          .order("weekly_xp", { ascending: false })
          .limit(30);
        setGroup(g || []);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const myTier = TIERS.find(t => t.id === (me?.tier || "bronze")) || TIERS[0];
  const daysLeft = season ? Math.max(0, Math.ceil((+new Date(season.ends_at) - Date.now()) / 86400000)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><HowItWorksButton variant="compact" title="Leagues" intro="Compete weekly with players of your skill for promotion, rewards and bragging rights." steps={[
        { title: "Your tier", desc: "Everyone starts in Bronze. You move up through Silver, Gold, Platinum, Diamond as you earn weekly XP." },
        { title: "Weekly reset", desc: "Every Monday the leaderboard resets and top players get promoted; bottom players relegate down." },
        { title: "Earn league XP", desc: "Every action that gives normal XP also counts toward your league score this week." },
        { title: "Top rewards", desc: "Top ranks receive credits, exclusive badges and cosmetics — check the reward preview on the tier card." },
      ]} /></div>
      <Card className="overflow-hidden border-primary/20">
        <div className={`bg-gradient-to-r ${myTier.color} p-6`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Shield className="h-10 w-10" />
              <div>
                <h2 className="text-2xl font-bold">{myTier.label} League</h2>
                <p className="text-sm opacity-90">Season {season?.season_number ?? "—"} · {daysLeft}d left</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{me?.weekly_xp ?? 0}</p>
              <p className="text-xs opacity-80">XP this week</p>
            </div>
          </div>
        </div>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-2">
            {TIERS.map((t, i) => (
              <div key={t.id} className="flex-1 text-center">
                <div className={`h-2 rounded-full bg-gradient-to-r ${t.color} ${me?.tier === t.id ? "opacity-100" : "opacity-30"}`} />
                <p className={`text-[10px] mt-1 ${me?.tier === t.id ? "font-bold text-foreground" : "text-muted-foreground"}`}>{t.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your group ({group.length} players)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : group.length === 0 ? (
            <p className="text-sm text-muted-foreground">No competitors yet — earn XP to be matched!</p>
          ) : (
            <div className="space-y-1">
              {group.map((p, idx) => {
                const isMe = p.user_id === user?.id;
                const willPromote = idx < PROMOTE;
                const willRelegate = idx >= RELEGATE_FROM;
                return (
                  <motion.div
                    key={p.user_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`flex items-center gap-3 p-2.5 rounded-lg ${
                      isMe ? "bg-primary/10 border border-primary/40" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="w-7 text-center font-bold text-sm">{idx + 1}</div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.profile?.avatar_url} />
                      <AvatarFallback>{p.profile?.full_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {p.profile?.full_name || "Player"} {isMe && <span className="text-xs text-primary">(you)</span>}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">{p.weekly_xp} XP</Badge>
                    {willPromote && <ArrowUp className="h-4 w-4 text-emerald-400" />}
                    {willRelegate && <ArrowDown className="h-4 w-4 text-red-400" />}
                    {!willPromote && !willRelegate && <Minus className="h-4 w-4 text-muted-foreground" />}
                  </motion.div>
                );
              })}
              <div className="pt-3 mt-3 border-t border-border/40 text-xs text-muted-foreground space-y-0.5">
                <p>🟢 Top {PROMOTE} promote to next tier</p>
                <p>🔴 Bottom 5 relegate to lower tier</p>
                <p>⚪ Stay in current league</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
