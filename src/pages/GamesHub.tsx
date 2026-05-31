import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, ArrowLeft, Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";
import { gdGames, gdCategories, getGDGamesByCategory, type GDCategory, type GDGame } from "@/data/gdGames";

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
        <div className="w-full rounded-xl overflow-hidden border border-border bg-black" style={{ aspectRatio: ratio }}>
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

const GamesHub = () => {
  const [active, setActive] = useState<string | null>(null);
  const categories = Object.keys(gdCategories) as GDCategory[];
  const usedCategories = useMemo(
    () => categories.filter((c) => getGDGamesByCategory(c).length > 0),
    [categories]
  );
  const tabCats = usedCategories.length > 0 ? usedCategories : categories;

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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {list.map((g) => (
                        <Card
                          key={g.id}
                          className="group relative overflow-hidden cursor-pointer border border-border hover:border-primary/50 transition-all hover:shadow-[0_8px_30px_hsl(var(--primary)/0.2)]"
                          onClick={() => setActive(g.id)}
                        >
                          <div className="aspect-video bg-muted overflow-hidden">
                            {g.thumbnail ? (
                              <img
                                src={g.thumbnail}
                                alt={g.title}
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
                            <p className="text-sm font-semibold truncate">{g.title}</p>
                            <p className="text-xs text-muted-foreground">{gdCategories[g.category]}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default GamesHub;
