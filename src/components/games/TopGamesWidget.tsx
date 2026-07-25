import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Play, Loader2 } from "lucide-react";
import { gdCategories, gdGames, type GDCategory, type GDGame } from "@/data/gdGames";

type Period = "week" | "month";

interface TopRow {
  game_id: string;
  game_title: string | null;
  game_category: string | null;
  plays: number;
  players: number;
}

interface Props {
  onPlay: (game: GDGame) => void;
}

export function TopGamesWidget({ onPlay }: Props) {
  const [period, setPeriod] = useState<Period>("week");
  const [category, setCategory] = useState<GDCategory | "all">("all");
  const [rows, setRows] = useState<TopRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase.rpc("top_games", {
        _period: period,
        _category: category === "all" ? null : gdCategories[category],
        _limit: 10,
      });
      if (cancelled) return;
      if (error) {
        setRows([]);
      } else {
        setRows((data ?? []) as TopRow[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [period, category]);

  const gameById = useMemo(() => {
    const m = new Map<string, GDGame>();
    for (const g of gdGames) m.set(g.id, g);
    return m;
  }, []);

  return (
    <Card className="p-4 sm:p-5 mb-8 border-primary/20 bg-gradient-to-br from-card/80 to-primary/5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Top Games</h2>
          <Badge variant="secondary" className="text-[10px]">Live</Badge>
        </div>
        <div className="inline-flex rounded-md border bg-background/60 p-0.5">
          <button
            onClick={() => setPeriod("week")}
            className={`px-3 py-1 text-xs rounded ${period === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-3 py-1 text-xs rounded ${period === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setCategory("all")}
          className={`text-xs px-2.5 py-1 rounded-full border transition ${category === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          All
        </button>
        {(Object.keys(gdCategories) as GDCategory[]).map((k) => (
          <button
            key={k}
            onClick={() => setCategory(k)}
            className={`text-xs px-2.5 py-1 rounded-full border transition ${category === k ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {gdCategories[k]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading rankings…
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No plays yet {category !== "all" ? `in ${gdCategories[category as GDCategory]}` : ""} for this period. Be the first!
        </div>
      ) : (
        <ol className="space-y-1.5">
          {rows.map((r, i) => {
            const game = gameById.get(r.game_id);
            const title = r.game_title || game?.title || r.game_id;
            const cat = r.game_category || (game && gdCategories[game.category]) || "—";
            return (
              <li
                key={r.game_id}
                className="flex items-center gap-3 rounded-lg bg-background/60 border border-border/60 px-2.5 py-2"
              >
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-yellow-500/20 text-yellow-600" : i === 1 ? "bg-slate-400/20 text-slate-600" : i === 2 ? "bg-amber-700/20 text-amber-700" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                {game?.thumbnail ? (
                  <img
                    src={game.thumbnail}
                    alt=""
                    loading="lazy"
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{title}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span>{cat}</span>
                    <span>•</span>
                    <span>{r.plays} plays</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {r.players}
                    </span>
                  </div>
                </div>
                {game && (
                  <Button size="sm" variant="ghost" className="shrink-0 gap-1" onClick={() => onPlay(game)}>
                    <Play className="h-3.5 w-3.5" /> Play
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
