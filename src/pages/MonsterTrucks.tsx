import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trophy, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Truck {
  id: number;
  name: string;
  emoji: string;
  color: string;
  power: number;
}

const defaultTrucks: Truck[] = [
  { id: 1, name: "Thunder Beast", emoji: "⚡", color: "from-yellow-400 to-orange-500", power: 85 },
  { id: 2, name: "Mega Crusher", emoji: "💥", color: "from-red-500 to-pink-600", power: 90 },
  { id: 3, name: "Steel Monster", emoji: "🔩", color: "from-gray-500 to-gray-700", power: 80 },
  { id: 4, name: "Dragon Fury", emoji: "🐉", color: "from-green-500 to-emerald-600", power: 95 }
];

const obstacles = [
  { id: 1, name: "Kopa áut", emoji: "🚗🚗🚗", points: 50 },
  { id: 2, name: "Skok cez autobus", emoji: "🚌", points: 100 },
  { id: 3, name: "Ohnivý kruh", emoji: "🔥", points: 150 },
  { id: 4, name: "Rampa let", emoji: "🛫", points: 200 }
];

const MonsterTrucks = () => {
  const navigate = useNavigate();
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [customTruckName, setCustomTruckName] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [crashPoints, setCrashPoints] = useState(0);
  const [jumpsCompleted, setJumpsCompleted] = useState(0);

  const selectTruck = (truck: Truck) => {
    setSelectedTruck(truck);
    toast.success(`${truck.name} vybraný! 🚚`);
  };

  const createCustomTruck = () => {
    if (!customTruckName.trim()) {
      toast.error("Zadaj meno pre tvoj kamión!");
      return;
    }

    const customTruck: Truck = {
      id: Date.now(),
      name: customTruckName,
      emoji: "🚚",
      color: "from-purple-500 to-indigo-600",
      power: 100
    };

    setSelectedTruck(customTruck);
    toast.success(`${customTruck.name} vytvorený! 🎨`);
    setCustomTruckName("");
  };

  const attemptObstacle = (obstacle: typeof obstacles[0]) => {
    if (!selectedTruck) {
      toast.error("Najprv vyber kamión!");
      return;
    }

    // Success based on truck power
    const success = Math.random() * 100 < selectedTruck.power;

    if (success) {
      setTotalPoints(totalPoints + obstacle.points);
      setJumpsCompleted(jumpsCompleted + 1);
      toast.success(`🎉 ${obstacle.name} zničená! +${obstacle.points} bodov!`);
    } else {
      const crashBonus = Math.floor(Math.random() * 50) + 25;
      setCrashPoints(crashPoints + crashBonus);
      toast.error(`Haváriu! Ale získal si ${crashBonus} crash bodov! 💥`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/kids-channel')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-indigo-700 mb-2">
            🚚 Monster Truck Mayhem 💥
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Skákaj cez prekážky a rozbíjaj všetko!
          </p>
          
          {/* Game Instructions */}
          <Card className="max-w-3xl mx-auto mb-6 border-2 border-blue-300 bg-blue-50/50">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-indigo-700 mb-3">
                📖 Ako hrať
              </h2>
              <ol className="text-left space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">1.</span>
                  <span><strong>Vyber si kamión</strong> - Každý kamión má rôznu silu (power). Vyššia sila = väčšia šanca na úspech!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">2.</span>
                  <span><strong>Alebo vytvor vlastný</strong> - Napíš meno a získaš kamión s maximálnou silou 100!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">3.</span>
                  <span><strong>Vyber prekážku</strong> - Čím ťažšia prekážka, tým viac bodov získaš pri úspechu!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">4.</span>
                  <span><strong>Klikni na "Skoč!"</strong> - Tvoj kamión sa pokúsi preskočiť prekážku. Ak sa podarí = body! Ak nie = crash body! 💥</span>
                </li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg border-2 border-yellow-300">
                <p className="text-sm text-yellow-800 font-semibold">
                  💡 Tip: Kamión s vyššou silou má väčšiu šancu na úspech, ale aj pri crashnutí získaš body!
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-indigo-600 text-white text-xl px-6 py-3">
              <Trophy className="w-5 h-5 mr-2 inline" />
              {totalPoints} Bodov
            </Badge>
            <Badge className="bg-red-500 text-white text-xl px-6 py-3">
              <Zap className="w-5 h-5 mr-2 inline" />
              {crashPoints} Crash bodov
            </Badge>
            <Badge className="bg-green-500 text-white text-xl px-6 py-3">
              {jumpsCompleted} Skokov
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Truck Selection */}
          <Card className="border-4 border-indigo-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-700">
                Vyber si Monster Truck
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {defaultTrucks.map((truck) => (
                  <Card
                    key={truck.id}
                    className={`bg-gradient-to-br ${truck.color} cursor-pointer border-4 transition-all duration-300 hover:scale-105 ${
                      selectedTruck?.id === truck.id
                        ? "border-indigo-600 shadow-2xl"
                        : "border-white"
                    }`}
                    onClick={() => selectTruck(truck)}
                  >
                    <CardContent className="text-center p-4">
                      <div className="text-5xl mb-2">{truck.emoji}</div>
                      <p className="font-bold text-white text-sm">{truck.name}</p>
                      <Badge className="mt-2 bg-white text-gray-800">
                        Sila: {truck.power}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="border-t-4 border-indigo-200 pt-4">
                <p className="font-semibold text-indigo-700 mb-3 text-center">
                  Alebo si vytvor vlastný!
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Meno tvojho kamiónu..."
                    value={customTruckName}
                    onChange={(e) => setCustomTruckName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createCustomTruck()}
                    className="border-2 border-indigo-300"
                  />
                  <Button
                    onClick={createCustomTruck}
                    className="bg-purple-500 hover:bg-purple-600 text-white whitespace-nowrap"
                  >
                    Vytvoriť
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Truck Display */}
          <Card className="border-4 border-indigo-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-700 text-center">
                Tvoj kamión
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTruck ? (
                <div className={`bg-gradient-to-br ${selectedTruck.color} rounded-lg p-8 text-center`}>
                  <div className="text-9xl mb-4">{selectedTruck.emoji}</div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {selectedTruck.name}
                  </h3>
                  <Badge className="bg-white text-gray-800 text-lg px-4 py-2">
                    Sila: {selectedTruck.power}
                  </Badge>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-16">
                  <p className="text-xl">Vyber alebo vytvor kamión na začatie!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Obstacles */}
        <Card className="border-4 border-indigo-300 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-700 text-center">
              Aréna prekážok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {obstacles.map((obstacle) => (
                <Card
                  key={obstacle.id}
                  className="border-4 border-orange-300 bg-gradient-to-br from-orange-100 to-red-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="text-center p-6">
                    <div className="text-5xl mb-3">{obstacle.emoji}</div>
                    <p className="font-bold text-gray-800 mb-2">{obstacle.name}</p>
                    <Badge className="bg-orange-500 text-white mb-4">
                      +{obstacle.points} pts
                    </Badge>
                    <Button
                      onClick={() => attemptObstacle(obstacle)}
                      disabled={!selectedTruck}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Skoč!
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonsterTrucks;
