import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Gamepad2, ArrowLeft, Sparkles, Search, X, ChevronLeft, ChevronRight, ExternalLink, Heart, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { gdGames, gdCategories, getGDGamesByCategory, type GDCategory, type GDGame } from "@/data/gdGames";
import { useGamesHub } from "@/hooks/useGamesHub";
import { gateGameLaunch, playPostRoll } from "@/lib/gameAdGate";

const PAGE_SIZE = 30;

const Pager = ({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  const go = (p: number) => {
    onChange(p);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => go(page - 1)} className="gap-1">
        <ChevronLeft className="h-4 w-4" /> Prev
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === page ? "default" : "outline"}
          onClick={() => go(p)}
          className="min-w-9"
        >
          {p}
        </Button>
      ))}
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => go(page + 1)} className="gap-1">
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const isGameDistributionUrl = (url?: string) =>
  Boolean(url?.includes("html5.gamedistribution.com"));

const GameFrame = ({ game, onBack }: { game: GDGame; onBack: () => void }) => {
  const ratio = game.aspectRatio ?? "16/9";
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Games
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">{game.title}</h1>
          <Badge variant="secondary">{gdCategories[game.category]}</Badge>
        </div>
        <div className="w-full rounded-xl overflow-hidden border border-border bg-background" style={{ aspectRatio: ratio }}>
          {game.embedUrl ? (
            <iframe
              src={game.embedUrl}
              title={game.title}
              className="w-full h-full"
              allow="autoplay; fullscreen; gamepad; microphone; camera"
              allowFullScreen
              frameBorder={0}
              scrolling="no"
            />
          ) : game.embedHtml ? (
            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: game.embedHtml }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No embed available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GameCard = ({
  game,
  onClick,
  isFavorite,
  onToggleFavorite,
}: {
  game: GDGame;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    <Card
      className="group relative overflow-hidden cursor-pointer border border-border hover:border-primary/50 transition-all hover:shadow-[0_8px_30px_hsl(var(--primary)/0.2)]"
      onClick={onClick}
    >
      <button
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background transition"
      >
        <Heart
          className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
        />
      </button>
      <div className="relative aspect-video bg-muted overflow-hidden">
        {game.thumbnail ? (
          <img
            src={game.thumbnail}
            alt={game.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Gamepad2 className="w-10 h-10 text-primary/60" />
          </div>
        )}
        {/* Hover Play CTA */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
            <Gamepad2 className="h-3.5 w-3.5" /> Play
          </div>
        </div>
      </div>
      <div className="p-2 sm:p-3">
        <p className="text-sm font-semibold truncate">{game.title}</p>
        <p className="text-xs text-muted-foreground">{gdCategories[game.category]}</p>
      </div>
    </Card>
  </motion.div>
);

const GamesHub = () => {
  const [active, setActive] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [catPage, setCatPage] = useState<Record<string, number>>({});
  const { isFavorite, toggleFavorite, trackPlay, recent, favorites } = useGamesHub();
  const categories = Object.keys(gdCategories) as GDCategory[];
  const usedCategories = useMemo(
    () => categories.filter((c) => getGDGamesByCategory(c).length > 0),
    [categories]
  );
  const tabCats = usedCategories.length > 0 ? usedCategories : categories;

  const handleOpen = (game: GDGame) => {
    setActive(game.id);
    trackPlay({ id: game.id, title: game.title, category: gdCategories[game.category] });
  };

  const recentGames = useMemo(
    () => recent.map((id) => gdGames.find((g) => g.id === id)).filter(Boolean) as GDGame[],
    [recent]
  );
  const favoriteGames = useMemo(
    () => gdGames.filter((g) => favorites.has(g.id)),
    [favorites]
  );

  const getCatPage = (cat: string) => catPage[cat] ?? 1;
  const setCatPageFor = (cat: string, page: number) =>
    setCatPage((prev) => ({ ...prev, [cat]: page }));

  useEffect(() => {
    setSearchPage(1);
  }, [searchQuery]);

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return gdGames.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        gdCategories[g.category].toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (active) {
    const game = gdGames.find((g) => g.id === active);
    if (game) return <GameFrame game={game} onBack={() => setActive(null)} />;
  }

  return (
    <>
      <SEO
        title="Games Hub — Play free online HTML5 games"
        description="Play categorized HTML5 games powered by Game Distributor on Unique. Action, puzzle, racing, sports and more."
        canonical="/games-hub"
      />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-2 sm:px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Powered by Game Distributor</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Games Hub
            </h1>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-md mx-auto">
              {gdGames.length > 0
                ? `Play ${gdGames.length}+ free HTML5 games right in your browser`
                : "Games will appear here as soon as embed codes are added."}
            </p>
          </motion.div>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search games by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 bg-card/80 backdrop-blur-sm border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!filteredGames && (favoriteGames.length > 0 || recentGames.length > 0) && (
            <div className="space-y-6 mb-8">
              {favoriteGames.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Heart className="h-5 w-5 fill-primary text-primary" /> Your Favorites
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {favoriteGames.slice(0, 10).map((g) => (
                      <GameCard
                        key={g.id}
                        game={g}
                        onClick={() => handleOpen(g)}
                        isFavorite
                        onToggleFavorite={() => toggleFavorite({ id: g.id, title: g.title, category: gdCategories[g.category] })}
                      />
                    ))}
                  </div>
                </section>
              )}
              {recentGames.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Recently Played
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {recentGames.slice(0, 10).map((g) => (
                      <GameCard
                        key={g.id}
                        game={g}
                        onClick={() => handleOpen(g)}
                        isFavorite={isFavorite(g.id)}
                        onToggleFavorite={() => toggleFavorite({ id: g.id, title: g.title, category: gdCategories[g.category] })}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {filteredGames ? (
            /* Search results */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-muted-foreground mb-4 text-center">
                {filteredGames.length} result{filteredGames.length !== 1 ? "s" : ""} for "{searchQuery.trim()}"
              </p>
              {filteredGames.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No games found.</p>
                  <p className="text-xs mt-1">Try a different search term.</p>
                </div>
              ) : (
                <>
                  {(() => {
                    const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
                    const page = Math.min(searchPage, totalPages);
                    const start = (page - 1) * PAGE_SIZE;
                    const pageItems = filteredGames.slice(start, start + PAGE_SIZE);
                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                          <AnimatePresence>
                            {pageItems.map((g) => (
                              <GameCard key={g.id} game={g} onClick={() => handleOpen(g)} isFavorite={isFavorite(g.id)} onToggleFavorite={() => toggleFavorite({ id: g.id, title: g.title, category: gdCategories[g.category] })} />

                            ))}
                          </AnimatePresence>
                        </div>
                        <Pager page={page} totalPages={totalPages} onChange={setSearchPage} />
                      </>
                    );
                  })()}
                </>
              )}
            </motion.div>
          ) : (
            /* Category tabs */
            <Tabs defaultValue={tabCats[0]} className="w-full">
              <div className="mb-6">
                <TabsList className="flex flex-wrap w-full h-auto bg-card/80 backdrop-blur-sm border">
                  {tabCats.map((cat) => (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="flex items-center gap-1.5 px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Gamepad2 className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{gdCategories[cat]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {tabCats.map((cat) => {
                const list = getGDGamesByCategory(cat);
                return (
                  <TabsContent key={cat} value={cat}>
                    {list.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No games in this category yet.</p>
                        <p className="text-xs mt-1">Send Game Distributor embed codes to add them here.</p>
                      </div>
                    ) : (
                      (() => {
                        const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
                        const page = Math.min(getCatPage(cat), totalPages);
                        const start = (page - 1) * PAGE_SIZE;
                        const pageItems = list.slice(start, start + PAGE_SIZE);
                        return (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                              <AnimatePresence>
                                {pageItems.map((g) => (
                                  <GameCard key={g.id} game={g} onClick={() => handleOpen(g)} isFavorite={isFavorite(g.id)} onToggleFavorite={() => toggleFavorite({ id: g.id, title: g.title, category: gdCategories[g.category] })} />
                                ))}
                              </AnimatePresence>
                            </div>
                            <Pager page={page} totalPages={totalPages} onChange={(p) => setCatPageFor(cat, p)} />
                          </>
                        );
                      })()
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
};

export default GamesHub;
