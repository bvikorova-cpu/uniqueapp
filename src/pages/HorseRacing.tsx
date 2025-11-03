import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HorseCurrencyDisplay } from "@/components/horse-racing/HorseCurrencyDisplay";
import { useUserHorses, useRaces, useJoinRace } from "@/hooks/useHorseRacing";
import { RaceTrack3D } from "@/components/horse-racing/RaceTrack3D";
import { Trophy, Dumbbell, Heart, Sparkles, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function HorseRacing() {
  const { horses, createHorse } = useUserHorses();
  const { races } = useRaces();
  const joinRace = useJoinRace();
  const [showBuyHorse, setShowBuyHorse] = useState(false);
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [horseName, setHorseName] = useState("");
  const [horseBreed, setHorseBreed] = useState("thoroughbred");
  const [horseColor, setHorseColor] = useState("#8B4513");

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
      }
    });
  };

  const activeRace = races?.find(r => r.id === selectedRace);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">🏇 Virtual Horse Racing Arena</h1>
            <p className="text-muted-foreground mt-2">
              Skill-based racing • Legal virtual economy • No gambling
            </p>
          </div>
        </div>

        <HorseCurrencyDisplay />

        <Tabs defaultValue="stable" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
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
                  onRaceComplete={(results) => {
                    console.log("Race complete:", results);
                    toast.success("Race finished!");
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
                        <Button variant="outline">
                          Join Race
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="training">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Training Facility</h2>
              <p className="text-muted-foreground">Coming soon: Train your horses to improve their stats!</p>
            </Card>
          </TabsContent>

          <TabsContent value="breeding">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Breeding Center</h2>
              <p className="text-muted-foreground">Coming soon: Breed horses to create offspring with combined traits!</p>
            </Card>
          </TabsContent>

          <TabsContent value="shop">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Cosmetics Shop</h2>
              <p className="text-muted-foreground">Coming soon: Purchase cosmetic items with Gems!</p>
            </Card>
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
    </div>
  );
}
