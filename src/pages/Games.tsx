import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Star, Heart, Zap, Brain, Dribbble, MapPin, Car, Sparkles, Target } from "lucide-react";
import { PokiGameWrapper } from "@/components/games/PokiGameWrapper";
import { pokiGames, getGamesByCategory, gameCategories, type GameCategory } from "@/data/pokigames";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { gateGameLaunch, playPostRoll } from "@/lib/gameAdGate";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const GAMES_HOW_IT_WORKS = [
  { title: "Pick a category", desc: "Tabs across the top split games by genre — Action, Puzzle, Racing, Sports and more. Tap one to filter the grid." },
  { title: "Tap a game to launch", desc: "Games open full-screen inside the app. A short ad may play before/after — that keeps the games free for you." },
  { title: "Play instantly, no install", desc: "Everything runs in the browser. Progress is saved by the game itself; some games sync via cookies." },
  { title: "Earn XP by playing", desc: "Time spent in Game Arena counts toward your daily XP goal and streak in the Rewards module." },
  { title: "Back to the arena anytime", desc: "Use the Back button (top-left inside a game) to return to the arena and pick another title." },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const Games = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame) {
    const game = pokiGames.find(g => g.id === activeGame);
    if (game) {
      return <PokiGameWrapper slug={game.slug} title={game.title} onBack={async () => {
        setActiveGame(null);
        await playPostRoll();
      }} />;
    }
  }

  const getCategoryIcon = (category: GameCategory) => {
    const icons: Record<string, any> = { girls: Heart, action: Zap, puzzle: Brain, sports: Dribbble, adventure: MapPin, racing: Car, strategy: Target, casual: Sparkles };
    return icons[category] || Gamepad2;
  };

  return (
    <>
      <SEO
        title="Game Arena - Free online games for everyone"
        description="Play 100+ free online games — action, puzzle, racing, sports and more. Powered by Poki on Unique Game Arena."
        canonical="/games"
      />
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Hero */}
        <div className="flex justify-end mb-2">
          <HowItWorksButton title="Game Arena" intro="How to browse, launch and enjoy the free Poki games." steps={GAMES_HOW_IT_WORKS} variant="compact" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
            <Gamepad2 className="w-4 h-4" />
            <span className="font-medium">Powered by Poki</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Game Arena
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-md mx-auto">
            Play thousands of free online games instantly
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{pokiGames.length}+</p>
              <p className="text-xs text-muted-foreground">Games</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{Object.keys(gameCategories).length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="action" className="w-full">
          <div className="overflow-x-auto scrollbar-hide mb-6">
            <TabsList className="inline-flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:gap-1 sm:h-auto sm:p-1 bg-card/80 backdrop-blur-sm border">
              {(Object.keys(gameCategories) as GameCategory[]).map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <TabsTrigger key={category} value={category} className="flex items-center gap-1.5 px-3 py-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{gameCategories[category]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {(Object.keys(gameCategories) as GameCategory[]).map((category) => (
            <TabsContent key={category} value={category}>
              <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {getGamesByCategory(category).map((game) => (
                  <motion.div key={game.id} variants={item}>
                    <Card 
                      className="group cursor-pointer overflow-hidden border-transparent hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]" 
                      onClick={() => gateGameLaunch(() => setActiveGame(game.id))}
                    >
                      <div className="h-1 bg-gradient-to-r from-primary to-accent" />
                      <CardHeader className="p-3 sm:p-4">
                        <div className="relative h-32 sm:h-40 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-lg mb-3 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Gamepad2 className="h-16 w-16 text-primary/30" />
                          </div>
                        </div>
                        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                          <Star className="h-4 w-4 text-yellow-500 shrink-0" />
                          <span className="line-clamp-1">{game.title}</span>
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2">{game.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                            <span className="text-xs text-muted-foreground">{game.rating ? `${game.rating}/10` : "New"}</span>
                          </div>
                          {game.plays && (
                            <Badge variant="secondary" className="text-[10px]">{(game.plays / 1000000).toFixed(1)}M</Badge>
                          )}
                        </div>
                        <Button className="w-full" size="sm" variant="premium" onClick={(e) => { e.stopPropagation(); gateGameLaunch(() => { window.open(`https://poki.com/en/g/${game.slug}`, "_blank", "noopener"); playPostRoll(); }); }}>
                          <Gamepad2 className="h-3.5 w-3.5 mr-1.5" /> Play on Poki ↗
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
    </>
  );
};

export default Games;
