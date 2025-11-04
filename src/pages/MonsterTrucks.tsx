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
  { id: 1, name: "Car Pile", emoji: "🚗🚗🚗", points: 50 },
  { id: 2, name: "Bus Jump", emoji: "🚌", points: 100 },
  { id: 3, name: "Fire Ring", emoji: "🔥", points: 150 },
  { id: 4, name: "Ramp Flight", emoji: "🛫", points: 200 }
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
    toast.success(`${truck.name} selected! 🚚`);
  };

  const createCustomTruck = () => {
    if (!customTruckName.trim()) {
      toast.error("Enter a name for your truck!");
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
    toast.success(`${customTruck.name} created! 🎨`);
    setCustomTruckName("");
  };

  const attemptObstacle = (obstacle: typeof obstacles[0]) => {
    if (!selectedTruck) {
      toast.error("Select a truck first!");
      return;
    }

    // Success based on truck power
    const success = Math.random() * 100 < selectedTruck.power;

    if (success) {
      setTotalPoints(totalPoints + obstacle.points);
      setJumpsCompleted(jumpsCompleted + 1);
      toast.success(`🎉 ${obstacle.name} crushed! +${obstacle.points} points!`);
    } else {
      const crashBonus = Math.floor(Math.random() * 50) + 25;
      setCrashPoints(crashPoints + crashBonus);
      toast.error(`Crashed! But earned ${crashBonus} crash points! 💥`);
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
            Jump obstacles and smash everything!
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-indigo-600 text-white text-xl px-6 py-3">
              <Trophy className="w-5 h-5 mr-2 inline" />
              {totalPoints} Points
            </Badge>
            <Badge className="bg-red-500 text-white text-xl px-6 py-3">
              <Zap className="w-5 h-5 mr-2 inline" />
              {crashPoints} Crash Points
            </Badge>
            <Badge className="bg-green-500 text-white text-xl px-6 py-3">
              {jumpsCompleted} Jumps
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Truck Selection */}
          <Card className="border-4 border-indigo-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-700">
                Choose Your Monster Truck
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
                        Power: {truck.power}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="border-t-4 border-indigo-200 pt-4">
                <p className="font-semibold text-indigo-700 mb-3 text-center">
                  Or Create Your Own!
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Custom truck name..."
                    value={customTruckName}
                    onChange={(e) => setCustomTruckName(e.target.value)}
                    className="border-2 border-indigo-300"
                  />
                  <Button
                    onClick={createCustomTruck}
                    className="bg-purple-500 hover:bg-purple-600 text-white whitespace-nowrap"
                  >
                    Create
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Truck Display */}
          <Card className="border-4 border-indigo-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-700 text-center">
                Your Truck
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
                    Power: {selectedTruck.power}
                  </Badge>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-16">
                  <p className="text-xl">Select or create a truck to start!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Obstacles */}
        <Card className="border-4 border-indigo-300 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-700 text-center">
              Obstacles Arena
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
                      Jump!
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
