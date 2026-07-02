import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Gift, Users } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { ReferralCard } from "@/components/subscription/ReferralCard";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Row = {
  referrer_id: string;
  display_name: string;
  avatar_url: string | null;
  successful_referrals: number;
  total_earned: number;
  rank: number;
};

const PERIODS = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all_time", label: "All-time" },
] as const;

export default function ReferralLeaderboard() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [period, setPeriod] = useState<typeof PERIODS[number]["key"]>("month");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await (supabase as any).rpc("get_referral_leaderboard", { period });
      if (cancelled) return;
      if (!error && data) setRows(data as Row[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [period]);

  const myRank = user ? rows.find((r) => r.referrer_id === user.id) : null;

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-mono text-muted-foreground w-5 text-center">{rank}</span>;
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <FloatingHowItWorks
        title={'Referral Leaderboard'}
        intro={"See top inviters this month and the prizes they've unlocked."}
        steps={[
          { title: 'Monthly reset', desc: 'The board resets on the 1st. Everyone starts at zero.' },
        { title: 'Earn points', desc: 'Each verified referral (7-day active friend) gives you 1 point.' },
        { title: 'Climb the ranks', desc: 'Top 10 win extra credits and cash bonuses each month.' },
        { title: 'Track yourself', desc: 'Your rank and progress bar appear at the top when signed in.' }
        ]}
      />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-4">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">Referral Champions</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Top Referrers
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Earn €5 for every friend who subscribes. Climb the leaderboard and get featured.
        </p>
      </motion.div>

      {myRank && (
        <Card className="p-4 mb-6 border-primary/40 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="text-base">#{myRank.rank}</Badge>
              <div>
                <div className="font-bold">Your rank</div>
                <div className="text-xs text-muted-foreground">
                  {myRank.successful_referrals} successful referrals
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-emerald-400">{format(Number(myRank.total_earned))}</div>
              <div className="text-xs text-muted-foreground">earned</div>
            </div>
          </div>
        </Card>
      )}

      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
          {PERIODS.map((p) => (
            <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={period}>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No successful referrals yet for this period.</p>
              <p className="text-sm">Be the first to claim the throne!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((r, i) => (
                <motion.div
                  key={r.referrer_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    r.rank <= 3
                      ? "bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-primary/30"
                      : "bg-card/40 border-border/40"
                  } ${user?.id === r.referrer_id ? "ring-1 ring-primary" : ""}`}
                >
                  <div className="w-8 flex justify-center">{rankIcon(Number(r.rank))}</div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={r.avatar_url ?? undefined} />
                    <AvatarFallback>{(r.display_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{r.display_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      {r.successful_referrals} referral{r.successful_referrals === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400">{format(Number(r.total_earned))}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ReferralCard userId={user?.id} />
    </div>
  );
}
