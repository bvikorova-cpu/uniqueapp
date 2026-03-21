import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Palette, Swords, Heart, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const FEATURES = {
  premiumAvatar: {
    name: "Premium AI Avatar",
    price: "€7",
    priceId: "price_1SPjFEGaXSfGtYFtBjeXRVkk",
    icon: Crown,
    popular: true,
    description: "Advanced holographic avatar with AI personality",
    features: [
      "AI-powered personality that learns",
      "Advanced 3D holographic rendering",
      "Autonomous behavior and interactions",
      "Daily avatar evolution",
      "Priority support",
    ],
  },
  basicCustomization: {
    name: "Basic Customization",
    price: "€3",
    priceId: "price_1SPjFUGaXSfGtYFtNiiQEQcT",
    icon: Palette,
    popular: false,
    description: "Essential avatar customization",
    features: [
      "20+ appearance options",
      "Basic clothing items",
      "5 personality traits",
      "Name customization",
    ],
  },
  advancedCustomization: {
    name: "Advanced Customization",
    price: "€15",
    priceId: "price_1SPjFk0QTWhd4oRpZGc4FevP",
    icon: Sparkles,
    popular: false,
    description: "Unlimited customization options",
    features: [
      "200+ appearance options",
      "Premium clothing & accessories",
      "20+ personality traits",
      "Custom animations",
      "Voice customization",
    ],
  },
  battleEntry: {
    name: "Avatar Battle Entry",
    price: "€2",
    priceId: "price_1SPjGQGaXSfGtYFtDYtm4aC2",
    icon: Swords,
    popular: false,
    description: "Enter the battle arena",
    features: [
      "Real-time avatar battles",
      "Win prizes and rewards",
      "Ranking system",
      "Battle statistics",
    ],
  },
  breeding: {
    name: "Avatar Breeding",
    price: "€10",
    priceId: "price_1SPjGzGaXSfGtYFtTGxQm0hM",
    icon: Heart,
    popular: false,
    description: "Create unique offspring",
    features: [
      "Combine two avatars",
      "Inherit traits & abilities",
      "Unique genetic combinations",
      "Breeding history tracking",
    ],
  },
};

export default function HolographicAvatars() {
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
      const { data, error } = await supabase.functions.invoke("create-holographic-avatar-checkout", {
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-background to-pink-500/10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNhODU1ZjciIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC0yYy0xLjEgMC0yIC45LTIgMnYyYzAgMS4xLjkgMiAyIDJoMmMxLjEgMCAyLS45IDItMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-6 py-2 bg-purple-500/20 rounded-full border border-purple-500/30">
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
              Holographic Avatar Company
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI-Powered Holographic Avatars
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Create 3D holographic avatars that live their own life, evolve with AI, and interact autonomously in a virtual world.
          </p>
        </div>

        {/* Detailed Description Section */}
        <div className="mb-16 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-950/60 to-pink-950/60 border border-purple-500/30">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">What are AI-Powered Holographic Avatars?</h2>
          <p className="text-gray-200 mb-6 leading-relaxed">
            Holographic Avatars is a revolutionary platform where you can create stunning 3D digital beings that come to life with artificial intelligence. Unlike traditional static avatars, our holographic avatars are autonomous entities that learn, evolve, and develop unique personalities over time. Each avatar exists in a virtual world where they can interact with other avatars, form relationships, compete in battles, and even breed to create entirely new unique offspring.
          </p>
          
          <h3 className="text-xl font-bold text-yellow-300 mb-4">How to Use:</h3>
          <ul className="text-gray-200 space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">1.</span>
              <span><strong>Create Your Avatar:</strong> Start by purchasing a Premium AI Avatar subscription or basic customization pack. Design your avatar's appearance, choose personality traits, and give it a unique name.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">2.</span>
              <span><strong>Customize & Personalize:</strong> Use our customization packs to unlock hundreds of appearance options, clothing items, accessories, voice settings, and custom animations.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">3.</span>
              <span><strong>Watch It Evolve:</strong> Your avatar's AI learns from interactions and develops its own behaviors, preferences, and personality quirks over time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">4.</span>
              <span><strong>Battle Other Avatars:</strong> Enter the battle arena to compete against other users' avatars. Win prizes, climb rankings, and prove your avatar's strength.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">5.</span>
              <span><strong>Breed Unique Offspring:</strong> Combine two avatars to create new generations with inherited traits, abilities, and genetic combinations.</span>
            </li>
          </ul>

          <h3 className="text-xl font-bold text-yellow-300 mb-4">Key Features:</h3>
          <ul className="text-gray-200 space-y-2 mb-6">
            <li>• <strong>Advanced AI Personalities:</strong> Each avatar develops unique behaviors and emotional responses</li>
            <li>• <strong>3D Holographic Rendering:</strong> Stunning visual representation with lifelike animations</li>
            <li>• <strong>Autonomous Living:</strong> Avatars continue to live and interact even when you're offline</li>
            <li>• <strong>Competitive Battles:</strong> Real-time arena battles with ranking systems and rewards</li>
            <li>• <strong>Genetic Breeding System:</strong> Create rare trait combinations through avatar breeding</li>
            <li>• <strong>Daily Evolution:</strong> Your avatar grows and changes every day based on its experiences</li>
          </ul>

          <p className="text-gray-400 text-sm italic">
            Note: This is an entertainment platform. All avatars exist in a virtual environment and are powered by AI algorithms designed for engagement and fun.
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
                  feature.popular ? "border-purple-500 shadow-lg shadow-purple-500/20 lg:col-span-3" : ""
                }`}
              >
                {feature.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-purple-600" />
                    <div className="text-right">
                      <div className="text-3xl font-bold">{feature.price}</div>
                      <div className="text-sm text-muted-foreground">
                        {featureKey === "premiumAvatar" ? "/month" : "one-time"}
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
                        <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
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
                    {loading === featureKey ? "Loading..." : featureKey === "premiumAvatar" ? "Subscribe" : "Purchase Now"}
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
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">1</div>
              <h3 className="font-semibold mb-2 text-lg">Create Your Avatar</h3>
              <p className="text-sm text-muted-foreground">Design your unique 3D holographic avatar with AI assistance</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">2</div>
              <h3 className="font-semibold mb-2 text-lg">AI Learns & Evolves</h3>
              <p className="text-sm text-muted-foreground">Your avatar develops personality and autonomous behaviors</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">3</div>
              <h3 className="font-semibold mb-2 text-lg">Battle & Breed</h3>
              <p className="text-sm text-muted-foreground">Compete in battles or breed avatars to create unique offspring</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">4</div>
              <h3 className="font-semibold mb-2 text-lg">Watch Them Live</h3>
              <p className="text-sm text-muted-foreground">Your avatars interact, evolve, and live their own virtual lives</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
