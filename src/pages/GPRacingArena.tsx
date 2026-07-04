import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GPCurrencyDisplay } from "@/components/gp-racing/GPCurrencyDisplay";
import { GPLeaderboard } from "@/components/gp-racing/GPLeaderboardWidget";
import { GPRacingHero } from "@/components/gp-racing/GPRacingHero";
import { GPRacingLiveTicker } from "@/components/gp-racing/GPRacingLiveTicker";
import { RaceReplayViewer } from "@/components/gp-racing/RaceReplayViewer";
import { CarPaintStudio } from "@/components/gp-racing/CarPaintStudio";
import { WeatherSystem } from "@/components/gp-racing/WeatherSystem";
import { PitStrategyPlanner } from "@/components/gp-racing/PitStrategyPlanner";
import { SeasonalChampionship } from "@/components/gp-racing/SeasonalChampionship";
import { TeamRacing } from "@/components/gp-racing/TeamRacing";
import { Telemetry } from "@/components/gp-racing/Telemetry";
import { BettingSystem } from "@/components/gp-racing/BettingSystem";
import { AchievementSystem } from "@/components/gp-racing/AchievementSystem";
import { TrackEditor } from "@/components/gp-racing/TrackEditor";
import { useUserCars, useGPRaces, useJoinGPRace, useUpgradeCar, usePurchaseCarColor, useGPCurrency } from "@/hooks/useGPRacing";
import { Trophy, Wrench, Sparkles, Zap, TrendingUp, Car, LogIn, Info, Gauge, Wind, CircleDot, Compass, ShoppingCart, Box, Rocket, Shield, Target, Cpu, Flame, Play, Palette, Cloud, Timer as TimerIcon, Users, Award, Coins, Map, Activity, Crown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
// 3D F1 Car Component
function GPCar3D({ position, color }: { position: [number, number, number]; color: string }) {
  return (
<group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.6, 1]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1, 0.4, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1.2, 0.1, 0]}>
        <boxGeometry args={[0.4, 0.1, 1.4]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-1, 0.8, 0]}>
        <boxGeometry args={[0.3, 0.6, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {[[0.8, 0, 0.6], [0.8, 0, -0.6], [-0.8, 0, 0.6], [-0.8, 0, -0.6]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

function RaceTrack3D({ participants, isRacing }: { participants: any[]; isRacing: boolean }) {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 15, 20]} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={10} maxDistance={50} />
        <ambientLight intensity={0.4} color="#4dd0e1" />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#e0f7fa" castShadow />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00bcd4" />
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 100]} />
          <meshStandardMaterial color="#0a1628" />
        </mesh>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i} position={[0, -0.48, -45 + i * 5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.3, 2]} />
            <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.5} />
          </mesh>
        ))}
        {[-8, 8].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.3, 1.5, 100]} />
            <meshStandardMaterial color="#00bcd4" emissive="#00bcd4" emissiveIntensity={0.3} transparent opacity={0.6} />
          </mesh>
        ))}
        {participants.map((p, i) => (
          <GPCar3D 
            key={p.id} 
            position={[-4 + i * 2.5, 0, isRacing ? -20 + Math.random() * 40 : 0]} 
            color={p.f1_cars?.color || "#00e5ff"} 
          />
        ))}
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}

const demoRaces = [
  { id: "demo-race-1", track_name: "Nebula Drift Circuit", distance: 5410, entry_fee_coins: 24, max_participants: 8, weather: "solar_storm", track_condition: "ion_charged", status: "open", f1_race_participants: [] },
  { id: "demo-race-2", track_name: "Quantum Horizon Ring", distance: 3340, entry_fee_coins: 50, max_participants: 6, weather: "cosmic_clear", track_condition: "plasma_smooth", status: "open", f1_race_participants: [] },
  { id: "demo-race-3", track_name: "Asteroid Belt Gauntlet", distance: 4200, entry_fee_coins: 35, max_participants: 10, weather: "meteor_shower", track_condition: "debris_field", status: "open", f1_race_participants: [] },
];

const toolCards = [
  { id: "replay", name: "Race Replay", icon: Play, desc: "Watch animated race replays", color: "text-amber-400", gradient: "from-amber-950/30 to-orange-950/20", border: "border-amber-500/20" },
  { id: "paint", name: "Paint Studio", icon: Palette, desc: "Custom livery designer", color: "text-violet-400", gradient: "from-violet-950/30 to-purple-950/20", border: "border-violet-500/20" },
  { id: "weather", name: "Weather System", icon: Cloud, desc: "Dynamic race conditions", color: "text-blue-400", gradient: "from-blue-950/30 to-cyan-950/20", border: "border-blue-500/20" },
  { id: "pit", name: "Pit Strategy", icon: TimerIcon, desc: "Plan pit stops & tires", color: "text-emerald-400", gradient: "from-emerald-950/30 to-cyan-950/20", border: "border-emerald-500/20" },
  { id: "championship", name: "Championship", icon: Crown, desc: "Seasonal league & standings", color: "text-amber-300", gradient: "from-amber-900/30 to-yellow-950/20", border: "border-amber-400/20" },
  { id: "teams", name: "Team Racing", icon: Users, desc: "Form squads & compete", color: "text-pink-400", gradient: "from-pink-950/30 to-rose-950/20", border: "border-pink-500/20" },
  { id: "telemetry", name: "Telemetry", icon: Activity, desc: "Real-time speed & G-force", color: "text-cyan-300", gradient: "from-cyan-900/30 to-blue-950/20", border: "border-cyan-400/20" },
  { id: "betting", name: "Race Betting", icon: Coins, desc: "Wager coins on winners", color: "text-orange-400", gradient: "from-orange-950/30 to-red-950/20", border: "border-orange-500/20" },
  { id: "achievements", name: "Achievements", icon: Award, desc: "Track racing milestones", color: "text-yellow-400", gradient: "from-yellow-950/30 to-amber-950/20", border: "border-yellow-500/20" },
  { id: "track-editor", name: "Track Editor", icon: Map, desc: "Design custom circuits", color: "text-indigo-400", gradient: "from-indigo-950/30 to-violet-950/20", border: "border-indigo-500/20" },
];

const statIcons: Record<string, React.ReactNode> = {
  engine: <Flame className="h-4 w-4" />,
  aero: <Wind className="h-4 w-4" />,
  tires: <CircleDot className="h-4 w-4" />,
  handling: <Compass className="h-4 w-4" />,
};

export default function GPRacingArena() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { currency } = useGPCurrency();
  const { cars: userCars, createCar } = useUserCars();
  const { races: userRaces } = useGPRaces();
  const joinRace = useJoinGPRace();
  const upgradeCar = useUpgradeCar();
  const purchaseColor = usePurchaseCarColor();
  
  const cars = user ? userCars : [];
  const races = user ? userRaces : demoRaces;
  
  const [activeView, setActiveView] = useState("hub");
  const [showBuyCar, setShowBuyCar] = useState(false);
  const [showJoinRace, setShowJoinRace] = useState(false);
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [selectedCarForRace, setSelectedCarForRace] = useState("");
  const [raceStrategy, setRaceStrategy] = useState("balanced");
  const [carName, setCarName] = useState("");
  const [carTeam, setCarTeam] = useState("Custom Racing");
  const [carColor, setCarColor] = useState("#00e5ff");
  const [showShop, setShowShop] = useState(false);
  const [selectedCarForShop, setSelectedCarForShop] = useState("");
  const [shopColor, setShopColor] = useState("#00e5ff");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    if (paymentStatus === "success") {
      toast.success("Purchase successful! Your resources will be added shortly.");
      setTimeout(() => { queryClient.invalidateQueries({ queryKey: ["f1-currency"] }); }, 2000);
      window.history.replaceState({}, "", "/gp-racing");
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled");
      window.history.replaceState({}, "", "/gp-racing");
    }
  }, [queryClient]);

  const requireAuth = (action: () => void) => {
    if (!user) { navigate('/auth'); return; }
    action();
  };

  const handleBuyCar = () => {
    if (!carName) { toast.error("Please enter a car name"); return; }
    createCar.mutate({ name: carName, team: carTeam, color: carColor, costCoins: 75 }, {
      onSuccess: () => { setShowBuyCar(false); setCarName(""); }
    });
  };

  const handleJoinRace = (raceId: string) => { setSelectedRace(raceId); setShowJoinRace(true); };

  const handleConfirmJoinRace = () => {
    if (!selectedCarForRace || !selectedRace) { toast.error("Please select a car"); return; }
    joinRace.mutate({ raceId: selectedRace, carId: selectedCarForRace, strategy: raceStrategy }, {
      onSuccess: () => { setShowJoinRace(false); setSelectedCarForRace(""); setRaceStrategy("balanced"); }
    });
  };

  const handleUpgradeCar = (carId: string, statType: 'engine' | 'aero' | 'tires' | 'handling') => {
    upgradeCar.mutate({ carId, statType });
  };

  const handlePurchaseColor = () => {
    if (!selectedCarForShop) { toast.error("Please select a car"); return; }
    purchaseColor.mutate({ carId: selectedCarForShop, newColor: shopColor }, {
      onSuccess: () => { setShowShop(false); setSelectedCarForShop(""); }
    });
  };

  const activeRace = races?.find(r => r.id === selectedRace);

  // Tool views
  if (activeView === "replay") return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        <RaceReplayViewer onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );
  if (activeView === "paint") return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        <CarPaintStudio onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );
  if (activeView === "weather") return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        <WeatherSystem onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );
  if (activeView === "pit") return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        <PitStrategyPlanner onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );
  if (activeView === "championship") return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        <SeasonalChampionship onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );
  if (activeView === "teams") return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        <TeamRacing onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );
  if (activeView === "telemetry") return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        <Telemetry onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );
  if (activeView === "betting") return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        <BettingSystem onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );
  if (activeView === "achievements") return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        <AchievementSystem onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );
  if (activeView === "track-editor") return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        <TrackEditor onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <FloatingHowItWorks title="GPRacingArena — How it works" steps={[{title:"Open this section",desc:"Access GPRacingArena from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
      {/* Animated background particles */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute w-0.5 h-0.5 bg-cyan-400/40 rounded-full animate-pulse"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 3}s` }} />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 p-4 sm:p-6 pt-20 sm:pt-24 pb-28 md:pb-8">
        {/* Cinematic Video Hero */}
        <GPRacingHero onNavigate={(view) => setActiveView(view === "garage" ? "hub" : view)} />
        <HeroRewardedAd sectionKey="page_f1racingarena" />


        {/* Live Ticker */}
        <GPRacingLiveTicker />

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {toolCards.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ scale: 1.03, y: -2 }}
              onClick={() => setActiveView(tool.id)}
              className={`cursor-pointer p-4 rounded-xl bg-gradient-to-b ${tool.gradient} border ${tool.border} backdrop-blur-sm transition-all group`}
            >
              <tool.icon className={`h-6 w-6 ${tool.color} mb-2 group-hover:scale-110 transition-transform`} />
              <h3 className="font-mono font-bold text-sm text-white">{tool.name}</h3>
              <p className="text-[10px] font-mono text-cyan-400/40 mt-1">{tool.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Currency Display */}
        <GPCurrencyDisplay />

        {/* Main Tabs */}
        <Tabs defaultValue="garage" className="w-full">
          <TabsList className="flex w-full overflow-x-auto bg-slate-900/60 border border-cyan-500/20 backdrop-blur-sm rounded-xl p-1 gap-1">
            {[
              { value: "garage", label: "Hangar", icon: <Car className="h-3.5 w-3.5" /> },
              { value: "racing", label: "Races", icon: <Rocket className="h-3.5 w-3.5" /> },
              { value: "upgrades", label: "Upgrades", icon: <Wrench className="h-3.5 w-3.5" /> },
              { value: "shop", label: "Shop", icon: <ShoppingCart className="h-3.5 w-3.5" /> },
              { value: "leaderboard", label: "Rankings", icon: <Trophy className="h-3.5 w-3.5" /> },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="flex-1 min-w-fit text-xs sm:text-sm font-mono uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 text-cyan-400/60 rounded-lg transition-all flex items-center gap-1.5">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* GARAGE TAB */}
          <TabsContent value="garage" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-wider">Your Cars</h2>
                <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Racing Machines</p>
              </div>
              <Button onClick={() => requireAuth(() => setShowBuyCar(true))}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/30 shadow-lg shadow-cyan-500/20 font-mono uppercase tracking-wider text-xs">
                <Zap className="mr-2 h-4 w-4" /> Buy Car (75 Coins)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars?.map((car, index) => (
                <motion.div key={car.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="relative overflow-hidden bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm group hover:border-cyan-400/40 transition-all duration-300">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-mono font-bold text-lg text-white">{car.name}</h3>
                          <p className="text-xs font-mono text-cyan-400/50">{car.team}</p>
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                            <Shield className="h-3 w-3 text-cyan-400" />
                            <span className="text-[10px] font-mono text-cyan-300 uppercase">Level {car.level}</span>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-14 h-14 rounded-xl border-2 border-cyan-500/30" style={{ backgroundColor: car.color }} />
                          <div className="absolute -inset-1 rounded-xl blur-md opacity-30" style={{ backgroundColor: car.color }} />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {[
                          { label: "Engine", value: car.engine_stat, icon: <Flame className="h-3.5 w-3.5 text-orange-400" />, color: "bg-orange-500" },
                          { label: "Aero", value: car.aero_stat, icon: <Wind className="h-3.5 w-3.5 text-blue-400" />, color: "bg-blue-500" },
                          { label: "Tires", value: car.tires_stat, icon: <CircleDot className="h-3.5 w-3.5 text-green-400" />, color: "bg-green-500" },
                          { label: "Handling", value: car.handling_stat, icon: <Compass className="h-3.5 w-3.5 text-violet-400" />, color: "bg-violet-500" },
                        ].map(stat => (
                          <div key={stat.label} className="flex items-center gap-2">
                            {stat.icon}
                            <span className="text-xs font-mono text-cyan-400/60 w-16">{stat.label}</span>
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${stat.value}%` }} transition={{ duration: 1, delay: 0.3 }}
                                className={`h-full ${stat.color} rounded-full`} />
                            </div>
                            <span className="text-xs font-mono font-bold text-white w-8 text-right">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-cyan-500/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-wider">
                          Races: {car.total_races} • Wins: {car.total_wins}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-[10px] font-mono text-cyan-400/60">Active</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {!user && (
              <Card className="p-8 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm text-center">
                <Car className="h-12 w-12 mx-auto mb-4 text-cyan-400/30" />
                <p className="text-cyan-300/60 font-mono mb-4">Sign in to buy your first racing car</p>
                <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/30 font-mono uppercase tracking-wider text-xs">
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* RACING TAB */}
          <TabsContent value="racing" className="space-y-4 mt-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-wider">Race Circuits</h2>
              <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Available Races</p>
            </div>
            
            {selectedRace && activeRace ? (
              <div className="space-y-4">
                <Button variant="outline" onClick={() => setSelectedRace(null)} className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/30 font-mono text-xs uppercase tracking-wider">
                  ← Back to Races
                </Button>
                <div className="h-[400px] rounded-xl overflow-hidden border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                  <RaceTrack3D participants={activeRace.f1_race_participants || []} isRacing={activeRace.status === "running"} />
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/30 shadow-lg shadow-cyan-500/20 font-mono uppercase tracking-wider py-6 text-base"
                  onClick={() => requireAuth(async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke("calculate-f1-race-results", { body: { raceId: selectedRace } });
                      if (error) throw error;
                      if (data?.results) {
                        const winner = data.results[0];
                        toast.success(`Race complete! Victor: ${winner.carName}${winner.prize > 0 ? ` — Reward: ${winner.prize} coins` : ""} 🏆`);
                      }
                    } catch (error) {
                      console.error("Error calculating results:", error);
                      toast.error("Error calculating race results");
                    }
                    queryClient.invalidateQueries({ queryKey: ["active-f1-races"] });
                    queryClient.invalidateQueries({ queryKey: ["user-f1-cars"] });
                    queryClient.invalidateQueries({ queryKey: ["f1-currency"] });
                    setSelectedRace(null);
                  })}>
                  <Flame className="mr-2 h-5 w-5" /> Start Race
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {races?.map((race, index) => (
                  <motion.div key={race.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="relative overflow-hidden bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm group hover:border-cyan-400/40 transition-all duration-300">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-mono font-bold text-base text-white">{race.track_name}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/15 text-[10px] font-mono text-cyan-300 uppercase">
                              <Target className="h-3 w-3" /> {race.distance}m
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/15 text-[10px] font-mono text-amber-300 uppercase">
                              Entry: {race.entry_fee_coins}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            <span className="text-[10px] font-mono text-cyan-400/40 uppercase">
                              Drivers: {race.f1_race_participants?.length || 0}/{race.max_participants}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-400/40 uppercase">
                              • {race.weather} • {race.track_condition}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => setSelectedRace(race.id)} variant="outline"
                            className="flex-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/30 font-mono text-xs uppercase tracking-wider">
                            Scan
                          </Button>
                          <Button onClick={() => requireAuth(() => handleJoinRace(race.id))}
                            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/20 font-mono text-xs uppercase tracking-wider">
                            Join Race
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* UPGRADES TAB */}
          <TabsContent value="upgrades" className="space-y-4 mt-4">
            <Card className="relative overflow-hidden bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-mono font-bold mb-1 text-white uppercase tracking-wider">Car Upgrades</h2>
                <p className="text-cyan-400/50 font-mono text-xs mb-6 uppercase tracking-wider">Upgrade car components — 25 Coins per upgrade</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cars?.map((car) => (
                    <Card key={car.id} className="p-4 bg-slate-950/50 border-cyan-500/15 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-mono font-bold text-base text-white">{car.name}</h3>
                          <span className="text-[10px] font-mono text-cyan-400/40 uppercase">Level {car.level}</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg border border-cyan-500/30" style={{ backgroundColor: car.color }} />
                      </div>
                      <div className="space-y-3 mb-4">
                        {[
                          { key: "engine" as const, label: "Engine", value: car.engine_stat, icon: <Flame className="h-3.5 w-3.5 text-orange-400" />, color: "bg-orange-500" },
                          { key: "aero" as const, label: "Aero", value: car.aero_stat, icon: <Wind className="h-3.5 w-3.5 text-blue-400" />, color: "bg-blue-500" },
                          { key: "tires" as const, label: "Tires", value: car.tires_stat, icon: <CircleDot className="h-3.5 w-3.5 text-green-400" />, color: "bg-green-500" },
                          { key: "handling" as const, label: "Handling", value: car.handling_stat, icon: <Compass className="h-3.5 w-3.5 text-violet-400" />, color: "bg-violet-500" },
                        ].map(stat => (
                          <div key={stat.key} className="flex items-center gap-2">
                            {stat.icon}
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${stat.color} rounded-full transition-all`} style={{ width: `${stat.value}%` }} />
                            </div>
                            <span className="text-xs font-mono text-white w-10 text-right">{stat.value}/100</span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(["engine", "aero", "tires", "handling"] as const).map(statType => (
                          <Button key={statType} size="sm"
                            onClick={() => requireAuth(() => handleUpgradeCar(car.id, statType))}
                            disabled={upgradeCar.isPending || car[`${statType}_stat`] >= 100}
                            className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/20 text-cyan-300 font-mono text-[10px] uppercase tracking-wider">
                            {statIcons[statType]}
                            <span className="ml-1">{statType}</span>
                          </Button>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* SHOP TAB */}
          <TabsContent value="shop" className="space-y-4 mt-4">
            <Card className="relative overflow-hidden bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-mono font-bold mb-1 text-white uppercase tracking-wider">Parts & Tech Shop</h2>
                <p className="text-cyan-400/50 font-mono text-xs mb-6 uppercase tracking-wider">Buy performance parts to dominate races</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { emoji: "🔥", name: "Turbo Engine V8", desc: "+15 Engine Power", price: "150 Coins", tier: "standard" },
                    { emoji: "⚡", name: "Hybrid Power Unit", desc: "+20 Engine, +5 Efficiency", price: "250 Coins", tier: "standard" },
                    { emoji: "💎", name: "Nuclear Fusion Core", desc: "+30 Engine Power", price: "100 Gems", tier: "premium" },
                    { emoji: "🌬️", name: "Carbon Fiber Wing", desc: "+10 Aerodynamics", price: "100 Coins", tier: "standard" },
                    { emoji: "🛸", name: "DRS+ System", desc: "+18 Aero, +5 Speed", price: "200 Coins", tier: "standard" },
                    { emoji: "🚀", name: "Active Aero Kit", desc: "+25 Aerodynamics", price: "80 Gems", tier: "premium" },
                    { emoji: "🛞", name: "Soft Compound Tires", desc: "+12 Grip, +8 Handling", price: "120 Coins", tier: "standard" },
                    { emoji: "🏁", name: "Slick Racing Tires", desc: "+20 Grip", price: "180 Coins", tier: "standard" },
                    { emoji: "✨", name: "Quantum Grip Tires", desc: "+30 Grip, +15 Handling", price: "120 Gems", tier: "premium" },
                    { emoji: "🎯", name: "Precision Steering", desc: "+15 Handling", price: "130 Coins", tier: "standard" },
                    { emoji: "⚙️", name: "Advanced Suspension", desc: "+18 Handling, +8 Stability", price: "200 Coins", tier: "standard" },
                    { emoji: "🤖", name: "AI Assist System", desc: "+25 Handling, Auto-correct", price: "90 Gems", tier: "premium" },
                  ].map((item, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${
                        item.tier === "premium" 
                          ? "bg-gradient-to-b from-violet-950/40 to-slate-950/60 border-violet-500/30 hover:border-violet-400/50" 
                          : "bg-slate-950/40 border-cyan-500/15 hover:border-cyan-400/30"
                      }`}>
                      <div className="text-2xl mb-2">{item.emoji}</div>
                      <h3 className="font-mono font-bold text-sm text-white">{item.name}</h3>
                      <p className="text-[10px] font-mono text-cyan-400/50 mt-1">{item.desc}</p>
                      <p className={`font-mono font-bold text-sm mt-2 ${item.tier === "premium" ? "text-violet-400" : "text-amber-400"}`}>{item.price}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Legendary */}
                <div className="mt-6 pt-6 border-t border-cyan-500/10">
                  <h3 className="text-lg font-mono font-bold text-amber-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Legendary Tech
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { emoji: "🏆", name: "Champion's Nitro Boost", desc: "+10% Race Speed", price: "300 Coins", gradient: "from-amber-950/40 to-orange-950/30", border: "border-amber-500/30" },
                      { emoji: "❄️", name: "Cryo Cooling System", desc: "Anti-overheat, +5 All", price: "350 Coins", gradient: "from-blue-950/40 to-cyan-950/30", border: "border-blue-500/30" },
                      { emoji: "⭐", name: "Legendary Engine Swap", desc: "+50 All Stats", price: "500 Gems", gradient: "from-violet-950/40 to-purple-950/30", border: "border-violet-400/40" },
                    ].map((item, i) => (
                      <motion.div key={i} whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-xl bg-gradient-to-b ${item.gradient} border ${item.border} backdrop-blur-sm`}>
                        <div className="text-2xl mb-2">{item.emoji}</div>
                        <h3 className="font-mono font-bold text-sm text-white">{item.name}</h3>
                        <p className="text-[10px] font-mono text-cyan-400/50 mt-1">{item.desc}</p>
                        <p className="font-mono font-bold text-sm mt-2 text-amber-400">{item.price}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Mystery Crates */}
                <div className="mt-6 pt-6 border-t border-cyan-500/10">
                  <h3 className="text-lg font-mono font-bold text-cyan-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Box className="h-4 w-4" /> Mystery Crates
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { name: "Bronze", desc: "+5-15 stats", price: "50 Coins", gradient: "from-amber-900/30 to-amber-950/30", border: "border-amber-500/20" },
                      { name: "Silver", desc: "+10-25 stats", price: "100 Coins", gradient: "from-gray-700/30 to-gray-900/30", border: "border-gray-400/20" },
                      { name: "Gold", desc: "+20-40 stats", price: "200 Coins", gradient: "from-yellow-900/30 to-amber-950/30", border: "border-yellow-500/30" },
                      { name: "Diamond", desc: "+30-60 stats", price: "50 Gems", gradient: "from-blue-900/30 to-violet-950/30", border: "border-blue-400/30" },
                      { name: "Legendary", desc: "+100 All + Skin", price: "300 Gems", gradient: "from-amber-600/20 via-orange-600/20 to-red-600/20", border: "border-amber-300/40", special: true },
                    ].map((box, i) => (
                      <motion.div key={i} whileHover={{ scale: 1.03 }}
                        className={`p-3 rounded-xl bg-gradient-to-b ${box.gradient} border ${box.border} text-center backdrop-blur-sm ${box.special ? "animate-pulse" : ""}`}>
                        <div className="text-xl mb-1">{box.special ? "👑" : ["📦", "🎁", "✨", "💎"][i]}</div>
                        <h4 className="font-mono font-bold text-xs text-white">{box.name}</h4>
                        <p className="text-[9px] font-mono text-cyan-400/40 mt-0.5">{box.desc}</p>
                        <p className="text-[10px] font-mono font-bold text-amber-400 mt-1">{box.price}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Livery */}
                <div className="mt-6 pt-6 border-t border-cyan-500/10">
                  <h3 className="text-lg font-mono font-bold text-cyan-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Livery Customization
                  </h3>
                  <Button onClick={() => requireAuth(() => setShowShop(true))} disabled={!cars || cars.length === 0}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 border border-violet-400/30 font-mono uppercase tracking-wider text-xs">
                    <Sparkles className="mr-2 h-4 w-4" /> Change Car Livery (50 Gems)
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* LEADERBOARD TAB */}
          <TabsContent value="leaderboard" className="space-y-4 mt-4">
            <Card className="relative overflow-hidden bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm p-4 sm:p-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
              <GPLeaderboard />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <Dialog open={showBuyCar} onOpenChange={setShowBuyCar}>
        <DialogContent className="bg-slate-950/95 border-cyan-500/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Car className="h-5 w-5 text-cyan-400" /> Buy New Car
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Car Name</Label>
              <Input value={carName} onChange={(e) => setCarName(e.target.value)} placeholder="Enter car name..."
                className="bg-slate-900/50 border-cyan-500/30 text-white font-mono placeholder:text-cyan-400/30" />
            </div>
            <div>
              <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Team</Label>
              <Select value={carTeam} onValueChange={setCarTeam}>
                <SelectTrigger className="bg-slate-900/50 border-cyan-500/30 text-white font-mono"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-950 border-cyan-500/30">
                  <SelectItem value="Custom Racing">Custom Racing</SelectItem>
                  <SelectItem value="Speed Demons">Speed Demons</SelectItem>
                  <SelectItem value="Thunder Racing">Thunder Racing</SelectItem>
                  <SelectItem value="Phoenix Team">Phoenix Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Car Color</Label>
              <Input type="color" value={carColor} onChange={(e) => setCarColor(e.target.value)} className="h-12 bg-slate-900/50 border-cyan-500/30" />
            </div>
            <Button onClick={handleBuyCar} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/20 font-mono uppercase tracking-wider" disabled={createCar.isPending}>
              {createCar.isPending ? "Building..." : "Buy Car (75 Coins)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinRace} onOpenChange={setShowJoinRace}>
        <DialogContent className="bg-slate-950/95 border-cyan-500/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Car className="h-5 w-5 text-cyan-400" /> Join Race
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Select Car</Label>
              <Select value={selectedCarForRace} onValueChange={setSelectedCarForRace}>
                <SelectTrigger className="bg-slate-900/50 border-cyan-500/30 text-white font-mono"><SelectValue placeholder="Choose car..." /></SelectTrigger>
                <SelectContent className="bg-slate-950 border-cyan-500/30">
                  {cars?.map(car => <SelectItem key={car.id} value={car.id}>{car.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Race Strategy</Label>
              <Select value={raceStrategy} onValueChange={setRaceStrategy}>
                <SelectTrigger className="bg-slate-900/50 border-cyan-500/30 text-white font-mono"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-950 border-cyan-500/30">
                  <SelectItem value="aggressive">Aggressive — Max Speed</SelectItem>
                  <SelectItem value="balanced">Balanced — Optimal</SelectItem>
                  <SelectItem value="safe">Conservative — Steady</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleConfirmJoinRace} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/20 font-mono uppercase tracking-wider" disabled={joinRace.isPending}>
              {joinRace.isPending ? "Joining..." : "Join Race"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showShop} onOpenChange={setShowShop}>
        <DialogContent className="bg-slate-950/95 border-cyan-500/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" /> Livery Bay
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Select Car</Label>
              <Select value={selectedCarForShop} onValueChange={setSelectedCarForShop}>
                <SelectTrigger className="bg-slate-900/50 border-cyan-500/30 text-white font-mono"><SelectValue placeholder="Choose car..." /></SelectTrigger>
                <SelectContent className="bg-slate-950 border-cyan-500/30">
                  {cars?.map(car => <SelectItem key={car.id} value={car.id}>{car.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">New Car Color</Label>
              <Input type="color" value={shopColor} onChange={(e) => setShopColor(e.target.value)} className="h-12 bg-slate-900/50 border-cyan-500/30" />
            </div>
            <Button onClick={handlePurchaseColor} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 border border-violet-400/20 font-mono uppercase tracking-wider" disabled={purchaseColor.isPending}>
              {purchaseColor.isPending ? "Applying..." : "Apply Livery (50 Gems)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
