import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, ShoppingCart, Shield, Dumbbell, ShoppingBag, Swords, Trophy, Map, Search, Building, ArrowUpDown, Medal, GraduationCap, BarChart3, Coins, Crosshair, Gamepad2 } from "lucide-react";
import { ArenaAuthGuard } from "@/components/arena/ArenaAuthGuard";
import { BasketballArenaHero } from "@/components/basketball/BasketballArenaHero";
import { BasketballEngagement } from "@/components/basketball/BasketballEngagement";
import { BasketballToolCard } from "@/components/basketball/BasketballToolCard";
import { PlayerCreator } from "@/components/basketball/PlayerCreator";
import { PlayerMarket } from "@/components/basketball/PlayerMarket";
import { TeamBuilder } from "@/components/basketball/TeamBuilder";
import { TrainingCenter } from "@/components/basketball/TrainingCenter";
import { EquipmentShop } from "@/components/basketball/EquipmentShop";
import { MatchSimulator } from "@/components/basketball/MatchSimulator";
import { LeagueSystem } from "@/components/basketball/LeagueSystem";
import { TacticsBoard } from "@/components/basketball/TacticsBoard";
import { ScoutNetwork } from "@/components/basketball/ScoutNetwork";
import { StadiumBuilder } from "@/components/basketball/StadiumBuilder";
import { TransferMarket } from "@/components/basketball/TransferMarket";
import { TrophyRoom } from "@/components/basketball/TrophyRoom";
import { YouthAcademy } from "@/components/basketball/YouthAcademy";
import { MatchAnalysis } from "@/components/basketball/MatchAnalysis";
import { CoinShop } from "@/components/basketball/CoinShop";
import { FreeThrow3D } from "@/components/basketball/FreeThrow3D";
import { EmbeddedGame } from "@/components/arena/EmbeddedGame";
import { supabase } from "@/integrations/supabase/client";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ViewType = "hub" | "player-creator" | "player-market" | "team-builder" | "training" | "equipment" | "match" | "league" | "tactics" | "scout" | "stadium" | "transfers" | "trophies" | "youth" | "analysis" | "coins" | "free-throw" | "play-game";

const tools = [
  { id: "player-creator" as ViewType, icon: UserPlus, title: "Player Creator", description: "Create custom players with AI-generated stats", badge: "AI", credits: 500, gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-400" },
  { id: "team-builder" as ViewType, icon: Shield, title: "Team Builder", description: "Build and manage your dream basketball squad", gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-400" },
  { id: "match" as ViewType, icon: Swords, title: "Match Simulator", description: "Play games against AI opponents", badge: "AI", credits: 300, gradient: "from-red-500/10 to-red-500/5", iconColor: "text-red-400" },
  { id: "training" as ViewType, icon: Dumbbell, title: "Training Center", description: "Train players to boost their stats", gradient: "from-orange-500/10 to-orange-500/5", iconColor: "text-orange-400" },
  { id: "player-market" as ViewType, icon: ShoppingCart, title: "Player Market", description: "Buy players from other managers", gradient: "from-cyan-500/10 to-cyan-500/5", iconColor: "text-cyan-400" },
  { id: "scout" as ViewType, icon: Search, title: "Scout Network", description: "AI-powered talent scouting worldwide", badge: "AI", credits: 400, gradient: "from-violet-500/10 to-violet-500/5", iconColor: "text-violet-400" },
  { id: "tactics" as ViewType, icon: Map, title: "Tactics Board", description: "Get AI tactical analysis for your team", badge: "AI", credits: 300, gradient: "from-teal-500/10 to-teal-500/5", iconColor: "text-teal-400" },
  { id: "league" as ViewType, icon: Trophy, title: "League System", description: "Join leagues and compete for trophies", gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "equipment" as ViewType, icon: ShoppingBag, title: "Equipment Shop", description: "Buy shoes, jerseys, and gear for players", gradient: "from-pink-500/10 to-pink-500/5", iconColor: "text-pink-400" },
  { id: "stadium" as ViewType, icon: Building, title: "Arena Builder", description: "Upgrade and customize your arena", gradient: "from-indigo-500/10 to-indigo-500/5", iconColor: "text-indigo-400" },
  { id: "transfers" as ViewType, icon: ArrowUpDown, title: "Transfer Market", description: "List and sell your players to others", gradient: "from-lime-500/10 to-lime-500/5", iconColor: "text-lime-400" },
  { id: "youth" as ViewType, icon: GraduationCap, title: "Youth Academy", description: "Discover and develop young talent", badge: "AI", credits: 350, gradient: "from-sky-500/10 to-sky-500/5", iconColor: "text-sky-400" },
  { id: "analysis" as ViewType, icon: BarChart3, title: "Match Analysis", description: "AI-powered post-game performance reports", badge: "AI", credits: 400, gradient: "from-fuchsia-500/10 to-fuchsia-500/5", iconColor: "text-fuchsia-400" },
  { id: "trophies" as ViewType, icon: Medal, title: "Trophy Room", description: "View your achievements and trophies", badge: "Free", gradient: "from-yellow-500/10 to-yellow-500/5", iconColor: "text-yellow-400" },
  { id: "coins" as ViewType, icon: Coins, title: "Coin Shop", description: "Purchase coins for players and upgrades", gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "free-throw" as ViewType, icon: Crosshair, title: "🏀 Free Throw", description: "Play 3D free throw challenge!", badge: "3D", gradient: "from-orange-500/10 to-orange-500/5", iconColor: "text-orange-400" },
  { id: "play-game" as ViewType, icon: Gamepad2, title: "🏀 Play on Poki ↗", description: "Opens Basketball Stars on Poki.com in a new tab", badge: "POKI", gradient: "from-purple-500/10 to-pink-500/5", iconColor: "text-purple-400" },
];

const useLiveStats = () => {
  const [stats, setStats] = useState({ totalPlayers: 0, totalMatches: 0, activeLeagues: 0, onlineManagers: 0 });
  useEffect(() => {
    const load = async () => {
      const [{ count: p }, { count: m }, { count: l }] = await Promise.all([
        supabase.from("basketball_players").select("id", { count: "exact", head: true }),
        supabase.from("basketball_matches").select("id", { count: "exact", head: true }),
        supabase.from("basketball_leagues").select("id", { count: "exact", head: true }).eq("status", "open"),
      ]);
      setStats({ totalPlayers: p || 0, totalMatches: m || 0, activeLeagues: l || 0, onlineManagers: Math.floor(Math.random() * 50) + 10 });
    };
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, []);
  return stats;
};

const BasketballArena = () => {
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
      case "free-throw": return <FreeThrow3D onBack={back} />;
      case "play-game": return <EmbeddedGame onBack={back} title="Basketball Stars" gameUrl="https://html5.gamedistribution.com/69d78d071f704fa183d75b4114ae40ec/" sport="basketball" />;
      default: return null;
    }
  };

  if (activeView !== "hub") {
    return (
      <><FloatingHowItWorks title="BasketballArena — How it works" steps={[{title:"Open this section",desc:"Access BasketballArena from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-20 pb-28 md:pb-8">
          <ArenaAuthGuard onBack={() => setActiveView("hub")} sportName="Basketball Arena">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{renderView()}</motion.div>
          </ArenaAuthGuard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-28 md:pb-8 space-y-8">
        <BasketballArenaHero stats={stats} onNavigate={(v) => setActiveView(v as ViewType)} />
        <HeroRewardedAd sectionKey="page_basketballarena" />

        <BasketballEngagement />
        <div>
          <h2 className="text-xl font-bold mb-4">Basketball Arena Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tools.map((tool, i) => (
              <BasketballToolCard key={tool.id} icon={tool.icon} title={tool.title} description={tool.description} badge={tool.badge} credits={tool.credits} gradient={tool.gradient} iconColor={tool.iconColor} onClick={() => setActiveView(tool.id)} delay={0.05 * i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default BasketballArena;
