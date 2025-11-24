import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Globe, Layers, Shuffle, Crown, Sparkles, Shield, Zap, Infinity, Users, Loader2 } from "lucide-react";
import UniverseCreator from "@/components/multiverse/UniverseCreator";
import MyUniverses from "@/components/multiverse/MyUniverses";
import TimelineMerger from "@/components/multiverse/TimelineMerger";
import BestSelfFinder from "@/components/multiverse/BestSelfFinder";

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

const MultiverseNetwork = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && searchParams.get('payment') === 'success') {
      verifyPayment(sessionId);
    }
  }, [searchParams]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (!session) {
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const verifyPayment = async (sessionId: string) => {
    try {
      setVerifying(true);
      const { data, error } = await supabase.functions.invoke('verify-multiverse-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Payment Successful",
          description: `Access to ${data.serviceType} activated!`,
        });
        window.history.replaceState({}, '', '/multiverse-network');
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Verification Failed",
        description: "Please contact support",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const services: Service[] = [
    {
      id: "universe_creation",
      title: "Universe Creation",
      description: "Create custom parallel universes with infinite possibilities",
      price: "€49",
      priceType: "one-time",
      icon: Globe,
      features: [
        "AI-generated alternate realities",
        "Custom universe parameters",
        "Infinite parallel versions",
        "Reality snapshot system",
        "Universe analytics dashboard",
      ],
    },
    {
      id: "reality_jumping",
      title: "Reality Jumping",
      description: "Jump between alternate realities and explore different paths",
      price: "€59",
      priceType: "per month",
      icon: Shuffle,
      features: [
        "Unlimited reality jumps",
        "Cross-dimensional navigation",
        "Life path exploration",
        "Decision tree mapping",
        "Probability analysis",
      ],
      highlighted: true,
    },
    {
      id: "timeline_merging",
      title: "Timeline Merging",
      description: "Merge multiple timeline versions into optimal reality",
      price: "€79",
      priceType: "one-time",
      icon: Layers,
      features: [
        "Multi-timeline integration",
        "Optimized path selection",
        "Quantum entanglement sync",
        "Reality harmonization",
        "Convergence analytics",
      ],
    },
    {
      id: "best_self_selection",
      title: "Best Self Selection",
      description: "AI-curated selection of your most successful versions",
      price: "€99",
      priceType: "per month",
      icon: Crown,
      features: [
        "AI success metrics analysis",
        "Cross-universe comparison",
        "Peak performance tracking",
        "Optimal trait identification",
        "Version recommendation system",
      ],
      highlighted: true,
    },
  ];

  const handlePurchase = async (serviceType: string) => {
    try {
      setLoading(serviceType);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access multiverse services",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-multiverse-checkout', {
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-violet-950/10 to-background overflow-hidden">
      {verifying && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
              <p>Verifying payment...</p>
            </div>
          </Card>
        </div>
      )}
      {/* Hero Section with cosmic design */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-background to-background" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-violet-500/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-20 w-80 h-80 bg-purple-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-fuchsia-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-violet-900/50 to-purple-900/50 border border-violet-500/40 backdrop-blur-xl mb-8 shadow-lg shadow-violet-500/20">
              <Infinity className="w-5 h-5 text-violet-400 animate-spin" style={{ animationDuration: "10s" }} />
              <span className="text-sm font-semibold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                Infinite Realities · AI-Generated Worlds · Quantum Navigation
              </span>
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            
            <h1 className="text-7xl md:text-9xl font-bold mb-8 leading-none">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 animate-gradient">
                Multiverse
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-violet-400 to-purple-400 animate-gradient">
                Profile Network
              </span>
            </h1>
            
            <p className="text-xl md:text-3xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              One user, infinite versions across parallel worlds. Explore alternate realities, 
              compare different life paths, and discover your best possible self across the multiverse.
            </p>
            
            <div className="flex flex-wrap gap-6 justify-center text-sm mb-12">
              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-violet-900/30 backdrop-blur-sm border border-violet-500/30 shadow-lg">
                <Globe className="w-5 h-5 text-violet-400" />
                <span>Infinite Universes</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-purple-900/30 backdrop-blur-sm border border-purple-500/30 shadow-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>AI Reality Generation</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-fuchsia-900/30 backdrop-blur-sm border border-fuchsia-500/30 shadow-lg">
                <Users className="w-5 h-5 text-fuchsia-400" />
                <span>200K+ Explorers</span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-lg px-8 py-6 shadow-xl shadow-violet-500/30"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Explore Access Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - NOW DIRECTLY AFTER HERO */}
      <section id="pricing" className="py-16 px-4 bg-gradient-to-b from-violet-950/10 to-background">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Multiverse Access Plans
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg max-w-3xl mx-auto">
            Choose your path through infinite realities
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={service.id} 
                  className={`group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 border-2 ${
                    service.highlighted 
                      ? 'border-violet-500/50 shadow-2xl shadow-violet-500/30 bg-gradient-to-br from-violet-950/40 to-background' 
                      : 'border-violet-700/30 hover:border-violet-600/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {service.highlighted && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-violet-500/50">
                      <Zap className="w-3.5 h-3.5" />
                      POPULAR
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="mb-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative p-3 rounded-xl bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-sm w-fit border border-violet-500/30">
                        <Icon className="w-8 h-8 text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2 group-hover:text-violet-400 transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                          {service.price}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {service.priceType}
                        </span>
                      </div>
                    </div>
                    
                    <ul className="space-y-2">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <div className="mt-0.5 p-1 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-violet-400 to-purple-400" />
                          </div>
                          <span className="flex-1">{feature}</span>
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-xs text-muted-foreground ml-5">
                          +{service.features.length - 3} more features
                        </li>
                      )}
                    </ul>

                    <Button 
                      onClick={() => handlePurchase(service.id)}
                      disabled={loading === service.id}
                      className={`w-full transition-all duration-300 ${
                        service.highlighted
                          ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/40'
                          : ''
                      }`}
                      variant={service.highlighted ? "default" : "outline"}
                      size="sm"
                    >
                      {loading === service.id ? "Processing..." : "Enter Multiverse"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - NOW AFTER PRICING */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-violet-950/10 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
              Navigate The Multiverse
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-3xl mx-auto">
            Discover infinite versions of yourself across parallel dimensions
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-500/30 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-violet-500/20">
                <Globe className="w-12 h-12 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Create Universe</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI generates infinite parallel realities based on your choices and possibilities
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-2 border-purple-500/30 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-purple-500/20">
                <Shuffle className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Jump Realities</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Navigate between dimensions to explore different life paths and outcomes
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border-2 border-fuchsia-500/30 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-fuchsia-500/20">
                <Layers className="w-12 h-12 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Merge Timelines</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Combine the best aspects of multiple realities into one optimized path
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-500/30 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-violet-500/20">
                <Crown className="w-12 h-12 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">4. Find Best Self</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI identifies your most successful version across all parallel universes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-violet-950/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Why Explore The Multiverse?
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-3xl mx-auto">
            Unlock infinite potential across parallel dimensions
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-500/30 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/20">
                <Sparkles className="w-12 h-12 text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-violet-400 transition-colors">
                AI Universe Generation
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced quantum algorithms create infinite realistic parallel realities based on your life choices
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-2 border-purple-500/30 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                <Shield className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-400 transition-colors">
                Quantum Secure
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your multiverse data is protected with quantum encryption across all dimensional layers
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border-2 border-fuchsia-500/30 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-fuchsia-500/20">
                <Infinity className="w-12 h-12 text-fuchsia-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-fuchsia-400 transition-colors">
                Limitless Exploration
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Navigate through infinite versions of yourself with no boundaries or restrictions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MultiverseNetwork;
