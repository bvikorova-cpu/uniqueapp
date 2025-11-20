import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HorseCurrencyDisplay } from "@/components/horse-racing/HorseCurrencyDisplay";
import { HorseLeaderboard } from "@/components/horse-racing/HorseLeaderboard";
import { HorseMarketplace } from "@/components/horse-racing/HorseMarketplace";
import { useUserHorses, useRaces, useJoinRace, useTrainHorse, useBreedHorses, usePurchaseHorseColor } from "@/hooks/useHorseRacing";
import { RaceTrack3D } from "@/components/horse-racing/RaceTrack3D";
import { Trophy, Dumbbell, Heart, Sparkles, Zap, TrendingUp, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function HorseRacing() {
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
  
  // Breeding state
  const [showBreeding, setShowBreeding] = useState(false);
  const [breedingParent1, setBreedingParent1] = useState("");
  const [breedingParent2, setBreedingParent2] = useState("");
  
  // Shop state
  const [showShop, setShowShop] = useState(false);
  const [selectedHorseForShop, setSelectedHorseForShop] = useState("");
  const [shopColor, setShopColor] = useState("#8B4513");

  // Handle payment success - just show message, webhook handles the credit addition
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      toast.success("Purchase successful! Your coins/gems will be added shortly.");
      // Refresh currency after a short delay to allow webhook to process
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      }, 2000);
      window.history.replaceState({}, "", "/horse-racing");
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled");
      window.history.replaceState({}, "", "/horse-racing");
    }
  }, [queryClient]);

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6 pt-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">🏇 Virtual Horse Racing Arena</h1>
            <p className="text-muted-foreground mt-2">
              Skill-based racing • Legal virtual economy • No gambling
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              🎁 New players receive 100 coins + 10 gems starter bonus!
            </p>
          </div>
        </div>

        <HorseCurrencyDisplay />

        <Tabs defaultValue="stable" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="stable">
              <Zap className="mr-2 h-4 w-4" />
              My Stable
            </TabsTrigger>
            <TabsTrigger value="racing">
              <Trophy className="mr-2 h-4 w-4" />
              Racing Arena
            </TabsTrigger>
            <TabsTrigger value="training">
              <Dumbbell className="mr-2 h-4 w-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="breeding">
              <Heart className="mr-2 h-4 w-4" />
              Breeding
            </TabsTrigger>
            <TabsTrigger value="shop">
              <Sparkles className="mr-2 h-4 w-4" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <TrendingUp className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stable" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Horses</h2>
              <Button onClick={() => setShowBuyHorse(true)}>
                <Zap className="mr-2 h-4 w-4" />
                Buy New Horse (50 Coins)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {horses?.map((horse) => (
                <Card key={horse.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{horse.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{horse.breed}</p>
                      <p className="text-xs text-muted-foreground">Level {horse.level}</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full border-4 border-muted"
                      style={{ backgroundColor: horse.color }}
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Speed</span>
                      <span className="font-bold">{horse.speed_stat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Stamina</span>
                      <span className="font-bold">{horse.stamina_stat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Acceleration</span>
                      <span className="font-bold">{horse.acceleration_stat}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Races: {horse.total_races} • Wins: {horse.total_wins}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="racing" className="space-y-4">
            <h2 className="text-2xl font-bold">Racing Arena</h2>
            
            {selectedRace && activeRace ? (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRace(null)}
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
                      // Calculate race results via edge function
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
                {races?.map((race) => (
                  <Card key={race.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{race.track_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Distance: {race.distance}m • Entry: {race.entry_fee_coins} Coins
                        </p>
                        <p className="text-sm">
                          Participants: {race.race_participants?.length || 0}/{race.max_participants}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize mt-1">
                          Weather: {race.weather} • Track: {race.track_condition}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={() => setSelectedRace(race.id)}>
                          View Race
                        </Button>
                        <Button variant="outline" onClick={() => handleJoinRace(race.id)}>
                          Join Race
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Training Facility</h2>
              <p className="text-muted-foreground mb-6">Train your horses to improve their stats! (20 Coins per session)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {horses?.map((horse) => (
                  <Card key={horse.id} className="p-4">
                    <h3 className="font-bold text-lg mb-2">{horse.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">Level {horse.level}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Speed</span>
                        <span>{horse.speed_stat}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Stamina</span>
                        <span>{horse.stamina_stat}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Acceleration</span>
                        <span>{horse.acceleration_stat}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Temperament</span>
                        <span>{horse.temperament_stat}/100</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleTrainHorse(horse.id, 'speed')}
                        disabled={trainHorse.isPending || horse.speed_stat >= 100}
                      >
                        Train Speed
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTrainHorse(horse.id, 'stamina')}
                        disabled={trainHorse.isPending || horse.stamina_stat >= 100}
                      >
                        Train Stamina
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTrainHorse(horse.id, 'acceleration')}
                        disabled={trainHorse.isPending || horse.acceleration_stat >= 100}
                      >
                        Train Acceleration
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTrainHorse(horse.id, 'temperament')}
                        disabled={trainHorse.isPending || horse.temperament_stat >= 100}
                      >
                        Train Temperament
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="breeding" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Breeding Center</h2>
              <p className="text-muted-foreground mb-6">Breed two horses to create offspring with combined traits! (100 Coins)</p>
              
              <Button onClick={() => setShowBreeding(true)} disabled={!horses || horses.length < 2}>
                <Heart className="mr-2 h-4 w-4" />
                Start Breeding
              </Button>

              {horses && horses.length < 2 && (
                <p className="text-sm text-muted-foreground mt-4">
                  You need at least 2 horses to breed
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="shop" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Cosmetics Shop</h2>
              <p className="text-muted-foreground mb-6">Customize your horse's appearance with gems!</p>
              
              <Button onClick={() => setShowShop(true)} disabled={!horses || horses.length === 0}>
                <Sparkles className="mr-2 h-4 w-4" />
                Change Horse Color (50 Gems)
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <HorseLeaderboard />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-4">
            <HorseMarketplace />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showBuyHorse} onOpenChange={setShowBuyHorse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy New Horse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Horse Name</Label>
              <Input
                value={horseName}
                onChange={(e) => setHorseName(e.target.value)}
                placeholder="Enter horse name"
              />
            </div>
            <div>
              <Label>Breed</Label>
              <Select value={horseBreed} onValueChange={setHorseBreed}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thoroughbred">Thoroughbred</SelectItem>
                  <SelectItem value="arabian">Arabian</SelectItem>
                  <SelectItem value="quarter">Quarter Horse</SelectItem>
                  <SelectItem value="mustang">Mustang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2">
                {["#8B4513", "#000000", "#FFFFFF", "#808080", "#D2691E"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setHorseColor(color)}
                    className="w-10 h-10 rounded-full border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: horseColor === color ? "hsl(var(--primary))" : "hsl(var(--border))",
                    }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleBuyHorse} className="w-full">
              Buy Horse - 50 Coins
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinRace} onOpenChange={setShowJoinRace}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Race</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Horse</Label>
              <Select value={selectedHorseForRace} onValueChange={setSelectedHorseForRace}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a horse" />
                </SelectTrigger>
                <SelectContent>
                  {horses?.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name} (Lvl {horse.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Race Strategy</Label>
              <Select value={raceStrategy} onValueChange={setRaceStrategy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aggressive">Aggressive - Early sprint</SelectItem>
                  <SelectItem value="balanced">Balanced - Steady pace</SelectItem>
                  <SelectItem value="conservative">Conservative - Save energy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleConfirmJoinRace} className="w-full" disabled={joinRace.isPending}>
              Join Race
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBreeding} onOpenChange={setShowBreeding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Breed Horses</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Parent 1</Label>
              <Select value={breedingParent1} onValueChange={setBreedingParent1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first parent" />
                </SelectTrigger>
                <SelectContent>
                  {horses?.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name} - {horse.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Parent 2</Label>
              <Select value={breedingParent2} onValueChange={setBreedingParent2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second parent" />
                </SelectTrigger>
                <SelectContent>
                  {horses?.filter(h => h.id !== breedingParent1).map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name} - {horse.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleBreedHorses} className="w-full" disabled={breedHorses.isPending}>
              Breed Horses - 100 Coins
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showShop} onOpenChange={setShowShop}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Horse Color</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Horse</Label>
              <Select value={selectedHorseForShop} onValueChange={setSelectedHorseForShop}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a horse" />
                </SelectTrigger>
                <SelectContent>
                  {horses?.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>New Color</Label>
              <div className="flex gap-2">
                {["#8B4513", "#000000", "#FFFFFF", "#808080", "#D2691E", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#DDA15E"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setShopColor(color)}
                    className="w-10 h-10 rounded-full border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: shopColor === color ? "hsl(var(--primary))" : "hsl(var(--border))",
                    }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handlePurchaseColor} className="w-full" disabled={purchaseColor.isPending}>
              {purchaseColor.isPending ? "Processing..." : "Change Color - 50 Gems"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* New Tabs Content */}
      <TabsContent value="leaderboard">
        <HorseLeaderboard />
      </TabsContent>

      <TabsContent value="marketplace">
        <HorseMarketplace />
      </TabsContent>
    </div>
  );
}
