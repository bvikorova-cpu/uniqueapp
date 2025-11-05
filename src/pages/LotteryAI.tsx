import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Star,
  Save,
  Zap,
  BarChart3,
  Calendar,
  Coins,
  Check,
} from "lucide-react";

const LOTTERY_TYPES = [
  { id: "eurojackpot", name: "EuroJackpot", maxNumber: 50, bonusBalls: 12, mainBalls: 5, bonusCount: 2 },
  { id: "lotto", name: "Lotto 6/49", maxNumber: 49, bonusBalls: 0, mainBalls: 6, bonusCount: 0 },
  { id: "powerball", name: "Powerball", maxNumber: 69, bonusBalls: 26, mainBalls: 5, bonusCount: 1 },
  { id: "megamillions", name: "Mega Millions", maxNumber: 70, bonusBalls: 25, mainBalls: 5, bonusCount: 1 },
];

const PRICING_TIERS = [
  {
    name: "Basic",
    price: "4.99",
    period: "month",
    features: [
      "10 generations per month",
      "Basic statistics",
      "Hot & Cold numbers",
      "Save up to 5 combinations",
    ],
    icon: Star,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Pro",
    price: "9.99",
    period: "month",
    features: [
      "Unlimited generations",
      "Advanced analytics",
      "Lucky day notifications",
      "Save unlimited combinations",
      "Historical pattern analysis",
      "Priority AI processing",
    ],
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    popular: true,
  },
  {
    name: "Premium Set",
    price: "2.00",
    period: "one-time",
    features: [
      "Super Lucky Set generation",
      "Extra AI deep analysis",
      "Astrological alignment",
      "Custom number preferences",
    ],
    icon: Sparkles,
    color: "from-orange-500 to-red-500",
  },
];

export default function LotteryAI() {
  const { toast } = useToast();
  const [selectedLottery, setSelectedLottery] = useState(LOTTERY_TYPES[0]);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [bonusNumbers, setBonusNumbers] = useState<number[]>([]);
  const [savedCombinations, setSavedCombinations] = useState<any[]>([]);

  const generateNumbers = () => {
    // Generate random main numbers
    const numbers: number[] = [];
    while (numbers.length < selectedLottery.mainBalls) {
      const num = Math.floor(Math.random() * selectedLottery.maxNumber) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    numbers.sort((a, b) => a - b);
    setGeneratedNumbers(numbers);

    // Generate bonus numbers if applicable
    if (selectedLottery.bonusCount > 0) {
      const bonus: number[] = [];
      while (bonus.length < selectedLottery.bonusCount) {
        const num = Math.floor(Math.random() * selectedLottery.bonusBalls) + 1;
        if (!bonus.includes(num)) {
          bonus.push(num);
        }
      }
      bonus.sort((a, b) => a - b);
      setBonusNumbers(bonus);
    } else {
      setBonusNumbers([]);
    }

    toast({
      title: "Numbers Generated! 🎰",
      description: "Your AI-predicted lucky numbers are ready!",
    });
  };

  const saveCombination = () => {
    const combination = {
      id: Date.now(),
      lottery: selectedLottery.name,
      numbers: generatedNumbers,
      bonus: bonusNumbers,
      date: new Date().toLocaleDateString(),
    };
    setSavedCombinations([combination, ...savedCombinations]);
    toast({
      title: "Combination Saved! 💾",
      description: "Your lucky numbers have been saved for later.",
    });
  };

  // Mock hot and cold numbers
  const hotNumbers = [7, 14, 21, 28, 35, 42];
  const coldNumbers = [3, 9, 16, 23, 31, 44];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-secondary/20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Predictions
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Lottery Numbers - AI Predictions
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI generates "lucky" numbers based on historical data and your personal preferences
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={generateNumbers}>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Lucky Numbers
            </Button>
            <Button size="lg" variant="outline">
              <BarChart3 className="mr-2 h-5 w-5" />
              View Statistics
            </Button>
          </div>
        </div>
      </section>

      {/* Main Generator Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="generator">Generator</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="saved">Saved ({savedCombinations.length})</TabsTrigger>
            </TabsList>

            {/* Generator Tab */}
            <TabsContent value="generator" className="mt-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Generator */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Lottery Type</CardTitle>
                      <CardDescription>Choose your preferred lottery game</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={selectedLottery.id}
                        onValueChange={(value) => {
                          const lottery = LOTTERY_TYPES.find((l) => l.id === value);
                          if (lottery) setSelectedLottery(lottery);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOTTERY_TYPES.map((lottery) => (
                            <SelectItem key={lottery.id} value={lottery.id}>
                              {lottery.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Your AI-Generated Lucky Numbers
                      </CardTitle>
                      <CardDescription>
                        Based on {selectedLottery.name} - {selectedLottery.mainBalls} main numbers
                        {selectedLottery.bonusCount > 0 && ` + ${selectedLottery.bonusCount} bonus`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {generatedNumbers.length === 0 ? (
                        <div className="text-center py-12">
                          <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">
                            Click "Generate Lucky Numbers" to get your AI predictions
                          </p>
                          <Button onClick={generateNumbers} size="lg">
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Now
                          </Button>
                        </div>
                      ) : (
                        <>
                          {/* Main Numbers */}
                          <div>
                            <p className="text-sm font-medium mb-3">Main Numbers:</p>
                            <div className="flex flex-wrap gap-3">
                              {generatedNumbers.map((num, idx) => (
                                <div
                                  key={idx}
                                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg"
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bonus Numbers */}
                          {bonusNumbers.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-3">Bonus Numbers:</p>
                              <div className="flex flex-wrap gap-3">
                                {bonusNumbers.map((num, idx) => (
                                  <div
                                    key={idx}
                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                                  >
                                    {num}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-3 pt-4">
                            <Button onClick={generateNumbers} className="flex-1">
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate New
                            </Button>
                            <Button onClick={saveCombination} variant="outline">
                              <Save className="mr-2 h-4 w-4" />
                              Save Combination
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Hot & Cold Numbers Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-red-500" />
                        Hot Numbers
                      </CardTitle>
                      <CardDescription>Most frequently drawn</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {hotNumbers.map((num) => (
                          <div
                            key={num}
                            className="aspect-square rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center font-bold text-red-500"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-blue-500" />
                        Cold Numbers
                      </CardTitle>
                      <CardDescription>Least frequently drawn</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {coldNumbers.map((num) => (
                          <div
                            key={num}
                            className="aspect-square rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-500"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Lucky Day
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Based on AI analysis, your luckiest day this week:
                      </p>
                      <p className="text-2xl font-bold">Friday, Dec 8</p>
                      <Badge className="mt-2" variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        83% Lucky Score
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Frequency Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { num: 7, freq: 42, color: "bg-red-500" },
                        { num: 14, freq: 38, color: "bg-orange-500" },
                        { num: 21, freq: 35, color: "bg-yellow-500" },
                        { num: 28, freq: 31, color: "bg-green-500" },
                        { num: 35, freq: 28, color: "bg-blue-500" },
                      ].map((item) => (
                        <div key={item.num} className="flex items-center gap-3">
                          <div className="w-12 text-center font-bold">{item.num}</div>
                          <div className="flex-1 h-8 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color} transition-all`}
                              style={{ width: `${item.freq}%` }}
                            />
                          </div>
                          <div className="w-16 text-right text-sm text-muted-foreground">
                            {item.freq}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pattern Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="font-medium">Odd/Even Ratio</span>
                      <Badge>3:3 Optimal</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="font-medium">High/Low Balance</span>
                      <Badge>Balanced</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="font-medium">Consecutive Numbers</span>
                      <Badge variant="outline">Low Probability</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Saved Combinations Tab */}
            <TabsContent value="saved" className="mt-8">
              {savedCombinations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Save className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No saved combinations yet</p>
                    <p className="text-sm text-muted-foreground">
                      Generate and save your favorite number combinations
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {savedCombinations.map((combo) => (
                    <Card key={combo.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{combo.lottery}</CardTitle>
                          <Badge variant="secondary">{combo.date}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {combo.numbers.map((num: number, idx: number) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary"
                            >
                              {num}
                            </div>
                          ))}
                          {combo.bonus.map((num: number, idx: number) => (
                            <div
                              key={`bonus-${idx}`}
                              className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center font-bold text-orange-500"
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground">
              Unlock advanced AI predictions and analytics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={tier.name}
                  className={`relative ${
                    tier.popular ? "border-2 border-primary shadow-xl scale-105" : ""
                  }`}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">€{tier.price}</span>
                      <span className="text-muted-foreground">/{tier.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-6" variant={tier.popular ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to maximize your lottery strategy
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Multiple Lottery Types",
                description: "Support for EuroJackpot, Lotto 6/49, Powerball, Mega Millions, and more",
              },
              {
                icon: BarChart3,
                title: "Historical Statistics",
                description: "Deep analysis of past draws and number frequency patterns",
              },
              {
                icon: TrendingUp,
                title: "Hot & Cold Analysis",
                description: "Track frequently and rarely drawn numbers for informed decisions",
              },
              {
                icon: Save,
                title: "Saved Combinations",
                description: "Store and manage your favorite number combinations",
              },
              {
                icon: Calendar,
                title: "Lucky Day Notifications",
                description: "Get alerts on your most auspicious days to play (Pro plan)",
              },
              {
                icon: Zap,
                title: "AI-Powered Predictions",
                description: "Advanced machine learning algorithms analyze patterns",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx}>
                  <CardHeader>
                    <Icon className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 bg-muted/50">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This tool is for entertainment purposes only. AI predictions
            are based on historical patterns and do not guarantee winning outcomes. Please play
            responsibly.
          </p>
        </div>
      </section>
    </div>
  );
}
