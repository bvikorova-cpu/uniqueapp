import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Award, User, Loader2, Globe, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface LeaderboardEntry {
  user_id: string;
  username: string;
  best_iq: number;
  tests_taken?: number;
  total_tests?: number;
  tier?: string;
}

const getLeague = (iq: number) => {
  if (iq >= 145) return "Legend";
  if (iq >= 135) return "Grandmaster";
  if (iq >= 125) return "Master";
  if (iq >= 115) return "Diamond";
  return "Gold";
};

const rankIcon = (r: number) => {
  if (r === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (r === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (r === 3) return <Award className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{r}</span>;
};

const rankBg = (r: number) => {
  if (r === 1) return "bg-gradient-to-r from-yellow-500/15 to-amber-500/10 border-yellow-500/30";
  if (r === 2) return "bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-400/20";
  if (r === 3) return "bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-700/20";
  return "border-border/30";
};

export default function IQGlobalLeaderboard() {
  const [scope, setScope] = useState<"global" | "country">("global");
  const [country, setCountry] = useState<string>("");
  const [countries, setCountries] = useState<{ country_code: string; player_count: number }[]>([]);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("get_iq_countries_with_players");
      const list = (data ?? []) as { country_code: string; player_count: number }[];
      setCountries(list);
      if (!country && list.length) setCountry(list[0].country_code);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (scope === "global") {
        const { data } = await supabase.rpc("get_iq_global_leaderboard");
        setEntries((data ?? []) as LeaderboardEntry[]);
      } else if (country) {
        const { data } = await supabase.rpc("get_iq_country_leaderboard", { _country: country });
        setEntries((data ?? []) as LeaderboardEntry[]);
      } else {
        setEntries([]);
      }
      setLoading(false);
    })();
  }, [scope, country]);

  return (
    <>
      <FloatingHowItWorks title="How IQGlobal Leaderboard works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🌍 Leaderboard</h2>
      <Card className="bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-500/20">
        <CardHeader className="p-4 flex flex-row items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {scope === "global" ? "Top 10 Worldwide" : `Top players · ${country || "—"}`}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={scope === "global" ? "default" : "outline"} onClick={() => setScope("global")}>
              <Globe className="h-3.5 w-3.5 mr-1" /> Global
            </Button>
            <Button size="sm" variant={scope === "country" ? "default" : "outline"} onClick={() => setScope("country")}>
              <Flag className="h-3.5 w-3.5 mr-1" /> Country
            </Button>
            {scope === "country" && (
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.country_code} value={c.country_code}>
                      {c.country_code} ({c.player_count})
                    </SelectItem>
                  ))}
                  {countries.length === 0 && <SelectItem value="__none" disabled>No countries yet</SelectItem>}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {loading ? (
            <div className="text-center py-6"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-6">No entries yet.</p>
          ) : (
            entries.map((entry, i) => {
              const rank = i + 1;
              const tests = entry.tests_taken ?? entry.total_tests ?? 0;
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border ${rankBg(rank)} transition-all`}
                >
                  <div className="flex items-center justify-center w-8">{rankIcon(rank)}</div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1.5 rounded-full bg-muted">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{entry.username}</p>
                      <p className="text-[10px] text-muted-foreground">{tests} tests</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0">{entry.tier ?? getLeague(entry.best_iq)}</Badge>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-blue-500">{entry.best_iq}</p>
                    <p className="text-[9px] text-muted-foreground">IQ</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
