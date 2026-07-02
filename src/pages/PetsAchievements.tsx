import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trophy, Sparkles, Gamepad2, History as HistoryIcon, ArrowLeft, PawPrint, Filter, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface UA {
  id: string;
  unlocked_at: string;
  achievements: { name: string; description: string | null; points: number | null; icon: string | null; category: string | null } | null;
}

interface TranslationRow {
  id: string; kind: string | null; emotion: string | null; text_result: string | null; created_at: string;
}

interface GameRow {
  id: string; game_type: string | null; score: number | null; created_at: string; pets?: { name: string | null } | null;
}

interface BattleRow {
  id: string; created_at: string; winner_id: string | null; challenger_id: string | null; opponent_id: string | null;
}

export default function PetsAchievements() {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<UA[]>([]);
  const [translations, setTranslations] = useState<TranslationRow[]>([]);
  const [games, setGames] = useState<GameRow[]>([]);
  const [battles, setBattles] = useState<BattleRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [ua, tr, gs, bt] = await Promise.all([
        supabase.from("user_achievements").select("id, unlocked_at, achievements(name, description, points, icon, category)").eq("user_id", user.id).order("unlocked_at", { ascending: false }),
        supabase.from("pet_translations").select("id, kind, emotion, text_result, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("pet_game_scores").select("id, game_type, score, created_at, pets(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("pet_battles").select("id, created_at, winner_id, challenger_id, opponent_id").or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`).order("created_at", { ascending: false }).limit(30),
      ]);

      setAchievements((ua.data as any) || []);
      setTranslations((tr.data as any) || []);
      setGames((gs.data as any) || []);
      setBattles((bt.data as any) || []);
      setLoading(false);
    })();
  }, []);

  const totalPoints = achievements.reduce((s, a) => s + (a.achievements?.points || 0), 0);
  const isPet = (cat: string | null | undefined) =>
    !!cat && /pet|virtual|translator/i.test(cat);
  const petAch = achievements.filter(a => isPet(a.achievements?.category));
  const otherAch = achievements.filter(a => !isPet(a.achievements?.category));

  return (
    <>
      <FloatingHowItWorks title="How Pets Achievements works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <SEO
        title="My Pet Achievements & Activity | Unique"
        description="Your unlocked achievements and recent activity across the AI Pet Translator and Virtual Pet."
      />
      <div className="max-w-5xl mx-auto">
        <Link to="/pets">
          <Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Pets Hub</Button>
        </Link>

        <header className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-full bg-amber-500/15 items-center justify-center mb-3">
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">My Pet Achievements</h1>
          <p className="text-muted-foreground">
            Unlocked: <strong>{petAch.length || achievements.length}</strong> · Points: <strong>{totalPoints}</strong>
          </p>
        </header>

        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="achievements"><Trophy className="w-4 h-4 mr-2" />Achievements</TabsTrigger>
            <TabsTrigger value="translator"><Sparkles className="w-4 h-4 mr-2" />Translator</TabsTrigger>
            <TabsTrigger value="virtual"><Gamepad2 className="w-4 h-4 mr-2" />Virtual Pet</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : achievements.length === 0 ? (
              <Card className="p-8 text-center">
                <PawPrint className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No achievements unlocked yet. Try the AI Translator or raise a Virtual Pet to start earning!</p>
              </Card>
            ) : (
              <FilterableAchievements items={achievements} />
            )}
          </TabsContent>

          <TabsContent value="translator" className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2"><HistoryIcon className="w-5 h-5 text-primary" /> Recent Translations</h2>
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
              translations.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No translations yet.</p>
                  <Link to="/pet-translator"><Button size="sm">Open Translator</Button></Link>
                </Card>
              ) : translations.map(t => (
                <Card key={t.id} className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex gap-2 items-center">
                      {t.kind && <Badge variant="outline">{t.kind}</Badge>}
                      {t.emotion && <Badge>{t.emotion}</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</span>
                  </div>
                  {t.text_result && <p className="text-sm text-foreground/90 line-clamp-3">{t.text_result}</p>}
                </Card>
              ))
            }
          </TabsContent>

          <TabsContent value="virtual" className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-accent" /> Recent Activity</h2>
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
              games.length === 0 && battles.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No virtual pet activity yet.</p>
                  <Link to="/virtual-pet"><Button size="sm" variant="secondary">Open Virtual Pet</Button></Link>
                </Card>
              ) : (
                <>
                  {games.map(g => (
                    <Card key={g.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">🎮 {g.game_type || "Mini-game"} {g.pets?.name ? `· ${g.pets.name}` : ""}</p>
                        <p className="text-xs text-muted-foreground">Score: {g.score ?? 0}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(g.created_at), { addSuffix: true })}</span>
                    </Card>
                  ))}
                  {battles.map(b => (
                    <Card key={b.id} className="p-4 flex items-center justify-between">
                      <p className="text-sm font-semibold">⚔️ Pet Battle</p>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}</span>
                    </Card>
                  ))}
                </>
              )
            }
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
    );
}

function FilterableAchievements({ items }: { items: UA[] }) {
  const [category, setCategory] = useState<string>("all");
  const [bucket, setBucket] = useState<string>("any");
  const [sort, setSort] = useState<string>("recent");
  const [query, setQuery] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => { if (i.achievements?.category) set.add(i.achievements.category); });
    return Array.from(set).sort();
  }, [items]);

  const buckets: Record<string, [number, number]> = {
    any: [0, Infinity],
    low: [0, 49],
    mid: [50, 149],
    high: [150, 499],
    legend: [500, Infinity],
  };

  const filtered = useMemo(() => {
    const [min, max] = buckets[bucket];
    const q = query.trim().toLowerCase();
    let out = items.filter(i => {
      const cat = i.achievements?.category || "uncategorized";
      const pts = i.achievements?.points || 0;
      const name = (i.achievements?.name || "").toLowerCase();
      const icon = (i.achievements?.icon || "").toLowerCase();
      const catOk = category === "all" || cat === category;
      const ptsOk = pts >= min && pts <= max;
      const qOk = !q || name.includes(q) || icon.includes(q);
      return catOk && ptsOk && qOk;
    });
    if (sort === "recent") out = [...out].sort((a, b) => +new Date(b.unlocked_at) - +new Date(a.unlocked_at));
    if (sort === "points-desc") out = [...out].sort((a, b) => (b.achievements?.points || 0) - (a.achievements?.points || 0));
    if (sort === "points-asc") out = [...out].sort((a, b) => (a.achievements?.points || 0) - (b.achievements?.points || 0));
    if (sort === "name") out = [...out].sort((a, b) => (a.achievements?.name || "").localeCompare(b.achievements?.name || ""));
    return out;
  }, [items, category, bucket, sort, query]);

  const totalPts = filtered.reduce((s, a) => s + (a.achievements?.points || 0), 0);

  return (
    <div className="space-y-4">
      <Card className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Filters</span>
          <Badge variant="outline" className="ml-auto text-[10px]">{filtered.length} · {totalPts} pts</Badge>
        </div>
        <div className="relative mb-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or icon (e.g. 'Whisperer' or '🔥')"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={bucket} onValueChange={setBucket}>
            <SelectTrigger><SelectValue placeholder="Points" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any points</SelectItem>
              <SelectItem value="low">0 – 49 pts</SelectItem>
              <SelectItem value="mid">50 – 149 pts</SelectItem>
              <SelectItem value="high">150 – 499 pts</SelectItem>
              <SelectItem value="legend">500+ pts</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="points-desc">Points: high → low</SelectItem>
              <SelectItem value="points-asc">Points: low → high</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(category !== "all" || bucket !== "any" || sort !== "recent" || query) && (
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setCategory("all"); setBucket("any"); setSort("recent"); setQuery(""); }}>
            Reset filters
          </Button>
        )}
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No achievements match these filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(a => (
            <Card key={a.id} className="text-center p-4 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
              <div className="text-3xl mb-2">{a.achievements?.icon || "🏅"}</div>
              <p className="text-xs font-bold leading-tight">{a.achievements?.name}</p>
              {a.achievements?.category && (
                <Badge variant="secondary" className="mt-1 text-[9px]">{a.achievements.category}</Badge>
              )}
              {a.achievements?.description && (
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{a.achievements.description}</p>
              )}
              <Badge variant="outline" className="mt-2 text-[10px]">+{a.achievements?.points || 0} pts</Badge>
              <p className="text-[9px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(a.unlocked_at), { addSuffix: true })}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
