import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Users, Heart, Crown, Eye, Infinity, Moon, Star, Globe, Shield } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  priceType: string;
  icon: any;
  features: string[];
  highlighted?: boolean;
}

const ReincarnationSocial = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const services: Service[] = [
    {
      id: "past_life_regression",
      title: "Past Life Regression",
      description: "Explore your previous incarnations through AI-powered spiritual analysis",
      price: "€79",
      priceType: "one-time",
      icon: Eye,
      features: [
        "AI-guided past life exploration",
        "Detailed regression session reports",
        "Historical context & verification",
        "Soul pattern recognition",
        "Spiritual timeline mapping",
      ],
    },
    {
      id: "karmic_debt_calculator",
      title: "Karmic Debt Calculator",
      description: "Track your karmic balance and spiritual lessons",
      price: "€19",
      priceType: "per month",
      icon: Infinity,
      features: [
        "Real-time karma tracking",
        "Debt resolution guidance",
        "Past action analysis",
        "Spiritual balance reports",
        "Daily karmic insights",
      ],
      highlighted: true,
    },
    {
      id: "soulmate_matching",
      title: "Past Lives Soulmate",
      description: "Connect with souls you've known across lifetimes",
      price: "€29",
      priceType: "per month",
      icon: Heart,
      features: [
        "Cross-lifetime soul matching",
        "Past relationship detection",
        "Karmic connection analysis",
        "Soul contract insights",
        "Reunion probability scores",
      ],
      highlighted: true,
    },
    {
      id: "reincarnation_guarantee",
      title: "Reincarnation Guarantee",
      description: "Ultimate lifetime spiritual planning & soul preservation",
      price: "€199",
      priceType: "one-time",
      icon: Crown,
      features: [
        "Personalized reincarnation plan",
        "Soul preservation protocol",
        "Next life destiny mapping",
        "Karmic lesson completion",
        "Lifetime spiritual support",
      ],
    },
  ];

  const handlePurchase = async (serviceType: string) => {
    try {
      setLoading(serviceType);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access spiritual services",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-reincarnation-checkout', {
        body: { serviceType }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background">
      {/* Hero Section with mystical design */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 animate-gradient" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-40 right-40 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 backdrop-blur-sm mb-8">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Ancient Wisdom Meets Modern AI
              </span>
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 animate-gradient">
                Reincarnation Social
              </span>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <Moon className="w-16 h-16 text-purple-400/30 animate-pulse" />
              </div>
            </h1>
            
            <p className="text-xl md:text-3xl text-muted-foreground mb-12 leading-relaxed">
              Journey through lifetimes. Discover your past lives, balance your karma, 
              and reconnect with souls from ancient times through AI-powered spiritual intelligence.
            </p>
            
            <div className="flex flex-wrap gap-8 justify-center text-sm">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-purple-500/20">
                <Star className="w-5 h-5 text-purple-400" />
                <span>AI Spiritual Analysis</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-indigo-500/20">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span>Sacred & Secure</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-pink-500/20">
                <Globe className="w-5 h-5 text-pink-400" />
                <span>15K+ Soul Connections</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid with mystical cards */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={service.id} 
                  className={`group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 border-2 ${
                    service.highlighted 
                      ? 'border-purple-500/50 shadow-lg shadow-purple-500/20 bg-gradient-to-br from-purple-950/20 to-background' 
                      : 'border-purple-500/20 hover:border-purple-500/40'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {service.highlighted && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      <Crown className="w-3 h-3" />
                      POPULAR
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm w-fit border border-purple-500/20">
                        <Icon className="w-10 h-10 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl mb-3 group-hover:text-purple-400 transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                          {service.price}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {service.priceType}
                        </span>
                      </div>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <div className="mt-1 p-1.5 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400" />
                          </div>
                          <span className="flex-1 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      onClick={() => handlePurchase(service.id)}
                      disabled={loading === service.id}
                      className={`w-full transition-all duration-300 ${
                        service.highlighted
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/30'
                          : ''
                      }`}
                      variant={service.highlighted ? "default" : "outline"}
                    >
                      {loading === service.id ? "Processing..." : "Begin Journey"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mystical Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-purple-950/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Why Journey With Us?
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
            Unlock the mysteries of your eternal soul with advanced AI spiritual technology
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-400 transition-colors">
                Sacred Protection
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your spiritual data is encrypted with celestial-grade security, ensuring complete privacy across all lifetimes
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-indigo-400 transition-colors">
                AI Mystic Intelligence
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Cutting-edge algorithms combined with ancient wisdom to analyze your soul's journey through time
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-pink-400 transition-colors">
                Eternal Community
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Join thousands reconnecting with ancient souls, discovering past relationships, and healing karmic bonds
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReincarnationSocial;
