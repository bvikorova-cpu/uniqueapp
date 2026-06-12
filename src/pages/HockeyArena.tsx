import { lazy, Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, ShoppingCart, Shield, Dumbbell, ShoppingBag, Swords, Trophy, Map, Search, Building, ArrowUpDown, Medal, GraduationCap, BarChart3, Coins, Crosshair, Gamepad2 } from "lucide-react";
import { ArenaAuthGuard } from "@/components/arena/ArenaAuthGuard";
import { HockeyArenaHero } from "@/components/hockey/HockeyArenaHero";
import { HockeyEngagement } from "@/components/hockey/HockeyEngagement";
import { HockeyToolCard } from "@/components/hockey/HockeyToolCard";
import { PageLoader } from "@/components/ui/PageLoader";
import { supabase } from "@/integrations/supabase/client";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ViewType = "hub" | "player-creator" | "player-market" | "team-builder" | "training" | "equipment" | "match" | "league" | "tactics" | "scout" | "stadium" | "transfers" | "trophies" | "youth" | "analysis" | "coins" | "penalty-shot" | "play-game";

const PlayerCreator = lazy(() => import("@/components/hockey/PlayerCreator").then((m) => ({ default: m.PlayerCreator })));
const PlayerMarket = lazy(() => import("@/components/hockey/PlayerMarket").then((m) => ({ default: m.PlayerMarket })));
const TeamBuilder = lazy(() => import("@/components/hockey/TeamBuilder").then((m) => ({ default: m.TeamBuilder })));
const TrainingCenter = lazy(() => import("@/components/hockey/TrainingCenter").then((m) => ({ default: m.TrainingCenter })));
const EquipmentShop = lazy(() => import("@/components/hockey/EquipmentShop").then((m) => ({ default: m.EquipmentShop })));
const MatchSimulator = lazy(() => import("@/components/hockey/MatchSimulator").then((m) => ({ default: m.MatchSimulator })));
const LeagueSystem = lazy(() => import("@/components/hockey/LeagueSystem").then((m) => ({ default: m.LeagueSystem })));
const TacticsBoard = lazy(() => import("@/components/hockey/TacticsBoard").then((m) => ({ default: m.TacticsBoard })));
const ScoutNetwork = lazy(() => import("@/components/hockey/ScoutNetwork").then((m) => ({ default: m.ScoutNetwork })));
const StadiumBuilder = lazy(() => import("@/components/hockey/StadiumBuilder").then((m) => ({ default: m.StadiumBuilder })));
const TransferMarket = lazy(() => import("@/components/hockey/TransferMarket").then((m) => ({ default: m.TransferMarket })));
const TrophyRoom = lazy(() => import("@/components/hockey/TrophyRoom").then((m) => ({ default: m.TrophyRoom })));
const YouthAcademy = lazy(() => import("@/components/hockey/YouthAcademy").then((m) => ({ default: m.YouthAcademy })));
const MatchAnalysis = lazy(() => import("@/components/hockey/MatchAnalysis").then((m) => ({ default: m.MatchAnalysis })));
const CoinShop = lazy(() => import("@/components/hockey/CoinShop").then((m) => ({ default: m.CoinShop })));
const PenaltyShot3D = lazy(() => import("@/components/hockey/PenaltyShot3D").then((m) => ({ default: m.PenaltyShot3D })));
const EmbeddedGame = lazy(() => import("@/components/arena/EmbeddedGame").then((m) => ({ default: m.EmbeddedGame })));

const tools = [
  { id: "player-creator" as ViewType, icon: UserPlus, title: "Player Creator", description: "Create custom hockey players with AI-generated stats", badge: "AI", credits: 500, gradient: "from-cyan-500/10 to-cyan-500/5", iconColor: "text-cyan-400" },
  { id: "team-builder" as ViewType, icon: Shield, title: "Team Builder", description: "Build and manage your dream hockey roster", gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-400" },
  { id: "match" as ViewType, icon: Swords, title: "Match Simulator", description: "Play matches against AI opponents on the ice", badge: "AI", credits: 300, gradient: "from-red-500/10 to-red-500/5", iconColor: "text-red-400" },
  { id: "training" as ViewType, icon: Dumbbell, title: "Training Center", description: "Train players to boost their skating, shooting & more", gradient: "from-orange-500/10 to-orange-500/5", iconColor: "text-orange-400" },
  { id: "player-market" as ViewType, icon: ShoppingCart, title: "Player Market", description: "Buy players from other managers", gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-400" },
  { id: "scout" as ViewType, icon: Search, title: "Scout Network", description: "AI-powered talent scouting worldwide", badge: "AI", credits: 400, gradient: "from-violet-500/10 to-violet-500/5", iconColor: "text-violet-400" },
  { id: "tactics" as ViewType, icon: Map, title: "Tactics Board", description: "Get AI tactical analysis for line combinations", badge: "AI", credits: 300, gradient: "from-teal-500/10 to-teal-500/5", iconColor: "text-teal-400" },
  { id: "league" as ViewType, icon: Trophy, title: "League System", description: "Join leagues and compete for the championship", gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "equipment" as ViewType, icon: ShoppingBag, title: "Equipment Shop", description: "Buy sticks, skates, pads and gear for players", gradient: "from-pink-500/10 to-pink-500/5", iconColor: "text-pink-400" },
  { id: "stadium" as ViewType, icon: Building, title: "Arena Builder", description: "Upgrade and customize your hockey arena", gradient: "from-indigo-500/10 to-indigo-500/5", iconColor: "text-indigo-400" },
  { id: "transfers" as ViewType, icon: ArrowUpDown, title: "Transfer Market", description: "List and sell your players to others", gradient: "from-lime-500/10 to-lime-500/5", iconColor: "text-lime-400" },
  { id: "youth" as ViewType, icon: GraduationCap, title: "Youth Academy", description: "Discover and develop young hockey talent", badge: "AI", credits: 350, gradient: "from-sky-500/10 to-sky-500/5", iconColor: "text-sky-400" },
  { id: "analysis" as ViewType, icon: BarChart3, title: "Match Analysis", description: "AI-powered post-match performance reports", badge: "AI", credits: 400, gradient: "from-fuchsia-500/10 to-fuchsia-500/5", iconColor: "text-fuchsia-400" },
  { id: "trophies" as ViewType, icon: Medal, title: "Trophy Room", description: "View your achievements and trophies", badge: "Free", gradient: "from-yellow-500/10 to-yellow-500/5", iconColor: "text-yellow-400" },
  { id: "coins" as ViewType, icon: Coins, title: "Coin Shop", description: "Purchase coins for players and upgrades", gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "penalty-shot" as ViewType, icon: Crosshair, title: "🏒 Penalty Shot", description: "Play 3D penalty shot on ice!", badge: "3D", gradient: "from-cyan-500/10 to-cyan-500/5", iconColor: "text-cyan-400" },
  { id: "play-game" as ViewType, icon: Gamepad2, title: "🏒 Play on Poki ↗", description: "Opens Hockey Legends on Poki.com in a new tab", badge: "POKI", gradient: "from-purple-500/10 to-pink-500/5", iconColor: "text-purple-400" },
];

const useLiveStats = () => {
  const [stats, setStats] = useState({ totalPlayers: 0, totalMatches: 0, activeLeagues: 0, onlineManagers: 0 });
  useEffect(() => {
    const load = async () => {
      const [{ count: p }, { count: m }, { count: l }] = await Promise.all([
        supabase.from("hockey_players").select("id", { count: "exact", head: true }),
        supabase.from("hockey_matches").select("id", { count: "exact", head: true }),
        supabase.from("hockey_leagues").select("id", { count: "exact", head: true }).eq("status", "open"),
      ]);
      setStats({ totalPlayers: p || 0, totalMatches: m || 0, activeLeagues: l || 0, onlineManagers: Math.floor(Math.random() * 50) + 10 });
    };
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, []);
  return stats;
};

const HockeyArena = () => {
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const stats = useLiveStats();

  const renderView = () => {
    const back = () => setActiveView("hub");
    switch (activeView) {
      case "player-creator": return <PlayerCreator onBack={back} />;
      case "player-market": return <PlayerMarket onBack={back} />;
      case "team-builder": return <TeamBuilder onBack={back} />;
      case "training": return <TrainingCenter onBack={back} />;
      case "equipment": return <EquipmentShop onBack={back} />;
      case "match": return <MatchSimulator onBack={back} />;
      case "league": return <LeagueSystem onBack={back} />;
      case "tactics": return <TacticsBoard onBack={back} />;
      case "scout": return <ScoutNetwork onBack={back} />;
      case "stadium": return <StadiumBuilder onBack={back} />;
      case "transfers": return <TransferMarket onBack={back} />;
      case "trophies": return <TrophyRoom onBack={back} />;
      case "youth": return <YouthAcademy onBack={back} />;
      case "analysis": return <MatchAnalysis onBack={back} />;
      case "coins": return <CoinShop onBack={back} />;
      case "penalty-shot": return <PenaltyShot3D onBack={back} />;
      case "play-game": return <EmbeddedGame onBack={back} title="Ice Hockey Shootout" gameUrl="https://html5.gamedistribution.com/09886da081dd4b4997ed4af98490b5f7/" sport="hockey" />;
      default: return null;
    }
  };

  if (activeView !== "hub") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-20 pb-28 md:pb-8">
          <ArenaAuthGuard onBack={() => setActiveView("hub")} sportName="Hockey Arena">
            <Suspense fallback={<PageLoader />}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{renderView()}</motion.div>
            </Suspense>
          </ArenaAuthGuard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-28 md:pb-8 space-y-8">
        <HockeyArenaHero stats={stats} onNavigate={(v) => setActiveView(v as ViewType)} />
        <HeroRewardedAd sectionKey="page_hockeyarena" />

        <HockeyEngagement />
        <div>
          <h2 className="text-xl font-bold mb-4">Hockey Arena Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tools.map((tool, i) => (
              <HockeyToolCard key={tool.id} icon={tool.icon} title={tool.title} description={tool.description} badge={tool.badge} credits={tool.credits} gradient={tool.gradient} iconColor={tool.iconColor} onClick={() => setActiveView(tool.id)} delay={0.05 * i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HockeyArena;
