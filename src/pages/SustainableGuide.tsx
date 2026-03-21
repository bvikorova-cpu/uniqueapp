import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf, ArrowLeft, Zap, Car, Utensils, ShoppingBag, Droplets, Trophy, Check, RefreshCw, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  completed: boolean;
}

const dailyChallenges: Challenge[] = [
  {
    id: "1",
    title: "Meatless Meal",
    description: "Have one completely plant-based meal today",
    impact: "Saves ~2.5 kg CO2",
    difficulty: "Easy",
    category: "Food",
    completed: false
  },
  {
    id: "2",
    title: "No Single-Use Plastic",
    description: "Avoid all single-use plastics for the entire day",
    impact: "Prevents ocean pollution",
    difficulty: "Medium",
    category: "Waste",
    completed: false
  },
  {
    id: "3",
    title: "Cold Shower",
    description: "Take a cold or shorter shower today",
    impact: "Saves ~2 kWh energy",
    difficulty: "Hard",
    category: "Energy",
    completed: false
  },
  {
    id: "4",
    title: "Walk or Bike",
    description: "Replace one car trip with walking or cycling",
    impact: "Saves ~2 kg CO2 per km",
    difficulty: "Easy",
    category: "Transport",
    completed: false
  },
  {
    id: "5",
    title: "Unplug Electronics",
    description: "Unplug all standby electronics before bed",
    impact: "Saves ~0.5 kWh/day",
    difficulty: "Easy",
    category: "Energy",
    completed: false
  }
];

const SustainableGuide = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>(dailyChallenges);
  const [streak, setStreak] = useState(3);
  
  // Carbon Footprint Calculator
  const [electricity, setElectricity] = useState("");
  const [carMiles, setCarMiles] = useState("");
  const [flightsPerYear, setFlightsPerYear] = useState("");
  const [meatMeals, setMeatMeals] = useState("");
  const [footprint, setFootprint] = useState<number | null>(null);

  const completedCount = challenges.filter(c => c.completed).length;
  const progressPercentage = (completedCount / challenges.length) * 100;

  const toggleChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        if (!c.completed) {
          toast({
            title: "Challenge Completed! 🌱",
            description: `You earned impact: ${c.impact}`,
          });
        }
        return { ...c, completed: !c.completed };
      }
      return c;
    }));
  };

  const refreshChallenges = () => {
    setChallenges(dailyChallenges.map(c => ({ ...c, completed: false })));
    toast({
      title: "Challenges Refreshed!",
      description: "New day, new opportunities to make a difference.",
    });
  };

  const calculateFootprint = () => {
    // Simplified CO2 calculation
    const elecCO2 = (parseFloat(electricity) || 0) * 0.5; // kg CO2 per kWh
    const carCO2 = (parseFloat(carMiles) || 0) * 0.21 * 52; // kg CO2 per mile, annualized
    const flightCO2 = (parseFloat(flightsPerYear) || 0) * 500; // avg kg CO2 per flight
    const meatCO2 = (parseFloat(meatMeals) || 0) * 2.5 * 52; // kg CO2 per meal, annualized

    const totalAnnual = elecCO2 * 12 + carCO2 + flightCO2 + meatCO2;
    setFootprint(totalAnnual);

    toast({
      title: "Footprint Calculated!",
      description: `Your estimated annual CO2: ${(totalAnnual / 1000).toFixed(1)} tonnes`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500";
      case "Medium": return "bg-yellow-500";
      case "Hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Food": return Utensils;
      case "Energy": return Zap;
      case "Transport": return Car;
      case "Waste": return ShoppingBag;
      default: return Leaf;
    }
  };

  const getFootprintLevel = (footprint: number) => {
    const tonnes = footprint / 1000;
    if (tonnes < 4) return { level: "Excellent", color: "text-green-400", description: "You're below the global average!" };
    if (tonnes < 8) return { level: "Average", color: "text-yellow-400", description: "Room for improvement." };
    if (tonnes < 16) return { level: "High", color: "text-orange-400", description: "Consider lifestyle changes." };
    return { level: "Very High", color: "text-red-400", description: "Significant changes recommended." };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-950/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Sustainable Living Guide
            </h1>
            <p className="text-muted-foreground">Daily challenges for a greener lifestyle</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">🔥 {streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="tips">Eco Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-6">
            {/* Progress */}
            <Card className="border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Today's Progress</h3>
                    <p className="text-sm text-muted-foreground">{completedCount} of {challenges.length} challenges completed</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className={`h-6 w-6 ${completedCount === challenges.length ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                    <Button variant="ghost" size="icon" onClick={refreshChallenges}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </CardContent>
            </Card>

            {/* Challenges List */}
            <div className="space-y-4">
              {challenges.map((challenge) => {
                const Icon = getCategoryIcon(challenge.category);
                return (
                  <Card 
                    key={challenge.id}
                    className={`border-green-500/30 transition-all ${challenge.completed ? 'opacity-60' : ''}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          id={challenge.id}
                          checked={challenge.completed}
                          onCheckedChange={() => toggleChallenge(challenge.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-green-400" />
                            <Label 
                              htmlFor={challenge.id}
                              className={`font-semibold cursor-pointer ${challenge.completed ? 'line-through' : ''}`}
                            >
                              {challenge.title}
                            </Label>
                            <Badge className={getDifficultyColor(challenge.difficulty) + " text-xs"}>
                              {challenge.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                          <Badge variant="outline" className="text-xs border-green-500/50">
                            <Leaf className="h-3 w-3 mr-1" />
                            {challenge.impact}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {completedCount === challenges.length && (
              <Card className="border-green-500/30 bg-gradient-to-br from-green-950/50 to-emerald-950/30">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-2">All Challenges Completed! 🎉</h3>
                  <p className="text-muted-foreground">You're making a real difference for our planet!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Carbon Footprint Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      Monthly Electricity (kWh)
                    </Label>
                    <Input
                      type="number"
                      value={electricity}
                      onChange={(e) => setElectricity(e.target.value)}
                      placeholder="e.g., 300"
                      className="mt-1 bg-green-950/30 border-green-500/30"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-purple-400" />
                      Weekly Car Miles
                    </Label>
                    <Input
                      type="number"
                      value={carMiles}
                      onChange={(e) => setCarMiles(e.target.value)}
                      placeholder="e.g., 100"
                      className="mt-1 bg-green-950/30 border-green-500/30"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      ✈️ Flights Per Year
                    </Label>
                    <Input
                      type="number"
                      value={flightsPerYear}
                      onChange={(e) => setFlightsPerYear(e.target.value)}
                      placeholder="e.g., 2"
                      className="mt-1 bg-green-950/30 border-green-500/30"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-red-400" />
                      Meat Meals Per Week
                    </Label>
                    <Input
                      type="number"
                      value={meatMeals}
                      onChange={(e) => setMeatMeals(e.target.value)}
                      placeholder="e.g., 7"
                      className="mt-1 bg-green-950/30 border-green-500/30"
                    />
                  </div>
                </div>

                <Button 
                  onClick={calculateFootprint}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Calculate My Footprint
                </Button>

                {footprint !== null && (
                  <div className="p-6 rounded-lg bg-green-950/30 border border-green-500/30 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Your Annual Carbon Footprint</p>
                    <p className="text-4xl font-bold text-green-400 mb-2">
                      {(footprint / 1000).toFixed(1)} tonnes CO2
                    </p>
                    <p className={`font-semibold ${getFootprintLevel(footprint).color}`}>
                      {getFootprintLevel(footprint).level}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getFootprintLevel(footprint).description}
                    </p>
                    <div className="mt-4 text-xs text-muted-foreground">
                      <p>Global average: ~4.5 tonnes/year</p>
                      <p>US average: ~15 tonnes/year</p>
                      <p>Sustainable target: &lt;2 tonnes/year</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Droplets, title: "Water", tips: ["Fix leaky faucets", "Shorter showers", "Collect rainwater", "Full dishwasher loads"] },
                { icon: Zap, title: "Energy", tips: ["LED lighting", "Unplug devices", "Smart thermostat", "Solar panels"] },
                { icon: Car, title: "Transport", tips: ["Public transit", "Carpooling", "Electric vehicles", "Work from home"] },
                { icon: Utensils, title: "Food", tips: ["Eat local", "Reduce meat", "Compost scraps", "Avoid food waste"] },
                { icon: ShoppingBag, title: "Shopping", tips: ["Buy secondhand", "Avoid fast fashion", "Choose quality", "Minimal packaging"] },
                { icon: Leaf, title: "Home", tips: ["Plant trees", "Grow vegetables", "Use natural cleaners", "Insulate properly"] }
              ].map((category, index) => (
                <Card key={index} className="border-green-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <category.icon className="h-5 w-5 text-green-400" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.tips.map((tip, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-400" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SustainableGuide;
