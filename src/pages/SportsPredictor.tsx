import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  TrendingUp,
  Star,
  Zap,
  BarChart3,
  Bell,
  Shield,
  Users,
  Award,
  Target,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const PRICING_TIERS = [
  {
    name: "Free Tips",
    price: "0",
    period: "forever",
    description: "Get started with basic predictions",
    features: [
      "3 free predictions per week",
      "Basic match statistics",
      "Community tips access",
      "Win rate stats",
    ],
    icon: Star,
    color: "from-gray-500 to-gray-600",
  },
  {
    name: "AI Premium",
    price: "9.99",
    period: "month",
    description: "Advanced AI-powered predictions",
    features: [
      "Unlimited AI predictions",
      "Advanced analytics & insights",
      "Live match notifications",
      "Head-to-head analysis",
      "Injury & form tracking",
      "Historical data analysis",
    ],
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    popular: true,
  },
  {
    name: "Expert Tipster",
    price: "19.99",
    period: "month",
    description: "Follow top-rated expert tipsters",
    features: [
      "All AI Premium features",
      "Unlimited expert tips",
      "VIP tipster access",
      "Personalized recommendations",
      "Priority notifications",
      "Exclusive betting strategies",
      "Monthly expert webinars",
    ],
    icon: Trophy,
    color: "from-purple-500 to-pink-500",
  },
];

const TOP_TIPSTERS = [
  {
    id: 1,
    name: "Mike Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    sport: "Football",
    winRate: 78.5,
    totalTips: 342,
    followers: 12400,
    roi: "+24.3%",
    badge: "Elite",
  },
  {
    id: 2,
    name: "Sarah Thompson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    sport: "Basketball",
    winRate: 76.2,
    totalTips: 289,
    followers: 9800,
    roi: "+21.8%",
    badge: "Pro",
  },
  {
    id: 3,
    name: "James Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    sport: "Tennis",
    winRate: 74.8,
    totalTips: 256,
    followers: 8300,
    roi: "+19.5%",
    badge: "Pro",
  },
];

const getUpcomingMatches = () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  return [
    {
      id: 1,
      homeTeam: "Manchester United",
      awayTeam: "Liverpool",
      sport: "Football",
      time: "18:30",
      date: format(today, "MMM dd, yyyy"),
      dateLabel: "Today",
      prediction: "Home Win",
      confidence: 72,
      tipster: "Mike Rodriguez",
      odds: "2.10",
    },
    {
      id: 2,
      homeTeam: "Lakers",
      awayTeam: "Warriors",
      sport: "Basketball",
      time: "20:00",
      date: format(today, "MMM dd, yyyy"),
      dateLabel: "Today",
      prediction: "Over 215.5",
      confidence: 68,
      tipster: "Sarah Thompson",
      odds: "1.85",
    },
    {
      id: 3,
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      sport: "Football",
      time: "21:00",
      date: format(tomorrow, "MMM dd, yyyy"),
      dateLabel: "Tomorrow",
      prediction: "Both Teams Score",
      confidence: 75,
      tipster: "Mike Rodriguez",
      odds: "1.95",
    },
  ];
};

export default function SportsPredictor() {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState("all");
  const upcomingMatches = useMemo(() => getUpcomingMatches(), []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-secondary/20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <Badge className="mb-4 animate-pulse" variant="secondary">
            <Trophy className="h-3 w-3 mr-1" />
            Expert + AI Sports Predictions
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Sports Match Predictions
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get expert tips and AI-powered predictions for sports matches. 
            Follow top tipsters or leverage advanced AI analytics.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button size="lg" onClick={() => navigate("/auth")}>
              <Star className="mr-2 h-5 w-5" />
              Start Free
            </Button>
            <Button size="lg" variant="outline">
              <BarChart3 className="mr-2 h-5 w-5" />
              View Top Tipsters
            </Button>
          </div>

          {/* Legal Disclaimer */}
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-left">
                <strong className="text-orange-500">Disclaimer:</strong> Predictions are for entertainment purposes only. 
                Past performance does not guarantee future results. Gambling can be addictive. 
                Please bet responsibly. 18+ only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Tipsters Leaderboard */}
      <section className="py-12 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Top Tipsters Leaderboard</h2>
              <p className="text-muted-foreground">Follow the best performers</p>
            </div>
            <Button variant="outline">
              <Award className="mr-2 h-4 w-4" />
              Become a Tipster
            </Button>
          </div>

          <div className="grid gap-4">
            {TOP_TIPSTERS.map((tipster, index) => (
              <Card key={tipster.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-muted-foreground w-12">
                      #{index + 1}
                    </div>
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={tipster.avatar} />
                      <AvatarFallback>{tipster.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{tipster.name}</h3>
                        <Badge className={tipster.badge === "Elite" ? "bg-gradient-to-r from-yellow-500 to-orange-500" : ""}>
                          {tipster.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{tipster.sport} Specialist</p>
                    </div>
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-500">{tipster.winRate}%</div>
                        <div className="text-xs text-muted-foreground">Win Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{tipster.totalTips}</div>
                        <div className="text-xs text-muted-foreground">Tips</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{tipster.roi}</div>
                        <div className="text-xs text-muted-foreground">ROI</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{(tipster.followers / 1000).toFixed(1)}k</div>
                        <div className="text-xs text-muted-foreground">Followers</div>
                      </div>
                    </div>
                    <Button>
                      <Users className="mr-2 h-4 w-4" />
                      Follow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Matches */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">Today's Predictions</h2>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Sports</TabsTrigger>
              <TabsTrigger value="football">Football</TabsTrigger>
              <TabsTrigger value="basketball">Basketball</TabsTrigger>
              <TabsTrigger value="tennis">Tennis</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4">
                {upcomingMatches.map((match) => (
                  <Card key={match.id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-2">{match.sport}</Badge>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="font-bold text-lg">{match.homeTeam}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="font-bold text-lg">{match.awayTeam}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{match.dateLabel} ({match.date}) • {match.time}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.tipster}`} />
                              </Avatar>
                              <span>{match.tipster}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">Prediction</div>
                            <Badge className="bg-green-500">{match.prediction}</Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                            <div className="text-2xl font-bold">{match.confidence}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">Odds</div>
                            <div className="text-2xl font-bold text-primary">{match.odds}</div>
                          </div>
                          <Button>
                            <Bell className="mr-2 h-4 w-4" />
                            Get Alert
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Platform Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Win Rate Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track detailed performance metrics for every tipster with transparent win rates and ROI
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Live Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get instant alerts before matches start with predictions from your favorite tipsters
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive match analysis including form, head-to-head stats, and injury reports
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground">Start free or upgrade for premium features</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={`relative ${
                  tier.popular ? "border-2 border-primary shadow-xl" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <tier.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => navigate("/auth")}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Tipster CTA */}
      <section className="py-12 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Become a Professional Tipster</h2>
          <p className="text-xl text-muted-foreground mb-6">
            Share your expertise and earn 75% from every tip you sell. 
            Top performers get exclusive badges and higher visibility.
          </p>
          <div className="flex gap-4 justify-center mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">€1-50</div>
              <div className="text-sm text-muted-foreground">Per Tip</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">75%</div>
              <div className="text-sm text-muted-foreground">Your Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">€19.99</div>
              <div className="text-sm text-muted-foreground">Subscription Price</div>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate("/auth")}>
            <Award className="mr-2 h-5 w-5" />
            Apply as Tipster
          </Button>
        </div>
      </section>
    </div>
  );
}
