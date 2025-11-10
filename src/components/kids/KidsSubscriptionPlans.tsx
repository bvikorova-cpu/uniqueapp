import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Heart, School, Users } from "lucide-react";
import { useKidsSubscription } from "@/hooks/useKidsSubscription";
import { toast } from "sonner";

const subscriptionPlans = [
  {
    id: 'basic',
    name: '⭐ Basic',
    price: 5,
    interval: 'mesiac',
    icon: Sparkles,
    color: 'from-yellow-500 to-orange-500',
    popular: true,
    features: [
      '20 rozprávok/mesiac',
      'HD ilustrácie',
      'Audio rozprávky',
      'Vytvoriť postavu',
      'Výukové príbehy',
      'Rozprávky na spanie'
    ]
  },
  {
    id: 'pro',
    name: '👑 Pro',
    price: 50,
    interval: '12 mesiacov',
    icon: Users,
    color: 'from-purple-500 to-indigo-500',
    features: [
      'Neobmedzené rozprávky',
      'Video rozprávky',
      'AR rozprávky',
      '3 detské profily',
      'Všetky prémiové funkcie',
      'Bez reklám',
      'Ušetríte 40€ ročne!'
    ]
  },
  {
    id: 'school',
    name: '🏫 School',
    price: 49.99,
    interval: 'mesiac',
    icon: School,
    color: 'from-green-500 to-emerald-500',
    features: [
      '50 detských účtov',
      'Analytics & reporty',
      'Vlastný branding',
      'Výukové programy',
      'Prioritná podpora',
      'Učiteľský dashboard'
    ]
  }
];

const payPerStory = [
  { name: '📖 Základný príbeh', price: 1.50 },
  { name: '🌟 Personalizovaný príbeh', price: 3.50 },
  { name: '🎬 Video rozprávka', price: 7.99 },
  { name: '🥽 AR rozprávka', price: 12.99 }
];

export default function KidsSubscriptionPlans() {
  const { subscription, upgrade } = useKidsSubscription();

  const handleUpgrade = async (planId: string) => {
    try {
      await upgrade(planId);
      toast.success(`🎉 Úspešne! Vitaj v ${planId} pláne!`);
    } catch (error) {
      toast.error('Ups! Niečo sa nepodarilo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Vyber si svoj plán! ✨
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Neobmedzené rozprávky plné dobrodružstva a fantázie pre tvoje deti
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {subscriptionPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.id}
                className={`relative overflow-hidden border-4 transform transition-all hover:scale-105 ${
                  plan.popular 
                    ? 'border-primary shadow-2xl' 
                    : 'border-transparent hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="gap-1 text-base px-4 py-1 shadow-lg bg-gradient-to-r from-yellow-400 to-orange-400">
                      <Sparkles className="h-4 w-4" />
                      Najobľúbenejší
                    </Badge>
                  </div>
                )}
                
                <div className={`h-3 bg-gradient-to-r ${plan.color}`} />
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-lg">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-center space-y-1">
                    <div className="text-4xl font-bold text-foreground">
                      €{plan.price}
                    </div>
                    <div className="text-sm text-muted-foreground">/{plan.interval}</div>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={subscription?.subscription_type === plan.id}
                    className="w-full text-lg py-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {subscription?.subscription_type === plan.id 
                      ? '✓ Tvoj plán' 
                      : 'Vybrať plán'
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pay Per Story */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">🎨 Alebo kúp len jeden príbeh</h2>
            <p className="text-muted-foreground">Bez mesačného predplatného</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {payPerStory.map((item, idx) => (
              <Card key={idx} className="text-center hover:border-primary transition-colors cursor-pointer">
                <CardContent className="pt-6 space-y-3">
                  <div className="text-xl font-semibold">{item.name}</div>
                  <div className="text-3xl font-bold text-primary">€{item.price}</div>
                  <Button variant="outline" className="w-full">
                    Kúpiť
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* B2B Section */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl p-8 border-2 border-dashed border-purple-300 dark:border-purple-700">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">🏢 Pre škôlky, hotely a reštaurácie</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Špeciálne B2B riešenia s vlastným brandingom a analytics
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Badge variant="outline" className="text-base px-4 py-2">🏨 Hotely €500-2000/mes</Badge>
              <Badge variant="outline" className="text-base px-4 py-2">🍽️ Reštaurácie €200-800/mes</Badge>
              <Badge variant="outline" className="text-base px-4 py-2">🏥 Pediatrie €300-1500/mes</Badge>
              <Badge variant="outline" className="text-base px-4 py-2">✈️ Letecké spoločnosti €1000-5000/mes</Badge>
            </div>
            <Button size="lg" className="mt-4">
              Kontaktujte nás
            </Button>
          </div>
        </div>

        {/* Trust & Guarantee */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>✓ Žiadne skryté poplatky · ✓ Zruš kedykoľvek · ✓ 14-dňová záruka vrátenia peňazí</p>
          <p>🔒 Bezpečné platby cez Stripe</p>
        </div>
      </div>
    </div>
  );
}
