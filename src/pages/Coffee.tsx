import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CoffeeHero } from "@/components/coffee/CoffeeHero";
import { toast } from "sonner";
import {
  MapPin, Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";


import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const NAV_ITEMS = [
  { icon: MapPin, label: "Check-ins & Reviews", path: "/coffee/checkins" },
  { icon: Users, label: "Coffee Buddy", path: "/coffee/buddy" },
];


const CREDIT_ITEMS = [
  { name: "Swipe ✓ (open chat)", cost: "2 credits", desc: "Opens a private coffee chat with that person. Swiping ✗ is always free." },
  { name: "Coffee gifts", cost: "2–15 credits", desc: "Send espressos, croissants or a golden cup right inside the chat." },
  { name: "Chatting", cost: "Free", desc: "Once the chat is open, messages cost nothing." },
];

const Coffee = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: profile } = useQuery({
    queryKey: ["coffee-profile-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("coffee_profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    } });

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Credits added! Enjoy your coffee dates ☕");
      window.history.replaceState({}, "", "/coffee");
    } else if (payment === "canceled") {
      toast.info("Payment was cancelled");
      window.history.replaceState({}, "", "/coffee");
    }
  }, [searchParams]);


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24 pb-28 md:pb-12 max-w-7xl">
        <CoffeeHero />


        <HeroRewardedAd sectionKey="page_coffee" />


        {/* Quick Navigation */}
        <div className="grid grid-cols-2 gap-3 mb-8">
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

        {/* Credit pricing */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black mb-4 text-center">Credit Pricing</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {CREDIT_ITEMS.map((item) => (
              <Card key={item.name} className="p-5 bg-card/80 backdrop-blur-xl border-amber-500/20">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-2xl font-black text-amber-400 mb-2">{item.cost}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5">
            <Button
              className="bg-gradient-to-r from-amber-600 to-amber-800"
              onClick={() => navigate("/coffee/buddy")}
            >
              Start swiping ☕
            </Button>
            <Button variant="outline" onClick={() => navigate("/ai-credits-store")}>
              Get credits
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Coffee;
