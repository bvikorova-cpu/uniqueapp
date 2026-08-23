import { cardThumbUrl } from "@/lib/cardImageUrl";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Crown, Loader2, Lock, Layers } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { CARDS_PER_CATEGORY, type CardCategory } from "@/components/collections/CardCategoryCollection";
import { getCategoryCover } from "@/components/collections/categoryCovers";
import { getCategoryBlurb } from "@/components/collections/categoryBlurbs";

interface PrimeRow {
  id: string;
  category_slug: string;
  name: string;
  lore: string | null;
  emoji: string | null;
  gradient: string | null;
  image_url: string | null;
}

/** Detailed overview of every collection: cover art, its Prime card and owned counts. */
const CardCollectionsGallery = () => {
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

  const { data: primes = {} } = useQuery({
    queryKey: ["card-prime-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_collectibles")
        .select("id, category_slug, name, lore, emoji, gradient, image_url")
        .eq("is_prime", true);
      if (error) throw error;
      const map: Record<string, PrimeRow> = {};
      for (const r of (data ?? []) as unknown as PrimeRow[]) map[r.category_slug] = r;
      return map;
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: progress = {} } = useQuery({
    queryKey: ["card-collection-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {} as Record<string, { unique: number; total: number; prime: boolean }>;
      const { data, error } = await supabase
        .from("user_card_collection")
        .select("category_slug, copies, collectible_id")
        .eq("user_id", user.id);
      if (error) throw error;
      const map: Record<string, { unique: number; total: number; prime: boolean }> = {};
      const primeIds = new Set(Object.values(primes).map((p) => p.id));
      for (const r of (data ?? []) as { category_slug: string; copies: number; collectible_id: string }[]) {
        const entry = map[r.category_slug] ?? { unique: 0, total: 0, prime: false };
        if (primeIds.has(r.collectible_id)) entry.prime = true;
        else entry.unique += 1;
        entry.total += r.copies ?? 1;
        map[r.category_slug] = entry;
      }
      return map;
    },
    staleTime: 30 * 1000,
  });

  const totalUnique = Object.values(progress).reduce((a, b) => a + b.unique, 0);
  const totalCopies = Object.values(progress).reduce((a, b) => a + b.total, 0);
  const primesOwned = Object.values(progress).filter((p) => p.prime).length;

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-6xl pt-20 pb-28 md:pb-8 space-y-6">
        <Button asChild variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
          <Link to="/card-collections">
            <ArrowLeft className="h-4 w-4" /> All collections
          </Link>
        </Button>

        <FloatingHowItWorks
          title="Collection details — How it works"
          steps={[
            { title: "Browse every collection", desc: "Each card below is one full collection: its cover artwork, theme description and your live progress." },
            { title: "See the Prime card", desc: "Every collection hides one exclusive golden Prime card. It stays locked until you own all 150 regular cards of that collection." },
            { title: "Track what you own", desc: "The counters show unique cards owned out of 150, plus the total number of copies including duplicates." },
            { title: "Jump straight in", desc: "Open any collection to draw new cards, browse your album and check the leaderboard." },
          ]}
        />

        <Card className="p-4 sm:p-6 border-border/30 bg-card/90 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black">Collection details</h1>
              <p className="text-xs text-muted-foreground">
                Prime gallery, covers and your owned cards across every collection
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl border border-border/40 p-3 text-center">
              <p className="text-lg font-black">{totalUnique}</p>
              <p className="text-[11px] text-muted-foreground">Unique cards</p>
            </div>
            <div className="rounded-xl border border-border/40 p-3 text-center">
              <p className="text-lg font-black">{totalCopies}</p>
              <p className="text-[11px] text-muted-foreground">Total copies</p>
            </div>
            <div className="rounded-xl border border-border/40 p-3 text-center">
              <p className="text-lg font-black">{primesOwned}</p>
              <p className="text-[11px] text-muted-foreground">Prime cards</p>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => {
              const p = progress[c.slug] ?? { unique: 0, total: 0, prime: false };
              const blurb = getCategoryBlurb(c.slug);
              const prime = primes[c.slug];
              const pct = Math.min(Math.round((p.unique / CARDS_PER_CATEGORY) * 100), 100);
              const unlocked = p.prime || p.unique >= CARDS_PER_CATEGORY;
              return (
                <Card key={c.slug} className="overflow-hidden border-border/30 bg-card/90 flex flex-col">
                  <div className={`relative h-32 bg-gradient-to-br ${c.gradient} overflow-hidden`}>
                    {getCategoryCover(c.slug) ? (
                      <img
                        src={getCategoryCover(c.slug)}
                        alt={`${c.name} collection cover artwork`}
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

                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="space-y-1">
                      <h2 className="font-black leading-tight">{blurb?.title ?? c.name}</h2>
                      <p className="text-xs text-muted-foreground">{blurb?.tagline ?? c.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-[11px] font-bold whitespace-nowrap">{p.unique}/{CARDS_PER_CATEGORY}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {p.total} cop{p.total === 1 ? "y" : "ies"} owned · {pct}% complete
                    </p>

                    <div
                      className={`rounded-xl border p-3 flex items-center gap-3 ${
                        unlocked
                          ? "border-amber-400/60 bg-gradient-to-br from-amber-500/15 to-yellow-500/10"
                          : "border-border/40 bg-muted/30"
                      }`}
                    >
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {unlocked && prime?.image_url ? (
                          <img
                            src={cardThumbUrl(prime.image_url)}
                            alt={`${prime.name} Prime card artwork`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black flex items-center gap-1">
                          <Crown className={`h-3 w-3 ${unlocked ? "text-amber-500" : "text-muted-foreground"}`} />
                          {prime?.name ?? "Prime card"}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {unlocked
                            ? prime?.lore ?? "Exclusive golden Prime card."
                            : `Locked — collect all ${CARDS_PER_CATEGORY} cards to unlock.`}
                        </p>
                      </div>
                      {unlocked && (
                        <Badge className="ml-auto bg-amber-500 text-white border-0 shrink-0">Owned</Badge>
                      )}
                    </div>

                    <Button asChild className="w-full mt-auto">
                      <Link to={`/card-collections/${c.slug}`}>Open collection</Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardCollectionsGallery;
