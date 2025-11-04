import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, Zap, AlertCircle, Sparkles, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const FEATURES = {
  messageSmall: {
    name: "Future Message - Small",
    price: "€1",
    priceId: "price_1SPj8zGaXSfGtYFtlowYtYZu",
    icon: Clock,
    popular: false,
    description: "Send a short message to your future",
    features: [
      "Up to 100 characters",
      "Delivery date of your choice",
      "AI-powered time prediction",
      "Instant confirmation",
    ],
  },
  messageMedium: {
    name: "Future Message - Medium",
    price: "€5",
    priceId: "price_1SPj9P0QTWhd4oRpePZWZlc4",
    icon: Clock,
    popular: false,
    description: "Send a medium message to your future",
    features: [
      "Up to 500 characters",
      "Delivery date of your choice",
      "AI-powered time prediction",
      "Priority delivery",
    ],
  },
  messageLarge: {
    name: "Future Message - Large",
    price: "€10",
    priceId: "price_1SPjA2GaXSfGtYFt6iMPrver",
    icon: Clock,
    popular: false,
    description: "Send a large message to your future",
    features: [
      "Up to 2000 characters",
      "Delivery date of your choice",
      "AI-powered time prediction",
      "Priority delivery & encryption",
    ],
  },
  paradoxFix: {
    name: "Time Paradox Fix",
    price: "€5",
    priceId: "price_1SPjAJGaXSfGtYFteKl4JLou",
    icon: AlertCircle,
    popular: false,
    description: "Restore timeline integrity",
    features: [
      "Fix timeline paradoxes",
      "Restore corrupted messages",
      "Timeline integrity check",
      "24/7 AI support",
    ],
  },
  aiConsultation: {
    name: "Future AI Consultation",
    price: "€20",
    priceId: "price_1SPjAaGaXSfGtYFtog9lTrCh",
    icon: Sparkles,
    popular: true,
    description: "Get personalized future insights",
    features: [
      "AI predicts your future",
      "Personalized timeline analysis",
      "30-minute consultation",
      "Detailed report & recommendations",
    ],
  },
  insurance: {
    name: "Timeline Insurance",
    price: "€10",
    priceId: "price_1SPjAyGaXSfGtYFtxbuDUwXA",
    icon: Shield,
    popular: false,
    description: "Protect your timeline",
    features: [
      "Unlimited paradox fixes",
      "Timeline backup & restore",
      "Priority AI support",
      "Cancel anytime",
    ],
  },
};

export default function TimeCapsuleSubscription() {
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
      const { data, error } = await supabase.functions.invoke("create-time-capsule-checkout", {
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-background to-cyan-500/10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZGIyZWEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC0yYy0xLjEgMC0yIC45LTIgMnYyYzAgMS4xLjkgMiAyIDJoMmMxLjEgMCAyLS45IDItMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-6 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">
              Time Capsule Network
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Send Messages to Your Future
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AI predicts your future and delivers messages when the time is right. Create a living network of time capsules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {(Object.keys(FEATURES) as Array<keyof typeof FEATURES>).map((featureKey) => {
            const feature = FEATURES[featureKey];
            const Icon = feature.icon;

            return (
              <Card
                key={featureKey}
                className={`relative ${
                  feature.popular ? "border-blue-500 shadow-lg shadow-blue-500/20 lg:col-span-3" : ""
                }`}
              >
                {feature.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                    <div className="text-right">
                      <div className="text-3xl font-bold">{feature.price}</div>
                      <div className="text-sm text-muted-foreground">
                        {featureKey === "insurance" ? "/month" : "one-time"}
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
                        <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
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
                    {loading === featureKey ? "Loading..." : featureKey === "insurance" ? "Subscribe" : "Purchase Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-3">1</div>
              <h3 className="font-semibold mb-2 text-lg">Write Your Message</h3>
              <p className="text-sm text-muted-foreground">Compose a message for your future self or loved ones</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-3">2</div>
              <h3 className="font-semibold mb-2 text-lg">AI Predicts Delivery</h3>
              <p className="text-sm text-muted-foreground">Our AI analyzes the perfect moment to deliver your message</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-3">3</div>
              <h3 className="font-semibold mb-2 text-lg">Message Travels Through Time</h3>
              <p className="text-sm text-muted-foreground">Your message is stored securely until the delivery date</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-3">4</div>
              <h3 className="font-semibold mb-2 text-lg">Future Delivery</h3>
              <p className="text-sm text-muted-foreground">Receive your message exactly when you need it most</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
