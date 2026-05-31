import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Gamepad2, ArrowLeft, Sparkles, Search, X, ChevronDown, ExternalLink } from "lucide-react";
import { SEO } from "@/components/SEO";
import { gdGames, gdCategories, getGDGamesByCategory, type GDCategory, type GDGame } from "@/data/gdGames";

const PAGE_SIZE = 30;

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
          {isGameDistributionUrl(game.embedUrl) ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 text-center bg-background">
              <p className="text-sm sm:text-lg font-semibold uppercase">
                If you want to play {game.title},{" "}
                <a
                  href={game.embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-primary inline-flex items-center gap-1"
                >
                  click here to play <ExternalLink className="h-4 w-4" />
                </a>
              </p>
              {game.thumbnail && (
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  className="w-36 sm:w-48 max-h-48 rounded-md object-cover border border-border"
                />
              )}
              <Button asChild size="lg" variant="secondary" className="min-w-36 uppercase text-lg">
                <a href={game.embedUrl} target="_blank" rel="noopener noreferrer">
                  Play <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          ) : game.embedUrl ? (
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

const GameCard = ({ game, onClick }: { game: GDGame; onClick: () => void }) => (
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
      <div className="aspect-video bg-muted overflow-hidden">
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
  const categories = Object.keys(gdCategories) as GDCategory[];
  const usedCategories = useMemo(
    () => categories.filter((c) => getGDGamesByCategory(c).length > 0),
    [categories]
  );
  const tabCats = usedCategories.length > 0 ? usedCategories : categories;

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
                              <GameCard key={g.id} game={g} onClick={() => setActive(g.id)} />
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
              <div className="overflow-x-auto scrollbar-hide mb-6">
                <TabsList className="inline-flex w-max min-w-full bg-card/80 backdrop-blur-sm border">
                  {tabCats.map((cat) => (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="flex items-center gap-1.5 px-3 py-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                          <AnimatePresence>
                            {list.slice(0, getCatVisible(cat)).map((g) => (
                              <GameCard key={g.id} game={g} onClick={() => setActive(g.id)} />
                            ))}
                          </AnimatePresence>
                        </div>
                        {getCatVisible(cat) < list.length && (
                          <div className="flex justify-center mt-6">
                            <Button
                              variant="outline"
                              onClick={() => loadMoreCat(cat, list.length)}
                              className="gap-2"
                            >
                              <ChevronDown className="h-4 w-4" />
                              Load More ({list.length - getCatVisible(cat)} left)
                            </Button>
                          </div>
                        )}
                      </>
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
