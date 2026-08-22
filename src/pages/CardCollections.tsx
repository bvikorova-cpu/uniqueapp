import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Coins, Crown, LayoutGrid, Loader2, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { CardCollectionLeaderboard } from "@/components/collections/CardCollectionLeaderboard";
import { CARDS_PER_CATEGORY, DRAW_COST, type CardCategory } from "@/components/collections/CardCategoryCollection";
import { getCategoryCover } from "@/components/collections/categoryCovers";
import { getCategoryBlurb } from "@/components/collections/categoryBlurbs";
import { useCardArtPrewarm } from "@/hooks/useCardArtPrewarm";
import cardsHeroPoster from "@/assets/collectible-cards-hero-poster.jpg";
import cardsHeroVideo from "../../public/videos/collectible-cards-hero.mp4.asset.json";



/** Hub listing all collectible-card categories with the user's real progress. */
const CardCollections = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["card-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_categories")
        .select("slug, name, description, emoji, gradient, sort_order, card_kind, available_from, available_until")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as (CardCategory & { sort_order: number })[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: progress = {} } = useQuery({
    queryKey: ["card-collection-progress", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const map: Record<string, { unique: number; total: number }> = {};
      if (!user?.id) return map;
      const { data, error } = await supabase
        .from("user_card_collection")
        .select("category_slug, copies")
        .eq("user_id", user.id);
      if (error) throw error;
      for (const r of (data ?? []) as { category_slug: string; copies: number }[]) {
        const entry = map[r.category_slug] ?? { unique: 0, total: 0 };
        entry.unique += 1;
        entry.total += r.copies ?? 1;
        map[r.category_slug] = entry;
      }
      return map;
    },
    staleTime: 15 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });


  const totalUnique = Object.values(progress).reduce((a, b) => a + b.unique, 0);

  // Pre-generate + pre-cache artwork for every set so cards load instantly.
  useCardArtPrewarm(categories.map((c) => c.slug), categories.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[45vh] sm:h-[60vh] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={cardsHeroPoster}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={cardsHeroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-16">
          <Badge className="mb-3 bg-white/15 text-white border-white/25 backdrop-blur-md gap-1">
            <Coins className="h-3 w-3" /> {DRAW_COST} credit / draw
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg">
            Collectible Cards
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/85 max-w-xl">
            50 themed collections · {CARDS_PER_CATEGORY} cards each · 7,500 cards to hunt down
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-2 sm:px-4 pt-6 pb-28 md:pb-8 space-y-6">

        <FloatingHowItWorks
          title="Collectible Cards — How it works"
          steps={[
            { title: "Pick a collection", desc: "Fifty themed collections, each with 150 fixed cards — mythic beasts, duel stats, personality archetypes, memes, daily quests, lifehacks, world facts, seasonal series, racehorses and seven sports sets (football, basketball, ice hockey, tennis, American football, baseball, golf) plus beauty icons, fashion couture, royal princesses, storybook folk plus five motorsport race sets (grand prix cars, rally, endurance hypercars, drift and superbikes) plus sixteen Kids Collectibles sets for younger collectors — ten hand-drawn cartoon sets and six cinematic 3D animated-movie sets." },
            { title: "Draw a card", desc: `Every draw costs ${DRAW_COST} AI credit and reveals one card from that collection — cards you already own can appear again.` },
            { title: "Decide ✓ or ✗", desc: "Tap ✓ to add the card to your album (duplicates stack up), or ✗ to move it to your discarded-cards bin." },
            { title: "Recycle for credits", desc: "Recycle exactly 10 discarded cards from your bin and get 1 AI credit back — the recycled cards are destroyed permanently." },
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
                50 collections · 150 cards each · 7,500 cards to hunt down
              </p>
            </div>
            <Badge variant="outline" className="ml-auto gap-1 border-border/40">
              <Coins className="h-3 w-3" /> {DRAW_COST} cr / draw
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            You own {totalUnique} unique card{totalUnique === 1 ? "" : "s"} across all collections.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3 gap-2">
            <Link to="/card-collections/gallery">
              <Crown className="h-4 w-4" /> Collection details &amp; Prime gallery
            </Link>
          </Button>

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
                  const blurb = getCategoryBlurb(c.slug);
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
                        {c.available_until && (
                          <Badge className="absolute top-2 right-2 gap-1 bg-orange-500 text-white border-0">
                            <Clock className="h-3 w-3" /> Limited ·{" "}
                            {Math.max(
                              0,
                              Math.ceil((new Date(c.available_until).getTime() - Date.now()) / 86400000),
                            )}
                            d left
                          </Badge>
                        )}
                      </div>


                      <div className="p-4 space-y-3">
                        <div className="space-y-1">
                          <h2 className="font-black leading-tight">{blurb?.title ?? c.name}</h2>
                          <p className="text-xs text-muted-foreground">{blurb?.tagline ?? c.description}</p>
                          {blurb?.inside && (
                            <p className="text-[11px] text-muted-foreground/80">{blurb.inside}</p>
                          )}
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
