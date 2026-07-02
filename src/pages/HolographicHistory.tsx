import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Swords,
  Sparkles,
  Loader2,
  Trophy,
  Skull,
  Minus,
  Filter,
  X,
} from "lucide-react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const PAGE_SIZE = 20;

interface BattleRow {
  id: string;
  mode: string;
  opponent_name: string;
  outcome: "win" | "loss" | "draw";
  user_power: number;
  opponent_power: number;
  rewards_eur: number;
  created_at: string;
}

interface BreedingRow {
  id: string;
  parent1_id: number;
  parent2_id: number;
  offspring_name: string;
  offspring_style: string;
  offspring_traits: string[] | any;
  offspring_level: number;
  rarity: string;
  created_at: string;
}

const rarityColor: Record<string, string> = {
  common: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  rare: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  epic: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  legendary: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  mythic: "bg-pink-500/20 text-pink-300 border-pink-500/40",
};

const OutcomeIcon = ({ outcome }: { outcome: string }) => {
  if (outcome === "win") return <Trophy className="h-4 w-4 text-emerald-400" />;
  if (outcome === "loss") return <Skull className="h-4 w-4 text-rose-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

function getDateThreshold(filter: TimeFilter): string | null {
  const now = new Date();
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  switch (filter) {
    case "today":
      return d.toISOString();
    case "week":
      d.setDate(d.getDate() - 7);
      return d.toISOString();
    case "month":
      d.setDate(d.getDate() - 30);
      return d.toISOString();
    default:
      return null;
  }
}

type SortBy = "newest" | "oldest";
type TimeFilter = "all" | "today" | "week" | "month";
type BattleOutcome = "all" | "win" | "loss" | "draw";
type BreedingRarity = "all" | "common" | "rare" | "epic" | "legendary" | "mythic";

export default function HolographicHistory() {
  const [tab, setTab] = useState<"battles" | "breeding">("battles");
  const [userId, setUserId] = useState<string | null>(null);
  const [authed, setAuthed] = useState(true);

  const [battleSort, setBattleSort] = useState<SortBy>("newest");
  const [battleTime, setBattleTime] = useState<TimeFilter>("all");
  const [battleOutcome, setBattleOutcome] = useState<BattleOutcome>("all");

  const [breedingSort, setBreedingSort] = useState<SortBy>("newest");
  const [breedingTime, setBreedingTime] = useState<TimeFilter>("all");
  const [breedingRarity, setBreedingRarity] = useState<BreedingRarity>("all");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthed(false);
        return;
      }
      setUserId(user.id);
    })();
  }, []);

  const battleFetch = useCallback(
    async (page: number): Promise<BattleRow[]> => {
      if (!userId) return [];
      const ascending = battleSort === "oldest";
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let q = supabase
        .from("holographic_battle_results")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending })
        .range(from, to);
      const threshold = getDateThreshold(battleTime);
      if (threshold) q = q.gte("created_at", threshold);
      if (battleOutcome !== "all") q = q.eq("outcome", battleOutcome);
      const { data, error } = await q;
      if (error) throw error;
      return (data as any[]) || [];
    },
    [userId, battleSort, battleTime, battleOutcome]
  );

  const breedingFetch = useCallback(
    async (page: number): Promise<BreedingRow[]> => {
      if (!userId) return [];
      const ascending = breedingSort === "oldest";
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let q = supabase
        .from("holographic_breeding_results")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending })
        .range(from, to);
      const threshold = getDateThreshold(breedingTime);
      if (threshold) q = q.gte("created_at", threshold);
      if (breedingRarity !== "all") q = q.eq("rarity", breedingRarity);
      const { data, error } = await q;
      if (error) throw error;
      return (data as any[]) || [];
    },
    [userId, breedingSort, breedingTime, breedingRarity]
  );

  const battlesInfinite = useInfiniteScroll<BattleRow>(battleFetch, { enabled: !!userId && tab === "battles" });
  const breedingInfinite = useInfiniteScroll<BreedingRow>(breedingFetch, { enabled: !!userId && tab === "breeding" });

  // Reset infinite scroll when filters change
  useEffect(() => {
    if (tab === "battles") battlesInfinite.reset();
  }, [battleSort, battleTime, battleOutcome, tab]);

  useEffect(() => {
    if (tab === "breeding") breedingInfinite.reset();
  }, [breedingSort, breedingTime, breedingRarity, tab]);

  // Stats for battles (from all loaded data so far; not total DB count)
  const battleStats = useMemo(() => {
    const wins = battlesInfinite.data.filter((b) => b.outcome === "win").length;
    const totalEur = battlesInfinite.data.reduce((s, b) => s + Number(b.rewards_eur || 0), 0);
    return { count: battlesInfinite.data.length, wins, totalEur };
  }, [battlesInfinite.data]);

  const breedingStats = useMemo(() => {
    return { count: breedingInfinite.data.length };
  }, [breedingInfinite.data]);

  const hasActiveBattleFilters = battleOutcome !== "all" || battleTime !== "all" || battleSort !== "newest";
  const hasActiveBreedingFilters = breedingRarity !== "all" || breedingTime !== "all" || breedingSort !== "newest";

  const resetBattleFilters = () => {
    setBattleOutcome("all");
    setBattleTime("all");
    setBattleSort("newest");
  };

  const resetBreedingFilters = () => {
    setBreedingRarity("all");
    setBreedingTime("all");
    setBreedingSort("newest");
  };

  if (!authed) {
    return (
      <>
        <FloatingHowItWorks title="How Holographic History works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
        <div className="min-h-screen bg-background pb-16">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Sign in to view your history.</p>
            <Link to="/auth"><Button className="mt-3">Sign in</Button></Link>
          </Card>
        </div>
      </div>
      </>
      );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link to="/holographic-avatars">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Holographic Avatars
          </Button>
        </Link>

        <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
          Holographic History
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your complete battle & breeding archive.
        </p>

        {/* Stats */}
        {tab === "battles" ? (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="p-3 text-center">
              <p className="text-2xl font-black">{battleStats.count}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Battles</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-black text-emerald-400">{battleStats.wins}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Wins</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-black text-amber-400">€{battleStats.totalEur.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Earned</p>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="p-3 text-center">
              <p className="text-2xl font-black">{breedingStats.count}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Offspring</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-black text-violet-400">
                {breedingInfinite.data.filter((r) => ["epic", "legendary", "mythic"].includes(r.rarity)).length}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">Rare+</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-black text-pink-400">
                {breedingInfinite.data.filter((r) => r.rarity === "mythic").length}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">Mythic</p>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={tab === "battles" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("battles")}
            className="flex-1"
          >
            <Swords className="h-4 w-4 mr-2" /> Battles
          </Button>
          <Button
            variant={tab === "breeding" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("breeding")}
            className="flex-1"
          >
            <Sparkles className="h-4 w-4 mr-2" /> Breeding
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Filters</h3>
            </div>
            {tab === "battles" && hasActiveBattleFilters && (
              <Button variant="ghost" size="sm" onClick={resetBattleFilters} className="text-xs">
                <X className="h-3 w-3 mr-1" /> Reset
              </Button>
            )}
            {tab === "breeding" && hasActiveBreedingFilters && (
              <Button variant="ghost" size="sm" onClick={resetBreedingFilters} className="text-xs">
                <X className="h-3 w-3 mr-1" /> Reset
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Sort */}
            <div className="space-y-2">
              <Label className="text-xs">Sort by</Label>
              <Select value={tab === "battles" ? battleSort : breedingSort} onValueChange={(v) => {
                if (tab === "battles") setBattleSort(v as SortBy);
                else setBreedingSort(v as SortBy);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label className="text-xs">Time Period</Label>
              <Select value={tab === "battles" ? battleTime : breedingTime} onValueChange={(v) => {
                if (tab === "battles") setBattleTime(v as TimeFilter);
                else setBreedingTime(v as TimeFilter);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tab-specific filter */}
            {tab === "battles" ? (
              <div className="space-y-2">
                <Label className="text-xs">Outcome</Label>
                <Select value={battleOutcome} onValueChange={(v) => setBattleOutcome(v as BattleOutcome)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                    <SelectItem value="draw">Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs">Rarity</Label>
                <Select value={breedingRarity} onValueChange={(v) => setBreedingRarity(v as BreedingRarity)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                    <SelectItem value="mythic">Mythic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>

        {/* Content */}
        {tab === "battles" ? (
          <>
            {battlesInfinite.data.length === 0 && !battlesInfinite.loading ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No battles found for selected filters.
              </Card>
            ) : (
              <div className="space-y-2">
                {battlesInfinite.data.map((b) => (
                  <Card key={b.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <OutcomeIcon outcome={b.outcome} />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">vs {b.opponent_name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {b.mode} · {new Date(b.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold tabular-nums">
                          {b.user_power} <span className="text-muted-foreground">vs</span> {b.opponent_power}
                        </p>
                        {b.rewards_eur > 0 && (
                          <Badge variant="outline" className="text-[10px] mt-1 border-amber-500/40 text-amber-400">
                            +€{Number(b.rewards_eur).toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {battlesInfinite.loading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            <div ref={battlesInfinite.loadMoreRef} />
          </>
        ) : (
          <>
            {breedingInfinite.data.length === 0 && !breedingInfinite.loading ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No offspring found for selected filters.
              </Card>
            ) : (
              <div className="space-y-2">
                {breedingInfinite.data.map((r) => {
                  const traits = Array.isArray(r.offspring_traits) ? r.offspring_traits : [];
                  return (
                    <Card key={r.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{r.offspring_name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {r.offspring_style} · Lv {r.offspring_level} ·{" "}
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${rarityColor[r.rarity] || rarityColor.common}`}
                        >
                          {r.rarity}
                        </Badge>
                      </div>
                      {traits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {traits.slice(0, 6).map((t: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
            {breedingInfinite.loading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            <div ref={breedingInfinite.loadMoreRef} />
          </>
        )}
      </div>
    </div>
  );
}
