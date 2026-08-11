import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Loader2, Sparkles, Library, Coins, Crown, Lock, Trophy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CardCollectionLeaderboard } from "./CardCollectionLeaderboard";
import { CardDetailModal } from "./CardDetailModal";
import { getCategoryCover } from "./categoryCovers";
import { getCategoryBlurb } from "./categoryBlurbs";


import { warmCollectionCardImages, readCachedCategory, writeCachedCategory } from "@/lib/collectionCardCache";

export const DRAW_COST = 1;
export const CARDS_PER_CATEGORY = 150;

export interface CardStats {
  strength?: number;
  speed?: number;
  magic?: number;
  defense?: number;
  luck?: number;
}

export interface CollectibleCard {
  id: string;
  code: string;
  card_index: number;
  name: string;
  subject: string;
  rarity: string;
  lore: string;
  emoji: string;
  gradient: string;
  image_url: string | null;
  is_prime: boolean;
  stats?: CardStats | null;
}

export interface CardCategory {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  card_kind?: string | null;
  available_from?: string | null;
  available_until?: string | null;
}


const RARITY_LABEL: Record<string, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
  prime: "Prime",
};

interface Props {
  category: CardCategory;
}

/** Draw / album / ranking experience for one collectible-card category. */
export const CardCategoryCollection = ({ category }: Props) => {
  const queryClient = useQueryClient();
  const slug = category.slug;

  const [drawing, setDrawing] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [current, setCurrent] = useState<CollectibleCard | null>(null);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [artMissing, setArtMissing] = useState(0);
  const [detailCard, setDetailCard] = useState<CollectibleCard | null>(null);


  const { data: catalogue = [], isLoading: loadingCatalogue } = useQuery({
    queryKey: ["card-catalogue", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_collectibles")
        .select("id, code, card_index, name, subject, rarity, lore, emoji, gradient, image_url, is_prime, stats")
        .eq("category_slug", slug)
        .eq("is_prime", false)
        .order("card_index", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as unknown as CollectibleCard[];
      writeCachedCategory(slug, rows);
      return rows;
    },
    initialData: () => readCachedCategory<CollectibleCard[]>(slug),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: ownedCounts = {}, isLoading } = useQuery({
    queryKey: ["card-collection-mine", slug],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {} as Record<string, number>;
      const { data, error } = await supabase
        .from("user_card_collection")
        .select("collectible_id, copies")
        .eq("user_id", user.id)
        .eq("category_slug", slug);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const r of (data ?? []) as { collectible_id: string; copies: number }[]) {
        counts[r.collectible_id] = r.copies ?? 1;
      }
      return counts;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Persistent image cache warming for what's on screen plus a look-ahead batch.
  useEffect(() => {
    if (!catalogue.length) return;
    warmCollectionCardImages(catalogue.slice(0, visibleCount + 24).map((c) => c.image_url));
  }, [catalogue, visibleCount]);

  useEffect(() => {
    if (current?.image_url) warmCollectionCardImages([current.image_url]);
  }, [current]);

  // Free background artwork generation so the album fills with real illustrations.
  useEffect(() => {
    let stop = false;
    const run = async () => {
      let batches = 0;
      while (!stop) {
        const { data, error } = await supabase.functions.invoke("hero-card-draw", {
          body: { scope: "collection", action: "backfill_art", category: slug, limit: 12 },
        });
        if (stop || error || !data || data.error) return;
        setArtMissing(data.missing ?? 0);
        batches += 1;
        if (batches % 3 === 0 || !data.missing) {
          queryClient.invalidateQueries({ queryKey: ["card-catalogue", slug] });
        }
        if (!data.missing || !data.generated) return;
        await new Promise((r) => setTimeout(r, 1200));
      }
    };
    const idle = window.setTimeout(run, 900);
    return () => { stop = true; window.clearTimeout(idle); };
  }, [queryClient, slug]);

  // Realtime: my collection updates instantly across devices.
  useEffect(() => {
    const channel = supabase
      .channel(`card-collection-mine-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_card_collection" }, () => {
        queryClient.invalidateQueries({ queryKey: ["card-collection-mine", slug] });
        queryClient.invalidateQueries({ queryKey: ["card-collection-progress"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient, slug]);

  const uniqueOwned = useMemo(() => Object.keys(ownedCounts).length, [ownedCounts]);
  const totalOwned = useMemo(() => Object.values(ownedCounts).reduce((a, b) => a + b, 0), [ownedCounts]);
  const progress = Math.min(Math.round((uniqueOwned / CARDS_PER_CATEGORY) * 100), 100);

  // Award the shareable profile badge as soon as the set is complete.
  useEffect(() => {
    if (uniqueOwned < CARDS_PER_CATEGORY) return;
    let done = false;
    (async () => {
      const { error } = await (supabase as any).rpc("award_card_category_badge", { _category_slug: slug });
      if (!done && !error) {
        queryClient.invalidateQueries({ queryKey: ["card-category-badges"] });
      }
    })();
    return () => { done = true; };
  }, [uniqueOwned, slug, queryClient]);



  const { data: prime } = useQuery({
    queryKey: ["card-prime-status", slug, uniqueOwned],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("hero-card-draw", {
        body: { scope: "collection", action: "prime_status", category: slug },
      });
      if (error) throw error;
      return data as {
        complete: boolean;
        claimed: boolean;
        uniqueOwned: number;
        total: number;
        card: CollectibleCard | null;
      };
    },
  });

  const draw = async () => {
    setDrawing(true);
    setCurrent(null);
    try {
      const { data, error } = await supabase.functions.invoke("hero-card-draw", {
        body: { scope: "collection", action: "draw", category: slug },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setCurrent(data.card as CollectibleCard);
      window.dispatchEvent(new Event("ai-credits-updated"));
      queryClient.invalidateQueries({ queryKey: ["character-credits"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The draw failed, please try again.");
    } finally {
      setDrawing(false);
    }
  };

  const decide = async (keep: boolean) => {
    if (!current) return;
    setExitDir(keep ? "right" : "left");
    if (!keep) {
      setTimeout(() => { setCurrent(null); setExitDir(null); }, 250);
      toast("Card released — it stays in the pool.", { icon: "🗑️" });
      return;
    }
    setDeciding(true);
    try {
      const { data, error } = await supabase.functions.invoke("hero-card-draw", {
        body: { scope: "collection", action: "keep", collectibleId: current.id },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setExitDir(null); return; }
      toast.success(`${current.name} added to your collection!`);
      queryClient.invalidateQueries({ queryKey: ["card-collection-mine", slug] });
      setTimeout(() => { setCurrent(null); setExitDir(null); }, 250);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the card.");
      setExitDir(null);
    } finally {
      setDeciding(false);
    }
  };

  const claimPrime = async () => {
    setClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke("hero-card-draw", {
        body: { scope: "collection", action: "claim_prime", category: slug },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      toast.success(`${category.name} Prime unlocked — the golden card is yours!`);
      queryClient.invalidateQueries({ queryKey: ["card-prime-status", slug] });
      queryClient.invalidateQueries({ queryKey: ["card-collection-mine", slug] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The Prime card could not be claimed.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6 border-border/30 bg-card/90 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br ${category.gradient} flex items-center justify-center text-2xl`}>
            {getCategoryCover(category.slug) ? (
              <img src={getCategoryCover(category.slug)} alt="" loading="lazy" className="w-full h-full object-cover" />
            ) : (
              category.emoji
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black">
              {getCategoryBlurb(category.slug)?.title ?? category.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {getCategoryBlurb(category.slug)?.tagline ?? category.description}
            </p>
            {getCategoryBlurb(category.slug)?.inside && (
              <p className="text-[11px] text-muted-foreground/80">
                {getCategoryBlurb(category.slug)?.inside}
              </p>
            )}
          </div>
          <Badge variant="outline" className="ml-auto gap-1 border-border/40">
            <Coins className="h-3 w-3" /> {DRAW_COST} cr / draw
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs font-bold whitespace-nowrap">{uniqueOwned}/{CARDS_PER_CATEGORY}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          {totalOwned} card{totalOwned === 1 ? "" : "s"} collected in total (including duplicates)
        </p>
      </Card>

      {/* ── Prime card: reward for a completed set ─────────────────────────── */}
      <Card className={`relative overflow-hidden p-4 sm:p-6 border-2 ${prime?.complete ? "border-amber-400/70 bg-gradient-to-br from-amber-500/15 via-yellow-400/10 to-amber-600/15" : "border-border/30 bg-card/70"}`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${prime?.complete ? "bg-gradient-to-br from-amber-400 to-yellow-600" : "bg-muted"}`}>
            {prime?.complete ? <Crown className="h-6 w-6 text-white" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
              {category.name} Prime
            </h3>
            <p className="text-xs text-muted-foreground">
              Own at least one copy of all {CARDS_PER_CATEGORY} cards to unlock the exclusive golden Prime card — free.
            </p>
          </div>
        </div>

        {prime?.claimed ? (
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
            {prime.card?.image_url && (
              <img
                src={prime.card.image_url}
                alt={`${category.name} Prime golden collectible card`}
                className="w-32 rounded-xl border-2 border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.35)]"
                loading="lazy"
              />
            )}
            <div className="text-center sm:text-left">
              <p className="font-black text-amber-500">Prime card unlocked!</p>
              <p className="text-xs text-muted-foreground mt-1">
                The golden {category.name} Prime card now sits at the top of your album.
              </p>
            </div>
          </div>
        ) : prime?.complete ? (
          <div className="mt-4">
            <Button onClick={claimPrime} disabled={claiming} className="gap-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-white">
              {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
              {claiming ? "Unlocking…" : "Claim your Prime card"}
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs font-bold whitespace-nowrap">{uniqueOwned}/{CARDS_PER_CATEGORY}</span>
          </div>
        )}
      </Card>

      <Tabs defaultValue="draw">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="draw" className="gap-2"><Sparkles className="h-4 w-4" /> Draw</TabsTrigger>
          <TabsTrigger value="album" className="gap-2"><Library className="h-4 w-4" /> Album</TabsTrigger>
          <TabsTrigger value="ranking" className="gap-2"><Trophy className="h-4 w-4" /> Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="pt-4">
          <div className="max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    x: exitDir === "right" ? 320 : exitDir === "left" ? -320 : 0,
                    rotate: exitDir === "right" ? 12 : exitDir === "left" ? -12 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                >
                  <Card className="overflow-hidden border-border/30 bg-card/95 backdrop-blur-xl">
                    <div className={`relative aspect-[4/5] bg-gradient-to-br ${current.gradient}`}>
                      {current.image_url ? (
                        <img
                          src={current.image_url}
                          alt={`${current.name} — ${category.name} collectible card`}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-7xl">{current.emoji}</div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur">
                        {RARITY_LABEL[current.rarity] ?? current.rarity}
                      </Badge>
                      <Badge variant="outline" className="absolute top-3 right-3 bg-background/80 backdrop-blur">
                        #{current.card_index}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-black leading-tight">{current.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{current.subject} · {category.name}</p>
                        <p className="text-[11px] font-bold mt-1 text-emerald-500">
                          {(ownedCounts[current.id] ?? 0) > 0
                            ? `Already in your collection ×${ownedCounts[current.id]} — keep it to stack a duplicate`
                            : "New card — not in your collection yet!"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{current.lore}</p>
                    </div>
                  </Card>

                  <div className="flex items-center justify-center gap-6 mt-5">
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={deciding}
                      onClick={() => decide(false)}
                      className="h-16 w-16 rounded-full border-destructive/40 hover:bg-destructive/10"
                      aria-label="Release this card"
                    >
                      <X className="h-7 w-7 text-destructive" />
                    </Button>
                    <Button
                      size="icon"
                      disabled={deciding}
                      onClick={() => decide(true)}
                      className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600"
                      aria-label="Add this card to your collection"
                    >
                      {deciding ? <Loader2 className="h-7 w-7 animate-spin" /> : <Check className="h-7 w-7" />}
                    </Button>
                  </div>
                  <p className="text-center text-[11px] text-muted-foreground mt-3">
                    ✓ keeps the card · ✗ releases it back into the pool
                  </p>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="p-8 text-center border-dashed border-border/40 bg-card/70">
                    <div className={`w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br ${category.gradient} flex items-center justify-center mx-auto mb-4 text-3xl`}>
                      {getCategoryCover(category.slug) ? (
                        <img src={getCategoryCover(category.slug)} alt="" loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        category.emoji
                      )}
                    </div>

                    <h3 className="font-black mb-1">Draw a {category.name} card</h3>
                    <p className="text-xs text-muted-foreground mb-5">
                      {DRAW_COST} AI credit per draw — any of the {CARDS_PER_CATEGORY} cards can appear, including ones you already own.
                    </p>
                    <Button onClick={draw} disabled={drawing} className="gap-2">
                      {drawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {drawing ? "Drawing…" : `Draw for ${DRAW_COST} credit`}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="album" className="pt-4">
          {artMissing > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Painting artwork… {CARDS_PER_CATEGORY - artMissing}/{CARDS_PER_CATEGORY} cards ready (free, keeps running while you browse)
            </div>
          )}
          {isLoading || loadingCatalogue ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {catalogue.slice(0, visibleCount).map((c) => {
                  const count = ownedCounts[c.id] ?? 0;
                  const owned = count > 0;
                  return (
                    <Card
                      key={c.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setDetailCard(c)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDetailCard(c); } }}
                      className="overflow-hidden border-border/30 bg-card/90 cursor-pointer transition-transform hover:scale-[1.02] hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className={`relative aspect-[4/5] bg-gradient-to-br ${c.gradient}`}>
                        {c.image_url ? (
                          <img
                            src={c.image_url}
                            alt={`${c.name} collectible card`}
                            className={`absolute inset-0 w-full h-full object-cover ${owned ? "" : "opacity-70 saturate-[0.6]"}`}
                            loading="lazy"
                            decoding="async"
                            width={320}
                            height={400}
                          />
                        ) : (
                          <div className={`absolute inset-0 flex items-center justify-center text-4xl ${owned ? "" : "opacity-70"}`}>{c.emoji}</div>
                        )}
                        <Badge className="absolute top-2 left-2 text-[9px] bg-background/80 text-foreground backdrop-blur">
                          {RARITY_LABEL[c.rarity] ?? c.rarity}
                        </Badge>
                        {owned && <Badge className="absolute top-2 right-2 text-[9px] bg-emerald-500 text-white">×{count}</Badge>}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate capitalize">#{c.card_index} · {c.subject}</p>
                        <p className={`text-[10px] font-bold mt-1 ${owned ? "text-emerald-500" : "text-muted-foreground"}`}>
                          {owned ? `Collected ×${count}` : "Not collected yet"}
                        </p>
                      </div>
                    </Card>
                  );
                })}

              </div>
              {visibleCount < catalogue.length && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={() => setVisibleCount((n) => n + 24)}>
                    Show more cards ({catalogue.length - visibleCount} left)
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="ranking" className="pt-4">
          <CardCollectionLeaderboard category={slug} totalCards={CARDS_PER_CATEGORY} />
        </TabsContent>
      </Tabs>

      <CardDetailModal
        card={detailCard}
        category={category}
        totalCards={CARDS_PER_CATEGORY}
        onClose={() => setDetailCard(null)}
      />
    </div>

  );
};

export default CardCategoryCollection;
