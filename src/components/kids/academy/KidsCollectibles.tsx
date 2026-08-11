import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, Sparkles } from "lucide-react";
import { downloadCardImage } from "@/lib/downloadCardImage";
import { getCategoryCover } from "@/components/collections/categoryCovers";
import { getCategoryBlurb } from "@/components/collections/categoryBlurbs";
import heroVideo from "@/assets/kids-collectibles-hero.mp4.asset.json";
import { useCardArtPrewarm } from "@/hooks/useCardArtPrewarm";
import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";

/** Slugs that belong to the kid-friendly cartoon collectible sets. */
export const KIDS_CARD_SLUGS = [
  "kids-dino-pals",
  "kids-rescue-heroes",
  "kids-pony-sparkles",
  "kids-jungle-babies",
  "kids-space-kiddos",
  "kids-sweet-treats",
  "kids-sea-buddies",
  "kids-super-kiddos",
  "kids-farm-friends",
  "kids-garden-bugs",
  "kids3d-magic-pets",
  "kids3d-unicorn-kingdom",
  "kids3d-fairy-blossoms",
  "kids3d-baby-dragons",
  "kids3d-robot-mates",
  "kids3d-dino-explorers",
] as const;

const CARDS_PER_SET = 150;

interface KidsCategory {
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
  gradient: string | null;
}

/** Kids Collectibles — cartoon card sets for little collectors (boys & girls). */
export const KidsCollectibles = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["kids-card-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_categories")
        .select("slug, name, description, emoji, gradient, sort_order")
        .in("slug", KIDS_CARD_SLUGS as unknown as string[])
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as KidsCategory[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: progress = {} } = useQuery({
    queryKey: ["kids-card-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {} as Record<string, { unique: number; total: number }>;
      const { data, error } = await supabase
        .from("user_card_collection")
        .select("category_slug, copies")
        .eq("user_id", user.id)
        .in("category_slug", KIDS_CARD_SLUGS as unknown as string[]);
      if (error) throw error;
      const map: Record<string, { unique: number; total: number }> = {};
      for (const r of (data ?? []) as { category_slug: string; copies: number }[]) {
        const e = map[r.category_slug] ?? { unique: 0, total: 0 };
        e.unique += 1;
        e.total += r.copies ?? 1;
        map[r.category_slug] = e;
      }
      return map;
    },
    staleTime: 30 * 1000,
  });

  // Pre-generate + pre-cache all kids card artwork so albums open instantly.
  useCardArtPrewarm(KIDS_CARD_SLUGS as unknown as string[], categories.length > 0);

  return (
    <div className="space-y-5">
      {/* Hero video */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-primary/25 shadow-lg">
        <video
          src={heroVideo.url}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-[220px] sm:h-[340px] object-cover"
          aria-label="Kids Collectibles hero animation"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground drop-shadow">
            Kids Collectibles
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
            16 magical card sets · {CARDS_PER_SET} cards each · 2,400 cards to collect
          </p>
        </div>
      </div>

      <HeroRewardedAd sectionKey="kids_collectibles" />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const blurb = getCategoryBlurb(cat.slug);
            const cover = getCategoryCover(cat.slug);
            const owned = progress[cat.slug] ?? { unique: 0, total: 0 };
            const pct = Math.round((owned.unique / CARDS_PER_SET) * 100);
            return (
              <Card key={cat.slug} className="overflow-hidden border-border/40 bg-card/90">
                <div className="relative aspect-video bg-muted">
                  {cover ? (
                    <img
                      src={cover}
                      alt={`${blurb?.title ?? cat.name} kids collectible card cover`}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {cat.emoji ?? "🃏"}
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-white/85 text-foreground border-0">
                    {owned.unique}/{CARDS_PER_SET}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-extrabold text-base">
                    {cat.emoji} {blurb?.title ?? cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {blurb?.tagline ?? cat.description}
                  </p>
                  <Progress value={pct} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground">
                    {blurb?.inside}
                  </p>
                  <Button asChild size="sm" className="w-full gap-2">
                    <Link to={`/card-collections/${cat.slug}`}>
                      <Sparkles className="h-4 w-4" /> Open &amp; draw a card
                    </Link>
                  </Button>
                  {cover && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => downloadCardImage(cover, `${blurb?.title ?? cat.name}-cover`)}
                    >
                      <Download className="h-4 w-4" /> Download cover
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KidsCollectibles;
