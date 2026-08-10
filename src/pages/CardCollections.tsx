import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, LayoutGrid, Loader2, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { CardCollectionLeaderboard } from "@/components/collections/CardCollectionLeaderboard";
import { CARDS_PER_CATEGORY, DRAW_COST, type CardCategory } from "@/components/collections/CardCategoryCollection";
import { getCategoryCover } from "@/components/collections/categoryCovers";


/** Hub listing all collectible-card categories with the user's real progress. */
const CardCollections = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["card-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_categories")
        .select("slug, name, description, emoji, gradient, sort_order")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as (CardCategory & { sort_order: number })[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: progress = {} } = useQuery({
    queryKey: ["card-collection-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {} as Record<string, { unique: number; total: number }>;
      const { data, error } = await supabase
        .from("user_card_collection")
        .select("category_slug, copies")
        .eq("user_id", user.id);
      if (error) throw error;
      const map: Record<string, { unique: number; total: number }> = {};
      for (const r of (data ?? []) as { category_slug: string; copies: number }[]) {
        const entry = map[r.category_slug] ?? { unique: 0, total: 0 };
        entry.unique += 1;
        entry.total += r.copies ?? 1;
        map[r.category_slug] = entry;
      }
      return map;
    },
    staleTime: 30 * 1000,
  });

  const totalUnique = Object.values(progress).reduce((a, b) => a + b.unique, 0);

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-6xl pt-20 pb-28 md:pb-8 space-y-6">
        <FloatingHowItWorks
          title="Collectible Cards — How it works"
          steps={[
            { title: "Pick a collection", desc: "Ten themed collections, each with 150 fixed cards — mythic beasts, celestial spirits, cyber guardians and more." },
            { title: "Draw a card", desc: `Every draw costs ${DRAW_COST} AI credit and reveals one card from that collection — cards you already own can appear again.` },
            { title: "Decide ✓ or ✗", desc: "Tap ✓ to add the card to your album (duplicates stack up), or ✗ to release it back into the pool." },
            { title: "Chase rarities", desc: "Cards come as Common, Rare, Epic, Legendary and one single Mythic card per collection — the Mythic is the hardest to ever see." },
            { title: "Complete a set", desc: `Own at least one copy of all ${CARDS_PER_CATEGORY} cards in a collection to unlock its exclusive golden Prime card for free.` },
            { title: "Climb the ranking", desc: "Every collection has its own live leaderboard, plus a global cross-collection ranking of the biggest collectors." },
          ]}
        />

        <Card className="p-4 sm:p-6 border-border/30 bg-card/90 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black">Collectible Cards</h1>
              <p className="text-xs text-muted-foreground">
                10 collections · 150 cards each · 1,500 cards to hunt down
              </p>
            </div>
            <Badge variant="outline" className="ml-auto gap-1 border-border/40">
              <Coins className="h-3 w-3" /> {DRAW_COST} cr / draw
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            You own {totalUnique} unique card{totalUnique === 1 ? "" : "s"} across all collections.
          </p>
        </Card>

        <Tabs defaultValue="collections">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="collections" className="gap-2"><LayoutGrid className="h-4 w-4" /> Collections</TabsTrigger>
            <TabsTrigger value="global" className="gap-2"><Trophy className="h-4 w-4" /> Global ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="collections" className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c) => {
                  const p = progress[c.slug] ?? { unique: 0, total: 0 };
                  const pct = Math.min(Math.round((p.unique / CARDS_PER_CATEGORY) * 100), 100);
                  return (
                    <Card key={c.slug} className="overflow-hidden border-border/30 bg-card/90">
                      <div className={`relative h-32 bg-gradient-to-br ${c.gradient} overflow-hidden`}>
                        {getCategoryCover(c.slug) ? (
                          <img
                            src={getCategoryCover(c.slug)}
                            alt={`${c.name} collection artwork`}
                            loading="lazy"
                            width={1024}
                            height={576}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-5xl">{c.emoji}</div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h2 className="font-black leading-tight">{c.name}</h2>
                          <p className="text-xs text-muted-foreground">{c.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-[11px] font-bold whitespace-nowrap">{p.unique}/{CARDS_PER_CATEGORY}</span>
                        </div>
                        <Button asChild className="w-full">
                          <Link to={`/card-collections/${c.slug}`}>
                            {p.unique > 0 ? "Continue collecting" : "Start collecting"}
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="global" className="pt-4">
            <CardCollectionLeaderboard category={null} totalCards={CARDS_PER_CATEGORY * 10} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CardCollections;
