import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Music, Users, Video, MessageSquare, ShoppingBag, Sparkles, CheckCircle2 } from "lucide-react";

const PRICE_IDS = {
  premiumTicket: "price_1SPkF8GaXSfGtYFtktFJm4ZO",
  vipMeetGreet: "price_1SPkJfGaXSfGtYFtAjbxOnWN",
  concertRecording: "price_1SPkJzGaXSfGtYFtM2DgvMFw",
  aiDedication: "price_1SPkKNGaXSfGtYFt79lMZjhi",
  merchCollection: "price_1SPkKpGaXSfGtYFtcliitpgd",
};

const HolographicConcerts = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (priceId: string, featureName: string) => {
    try {
      setLoading(featureName);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-holographic-concert-checkout', {
        body: { priceId, featureName }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const features = [
    {
      icon: Music,
      title: "Premium Concert Ticket",
      price: "€150",
      description: "Experience legendary musicians brought back to life through cutting-edge holographic AI technology",
      highlights: [
        "Premium seating with optimal view",
        "Immersive 360° audio-visual experience",
        "Access to exclusive pre-show content",
        "Digital commemorative ticket"
      ],
      priceId: PRICE_IDS.premiumTicket,
      gradient: "from-purple-600/20 via-pink-600/20 to-blue-600/20"
    },
    {
      icon: Users,
      title: "VIP Holographic Meet & Greet",
      price: "€500",
      description: "Exclusive VIP experience with AI-powered holographic interaction with legendary musicians",
      highlights: [
        "15-minute private holographic session",
        "AI-powered personalized conversation",
        "Professional photo opportunities",
        "Exclusive VIP lounge access",
        "Premium gift package"
      ],
      priceId: PRICE_IDS.vipMeetGreet,
      gradient: "from-amber-600/20 via-orange-600/20 to-red-600/20",
      featured: true
    },
    {
      icon: Video,
      title: "Concert Recording - HD",
      price: "€20",
      description: "High-quality recording of the full holographic concert experience",
      highlights: [
        "4K Ultra HD video quality",
        "Spatial audio technology",
        "Unlimited streaming access",
        "Download for offline viewing"
      ],
      priceId: PRICE_IDS.concertRecording,
      gradient: "from-blue-600/20 via-cyan-600/20 to-teal-600/20"
    },
    {
      icon: MessageSquare,
      title: "AI Personalized Dedication",
      price: "€100",
      description: "Receive a unique, AI-personalized dedication from your favorite holographic artist",
      highlights: [
        "Custom message in artist's voice",
        "Personalized to your story",
        "High-quality video format",
        "Digital certificate of authenticity"
      ],
      priceId: PRICE_IDS.aiDedication,
      gradient: "from-green-600/20 via-emerald-600/20 to-teal-600/20"
    },
    {
      icon: ShoppingBag,
      title: "AI Signature Merch Collection",
      price: "€75",
      description: "Exclusive merchandise featuring AI-generated signatures and holographic designs",
      highlights: [
        "Limited edition collectibles",
        "AI-generated artist signature",
        "Holographic authentication",
        "Premium quality materials"
      ],
      priceId: PRICE_IDS.merchCollection,
      gradient: "from-indigo-600/20 via-purple-600/20 to-pink-600/20"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Revolutionary Holographic Technology</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Holographic Concerts
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Witness legendary musicians return to the stage through cutting-edge AI and holographic technology. 
              An unforgettable experience that transcends time and reality.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Artists Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Artists</h2>
            <p className="text-muted-foreground">Experience performances from music legends</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {["Elvis Presley", "Freddie Mercury", "Michael Jackson", "Whitney Houston"].map((artist) => (
              <Card key={artist} className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mx-auto mb-3 flex items-center justify-center">
                    <Music className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold">{artist}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Offerings Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Experience Packages</h2>
            <p className="text-muted-foreground">Choose your perfect holographic concert experience</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden border-2 transition-all hover:shadow-xl hover:shadow-primary/20 ${
                  feature.featured ? 'border-primary lg:scale-105' : 'border-border hover:border-primary/50'
                }`}
              >
                {feature.featured && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50`}></div>
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <feature.icon className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold text-primary">{feature.price}</span>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-foreground/70">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => handlePurchase(feature.priceId, feature.title)}
                    disabled={loading === feature.title}
                    className="w-full"
                    variant={feature.featured ? "default" : "outline"}
                  >
                    {loading === feature.title ? "Processing..." : "Purchase Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Powered by Advanced AI Technology</h2>
          <p className="text-muted-foreground text-lg">
            Our revolutionary holographic system combines cutting-edge AI, motion capture, and advanced projection 
            technology to create lifelike performances that honor the legacy of legendary artists.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">AI Voice Recreation</h3>
              <p className="text-sm text-muted-foreground">Authentic vocal performances powered by advanced AI</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Holographic Projection</h3>
              <p className="text-sm text-muted-foreground">Ultra-high definition 3D holographic technology</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Live Performance</h3>
              <p className="text-sm text-muted-foreground">Real-time interaction and dynamic stage presence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolographicConcerts;
