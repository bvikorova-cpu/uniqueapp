import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Trophy, ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CountryRow {
  rank: number;
  country_code: string;
  player_count: number;
  avg_best_iq: number;
  top_iq: number;
}

interface PlayerRow {
  rank: number;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  share_slug: string | null;
  best_iq: number;
  tier: string | null;
  total_tests: number;
}

function flag(code: string) {
  if (!code || code.length !== 2 || code === "XX") return "🌍";
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + code.toUpperCase().charCodeAt(0) - 65,
    A + code.toUpperCase().charCodeAt(1) - 65,
  );
}

export default function IQCountryLeaderboard() {
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [selected, setSelected] = useState<CountryRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.rpc("get_iq_country_leaderboard");
      setCountries((data ?? []) as CountryRow[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      const { data } = await supabase.rpc("get_iq_country_top_players", {
        _country_code: selected.country_code,
        _limit: 25,
      });
      setPlayers((data ?? []) as PlayerRow[]);
    })();
  }, [selected]);

  return (
    <>
      <FloatingHowItWorks title="How IQCountry Leaderboard works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {selected ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>{flag(selected.country_code)} {selected.country_code} — Top players</span>
            </>
          ) : (
            <>
              <Globe className="h-5 w-5 text-primary" /> Country Leaderboard
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : selected ? (
          players.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No public players yet from this country.
            </p>
          ) : (
            <div className="space-y-2">
              {players.map((p) => (
                <div key={p.user_id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="w-7 justify-center">{p.rank}</Badge>
                    <span className="text-sm font-medium truncate">{p.display_name ?? "Anonymous"}</span>
                    {p.tier && <Badge variant="secondary" className="text-[9px]">{p.tier}</Badge>}
                  </div>
                  <span className="text-sm font-bold text-primary">{p.best_iq}</span>
                </div>
              ))}
            </div>
          )
        ) : countries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No country data yet.</p>
        ) : (
          <div className="space-y-2">
            {countries.map((c) => (
              <button
                key={c.country_code}
                onClick={() => setSelected(c)}
                className="w-full flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="w-7 justify-center">{c.rank}</Badge>
                  <span className="text-lg leading-none">{flag(c.country_code)}</span>
                  <span className="text-sm font-semibold">{c.country_code}</span>
                  <span className="text-xs text-muted-foreground">· {c.player_count} players</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">avg <b className="text-foreground">{c.avg_best_iq}</b></span>
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                    <Trophy className="h-3 w-3 mr-1" /> {c.top_iq}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
}
