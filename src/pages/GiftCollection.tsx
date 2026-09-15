import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GiftVisual } from "@/components/gifts/GiftVisual";
import { GIFT_RARITY_RING } from "@/components/gifts/giftAssets";
import { ArrowLeft, Coins, Crown, Gift, Medal, Trophy, Sparkles } from "lucide-react";

interface CollectionRow {
  gift_id: string;
  slug: string;
  name: string;
  category: string;
  rarity: string;
  animation: string;
  image_url: string | null;
  emoji: string | null;
  price_credits: number;
  copies: number;
  credits_value: number;
  last_received: string;
}

interface Stats {
  unique_gifts: number;
  total_gifts: number;
  total_credits: number;
  rank: number | null;
  catalog_total: number;
  collectors: number;
}

interface LeaderRow {
  rank_position: number;
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  unique_gifts: number;
  total_gifts: number;
  total_credits: number;
  top_gift_slug: string | null;
}

const medalFor = (position: number) => {
  if (position === 1) return <Crown className="h-4 w-4 text-amber-500" />;
  if (position === 2) return <Medal className="h-4 w-4 text-slate-400" />;
  if (position === 3) return <Medal className="h-4 w-4 text-amber-700" />;
  return null;
};

export default function GiftCollection() {
  const { user } = useAuth();
  const [collection, setCollection] = useState<CollectionRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [colRes, statRes, lbRes] = await Promise.all([
      user?.id
        ? (supabase as any).rpc("get_gift_collection", { p_user_id: user.id })
        : Promise.resolve({ data: [] }),
      user?.id
        ? (supabase as any).rpc("get_gift_collection_stats", { p_user_id: user.id })
        : Promise.resolve({ data: null }),
      (supabase as any).rpc("get_gift_collectors_leaderboard", { p_limit: 50 }),
    ]);
    setCollection((colRes.data as CollectionRow[]) ?? []);
    setStats((statRes.data as Stats) ?? null);
    setLeaders((lbRes.data as LeaderRow[]) ?? []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const completion =
    stats && stats.catalog_total > 0
      ? Math.min(100, Math.round((stats.unique_gifts / stats.catalog_total) * 100))
      : 0;

  return (
    <div className="container mx-auto max-w-4xl px-3 py-4 pb-24">
      <div className="mb-4 flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Back">
          <Link to="/gifts/inbox">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Gift Collection</h1>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-primary" />
            Your collector profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Rank</p>
                  <p className="text-lg font-bold">
                    {stats?.rank ? `#${stats.rank}` : "—"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Unique gifts</p>
                  <p className="text-lg font-bold">{stats?.unique_gifts ?? 0}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total received</p>
                  <p className="text-lg font-bold">{stats?.total_gifts ?? 0}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Collection value</p>
                  <p className="flex items-center gap-1 text-lg font-bold">
                    <Coins className="h-4 w-4 text-amber-500" />
                    {(stats?.total_credits ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Collected {stats?.unique_gifts ?? 0} of {stats?.catalog_total ?? 0} gifts
                  </span>
                  <span>{completion}%</span>
                </div>
                <Progress value={completion} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="collection">
        <TabsList className="w-full">
          <TabsTrigger value="collection" className="flex-1 gap-1.5">
            <Gift className="h-4 w-4" />
            My collection
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex-1 gap-1.5">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="mt-3">
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : collection.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No gifts collected yet. Received gifts appear here and raise your rank.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {collection.map((g) => (
                <div
                  key={g.gift_id}
                  className={`relative flex flex-col items-center gap-1 rounded-xl border bg-card/60 p-2 ring-1 ${
                    GIFT_RARITY_RING[g.rarity] || "ring-border"
                  }`}
                >
                  {g.copies > 1 && (
                    <Badge className="absolute right-1 top-1 h-5 px-1.5 text-[10px]">
                      ×{g.copies}
                    </Badge>
                  )}
                  <GiftVisual
                    slug={g.slug}
                    name={g.name}
                    emoji={g.emoji}
                    image_url={g.image_url}
                    animation={g.animation}
                    size={56}
                  />
                  <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight">
                    {g.name}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Coins className="h-3 w-3" />
                    {Number(g.credits_value).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-3">
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Card>
              <CardContent className="divide-y p-0">
                {leaders.map((l) => (
                  <div
                    key={l.user_id}
                    className={`flex items-center gap-3 px-3 py-2.5 ${
                      l.user_id === user?.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="flex w-8 items-center gap-1 text-sm font-bold">
                      {medalFor(Number(l.rank_position)) ?? `#${l.rank_position}`}
                    </span>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={l.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {(l.full_name || l.username || "U").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {l.full_name || l.username || "Unique user"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {l.unique_gifts} unique · {l.total_gifts} gifts
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      {Number(l.total_credits).toLocaleString()}
                    </span>
                  </div>
                ))}
                {leaders.length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    The leaderboard is still empty.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          <p>Every gift you receive in chat or on a post is added to your collection.</p>
          <p>Rank is based on how many different gifts you own; total credit value breaks ties.</p>
          <p>Rare and Mega gifts are worth the most, so they lift your position the fastest.</p>
          <p>You still earn euros from received gifts — collecting is an extra motivation.</p>
        </CardContent>
      </Card>
    </div>
  );
}
