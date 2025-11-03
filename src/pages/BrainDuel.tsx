import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Zap, Users, ShoppingCart, Crown, Flame, Clock, 
  Globe, BookOpen, FlaskConical, Film, Dumbbell, Music, 
  Pizza, Briefcase, Palette, Gamepad2, Target, Brain,
  TrendingUp, Heart, Sparkles, Gift
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BrainDuel = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const gameModes = [
    {
      id: "quick",
      name: "Quick Duel",
      duration: "5 minutes",
      questions: 10,
      timePerQuestion: "30s",
      entry: "€0.50",
      reward: "5 credits",
      icon: Zap,
      color: "text-yellow-500"
    },
    {
      id: "classic",
      name: "Classic Battle",
      duration: "10 minutes",
      questions: 20,
      timePerQuestion: "30s",
      entry: "€1.00",
      reward: "10 credits + achievement",
      icon: Trophy,
      color: "text-blue-500"
    },
    {
      id: "championship",
      name: "Championship",
      duration: "20 minutes",
      questions: 50,
      timePerQuestion: "24s",
      entry: "€3.00",
      reward: "50 credits + trophy",
      icon: Crown,
      color: "text-purple-500",
      featured: true
    }
  ];

  const tournaments = [
    {
      id: "bronze",
      name: "Bronze League",
      entry: "€0.50",
      description: "Beginners",
      color: "bg-amber-700",
      icon: "🥉"
    },
    {
      id: "silver",
      name: "Silver League",
      entry: "€1.00",
      description: "Advanced",
      color: "bg-slate-400",
      icon: "🥈"
    },
    {
      id: "gold",
      name: "Gold League",
      entry: "€3.00",
      description: "Experts",
      color: "bg-yellow-500",
      icon: "🥇"
    },
    {
      id: "diamond",
      name: "Diamond League",
      entry: "€10.00",
      description: "Professionals",
      color: "bg-cyan-400",
      icon: "💎",
      featured: true
    }
  ];

  const categories = [
    { id: "geography", name: "Geography", icon: Globe, color: "text-green-500" },
    { id: "history", name: "History", icon: BookOpen, color: "text-amber-600" },
    { id: "science", name: "Science & Tech", icon: FlaskConical, color: "text-blue-500" },
    { id: "film", name: "Film & TV", icon: Film, color: "text-red-500" },
    { id: "sports", name: "Sports", icon: Dumbbell, color: "text-orange-500" },
    { id: "music", name: "Music", icon: Music, color: "text-purple-500" },
    { id: "food", name: "Food & Drinks", icon: Pizza, color: "text-pink-500" },
    { id: "business", name: "Business & Economy", icon: Briefcase, color: "text-slate-600" },
    { id: "art", name: "Art & Culture", icon: Palette, color: "text-violet-500" },
    { id: "gaming", name: "Gaming & Pop Culture", icon: Gamepad2, color: "text-cyan-500" }
  ];

  const powerUps = [
    {
      id: "fifty-fifty",
      name: "50:50",
      description: "Remove 2 wrong answers",
      price: "€0.50",
      icon: Target,
      color: "text-yellow-500"
    },
    {
      id: "ask-ai",
      name: "Ask AI",
      description: "AI hint for the answer",
      price: "€0.30",
      icon: Brain,
      color: "text-blue-500"
    },
    {
      id: "extra-time",
      name: "Extra Time",
      description: "+15 seconds bonus",
      price: "€0.20",
      icon: Clock,
      color: "text-green-500"
    },
    {
      id: "double-points",
      name: "Double Points",
      description: "2× credits from this question",
      price: "€1.00",
      icon: TrendingUp,
      color: "text-purple-500"
    }
  ];

  const questionPacks = [
    {
      id: "celebrity",
      name: "Celebrity Pack",
      questions: 100,
      price: "€2.99",
      category: "Entertainment"
    },
    {
      id: "history",
      name: "History Bundle",
      questions: 200,
      price: "€4.99",
      category: "History"
    },
    {
      id: "science",
      name: "Science Mega Pack",
      questions: 300,
      price: "€7.99",
      category: "Science"
    },
    {
      id: "custom",
      name: "Create Custom Pack",
      questions: "Unlimited",
      price: "€0.10/question",
      category: "Custom",
      custom: true
    }
  ];

  const handleStartGame = (modeId: string) => {
    toast.info(`Starting ${gameModes.find(m => m.id === modeId)?.name}...`, {
      description: "Finding an opponent for you"
    });
  };

  const handleJoinTournament = (tournamentId: string) => {
    toast.info(`Joining ${tournaments.find(t => t.id === tournamentId)?.name}...`, {
      description: "Waiting for tournament to start"
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl pt-20">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-sm">Live Now</Badge>
            <Badge variant="outline" className="text-sm">
              <Flame className="w-3 h-3 mr-1 text-orange-500" />
              1,234 players online
            </Badge>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            BrainDuel
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Battle of Knowledge • Winner Takes All
          </p>
          <p className="text-sm text-muted-foreground">
            QuizArena • Knowledge Battle • SmartShowdown
          </p>
        </div>

        <Tabs defaultValue="play" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto bg-muted p-2 mb-6">
            <TabsTrigger value="play" className="gap-2">
              <Zap className="h-4 w-4" />
              Play Now
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="gap-2">
              <Trophy className="h-4 w-4" />
              Tournaments
            </TabsTrigger>
            <TabsTrigger value="powerups" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Power-ups
            </TabsTrigger>
            <TabsTrigger value="packs" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Question Packs
            </TabsTrigger>
            <TabsTrigger value="audience" className="gap-2">
              <Users className="h-4 w-4" />
              Live Audience
            </TabsTrigger>
          </TabsList>

          {/* Play Now Tab */}
          <TabsContent value="play" className="space-y-6">
            {/* Betting System Info */}
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Betting System
                </CardTitle>
                <CardDescription>
                  Winner takes all • Platform takes 10% commission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Players bet against each other in real-time duels. The winner takes the entire prize pool minus a 10% platform fee.
                </p>
              </CardContent>
            </Card>

            {/* Game Modes */}
            <div className="grid md:grid-cols-3 gap-4">
              {gameModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Card 
                    key={mode.id}
                    className={`relative hover:shadow-elegant transition-all ${
                      mode.featured ? 'border-primary/50 ring-2 ring-primary/20' : ''
                    }`}
                  >
                    {mode.featured && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-bold">
                        POPULAR
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${mode.color}`} />
                        {mode.name}
                      </CardTitle>
                      <CardDescription>
                        {mode.duration} • {mode.questions} questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time per question:</span>
                          <span className="font-medium">{mode.timePerQuestion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entry fee:</span>
                          <span className="font-bold text-primary">{mode.entry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Win reward:</span>
                          <span className="font-bold text-green-500">{mode.reward}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => handleStartGame(mode.id)}
                      >
                        Start Battle
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Question Categories</CardTitle>
                <CardDescription>
                  Choose your expertise or challenge yourself with mixed categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                      >
                        <Icon className={`h-6 w-6 ${category.color}`} />
                        <span className="text-xs font-medium">{category.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tiered Tournaments</CardTitle>
                <CardDescription>
                  Compete in your skill level and climb the ranks
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {tournaments.map((tournament) => (
                <Card 
                  key={tournament.id}
                  className={`relative ${
                    tournament.featured ? 'border-primary/50 ring-2 ring-primary/20' : ''
                  }`}
                >
                  {tournament.featured && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                      ELITE
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${tournament.color} rounded-full flex items-center justify-center text-2xl`}>
                        {tournament.icon}
                      </div>
                      <div>
                        <div>{tournament.name}</div>
                        <div className="text-sm font-normal text-muted-foreground">
                          {tournament.description}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Entry fee:</span>
                      <span className="text-2xl font-bold text-primary">{tournament.entry}</span>
                    </div>
                    <Button className="w-full" onClick={() => handleJoinTournament(tournament.id)}>
                      Join Tournament
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Power-ups Tab */}
          <TabsContent value="powerups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>In-Game Power-ups</CardTitle>
                <CardDescription>
                  Boost your chances during battles with special abilities
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {powerUps.map((powerUp) => {
                const Icon = powerUp.icon;
                return (
                  <Card key={powerUp.id} className="hover:shadow-elegant transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className={`h-5 w-5 ${powerUp.color}`} />
                        {powerUp.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{powerUp.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">{powerUp.price}</span>
                        <Button size="sm">Buy</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Question Packs Tab */}
          <TabsContent value="packs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Packs</CardTitle>
                <CardDescription>
                  Expand your question library with themed packs or create your own
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {questionPacks.map((pack) => (
                <Card 
                  key={pack.id}
                  className={`hover:shadow-elegant transition-all ${
                    pack.custom ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5' : ''
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {pack.custom ? <Gift className="h-5 w-5 text-primary" /> : <ShoppingCart className="h-5 w-5" />}
                      {pack.name}
                    </CardTitle>
                    <CardDescription>
                      {pack.category} • {pack.questions} questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">{pack.price}</span>
                      <Button>
                        {pack.custom ? 'Create Pack' : 'Purchase'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Live Audience Mode
                </CardTitle>
                <CardDescription>
                  Watch live battles and bet on your favorite players
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">Bet range:</span>
                    <span className="font-bold">€0.10 - €5.00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">Winner payout:</span>
                    <span className="font-bold text-green-500">70%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">Loser payout:</span>
                    <span className="font-bold text-orange-500">10%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">Platform fee:</span>
                    <span className="font-bold">20%</span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Live Chat Gifts
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send virtual gifts to players during live battles
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">❤️ €0.50</Badge>
                    <Badge variant="outline">🎁 €1.00</Badge>
                    <Badge variant="outline">🏆 €2.00</Badge>
                    <Badge variant="outline">👑 €5.00</Badge>
                    <Badge variant="outline">💎 €10.00</Badge>
                  </div>
                </div>

                <Button className="w-full mt-4" size="lg">
                  Watch Live Battles
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BrainDuel;
