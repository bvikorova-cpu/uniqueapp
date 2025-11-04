import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Heart, Gem, BookOpen, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const FEATURES = {
  aiEnergyReading: {
    name: "AI Energy Reading",
    price: "€3",
    priceId: "price_1SPjMLGaXSfGtYFtqkcK9RvD",
    icon: Sparkles,
    popular: false,
    description: "AI detects your energy from photos",
    features: [
      "Upload photo or video",
      "AI energy level analysis",
      "Personalized crystal recommendations",
      "Energy report with insights",
    ],
  },
  energyHealing: {
    name: "Energy Healing Session",
    price: "€20",
    priceId: "price_1SPjMeGaXSfGtYFtxh1CBELL",
    icon: Heart,
    popular: false,
    description: "Personalized energy healing",
    features: [
      "1-hour guided healing session",
      "AI-powered energy assessment",
      "Custom crystal therapy plan",
      "Follow-up recommendations",
    ],
  },
  chakraBalancing: {
    name: "Chakra Balancing Program",
    price: "€30",
    priceId: "price_1SPjNVGaXSfGtYFtf30eOhsv",
    icon: Gem,
    popular: true,
    description: "Complete chakra alignment",
    features: [
      "7-day comprehensive program",
      "All 7 chakras balanced",
      "Personalized crystal therapy",
      "Daily AI coaching & guidance",
      "Progress tracking & reports",
    ],
  },
  premiumEncyclopedia: {
    name: "Premium Crystal Encyclopedia",
    price: "€7",
    priceId: "price_1SPjNnGaXSfGtYFtxxkU1fPa",
    icon: BookOpen,
    popular: false,
    description: "Complete crystal knowledge base",
    features: [
      "500+ crystal profiles",
      "Daily crystal insights",
      "AI-powered recommendations",
      "Energy compatibility tests",
      "Exclusive content & updates",
    ],
  },
};

export default function CrystalEnergyNetwork() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePurchase = async (featureKey: keyof typeof FEATURES) => {
    try {
      setLoading(featureKey);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const feature = FEATURES[featureKey];
      const { data, error } = await supabase.functions.invoke("create-crystal-energy-checkout", {
        body: {
          priceId: feature.priceId,
          featureName: feature.name,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Error",
        description: "Failed to start payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-background to-pink-500/10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNjMDg0ZmMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC0yYy0xLjEgMC0yIC45LTIgMnYyYzAgMS4xLjkgMiAyIDJoMmMxLjEgMCAyLS45IDItMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-6 py-2 bg-violet-500/20 rounded-full border border-violet-500/30">
            <span className="text-violet-600 dark:text-violet-400 font-semibold text-sm uppercase tracking-wider">
              Crystal & Energy Network
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
            AI-Powered Energy & Crystal Healing
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover your energy levels through AI analysis. Get personalized crystal recommendations and healing guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
          {(Object.keys(FEATURES) as Array<keyof typeof FEATURES>).map((featureKey) => {
            const feature = FEATURES[featureKey];
            const Icon = feature.icon;

            return (
              <Card
                key={featureKey}
                className={`relative ${
                  feature.popular ? "border-violet-500 shadow-lg shadow-violet-500/20" : ""
                }`}
              >
                {feature.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-violet-600" />
                    <div className="text-right">
                      <div className="text-3xl font-bold">{feature.price}</div>
                      <div className="text-sm text-muted-foreground">
                        {featureKey === "premiumEncyclopedia" ? "/month" : "one-time"}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{feature.name}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {feature.features.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={feature.popular ? "default" : "outline"}
                    onClick={() => handlePurchase(featureKey)}
                    disabled={loading === featureKey}
                  >
                    {loading === featureKey ? "Loading..." : featureKey === "premiumEncyclopedia" ? "Subscribe" : "Purchase Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-16">
          <Card className="border-violet-500/30 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Store className="h-8 w-8 text-violet-600" />
                <CardTitle className="text-2xl">Crystal Marketplace</CardTitle>
              </div>
              <CardDescription className="text-base">
                Buy and sell authentic crystals. 15% commission on all sales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Connect with verified crystal sellers worldwide. Each crystal comes with an AI-verified authenticity certificate and energy profile.
              </p>
              <Button variant="outline" size="lg">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-violet-500/20 hover:border-violet-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-violet-500 to-pink-500 bg-clip-text text-transparent mb-3">1</div>
              <h3 className="font-semibold mb-2 text-lg">Upload Photo/Video</h3>
              <p className="text-sm text-muted-foreground">Share a photo or video of yourself for AI analysis</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-violet-500/20 hover:border-violet-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-violet-500 to-pink-500 bg-clip-text text-transparent mb-3">2</div>
              <h3 className="font-semibold mb-2 text-lg">AI Energy Detection</h3>
              <p className="text-sm text-muted-foreground">Advanced AI analyzes your energy levels and patterns</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-violet-500/20 hover:border-violet-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-violet-500 to-pink-500 bg-clip-text text-transparent mb-3">3</div>
              <h3 className="font-semibold mb-2 text-lg">Crystal Recommendations</h3>
              <p className="text-sm text-muted-foreground">Get personalized crystal suggestions for your energy</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-violet-500/20 hover:border-violet-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-violet-500 to-pink-500 bg-clip-text text-transparent mb-3">4</div>
              <h3 className="font-semibold mb-2 text-lg">Begin Healing</h3>
              <p className="text-sm text-muted-foreground">Follow AI-guided healing journey with your crystals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
