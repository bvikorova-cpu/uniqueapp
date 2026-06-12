import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CoffeeHero } from "@/components/coffee/CoffeeHero";
import { toast } from "sonner";
import {
  MapPin, Users, Trophy, Star, Flame, Award, Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useState } from "react";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const NAV_ITEMS = [
  { icon: MapPin, label: "Check-ins & Reviews", path: "/coffee/checkins" },
  { icon: Users, label: "Coffee Buddy", path: "/coffee/buddy" },
  { icon: Trophy, label: "Leaderboard", path: "/coffee/leaderboard" },
];

const PLANS = [
  { name: "Free", price: "€0", tier: "free", features: ["3 buddy matches/month", "Basic check-ins", "Standard reviews", "Community access"] },
  { name: "Coffee Lover", price: "€4.99/mo", tier: "lover", features: ["Unlimited buddy matches", "Priority matching", "Featured reviews", "Analytics dashboard", "Ad-free experience"], highlight: true },
  { name: "Coffee Expert", price: "€9.99/mo", tier: "expert", features: ["Everything in Lover", "Event organization", "Premium analytics", "Priority support", "Exclusive badges"] },
];

const Coffee = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscribingTier, setSubscribingTier] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["coffee-profile-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("coffee_profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Subscription activated! Welcome to your new plan! ☕");
      window.history.replaceState({}, "", "/coffee");
    } else if (payment === "canceled") {
      toast.info("Payment was cancelled");
      window.history.replaceState({}, "", "/coffee");
    }
  }, [searchParams]);

  const handleSubscribe = async (tier: string) => {
    if (tier === "free") {
      navigate("/coffee/checkins");
      return;
    }

    try {
      setSubscribingTier(tier);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to subscribe");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("coffee-checkout", {
        body: { tier },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setSubscribingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24 pb-28 md:pb-12 max-w-7xl">
        <CoffeeHero />


        <HeroRewardedAd sectionKey="page_coffee" />

        {/* Engagement Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-amber-500/20 text-center">
            <Flame className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-black">{profile?.total_checkins || 0}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Check-ins</p>
          </Card>
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-amber-500/20 text-center">
            <Star className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-black">{profile?.total_points || 0}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Points</p>
          </Card>
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-amber-500/20 text-center">
            <Award className="h-5 w-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-black capitalize">{profile?.subscription_tier || "Free"}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Tier</p>
          </Card>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.path} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Card
                  className="p-4 cursor-pointer hover:border-amber-500/40 transition-all bg-card/80 backdrop-blur-xl border-amber-500/20 text-center"
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold">{item.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black mb-4 text-center">Subscription Plans</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <Card key={plan.tier} className={`p-5 ${plan.highlight ? "border-amber-500 shadow-lg shadow-amber-500/10" : "border-amber-500/20"} bg-card/80 backdrop-blur-xl`}>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-2xl font-black text-amber-400 mb-3">{plan.price}</p>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Star className="h-3 w-3 text-amber-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.highlight ? "bg-gradient-to-r from-amber-600 to-amber-800" : ""}`} 
                  variant={plan.highlight ? "default" : "outline"}
                  disabled={subscribingTier === plan.tier}
                  onClick={() => handleSubscribe(plan.tier)}
                >
                  {subscribingTier === plan.tier ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                  ) : plan.tier === "free" ? "Get Started" : "Subscribe"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coffee;
