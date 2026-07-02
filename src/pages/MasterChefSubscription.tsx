import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChefHat, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ModuleSubscriptionHero } from "@/components/subscription/ModuleSubscriptionHero";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const TIERS = {
  amateur: {
    name: "Amateur",
    price: "€19.99",
    priceId: "price_1SPiaUGaXSfGtYFtpV3Q8jjN",
    productId: "prod_TMRTqaG6dcQNVx",
    icon: ChefHat,
    popular: false,
    features: [
      "5 competitions per month",
      "Basic voting system",
      "Access to amateur categories",
      "Community recipes",
      "Basic performance statistics",
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
      "Unlimited competitions",
      "Live battles in real-time",
      "Premium categories (Fine Dining, Dessert Masters)",
      "Exclusive recipes from professionals",
      "Detailed statistics and analytics",
      "Priority support",
      "Mystery Box challenges",
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
      "Everything from Pro tier",
      "Personal mentoring from professional chefs",
      "VIP behind-the-scenes access",
      "Winning bonuses and rewards",
      "No commission on winnings",
      "Exclusive live events",
      "Priority leaderboard placement",
      "Access to closed premium communities",
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
          title: "Login Required",
          description: "Please sign in to continue",
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
        title: "Error",
        description: "Failed to start payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Master Chef Subscription works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen relative overflow-hidden">
      {/* Background with cooking theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-background to-red-500/10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZjYzNDciIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC0yYy0xLjEgMC0yIC45LTIgMnYyYzAgMS4xLjkgMiAyIDJoMmMxLjEgMCAyLS45IDItMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-16">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={() => navigate("/masterchef/competitions-public")}>
              ← View Public Competitions
            </Button>
            <Button variant="ghost" onClick={() => navigate("/masterchef/dashboard")}>
              Go to Dashboard →
            </Button>
          </div>
          <ModuleSubscriptionHero
            module="KitchenStars Platform"
            icon={ChefHat}
            badge="Cooking battles"
            title="Compete. Cook. Conquer."
            subtitle="Join the world's most exciting online cooking arena — vote, compete, win prizes."
          />
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Compete, vote, and become the king of the kitchen! Choose the package that suits you best.
          </p>
          <Card className="max-w-2xl mx-auto bg-orange-500/10 border-orange-500/20">
            <CardContent className="p-6 text-center">
              <p className="text-lg text-foreground">
                🍳 <strong>Free Access:</strong> You can view active competitions and vote for your favorites absolutely free! 
                No subscription needed to be part of the action.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/masterchef/competitions-public")}
                className="mt-4"
              >
                Browse Competitions & Vote Free
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Description Section */}
        <div className="mb-16 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-orange-950/60 to-red-950/60 border border-orange-500/30">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">What is KitchenStars Platform?</h2>
          <p className="text-gray-200 mb-6 leading-relaxed">
            KitchenStars Platform is an online cooking competition where home cooks and professional chefs compete against each other in exciting culinary battles. Upload videos of your cooking creations, participate in live cooking challenges, and let the community vote for the best dishes. Whether you're a passionate home cook or an aspiring professional chef, this platform gives you the opportunity to showcase your skills, learn from others, and win amazing prizes.
          </p>
          
          <h3 className="text-xl font-bold text-yellow-300 mb-4">How to Use:</h3>
          <ul className="text-gray-200 space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">1.</span>
              <span><strong>Create Your Profile:</strong> Sign up and choose your subscription tier based on how competitive you want to be - from Amateur to Elite levels.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">2.</span>
              <span><strong>Join Competitions:</strong> Browse available cooking competitions by category (appetizers, main courses, desserts, etc.) and enter the ones that match your skills.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">3.</span>
              <span><strong>Submit Your Entry:</strong> Record a video of yourself cooking the dish, upload photos, and share your recipe. Show off your techniques and presentation skills.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">4.</span>
              <span><strong>Get Community Votes:</strong> Other users and viewers watch your submission and vote for their favorites. The more impressive your dish, the more votes you'll receive.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">5.</span>
              <span><strong>Win Rewards:</strong> Top performers earn XP, climb the leaderboard, unlock achievements, and win prizes including cash rewards for Elite members.</span>
            </li>
          </ul>

          <h3 className="text-xl font-bold text-yellow-300 mb-4">Key Features:</h3>
          <ul className="text-gray-200 space-y-2 mb-6">
            <li>• <strong>Live Cooking Battles:</strong> Real-time competitions where chefs cook simultaneously and viewers vote live</li>
            <li>• <strong>Mystery Box Challenges:</strong> Surprise ingredient challenges that test your creativity and improvisation</li>
            <li>• <strong>Community Voting:</strong> Fair, transparent voting system where the community decides the winners</li>
            <li>• <strong>Recipe Sharing:</strong> Access exclusive recipes from professional chefs and competition winners</li>
            <li>• <strong>Leaderboard Rankings:</strong> Track your progress and compete for top positions on global rankings</li>
            <li>• <strong>Professional Mentoring:</strong> Elite members get personal guidance from renowned chefs</li>
          </ul>

          <p className="text-gray-400 text-sm italic">
            Note: Free users can view all competitions and vote for their favorites. Subscribe to participate as a competitor and unlock premium features.
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
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                    <div className="text-right">
                      <div className="text-3xl font-bold">{tier.price}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>
                    {tierKey === "amateur" && "For beginners and enthusiasts"}
                    {tierKey === "pro" && "For serious chefs"}
                    {tierKey === "elite" && "For professionals and winners"}
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
                    {loading === tierKey ? "Loading..." : "Choose Package"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-12 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-orange-500/20 hover:border-orange-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent mb-3">1</div>
              <h3 className="font-semibold mb-2 text-lg">Choose Your Tier</h3>
              <p className="text-sm text-muted-foreground">Select a package based on your ambitions</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-orange-500/20 hover:border-orange-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent mb-3">2</div>
              <h3 className="font-semibold mb-2 text-lg">Compete</h3>
              <p className="text-sm text-muted-foreground">
                Join live battles or upload your video
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-orange-500/20 hover:border-orange-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent mb-3">3</div>
              <h3 className="font-semibold mb-2 text-lg">Get Votes</h3>
              <p className="text-sm text-muted-foreground">Viewers vote for the best dish</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-orange-500/20 hover:border-orange-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent mb-3">4</div>
              <h3 className="font-semibold mb-2 text-lg">Win</h3>
              <p className="text-sm text-muted-foreground">
                Earn rewards, XP and climb the leaderboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
    );
}
