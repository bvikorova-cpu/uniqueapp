import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Zap, Trophy, Users, Star, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ModuleSubscriptionHero } from "@/components/subscription/ModuleSubscriptionHero";

const tiers = {
  pro: {
    name: "Pro",
    price: "€12.99",
    priceId: "price_1SPi5GGaXSfGtYFtlHoasCWx",
    credits: 1000,
    icon: Zap,
    color: "from-blue-600 to-cyan-600",
    features: [
      "Unlimited leagues",
      "Live stats & analytics",
      "1000 monthly credits",
      "No ads",
      "Mobile app access",
      "Community access"
    ]
  },
  elite: {
    name: "Elite",
    price: "€24.99",
    priceId: "price_1SPi5XGaXSfGtYFtnJalF08v",
    credits: 3000,
    icon: Trophy,
    color: "from-yellow-600 to-orange-600",
    features: [
      "Everything in Pro",
      "3000 monthly credits (3x)",
      "Exclusive VIP leagues",
      "Early access features",
      "Priority support",
      "Custom team branding",
      "Advanced analytics",
      "Private leagues (unlimited)",
      "Trading fee discount (50%)"
    ]
  },
  team: {
    name: "Team Package",
    price: "€99.99",
    priceId: "price_1SPi5o0QTWhd4oRpvgi8IB9R",
    credits: 15000,
    icon: Users,
    color: "from-purple-600 to-indigo-600",
    features: [
      "For 5-10 people",
      "All Elite features",
      "15,000 monthly credits",
      "Team dashboard",
      "Bulk credit management",
      "Dedicated account manager",
      "Custom tournaments",
      "White-label options"
    ]
  }
};

const GPSubscription = () => {
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingTier, setProcessingTier] = useState<string | null>(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-f1-subscription');
      if (error) throw error;

      setIsSubscribed(data.subscribed);
      setCurrentTier(data.tier);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierKey: string, priceId: string) => {
    setProcessingTier(tierKey);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to subscribe");
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-f1-checkout', {
        body: { priceId, tier: tierKey }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Failed to create checkout session");
    } finally {
      setProcessingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('f1-customer-portal');
      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error("Failed to open customer portal");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-gray-900 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/gp-racing')}
          className="mb-4 sm:mb-6 text-white hover:bg-white/10"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Racing
        </Button>

        <ModuleSubscriptionHero
          module="GP Fantasy Racing"
          icon={Trophy}
          badge="Premium GP"
          title="🏎️ Choose your plan"
          subtitle="Premium-only GP Fantasy Racing — leagues, live stats, exclusive teams."
        />
        {isSubscribed && (
          <div className="text-center mb-6">
            <Badge className="bg-emerald-500 text-white text-sm sm:text-xl px-4 sm:px-6 py-2 sm:py-3">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" />
              Current Plan: {currentTier?.toUpperCase()}
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Object.entries(tiers).map(([key, tier]) => {
            const Icon = tier.icon;
            const isCurrentPlan = currentTier === key;
            
            return (
              <Card
                key={key}
                className={`relative border-4 ${
                  isCurrentPlan
                    ? "border-green-500 shadow-2xl shadow-green-500/50"
                    : "border-red-500"
                } bg-black/90 hover:scale-105 transition-all duration-300`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-2 text-lg">
                      <Crown className="w-4 h-4 mr-1 inline" />
                      Your Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-4 sm:p-6">
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                    <Icon className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-3xl text-center text-white mb-2">
                    {tier.name}
                  </CardTitle>
                  <div className="text-center">
                    <span className="text-3xl sm:text-5xl font-bold text-white">{tier.price}</span>
                    <span className="text-gray-400 text-base sm:text-xl">/month</span>
                  </div>
                  <div className="text-center mt-2">
                    <Badge className={`bg-gradient-to-r ${tier.color} text-white text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2`}>
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 inline" />
                      {tier.credits.toLocaleString()} Credits/mo
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-gray-300">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(key, tier.priceId)}
                    disabled={processingTier === key || isCurrentPlan}
                    className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 text-white py-6 text-lg mt-6`}
                  >
                    {processingTier === key
                      ? "Processing..."
                      : isCurrentPlan
                      ? "Current Plan"
                      : `Subscribe to ${tier.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {isSubscribed && (
          <Card className="border-4 border-red-500 bg-black/90 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">
                Manage Your Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-300">
                Update payment method, cancel subscription, or view billing history
              </p>
              <Button
                onClick={handleManageSubscription}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg"
              >
                <Star className="w-5 h-5 mr-2" />
                Open Customer Portal
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-4 border-red-500 bg-black/90 mt-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center text-gray-300">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">🎮 Race Anytime</h3>
                <p>Unlimited access to all racing features</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">🏆 Compete Globally</h3>
                <p>Join leagues and tournaments worldwide</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">⚡ Monthly Credits</h3>
                <p>Fresh credits every month to keep racing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GPSubscription;
