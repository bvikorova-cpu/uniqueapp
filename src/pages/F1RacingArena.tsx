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
import { F1CurrencyDisplay } from "@/components/f1-racing/F1CurrencyDisplay";
import { F1Leaderboard } from "@/components/f1-racing/F1Leaderboard";
import { useUserCars, useF1Races, useJoinF1Race, useUpgradeCar, usePurchaseCarColor } from "@/hooks/useF1Racing";
import { Trophy, Wrench, Sparkles, Zap, TrendingUp, Car } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// 3D F1 Car Component
function F1Car3D({ position, color }: { position: [number, number, number]; color: string }) {
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
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        {/* Track */}
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 100]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        
        {/* Track lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i} position={[0, -0.48, -45 + i * 5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.3, 2]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
        
        {/* Barriers */}
        {[-8, 8].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.5, 1, 100]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        ))}
        
        {/* Cars */}
        {participants.map((p, i) => (
          <F1Car3D 
            key={p.id} 
            position={[-4 + i * 2.5, 0, isRacing ? -20 + Math.random() * 40 : 0]} 
            color={p.f1_cars?.color || "#e10600"} 
          />
        ))}
        
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}

export default function F1RacingArena() {
  const queryClient = useQueryClient();
  const { cars, createCar } = useUserCars();
  const { races } = useF1Races();
  const joinRace = useJoinF1Race();
  const upgradeCar = useUpgradeCar();
  const purchaseColor = usePurchaseCarColor();
  
  const [showBuyCar, setShowBuyCar] = useState(false);
  const [showJoinRace, setShowJoinRace] = useState(false);
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [selectedCarForRace, setSelectedCarForRace] = useState("");
  const [raceStrategy, setRaceStrategy] = useState("balanced");
  const [carName, setCarName] = useState("");
  const [carTeam, setCarTeam] = useState("Custom Racing");
  const [carColor, setCarColor] = useState("#e10600");
  
  const [showShop, setShowShop] = useState(false);
  const [selectedCarForShop, setSelectedCarForShop] = useState("");
  const [shopColor, setShopColor] = useState("#e10600");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      toast.success("Purchase successful! Your coins/gems will be added shortly.");
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["f1-currency"] });
      }, 2000);
      window.history.replaceState({}, "", "/f1-racing-arena");
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled");
      window.history.replaceState({}, "", "/f1-racing-arena");
    }
  }, [queryClient]);

  const handleBuyCar = () => {
    if (!carName) {
      toast.error("Please enter a car name");
      return;
    }
    
    createCar.mutate({
      name: carName,
      team: carTeam,
      color: carColor,
      costCoins: 75,
    }, {
      onSuccess: () => {
        setShowBuyCar(false);
        setCarName("");
      }
    });
  };

  const handleJoinRace = (raceId: string) => {
    setSelectedRace(raceId);
    setShowJoinRace(true);
  };

  const handleConfirmJoinRace = () => {
    if (!selectedCarForRace || !selectedRace) {
      toast.error("Please select a car");
      return;
    }

    joinRace.mutate({
      raceId: selectedRace,
      carId: selectedCarForRace,
      strategy: raceStrategy,
    }, {
      onSuccess: () => {
        setShowJoinRace(false);
        setSelectedCarForRace("");
        setRaceStrategy("balanced");
      }
    });
  };

  const handleUpgradeCar = (carId: string, statType: 'engine' | 'aero' | 'tires' | 'handling') => {
    upgradeCar.mutate({ carId, statType });
  };

  const handlePurchaseColor = () => {
    if (!selectedCarForShop) {
      toast.error("Please select a car");
      return;
    }

    purchaseColor.mutate({
      carId: selectedCarForShop,
      newColor: shopColor,
    }, {
      onSuccess: () => {
        setShowShop(false);
        setSelectedCarForShop("");
      }
    });
  };

  const activeRace = races?.find(r => r.id === selectedRace);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-950/20 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6 pt-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">🏎️ F1 Racing Arena</h1>
            <p className="text-gray-400 mt-2">
              Build your car • Upgrade parts • Race to win
            </p>
          </div>
        </div>

        <F1CurrencyDisplay />

        <Tabs defaultValue="garage" className="w-full">
          <TabsList className="flex w-full overflow-x-auto bg-black/50 border border-red-500/50">
            <TabsTrigger value="garage" className="flex-1 min-w-fit text-xs sm:text-sm data-[state=active]:bg-red-600 text-white">
              Garage
            </TabsTrigger>
            <TabsTrigger value="racing" className="flex-1 min-w-fit text-xs sm:text-sm data-[state=active]:bg-red-600 text-white">
              Racing
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="flex-1 min-w-fit text-xs sm:text-sm data-[state=active]:bg-red-600 text-white">
              Upgrades
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex-1 min-w-fit text-xs sm:text-sm data-[state=active]:bg-red-600 text-white">
              Shop
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex-1 min-w-fit text-xs sm:text-sm data-[state=active]:bg-red-600 text-white">
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="garage" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Your F1 Cars</h2>
              <Button onClick={() => setShowBuyCar(true)} className="bg-red-600 hover:bg-red-700">
                <Zap className="mr-2 h-4 w-4" />
                Buy New Car (75 Coins)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars?.map((car) => (
                <Card key={car.id} className="p-4 bg-black/80 border-red-500/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white">{car.name}</h3>
                      <p className="text-sm text-gray-400">{car.team}</p>
                      <p className="text-xs text-gray-500">Level {car.level}</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg border-4 border-red-500"
                      style={{ backgroundColor: car.color }}
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Engine</span>
                      <span className="font-bold text-white">{car.engine_stat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Aerodynamics</span>
                      <span className="font-bold text-white">{car.aero_stat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tires</span>
                      <span className="font-bold text-white">{car.tires_stat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Handling</span>
                      <span className="font-bold text-white">{car.handling_stat}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-red-500/30">
                    <p className="text-xs text-gray-500">
                      Races: {car.total_races} • Wins: {car.total_wins}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="racing" className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Racing Arena</h2>
            
            {selectedRace && activeRace ? (
              <div className="space-y-4">
                <Button variant="outline" onClick={() => setSelectedRace(null)} className="border-red-500 text-white">
                  Back to Races
                </Button>
                
                <div className="h-[400px] rounded-lg overflow-hidden border-4 border-red-500">
                  <RaceTrack3D 
                    participants={activeRace.f1_race_participants || []} 
                    isRacing={activeRace.status === "running"} 
                  />
                </div>
                
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke(
                        "calculate-f1-race-results",
                        { body: { raceId: selectedRace } }
                      );

                      if (error) throw error;

                      if (data?.results) {
                        const winner = data.results[0];
                        toast.success(
                          `Race finished! Winner: ${winner.carName}${
                            winner.prize > 0 ? ` - Prize: ${winner.prize} coins` : ""
                          } 🏆`
                        );
                      }
                    } catch (error) {
                      console.error("Error calculating results:", error);
                      toast.error("Error calculating race results");
                    }
                    
                    queryClient.invalidateQueries({ queryKey: ["active-f1-races"] });
                    queryClient.invalidateQueries({ queryKey: ["user-f1-cars"] });
                    queryClient.invalidateQueries({ queryKey: ["f1-currency"] });
                    setSelectedRace(null);
                  }}
                >
                  Start Race 🏁
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {races?.map((race) => (
                  <Card key={race.id} className="p-4 bg-black/80 border-red-500/50">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-white">{race.track_name}</h3>
                        <p className="text-sm text-gray-400">
                          Distance: {race.distance}m • Entry: {race.entry_fee_coins} Coins
                        </p>
                        <p className="text-sm text-gray-400">
                          Participants: {race.f1_race_participants?.length || 0}/{race.max_participants}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Weather: {race.weather} • Track: {race.track_condition}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => setSelectedRace(race.id)} className="w-full bg-red-600 hover:bg-red-700 text-white">
                          View Race
                        </Button>
                        <Button onClick={() => handleJoinRace(race.id)} className="w-full bg-red-700 hover:bg-red-800 text-white border-none">
                          Join Race
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upgrades" className="space-y-4">
            <Card className="p-6 bg-black/80 border-red-500/50">
              <h2 className="text-2xl font-bold mb-4 text-white">Upgrade Center</h2>
              <p className="text-gray-400 mb-6">Upgrade your car's parts to improve performance! (25 Coins per upgrade)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars?.map((car) => (
                  <Card key={car.id} className="p-4 bg-red-950/30 border-red-500/30">
                    <h3 className="font-bold text-lg mb-2 text-white">{car.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">Level {car.level}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Engine</span>
                        <span className="text-white">{car.engine_stat}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Aerodynamics</span>
                        <span className="text-white">{car.aero_stat}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tires</span>
                        <span className="text-white">{car.tires_stat}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Handling</span>
                        <span className="text-white">{car.handling_stat}/100</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpgradeCar(car.id, 'engine')}
                        disabled={upgradeCar.isPending || car.engine_stat >= 100}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Engine
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpgradeCar(car.id, 'aero')}
                        disabled={upgradeCar.isPending || car.aero_stat >= 100}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Aero
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpgradeCar(car.id, 'tires')}
                        disabled={upgradeCar.isPending || car.tires_stat >= 100}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Tires
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpgradeCar(car.id, 'handling')}
                        disabled={upgradeCar.isPending || car.handling_stat >= 100}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Handling
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="shop" className="space-y-4">
            <Card className="p-6 bg-black/80 border-red-500/50">
              <h2 className="text-2xl font-bold mb-4 text-white">🛒 Performance Shop</h2>
              <p className="text-gray-400 mb-6">Upgrade your car with special items to dominate the track!</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Engines */}
                <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
                  <div className="text-2xl mb-2">🔥</div>
                  <h3 className="font-bold text-white">Turbo Engine V8</h3>
                  <p className="text-sm text-gray-400 mb-2">+15 Engine Power</p>
                  <p className="text-yellow-500 font-bold">150 Coins</p>
                </div>
                
                <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="font-bold text-white">Hybrid Power Unit</h3>
                  <p className="text-sm text-gray-400 mb-2">+20 Engine Power, +5 Efficiency</p>
                  <p className="text-yellow-500 font-bold">250 Coins</p>
                </div>
                
                <div className="p-4 bg-red-950/50 rounded-lg border border-purple-500/50">
                  <div className="text-2xl mb-2">💎</div>
                  <h3 className="font-bold text-white">Nuclear Fusion Core</h3>
                  <p className="text-sm text-gray-400 mb-2">+30 Engine Power</p>
                  <p className="text-purple-400 font-bold">100 Gems</p>
                </div>
                
                {/* Aerodynamics */}
                <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
                  <div className="text-2xl mb-2">🌬️</div>
                  <h3 className="font-bold text-white">Carbon Fiber Wing</h3>
                  <p className="text-sm text-gray-400 mb-2">+10 Aerodynamics</p>
                  <p className="text-yellow-500 font-bold">100 Coins</p>
                </div>
                
                <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
                  <div className="text-2xl mb-2">🛸</div>
                  <h3 className="font-bold text-white">DRS+ System</h3>
                  <p className="text-sm text-gray-400 mb-2">+18 Aerodynamics, +5 Speed</p>
                  <p className="text-yellow-500 font-bold">200 Coins</p>
                </div>
                
                <div className="p-4 bg-red-950/50 rounded-lg border border-purple-500/50">
                  <div className="text-2xl mb-2">🚀</div>
                  <h3 className="font-bold text-white">Active Aero Kit</h3>
                  <p className="text-sm text-gray-400 mb-2">+25 Aerodynamics</p>
                  <p className="text-purple-400 font-bold">80 Gems</p>
                </div>
                
                {/* Tires */}
                <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
                  <div className="text-2xl mb-2">🛞</div>
                  <h3 className="font-bold text-white">Soft Compound Tires</h3>
                  <p className="text-sm text-gray-400 mb-2">+12 Grip, +8 Handling</p>
                  <p className="text-yellow-500 font-bold">120 Coins</p>
                </div>
                
                <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
                  <div className="text-2xl mb-2">🏁</div>
                  <h3 className="font-bold text-white">Slick Racing Tires</h3>
                  <p className="text-sm text-gray-400 mb-2">+20 Grip</p>
                  <p className="text-yellow-500 font-bold">180 Coins</p>
                </div>
                
                <div className="p-4 bg-red-950/50 rounded-lg border border-purple-500/50">
                  <div className="text-2xl mb-2">✨</div>
                  <h3 className="font-bold text-white">Quantum Grip Tires</h3>
                  <p className="text-sm text-gray-400 mb-2">+30 Grip, +15 Handling</p>
                  <p className="text-purple-400 font-bold">120 Gems</p>
                </div>
                
                {/* Handling */}
                <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-bold text-white">Precision Steering</h3>
                  <p className="text-sm text-gray-400 mb-2">+15 Handling</p>
                  <p className="text-yellow-500 font-bold">130 Coins</p>
                </div>
                
                <div className="p-4 bg-red-950/50 rounded-lg border border-red-500/30">
                  <div className="text-2xl mb-2">⚙️</div>
                  <h3 className="font-bold text-white">Advanced Suspension</h3>
                  <p className="text-sm text-gray-400 mb-2">+18 Handling, +8 Stability</p>
                  <p className="text-yellow-500 font-bold">200 Coins</p>
                </div>
                
                <div className="p-4 bg-red-950/50 rounded-lg border border-purple-500/50">
                  <div className="text-2xl mb-2">🤖</div>
                  <h3 className="font-bold text-white">AI Assist System</h3>
                  <p className="text-sm text-gray-400 mb-2">+25 Handling, Auto-correction</p>
                  <p className="text-purple-400 font-bold">90 Gems</p>
                </div>
                
                {/* Special Items */}
                <div className="p-4 bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-lg border border-yellow-500/50">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="font-bold text-yellow-300">Champion's Nitro Boost</h3>
                  <p className="text-sm text-gray-300 mb-2">+10% Race Speed Bonus</p>
                  <p className="text-yellow-400 font-bold">300 Coins</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-lg border border-blue-500/50">
                  <div className="text-2xl mb-2">❄️</div>
                  <h3 className="font-bold text-blue-300">Cryo Cooling System</h3>
                  <p className="text-sm text-gray-300 mb-2">Prevents overheating, +5 All Stats</p>
                  <p className="text-yellow-400 font-bold">350 Coins</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-500/50">
                  <div className="text-2xl mb-2">⭐</div>
                  <h3 className="font-bold text-purple-300">Legendary Engine Swap</h3>
                  <p className="text-sm text-gray-300 mb-2">+50 All Stats, Legendary Tier</p>
                  <p className="text-purple-400 font-bold">500 Gems</p>
                </div>
              </div>
              
              {/* Mystery Boxes */}
              <div className="col-span-full mt-6">
                <h3 className="text-xl font-bold text-white mb-4">🎁 Mystery Boxes</h3>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-amber-900/50 to-yellow-900/50 rounded-lg border border-amber-500/50">
                <div className="text-2xl mb-2">📦</div>
                <h3 className="font-bold text-amber-300">Bronze Box</h3>
                <p className="text-sm text-gray-300 mb-2">Random +5-15 stats boost</p>
                <p className="text-yellow-400 font-bold">50 Coins</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-gray-600/50 to-gray-400/50 rounded-lg border border-gray-400/50">
                <div className="text-2xl mb-2">🎁</div>
                <h3 className="font-bold text-gray-200">Silver Box</h3>
                <p className="text-sm text-gray-300 mb-2">Random +10-25 stats boost</p>
                <p className="text-yellow-400 font-bold">100 Coins</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-yellow-600/50 to-amber-500/50 rounded-lg border border-yellow-400/50">
                <div className="text-2xl mb-2">✨</div>
                <h3 className="font-bold text-yellow-300">Gold Box</h3>
                <p className="text-sm text-gray-300 mb-2">Random +20-40 stats boost</p>
                <p className="text-yellow-400 font-bold">200 Coins</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-700/50 to-violet-600/50 rounded-lg border border-purple-400/50">
                <div className="text-2xl mb-2">💎</div>
                <h3 className="font-bold text-purple-300">Diamond Box</h3>
                <p className="text-sm text-gray-300 mb-2">Random +30-60 stats boost</p>
                <p className="text-purple-400 font-bold">50 Gems</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-red-700/50 to-orange-600/50 rounded-lg border border-red-400/50">
                <div className="text-2xl mb-2">🔥</div>
                <h3 className="font-bold text-red-300">Inferno Box</h3>
                <p className="text-sm text-gray-300 mb-2">+50 Engine guaranteed + bonus</p>
                <p className="text-purple-400 font-bold">80 Gems</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-cyan-700/50 to-blue-600/50 rounded-lg border border-cyan-400/50">
                <div className="text-2xl mb-2">❄️</div>
                <h3 className="font-bold text-cyan-300">Frost Box</h3>
                <p className="text-sm text-gray-300 mb-2">+50 Aero guaranteed + bonus</p>
                <p className="text-purple-400 font-bold">80 Gems</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-700/50 to-emerald-600/50 rounded-lg border border-green-400/50">
                <div className="text-2xl mb-2">🌿</div>
                <h3 className="font-bold text-green-300">Nature Box</h3>
                <p className="text-sm text-gray-300 mb-2">+50 Tires guaranteed + bonus</p>
                <p className="text-purple-400 font-bold">80 Gems</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-pink-700/50 to-rose-600/50 rounded-lg border border-pink-400/50">
                <div className="text-2xl mb-2">🌸</div>
                <h3 className="font-bold text-pink-300">Sakura Box</h3>
                <p className="text-sm text-gray-300 mb-2">+50 Handling guaranteed + bonus</p>
                <p className="text-purple-400 font-bold">80 Gems</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-indigo-800/50 to-purple-900/50 rounded-lg border border-indigo-400/50">
                <div className="text-2xl mb-2">🌌</div>
                <h3 className="font-bold text-indigo-300">Galaxy Box</h3>
                <p className="text-sm text-gray-300 mb-2">Rare car skin + random boost</p>
                <p className="text-purple-400 font-bold">150 Gems</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-yellow-500/60 via-orange-500/60 to-red-600/60 rounded-lg border-2 border-yellow-300/70 animate-pulse">
                <div className="text-2xl mb-2">👑</div>
                <h3 className="font-bold text-yellow-200">Legendary Box</h3>
                <p className="text-sm text-gray-200 mb-2">+100 All Stats + Legendary Skin</p>
                <p className="text-yellow-300 font-bold">300 Gems</p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-red-500/30">
                <h3 className="text-xl font-bold text-white mb-4">🎨 Livery Shop</h3>
                <Button onClick={() => setShowShop(true)} disabled={!cars || cars.length === 0} className="bg-red-600 hover:bg-red-700 text-white">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Change Car Livery (50 Gems)
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <F1Leaderboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Buy Car Dialog */}
      <Dialog open={showBuyCar} onOpenChange={setShowBuyCar}>
        <DialogContent className="bg-black/95 border-red-500">
          <DialogHeader>
            <DialogTitle className="text-white">🏎️ Build New F1 Car</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Car Name</Label>
              <Input
                value={carName}
                onChange={(e) => setCarName(e.target.value)}
                placeholder="Enter car name..."
                className="bg-black/50 border-red-500/50 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Team Name</Label>
              <Select value={carTeam} onValueChange={setCarTeam}>
                <SelectTrigger className="bg-black/50 border-red-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Custom Racing">Custom Racing</SelectItem>
                  <SelectItem value="Speed Demons">Speed Demons</SelectItem>
                  <SelectItem value="Thunder Racing">Thunder Racing</SelectItem>
                  <SelectItem value="Phoenix Team">Phoenix Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Car Color</Label>
              <Input
                type="color"
                value={carColor}
                onChange={(e) => setCarColor(e.target.value)}
                className="h-12 bg-black/50 border-red-500/50"
              />
            </div>
            <Button onClick={handleBuyCar} className="w-full bg-red-600 hover:bg-red-700" disabled={createCar.isPending}>
              {createCar.isPending ? "Building..." : "Build Car (75 Coins)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Race Dialog */}
      <Dialog open={showJoinRace} onOpenChange={setShowJoinRace}>
        <DialogContent className="bg-black/95 border-red-500">
          <DialogHeader>
            <DialogTitle className="text-white">🏁 Join Race</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Select Car</Label>
              <Select value={selectedCarForRace} onValueChange={setSelectedCarForRace}>
                <SelectTrigger className="bg-black/50 border-red-500/50 text-white">
                  <SelectValue placeholder="Choose a car" />
                </SelectTrigger>
                <SelectContent>
                  {cars?.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.name} (Level {car.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Race Strategy</Label>
              <Select value={raceStrategy} onValueChange={setRaceStrategy}>
                <SelectTrigger className="bg-black/50 border-red-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aggressive">Aggressive (High risk, high reward)</SelectItem>
                  <SelectItem value="balanced">Balanced (Moderate approach)</SelectItem>
                  <SelectItem value="conservative">Conservative (Safe driving)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleConfirmJoinRace} className="w-full bg-red-600 hover:bg-red-700" disabled={joinRace.isPending}>
              {joinRace.isPending ? "Joining..." : "Join Race"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shop Dialog */}
      <Dialog open={showShop} onOpenChange={setShowShop}>
        <DialogContent className="bg-black/95 border-red-500">
          <DialogHeader>
            <DialogTitle className="text-white">🎨 Change Livery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Select Car</Label>
              <Select value={selectedCarForShop} onValueChange={setSelectedCarForShop}>
                <SelectTrigger className="bg-black/50 border-red-500/50 text-white">
                  <SelectValue placeholder="Choose a car" />
                </SelectTrigger>
                <SelectContent>
                  {cars?.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">New Color</Label>
              <Input
                type="color"
                value={shopColor}
                onChange={(e) => setShopColor(e.target.value)}
                className="h-12 bg-black/50 border-red-500/50"
              />
            </div>
            <Button onClick={handlePurchaseColor} className="w-full bg-red-600 hover:bg-red-700" disabled={purchaseColor.isPending}>
              {purchaseColor.isPending ? "Changing..." : "Change Livery (50 Gems)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
