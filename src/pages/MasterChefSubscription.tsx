import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChefHat, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const TIERS = {
  amateur: {
    name: "Amateur",
    price: "€19.99",
    priceId: "price_1SPiaUGaXSfGtYFtpV3Q8jjN",
    productId: "prod_TMRTqaG6dcQNVx",
    icon: ChefHat,
    popular: false,
    features: [
      "5 súťaží za mesiac",
      "Základné hlasovanie",
      "Prístup k amatérskym kategóriám",
      "Komunitné recepty",
      "Základná štatistika výkonnosti",
    ],
  },
  pro: {
    name: "Pro",
    price: "€49.99",
    priceId: "price_1SPiarGaXSfGtYFtBgTuCPiw",
    productId: "prod_TMRTnRIoFKo2US",
    icon: Crown,
    popular: true,
    features: [
      "Neobmedzené súťaže",
      "Live battles v reálnom čase",
      "Prémiové kategórie (Fine Dining, Dessert Masters)",
      "Exkluzívne recepty od profesionálov",
      "Podrobné štatistiky a analýzy",
      "Prioritná podpora",
      "Mystery Box výzvy",
    ],
  },
  elite: {
    name: "Elite",
    price: "€99.99",
    priceId: "price_1SPibC0QTWhd4oRpJwaH5vZM",
    productId: "prod_TMRUCoB3rBTawE",
    icon: Sparkles,
    popular: false,
    features: [
      "Všetko z Pro tier",
      "Osobný mentoring od profesionálnych šéfkuchárov",
      "VIP behind-the-scenes prístup",
      "Výherné bonusy a odmeny",
      "Bez provízií z výhier",
      "Exkluzívne live eventy",
      "Prvoradé umiestnenie v leaderboardoch",
      "Prístup k uzavretým premium komunitám",
    ],
  },
};

export default function MasterChefSubscription() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async (tier: keyof typeof TIERS) => {
    try {
      setLoading(tier);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Prihlásenie potrebné",
          description: "Prosím prihláste sa pre pokračovanie",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-masterchef-checkout", {
        body: {
          priceId: TIERS[tier].priceId,
          tier: tier,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa spustiť platbu. Skúste znova.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            MasterChef Platforma
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Súťaž, hlasuj a staň sa kráľom kuchyne! Vyberte si balíček, ktorý vám najlepšie vyhovuje.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(Object.keys(TIERS) as Array<keyof typeof TIERS>).map((tierKey) => {
            const tier = TIERS[tierKey];
            const Icon = tier.icon;

            return (
              <Card
                key={tierKey}
                className={`relative ${
                  tier.popular ? "border-primary shadow-lg shadow-primary/20" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Najpopulárnejšie
                    </span>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                    <div className="text-right">
                      <div className="text-3xl font-bold">{tier.price}</div>
                      <div className="text-sm text-muted-foreground">/mesiac</div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>
                    {tierKey === "amateur" && "Pre začiatočníkov a nadšencov"}
                    {tierKey === "pro" && "Pre serious šéfkuchárov"}
                    {tierKey === "elite" && "Pre profesionálov a víťazov"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(tierKey)}
                    disabled={loading === tierKey}
                  >
                    {loading === tierKey ? "Načítavam..." : "Vybrať balíček"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">Ako to funguje?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg bg-card">
              <div className="text-3xl font-bold text-primary mb-2">1</div>
              <h3 className="font-semibold mb-2">Vyber si tier</h3>
              <p className="text-sm text-muted-foreground">Zvoľ balíček podľa tvojich ambícií</p>
            </div>
            <div className="p-6 rounded-lg bg-card">
              <div className="text-3xl font-bold text-primary mb-2">2</div>
              <h3 className="font-semibold mb-2">Súťaž</h3>
              <p className="text-sm text-muted-foreground">
                Pripoj sa k live battles alebo nahraj svoje video
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card">
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <h3 className="font-semibold mb-2">Získaj hlasy</h3>
              <p className="text-sm text-muted-foreground">Diváci hlasujú za najlepšie jedlo</p>
            </div>
            <div className="p-6 rounded-lg bg-card">
              <div className="text-3xl font-bold text-primary mb-2">4</div>
              <h3 className="font-semibold mb-2">Vyhraj</h3>
              <p className="text-sm text-muted-foreground">
                Získaj odmeny, XP a stúpaj v rebríčku
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
