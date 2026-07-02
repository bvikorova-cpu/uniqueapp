import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, Lock, Eye, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ModuleSubscriptionHero } from "@/components/subscription/ModuleSubscriptionHero";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const FEATURES = {
  timeSpeed: {
    name: "Time Travel Speed",
    price: "€6.99",
    priceId: "price_1SPitHGaXSfGtYFtD5qWM26P",
    productId: "prod_TMRm1jb3zE5js2",
    icon: Zap,
    popular: false,
    description: "Age backwards faster than ever",
    features: [
      "2x faster aging reversal",
      "Custom speed settings",
      "Fast-forward through decades",
      "Priority timeline updates",
    ],
  },
  ageLocks: {
    name: "Age Locks",
    price: "€4.99",
    priceId: "price_1SPitb0QTWhd4oRpSUpKFiYN",
    productId: "prod_TMRnhkeFy9ex4r",
    icon: Lock,
    popular: false,
    description: "Freeze time at your perfect age",
    features: [
      "Unlimited age lock points",
      "Pause at any age you want",
      "Create custom milestones",
      "Resume aging anytime",
    ],
  },
  futureGlimpse: {
    name: "Future Glimpse",
    price: "€2.99",
    priceId: "price_1SPitv0QTWhd4oRpT3MCvpTR",
    productId: "prod_TMRnPTkfIFqUKR",
    icon: Eye,
    popular: false,
    description: "See your future self",
    features: [
      "Preview any future age",
      "AI-generated future photos",
      "Timeline exploration",
      "What-if scenarios",
    ],
  },
  paradoxPosts: {
    name: "Time Paradox Posts",
    price: "€1.99",
    priceId: "price_1SPiuHGaXSfGtYFtJQmIpTBa",
    productId: "prod_TMRn6Te8Cy5BTW",
    icon: Sparkles,
    popular: false,
    description: "Post across different timelines",
    features: [
      "Post from any age",
      "Create time paradoxes",
      "Cross-timeline content",
      "Special paradox badges",
    ],
  },
  masterBundle: {
    name: "Time Master Bundle",
    price: "€12.99",
    priceId: "price_1SPiudGaXSfGtYFttW8NCjDx",
    productId: "prod_TMRotpGwIfjHLT",
    icon: Clock,
    popular: true,
    description: "All features unlocked",
    features: [
      "All features above included",
      "Exclusive Time Master badge",
      "Priority support",
      "Early access to new features",
      "Save €2 per month",
    ],
  },
};

export default function TimeReversalSubscription() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async (featureKey: keyof typeof FEATURES) => {
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
      const { data, error } = await supabase.functions.invoke("create-time-reversal-checkout", {
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
      <FloatingHowItWorks title="Time Reversal Subscription" steps={[{ title: "Pick a tier", desc: "Free, Plus, or Unlimited rewinds." }, { title: "Checkout with Stripe", desc: "Secure payment in EUR." }, { title: "Unlock deeper rewinds", desc: "More branches, longer history." }, { title: "Cancel anytime", desc: "Manage from your billing portal." }]} />
      <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MzMzZWEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC0yYy0xLjEgMC0yIC45LTIgMnYyYzAgMS4xLjkgMiAyIDJoMmMxLjEgMCAyLS45IDItMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-16">
          <div className="flex justify-end mb-4">
            <Button variant="ghost" onClick={() => navigate("/time-reversal/dashboard")}>
              Go to Dashboard →
            </Button>
          </div>
          <ModuleSubscriptionHero
            module="Time Reversal Social"
            icon={Clock}
            badge="AI age transform"
            title="Live your life backwards"
            subtitle="Start at 80, get younger every day. Watch followers experience your reversed life through AI age transformation."
          />
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Start at 80, get younger every day. Watch followers experience your life in reverse through AI-powered age transformation.
          </p>
        </div>

        {/* Detailed Description Section */}
        <div className="mb-16 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-950/60 to-blue-950/60 border border-purple-500/30">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">What is Time Reversal Social?</h2>
          <p className="text-gray-200 mb-6 leading-relaxed">
            Time Reversal Social is a revolutionary social platform where you experience life in reverse. Instead of aging forward like traditional social media, you start as an 80-year-old version of yourself and get younger every day through AI-powered age transformation. Your followers watch your unique journey backwards through time, experiencing your life milestones in reverse order. It's a creative, entertaining way to share your life story and connect with others who are curious about the concept of living life backwards.
          </p>
          
          <h3 className="text-xl font-bold text-yellow-300 mb-4">How to Use:</h3>
          <ul className="text-gray-200 space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">1.</span>
              <span><strong>Upload Your Photo:</strong> Start by uploading a current photo of yourself. Our AI will transform it into an 80-year-old version to begin your reverse journey.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">2.</span>
              <span><strong>Daily Age Transformation:</strong> Every day, our AI automatically makes you younger. Watch as wrinkles disappear and your appearance transforms back through time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">3.</span>
              <span><strong>Share Posts from Any Age:</strong> Create content from different points in your reverse timeline. Post memories, thoughts, and experiences as if you're living that age.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">4.</span>
              <span><strong>Build Your Following:</strong> Connect with others who appreciate your unique journey. Follow other users and watch their reverse transformations.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">5.</span>
              <span><strong>Unlock Premium Features:</strong> Speed up your aging reversal, lock at your perfect age, preview future transformations, or create time paradox posts across timelines.</span>
            </li>
          </ul>

          <h3 className="text-xl font-bold text-yellow-300 mb-4">Key Features:</h3>
          <ul className="text-gray-200 space-y-2 mb-6">
            <li>• <strong>AI Age Transformation:</strong> Advanced AI technology creates realistic age progressions and regressions</li>
            <li>• <strong>Reverse Timeline:</strong> Experience your life story in reverse chronological order</li>
            <li>• <strong>Age Lock Points:</strong> Freeze your appearance at any age you want for as long as you want</li>
            <li>• <strong>Future Glimpse:</strong> Preview what you'll look like at any future age with AI-generated photos</li>
            <li>• <strong>Time Paradox Posts:</strong> Create unique content that exists across multiple timelines</li>
            <li>• <strong>Social Interactions:</strong> Follow others, comment, like, and share reverse journey experiences</li>
          </ul>

          <p className="text-gray-400 text-sm italic">
            Note: This is an entertainment platform. All age transformations are AI-generated simulations and do not represent actual physical changes. The platform is designed for creative expression and social fun.
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
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      Best Value
                    </span>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-purple-600" />
                    <div className="text-right">
                      <div className="text-3xl font-bold">{feature.price}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
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
                    onClick={() => handleSubscribe(featureKey)}
                    disabled={loading === featureKey}
                  >
                    {loading === featureKey ? "Loading..." : "Subscribe Now"}
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
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent mb-3">1</div>
              <h3 className="font-semibold mb-2 text-lg">Start at 80</h3>
              <p className="text-sm text-muted-foreground">Create your profile as an 80-year-old version of yourself</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent mb-3">2</div>
              <h3 className="font-semibold mb-2 text-lg">AI Ages You Down</h3>
              <p className="text-sm text-muted-foreground">Every day, AI makes you younger automatically</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent mb-3">3</div>
              <h3 className="font-semibold mb-2 text-lg">Share Your Journey</h3>
              <p className="text-sm text-muted-foreground">Post content from different ages in your reverse timeline</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent mb-3">4</div>
              <h3 className="font-semibold mb-2 text-lg">Build Following</h3>
              <p className="text-sm text-muted-foreground">Watch as followers experience your life in reverse</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
