import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingUp,
  Star,
  Zap,
  BarChart3,
  Calendar,
  Check,
  Shield,
  Infinity,
  Crown,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Predictions",
    description: "Advanced algorithms analyze historical data to generate optimized number combinations",
  },
  {
    icon: BarChart3,
    title: "Statistical Analysis",
    description: "Detailed frequency analysis, hot/cold numbers, and pattern recognition",
  },
  {
    icon: Calendar,
    title: "Lucky Day Detection",
    description: "AI determines your most favorable days for playing based on multiple factors",
  },
  {
    icon: TrendingUp,
    title: "Historical Tracking",
    description: "Save and track all your generated combinations with favorites system",
  },
];

const PRICING_TIERS = [
  {
    name: "Basic",
    price: "4.99",
    period: "month",
    description: "Perfect for casual players",
    features: [
      "10 generations per month",
      "Basic statistics",
      "Hot & Cold numbers",
      "Save up to 5 combinations",
      "Email support",
    ],
    icon: Star,
    color: "from-blue-500 to-cyan-500",
    priceId: "price_1SQ5bv0QTWhd4oRpEQwOsKMQ",
  },
  {
    name: "Pro",
    price: "9.99",
    period: "month",
    description: "For serious lottery enthusiasts",
    features: [
      "Unlimited generations",
      "Advanced analytics",
      "Lucky day notifications",
      "Save unlimited combinations",
      "Historical pattern analysis",
      "Priority AI processing",
      "Priority support",
    ],
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    popular: true,
    priceId: "price_1SQ5cIGaXSfGtYFtKghPwnpp",
  },
];

const LOTTERY_TYPES = [
  { name: "EuroJackpot", icon: "🇪🇺" },
  { name: "Lotto 6/49", icon: "🎰" },
  { name: "Powerball", icon: "🇺🇸" },
  { name: "Mega Millions", icon: "💰" },
];

export default function LotteryLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/20 via-background to-secondary/20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <Badge className="mb-4 animate-pulse" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Lottery Predictions
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Zvýšte svoje šance s AI
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Naša pokročilá AI analyzuje historické dáta a generuje optimalizované číselné kombinácie 
            pre najpopulárnejšie lotérie na svete.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => navigate("/auth")}>
              <Star className="mr-2 h-5 w-5" />
              Začať Zadarmo
            </Button>
            <Button size="lg" variant="outline" onClick={() => {
              document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
            }}>
              <BarChart3 className="mr-2 h-5 w-5" />
              Zobraziť Cenník
            </Button>
          </div>

          {/* Supported Lotteries */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <span className="text-sm text-muted-foreground">Podporované lotérie:</span>
            {LOTTERY_TYPES.map((lottery) => (
              <Badge key={lottery.name} variant="outline" className="text-base">
                {lottery.icon} {lottery.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prečo zvoliť našu AI?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kombinujeme pokročilé algoritmy strojového učenia s hlbokou štatistickou analýzou
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ako to funguje?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  1
                </div>
                <CardTitle>Vyberte Lotériu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Zvoľte si z EuroJackpot, Lotto 6/49, Powerball alebo Mega Millions
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  2
                </div>
                <CardTitle>AI Generuje Čísla</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Naša AI analyzuje vzory a generuje optimalizované kombinácie
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  3
                </div>
                <CardTitle>Uložte a Sledujte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ukladajte obľúbené kombinácie a sledujte históriu generovaní
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vyberte si svoj plán
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Začnite s predplatným a zvýšte svoje šance na výhru
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={`relative border-2 ${
                  tier.popular
                    ? "border-primary shadow-2xl scale-105"
                    : "border-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Najpopulárnejší
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <tier.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€{tier.price}</span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    size="lg"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => navigate("/auth")}
                  >
                    {tier.popular ? (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Začať s Pro
                      </>
                    ) : (
                      <>
                        <Star className="mr-2 h-4 w-4" />
                        Začať s Basic
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              <Shield className="inline h-4 w-4 mr-1" />
              Bezpečné platby cez Stripe • Zrušte kedykoľvek • Bez skrytých poplatkov
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pripravení zvýšiť svoje šance?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Pripojte sa k tisíckam používateľov, ktorí využívajú AI pre lepšie výsledky
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            <Sparkles className="mr-2 h-5 w-5" />
            Začať Teraz
          </Button>
        </div>
      </section>
    </div>
  );
}
