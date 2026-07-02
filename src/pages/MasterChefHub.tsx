import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, ChefHat, Timer, ScanLine, MessageCircle, 
  Video, Award, Apple, Globe, Bot, BookOpen,
  Crown, Sparkles, Check
} from "lucide-react";
import { MasterChefHero } from "@/components/masterchef/MasterChefHero";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import UnifiedXPLeaderboard from "@/components/shared/UnifiedXPLeaderboard";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const TIERS = {
  amateur: {
    name: "Amateur", price: "€19.99", priceId: "price_1SPiaUGaXSfGtYFtpV3Q8jjN",
    icon: ChefHat, popular: false,
    features: ["5 competitions per month", "Basic voting system", "Access to amateur categories", "Community recipes", "Basic performance statistics"],
  },
  pro: {
    name: "Pro", price: "€49.99", priceId: "price_1SPiarGaXSfGtYFtBgTuCPiw",
    icon: Crown, popular: true,
    features: ["Unlimited competitions", "Live battles in real-time", "Premium categories (Fine Dining, Dessert Masters)", "Exclusive recipes from professionals", "Detailed statistics and analytics", "Priority support", "Mystery Box challenges"],
  },
  elite: {
    name: "Elite", price: "€99.99", priceId: "price_1SPibC0QTWhd4oRpJwaH5vZM",
    icon: Sparkles, popular: false,
    features: ["Everything from Pro tier", "Personal mentoring from professional chefs", "VIP behind-the-scenes access", "Winning bonuses and rewards", "No commission on winnings", "Exclusive live events", "Priority leaderboard placement", "Access to closed premium communities"],
  },
};

const toolCards = [
  { icon: Trophy, title: "Competitions", desc: "Join cooking battles & win prizes", route: "/masterchef/competitions-public", color: "from-orange-500 to-red-500" },
  { icon: ChefHat, title: "AI Recipe Generator", desc: "AI creates recipes from your ingredients", route: "/masterchef/ai-recipes", color: "from-emerald-500 to-teal-500" },
  { icon: Timer, title: "Live Cooking Timer", desc: "Interactive countdown with audio alerts", route: "/masterchef/cooking-timer", color: "from-blue-500 to-indigo-500" },
  { icon: ScanLine, title: "Ingredient Scanner", desc: "Scan ingredients & get dish suggestions", route: "/masterchef/ingredient-scanner", color: "from-purple-500 to-pink-500" },
  { icon: MessageCircle, title: "Chef Community Chat", desc: "Real-time chat with fellow chefs", route: "/masterchef/chef-chat", color: "from-cyan-500 to-blue-500" },
  { icon: Video, title: "Live Kitchen Stream", desc: "Stream your cooking live for votes", route: "/masterchef/live-stream", color: "from-red-500 to-rose-500" },
  { icon: Award, title: "Weekly Chef Awards", desc: "Automatic awards for top performers", route: "/masterchef/weekly-awards", color: "from-yellow-500 to-amber-500" },
  { icon: Apple, title: "Nutrition Analyzer", desc: "AI analysis of recipe nutritional values", route: "/masterchef/nutrition-analyzer", color: "from-green-500 to-emerald-500" },
  { icon: Globe, title: "Global Kitchen Map", desc: "See where chefs compete worldwide", route: "/masterchef/global-map", color: "from-sky-500 to-cyan-500" },
  { icon: Bot, title: "AI Cooking Coach", desc: "Personalized cooking training & tips", route: "/masterchef/ai-coach", color: "from-violet-500 to-purple-500" },
  { icon: BookOpen, title: "Recipe Social Feed", desc: "Social network for recipes & sharing", route: "/masterchef/recipe-feed", color: "from-pink-500 to-rose-500" },
];

export default function MasterChefHub() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: keyof typeof TIERS) => {
    try {
      setLoading(tier);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login Required", description: "Please sign in to continue", variant: "destructive" });
        navigate("/auth");
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-masterchef-checkout", {
        body: { priceId: TIERS[tier].priceId, tier },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (error) {
      console.error("Subscription error:", error);
      toast({ title: "Error", description: "Failed to start payment. Please try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Master Chef Hub works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-2 md:px-6 pt-20 pb-12 space-y-10">
        
        {/* Cinematic Video Hero */}
        <MasterChefHero />

        <HeroRewardedAd sectionKey="page_masterchefhub" />

        {/* Free Access Banner */}
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="p-5 flex items-center gap-4 flex-wrap">
            <span className="text-3xl">🍳</span>
            <div className="flex-1 min-w-[200px]">
              <p className="font-bold text-foreground">Free Access Available!</p>
              <p className="text-sm text-muted-foreground">View competitions and vote for your favorites — no subscription needed.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/masterchef/competitions-public")}>
              Browse & Vote Free
            </Button>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div>
          <h2 className="text-3xl md:text-4xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Kitchen Arsenal
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {toolCards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Card className="cursor-pointer h-full hover:shadow-lg hover:shadow-primary/10 transition-all border-border/50 hover:border-primary/30 group"
                  onClick={() => navigate(card.route)}>
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-sm">{card.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-orange-950/60 to-red-950/60 border border-orange-500/30">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">How KitchenStars Arena Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n: "1", t: "Choose Your Tier", d: "Pick Amateur, Pro, or Elite" },
              { n: "2", t: "Compete", d: "Join live battles or upload videos" },
              { n: "3", t: "Get Votes", d: "Community votes for the best dish" },
              { n: "4", t: "Win Prizes", d: "Earn rewards, XP & climb ranks" },
            ].map((step, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-3xl font-black bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">{step.n}</div>
                <h3 className="font-semibold text-white text-sm mb-1">{step.t}</h3>
                <p className="text-xs text-white/60">{step.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Tiers */}
        <div>
          <h2 className="text-3xl md:text-4xl font-black mb-2 text-center bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Choose Your Path
          </h2>
          <p className="text-center text-muted-foreground mb-8">Select the tier that matches your culinary ambitions</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(TIERS) as Array<keyof typeof TIERS>).map((tierKey) => {
              const tier = TIERS[tierKey];
              const Icon = tier.icon;
              return (
                <Card key={tierKey} className={`relative ${tier.popular ? "border-primary shadow-lg shadow-primary/20" : ""}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                      <div className="text-right">
                        <div className="text-3xl font-bold">{tier.price}</div>
                        <div className="text-sm text-muted-foreground">/month</div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tierKey === "amateur" && "For beginners and enthusiasts"}
                      {tierKey === "pro" && "For serious chefs"}
                      {tierKey === "elite" && "For professionals and winners"}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" size="lg" variant={tier.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(tierKey)} disabled={loading === tierKey}>
                      {loading === tierKey ? "Loading..." : "Choose Package"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <UnifiedXPLeaderboard hub="kitchenstars" />
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-3 flex-wrap">
          <Button variant="outline" onClick={() => navigate("/masterchef/dashboard")}>Dashboard</Button>
          <Button variant="outline" onClick={() => navigate("/masterchef/earnings")}>Earnings</Button>
          <Button variant="outline" onClick={() => navigate("/masterchef/competitions")}>My Competitions</Button>
        </div>
      </div>
    </div>
    </>
    );
}
