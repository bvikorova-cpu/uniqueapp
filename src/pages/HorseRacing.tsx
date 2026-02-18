import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HorseCurrencyDisplay } from "@/components/horse-racing/HorseCurrencyDisplay";
import { HorseLeaderboard } from "@/components/horse-racing/HorseLeaderboard";
import { HorseMarketplace } from "@/components/horse-racing/HorseMarketplace";
import { HorseShop } from "@/components/horse-racing/HorseShop";
import { useUserHorses, useRaces, useJoinRace, useTrainHorse, useBreedHorses, usePurchaseHorseColor } from "@/hooks/useHorseRacing";
import { RaceTrack3D } from "@/components/horse-racing/RaceTrack3D";
import { Trophy, Dumbbell, Heart, Sparkles, Zap, TrendingUp, ShoppingCart, Info, Rocket, Shield, Target, LogIn } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import horseHeroBg from "@/assets/horse-racing-hero.jpg";

export default function HorseRacing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { horses, createHorse } = useUserHorses();
  const { races } = useRaces();
  const joinRace = useJoinRace();
  const trainHorse = useTrainHorse();
  const breedHorses = useBreedHorses();
  const purchaseColor = usePurchaseHorseColor();
  
  const [showBuyHorse, setShowBuyHorse] = useState(false);
  const [showJoinRace, setShowJoinRace] = useState(false);
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [selectedHorseForRace, setSelectedHorseForRace] = useState("");
  const [raceStrategy, setRaceStrategy] = useState("balanced");
  const [horseName, setHorseName] = useState("");
  const [horseBreed, setHorseBreed] = useState("thoroughbred");
  const [horseColor, setHorseColor] = useState("#8B4513");
  
  const [showBreeding, setShowBreeding] = useState(false);
  const [breedingParent1, setBreedingParent1] = useState("");
  const [breedingParent2, setBreedingParent2] = useState("");
  
  const [showShop, setShowShop] = useState(false);
  const [selectedHorseForShop, setSelectedHorseForShop] = useState("");
  const [shopColor, setShopColor] = useState("#8B4513");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      toast.success("Purchase successful! Your coins/gems will be added shortly.");
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      }, 2000);
      window.history.replaceState({}, "", "/horse-racing");
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled");
      window.history.replaceState({}, "", "/horse-racing");
    }
  }, [queryClient]);

  const requireAuth = (action: () => void) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    action();
  };

  const handleBuyHorse = () => {
    if (!horseName) {
      toast.error("Please enter a horse name");
      return;
    }
    
    createHorse.mutate({
      name: horseName,
      breed: horseBreed,
      color: horseColor,
      costCoins: 50,
    }, {
      onSuccess: () => {
        setShowBuyHorse(false);
        setHorseName("");
      },
      onError: (error: Error) => {
        toast.error(`Failed to buy horse: ${error.message}`);
      }
    });
  };

  const handleJoinRace = (raceId: string) => {
    setSelectedRace(raceId);
    setShowJoinRace(true);
  };

  const handleConfirmJoinRace = () => {
    if (!selectedHorseForRace || !selectedRace) {
      toast.error("Please select a horse");
      return;
    }

    joinRace.mutate({
      raceId: selectedRace,
      horseId: selectedHorseForRace,
      strategy: raceStrategy,
    }, {
      onSuccess: () => {
        setShowJoinRace(false);
        setSelectedHorseForRace("");
        setRaceStrategy("balanced");
      }
    });
  };

  const handleTrainHorse = (horseId: string, statType: 'speed' | 'stamina' | 'acceleration' | 'temperament') => {
    trainHorse.mutate({ horseId, statType });
  };

  const handleBreedHorses = () => {
    if (!breedingParent1 || !breedingParent2) {
      toast.error("Please select two horses");
      return;
    }
    if (breedingParent1 === breedingParent2) {
      toast.error("Please select different horses");
      return;
    }

    breedHorses.mutate({
      parent1Id: breedingParent1,
      parent2Id: breedingParent2,
    }, {
      onSuccess: () => {
        setShowBreeding(false);
        setBreedingParent1("");
        setBreedingParent2("");
      }
    });
  };

  const handlePurchaseColor = () => {
    if (!selectedHorseForShop) {
      toast.error("Please select a horse");
      return;
    }

    purchaseColor.mutate({
      horseId: selectedHorseForShop,
      newColor: shopColor,
    }, {
      onSuccess: () => {
        setShowShop(false);
        setSelectedHorseForShop("");
      }
    });
  };

  const activeRace = races?.find(r => r.id === selectedRace);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${horseHeroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950" />
        {/* Floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-emerald-400/40 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 p-4 sm:p-6 pt-20 sm:pt-24">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-8 bg-emerald-400 rounded-full" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-400/60">Stable Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white font-mono tracking-tight">
              Horse <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">Racing Arena</span>
            </h1>
            <p className="text-emerald-400/50 mt-1 font-mono text-xs sm:text-sm tracking-wider">
              Breed • Train • Dominate the Track
            </p>
          </div>
          {!user && (
            <motion.div whileHover={{ scale: 1.02 }}>
              <Button 
                onClick={() => navigate('/auth')} 
                className="bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white border border-emerald-400/30 shadow-lg shadow-emerald-500/20 font-mono uppercase tracking-wider"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden bg-slate-900/60 border-emerald-500/20 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="relative shrink-0 mt-1">
                  <Info className="h-5 w-5 text-emerald-400" />
                  <div className="absolute -inset-2 bg-emerald-400/10 rounded-full blur-md" />
                </div>
                <div className="space-y-3 text-sm">
                  <h3 className="font-mono font-bold text-emerald-300 uppercase tracking-wider text-base">How to Play</h3>
                  <p className="text-emerald-100/60 leading-relaxed">
                    Welcome, Trainer. Build your stable of elite horses, train champions, breed legendary bloodlines, and compete in races.
                    Climb the rankings to become the ultimate Horse Racing Champion.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/10">
                      <h4 className="font-mono font-semibold text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-2">
                        <Rocket className="h-3.5 w-3.5" /> Quick Start Guide
                      </h4>
                      <ul className="text-emerald-100/50 space-y-1.5 text-xs font-mono">
                        <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400">1</span> Buy currency (Coins & Gems)</li>
                        <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400">2</span> Acquire your first horse (50 Coins)</li>
                        <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400">3</span> Train stats & join races</li>
                        <li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400">4</span> Breed, upgrade & climb ranks</li>
                      </ul>
                    </div>
                    <div className="space-y-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/10">
                      <h4 className="font-mono font-semibold text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-2">
                        <Target className="h-3.5 w-3.5" /> Horse Stats
                      </h4>
                      <ul className="text-emerald-100/50 space-y-1.5 text-xs font-mono">
                        <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-yellow-400" /> Speed & burst power</li>
                        <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-blue-400" /> Stamina & endurance</li>
                        <li className="flex items-center gap-2"><Rocket className="h-3 w-3 text-orange-400" /> Acceleration & response</li>
                        <li className="flex items-center gap-2"><Heart className="h-3 w-3 text-pink-400" /> Temperament & composure</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-amber-950/20 border border-amber-500/10">
                    <p className="text-xs font-mono text-amber-300/60">
                      <strong className="text-amber-300">⚖️ Legal Notice:</strong> Skill-based racing • Legal virtual economy • No gambling • Virtual currency cannot be exchanged for real money
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Currency Display */}
        <HorseCurrencyDisplay />

        {/* Main Tabs */}
        <Tabs defaultValue="stable" className="w-full">
          <TabsList className="flex w-full overflow-x-auto bg-slate-900/60 border border-emerald-500/20 backdrop-blur-sm rounded-xl p-1 gap-1">
            {[
              { value: "stable", label: "My Stable", icon: <Zap className="h-3.5 w-3.5" /> },
              { value: "racing", label: "Racing", icon: <Trophy className="h-3.5 w-3.5" /> },
              { value: "training", label: "Training", icon: <Dumbbell className="h-3.5 w-3.5" /> },
              { value: "breeding", label: "Breeding", icon: <Heart className="h-3.5 w-3.5" /> },
              { value: "shop", label: "Shop", icon: <Sparkles className="h-3.5 w-3.5" /> },
              { value: "leaderboard", label: "Rankings", icon: <TrendingUp className="h-3.5 w-3.5" /> },
              { value: "marketplace", label: "Market", icon: <ShoppingCart className="h-3.5 w-3.5" /> },
            ].map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="flex-1 min-w-fit text-xs sm:text-sm font-mono uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 text-emerald-400/60 rounded-lg transition-all flex items-center gap-1.5"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* STABLE TAB */}
          <TabsContent value="stable" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-wider">Your Horses</h2>
                <p className="text-[10px] font-mono text-emerald-400/40 uppercase tracking-[0.3em]">Champion Stable</p>
              </div>
              <Button 
                onClick={() => requireAuth(() => setShowBuyHorse(true))} 
                className="bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 border border-emerald-400/30 shadow-lg shadow-emerald-500/20 font-mono uppercase tracking-wider text-xs"
              >
                <Zap className="mr-2 h-4 w-4" />
                Buy Horse (50 Coins)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {horses?.map((horse, index) => (
                <motion.div
                  key={horse.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden bg-slate-900/60 border-emerald-500/20 backdrop-blur-sm p-4 group hover:border-emerald-400/40 transition-all duration-300">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative flex items-start justify-between">
                      <div>
                        <h3 className="font-mono font-bold text-white text-lg">{horse.name}</h3>
                        <p className="text-xs text-emerald-400/50 font-mono capitalize">{horse.breed}</p>
                        <p className="text-[10px] text-amber-400/60 font-mono mt-0.5">Level {horse.level}</p>
                      </div>
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-white/20"
                          style={{ backgroundColor: horse.color }}
                        />
                        <div 
                          className="absolute -inset-1 rounded-xl blur-md opacity-40"
                          style={{ backgroundColor: horse.color }}
                        />
                      </div>
                    </div>

                    <div className="relative mt-4 space-y-2">
                      {[
                        { label: "Speed", value: horse.speed_stat, color: "text-yellow-400" },
                        { label: "Stamina", value: horse.stamina_stat, color: "text-blue-400" },
                        { label: "Acceleration", value: horse.acceleration_stat, color: "text-orange-400" },
                      ].map(stat => (
                        <div key={stat.label} className="flex justify-between text-sm font-mono">
                          <span className="text-emerald-100/50 text-xs">{stat.label}</span>
                          <span className={`font-bold text-xs ${stat.color}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="relative mt-4 pt-3 border-t border-emerald-500/10">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono text-emerald-400/40">
                          Races: {horse.total_races} • Wins: {horse.total_wins}
                        </p>
                        {horse.total_wins > 0 && (
                          <Trophy className="h-3.5 w-3.5 text-amber-400" />
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {(!horses || horses.length === 0) && (
                <div className="col-span-full text-center py-12">
                  <Zap className="w-16 h-16 mx-auto mb-4 text-emerald-500/30" />
                  <p className="text-emerald-400/50 font-mono uppercase tracking-wider text-sm">No horses yet</p>
                  <p className="text-emerald-400/30 text-xs mt-2 font-mono">Buy your first horse to start racing</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* RACING TAB */}
          <TabsContent value="racing" className="space-y-4 mt-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-wider">Racing Arena</h2>
              <p className="text-[10px] font-mono text-emerald-400/40 uppercase tracking-[0.3em]">Active Circuits</p>
            </div>
            
            {selectedRace && activeRace ? (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRace(null)}
                  className="bg-slate-900/60 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/40 font-mono"
                >
                  Back to Races
                </Button>
                
                <RaceTrack3D
                  participants={activeRace.race_participants.map((p: any) => ({
                    id: p.id,
                    horse: p.horses,
                    position: p.position || 0,
                    progress: 0,
                  }))}
                  isRaceActive={activeRace.status === "running"}
                  onRaceComplete={async (results) => {
                    console.log("Race complete:", results);
                    
                    try {
                      const { data, error } = await supabase.functions.invoke(
                        "calculate-race-results",
                        {
                          body: { raceId: selectedRace },
                        }
                      );

                      if (error) throw error;

                      if (data?.results) {
                        const winner = data.results[0];
                        toast.success(
                          `Race finished! Winner: ${winner.horseName}${
                            winner.prize > 0 ? ` - Prize: ${winner.prize} coins` : ""
                          }`
                        );
                      }
                    } catch (error) {
                      console.error("Error calculating results:", error);
                      toast.error("Error calculating race results");
                    }
                    
                    queryClient.invalidateQueries({ queryKey: ["active-races"] });
                    queryClient.invalidateQueries({ queryKey: ["user-horses"] });
                    queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
                    setSelectedRace(null);
                  }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {races?.map((race, index) => (
                  <motion.div
                    key={race.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="relative overflow-hidden bg-slate-900/60 border-emerald-500/20 backdrop-blur-sm p-4 sm:p-6 group hover:border-emerald-400/40 transition-all duration-300">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="font-mono font-bold text-white">{race.track_name}</h3>
                          <p className="text-xs text-emerald-400/50 font-mono">
                            Distance: {race.distance}m • Entry: {race.entry_fee_coins} Coins
                          </p>
                          <p className="text-xs text-emerald-400/40 font-mono">
                            Participants: {race.race_participants?.length || 0}/{race.max_participants}
                          </p>
                          <p className="text-[10px] text-amber-400/40 font-mono capitalize mt-1">
                            Weather: {race.weather} • Track: {race.track_condition}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setSelectedRace(race.id)}
                            className="bg-emerald-900/40 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-800/40 font-mono text-xs"
                            variant="outline"
                          >
                            View Race
                          </Button>
                          <Button 
                            onClick={() => requireAuth(() => handleJoinRace(race.id))}
                            className="bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-mono text-xs"
                          >
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

          {/* TRAINING TAB */}
          <TabsContent value="training" className="space-y-4 mt-4">
            <Card className="relative overflow-hidden bg-slate-900/60 border-emerald-500/20 backdrop-blur-sm p-4 sm:p-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-wider mb-1">Training Facility</h2>
              <p className="text-xs font-mono text-emerald-400/50 mb-6">Train your horses to improve their stats! (20 Coins per session)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {horses?.map((horse, index) => (
                  <motion.div
                    key={horse.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden bg-slate-800/40 border-emerald-500/10 p-4 group hover:border-emerald-400/30 transition-all">
                      <h3 className="font-mono font-bold text-white mb-1">{horse.name}</h3>
                      <p className="text-[10px] text-amber-400/50 font-mono mb-3">Level {horse.level}</p>
                      
                      <div className="space-y-2 mb-4">
                        {[
                          { label: "Speed", value: horse.speed_stat, max: 100 },
                          { label: "Stamina", value: horse.stamina_stat, max: 100 },
                          { label: "Acceleration", value: horse.acceleration_stat, max: 100 },
                          { label: "Temperament", value: horse.temperament_stat, max: 100 },
                        ].map(stat => (
                          <div key={stat.label}>
                            <div className="flex justify-between text-xs font-mono mb-1">
                              <span className="text-emerald-100/50">{stat.label}</span>
                              <span className="text-emerald-400">{stat.value}/{stat.max}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all"
                                style={{ width: `${stat.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {(["speed", "stamina", "acceleration", "temperament"] as const).map(stat => (
                          <Button
                            key={stat}
                            size="sm"
                            onClick={() => requireAuth(() => handleTrainHorse(horse.id, stat))}
                            disabled={trainHorse.isPending || horse[`${stat}_stat`] >= 100}
                            className="bg-emerald-900/40 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-800/40 font-mono text-[10px] uppercase"
                            variant="outline"
                          >
                            Train {stat.charAt(0).toUpperCase() + stat.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* BREEDING TAB */}
          <TabsContent value="breeding" className="space-y-4 mt-4">
            <Card className="relative overflow-hidden bg-slate-900/60 border-emerald-500/20 backdrop-blur-sm p-4 sm:p-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-wider mb-1">Breeding Center</h2>
              <p className="text-xs font-mono text-emerald-400/50 mb-6">Breed two horses to create offspring with combined traits! (100 Coins)</p>
              
              <Button 
                onClick={() => requireAuth(() => setShowBreeding(true))} 
                disabled={!horses || horses.length < 2}
                className="bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-mono uppercase tracking-wider text-xs"
              >
                <Heart className="mr-2 h-4 w-4" />
                Start Breeding
              </Button>

              {horses && horses.length < 2 && (
                <p className="text-xs text-emerald-400/40 mt-4 font-mono">
                  You need at least 2 horses to breed
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="shop" className="space-y-4 mt-4">
            <HorseShop />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4 mt-4">
            <HorseLeaderboard />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-4 mt-4">
            <HorseMarketplace />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs - keeping all business logic identical */}
      <Dialog open={showBuyHorse} onOpenChange={setShowBuyHorse}>
        <DialogContent className="bg-slate-900 border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="font-mono text-white">Buy New Horse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-emerald-400/70 font-mono text-xs">Horse Name</Label>
              <Input
                value={horseName}
                onChange={(e) => setHorseName(e.target.value)}
                placeholder="Enter horse name"
                className="bg-slate-800/60 border-emerald-500/20 text-white font-mono"
              />
            </div>
            <div>
              <Label className="text-emerald-400/70 font-mono text-xs">Breed</Label>
              <Select value={horseBreed} onValueChange={setHorseBreed}>
                <SelectTrigger className="bg-slate-800/60 border-emerald-500/20 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-emerald-500/20">
                  <SelectItem value="thoroughbred">Thoroughbred</SelectItem>
                  <SelectItem value="arabian">Arabian</SelectItem>
                  <SelectItem value="quarter">Quarter Horse</SelectItem>
                  <SelectItem value="mustang">Mustang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-emerald-400/70 font-mono text-xs">Color</Label>
              <div className="flex gap-2">
                {["#8B4513", "#000000", "#FFFFFF", "#808080", "#D2691E"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setHorseColor(color)}
                    className="w-10 h-10 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: horseColor === color ? "#10b981" : "rgba(255,255,255,0.1)",
                      boxShadow: horseColor === color ? "0 0 12px rgba(16,185,129,0.4)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>
            <Button 
              onClick={handleBuyHorse} 
              className="w-full bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-mono uppercase tracking-wider"
            >
              Buy Horse - 50 Coins
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinRace} onOpenChange={setShowJoinRace}>
        <DialogContent className="bg-slate-900 border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="font-mono text-white">Join Race</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-emerald-400/70 font-mono text-xs">Select Horse</Label>
              <Select value={selectedHorseForRace} onValueChange={setSelectedHorseForRace}>
                <SelectTrigger className="bg-slate-800/60 border-emerald-500/20 text-white font-mono">
                  <SelectValue placeholder="Choose a horse" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-emerald-500/20">
                  {horses?.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name} (Lvl {horse.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-emerald-400/70 font-mono text-xs">Race Strategy</Label>
              <Select value={raceStrategy} onValueChange={setRaceStrategy}>
                <SelectTrigger className="bg-slate-800/60 border-emerald-500/20 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-emerald-500/20">
                  <SelectItem value="aggressive">Aggressive - Early sprint</SelectItem>
                  <SelectItem value="balanced">Balanced - Steady pace</SelectItem>
                  <SelectItem value="conservative">Conservative - Save energy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleConfirmJoinRace} 
              className="w-full bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-mono uppercase tracking-wider" 
              disabled={joinRace.isPending}
            >
              Join Race
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBreeding} onOpenChange={setShowBreeding}>
        <DialogContent className="bg-slate-900 border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="font-mono text-white">Breed Horses</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-emerald-400/70 font-mono text-xs">Parent 1</Label>
              <Select value={breedingParent1} onValueChange={setBreedingParent1}>
                <SelectTrigger className="bg-slate-800/60 border-emerald-500/20 text-white font-mono">
                  <SelectValue placeholder="Select first parent" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-emerald-500/20">
                  {horses?.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name} - {horse.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-emerald-400/70 font-mono text-xs">Parent 2</Label>
              <Select value={breedingParent2} onValueChange={setBreedingParent2}>
                <SelectTrigger className="bg-slate-800/60 border-emerald-500/20 text-white font-mono">
                  <SelectValue placeholder="Select second parent" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-emerald-500/20">
                  {horses?.filter(h => h.id !== breedingParent1).map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name} - {horse.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleBreedHorses} 
              className="w-full bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-mono uppercase tracking-wider" 
              disabled={breedHorses.isPending}
            >
              Breed Horses - 100 Coins
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showShop} onOpenChange={setShowShop}>
        <DialogContent className="bg-slate-900 border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="font-mono text-white">Change Horse Color</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-emerald-400/70 font-mono text-xs">Select Horse</Label>
              <Select value={selectedHorseForShop} onValueChange={setSelectedHorseForShop}>
                <SelectTrigger className="bg-slate-800/60 border-emerald-500/20 text-white font-mono">
                  <SelectValue placeholder="Choose a horse" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-emerald-500/20">
                  {horses?.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-emerald-400/70 font-mono text-xs">New Color</Label>
              <div className="flex gap-2 flex-wrap">
                {["#8B4513", "#000000", "#FFFFFF", "#808080", "#D2691E", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#DDA15E"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setShopColor(color)}
                    className="w-10 h-10 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: shopColor === color ? "#10b981" : "rgba(255,255,255,0.1)",
                      boxShadow: shopColor === color ? "0 0 12px rgba(16,185,129,0.4)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>
            <Button 
              onClick={handlePurchaseColor} 
              className="w-full bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-mono uppercase tracking-wider" 
              disabled={purchaseColor.isPending}
            >
              {purchaseColor.isPending ? "Processing..." : "Change Color - 50 Gems"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
