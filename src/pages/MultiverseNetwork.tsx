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
    <div className="min-h-screen bg-gradient-to-br from-background via-red-950/10 to-background overflow-hidden">
      {verifying && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-red-400" />
              <p>Verifying payment...</p>
            </div>
          </Card>
        </div>
      )}
      {/* Hero Section with cosmic design */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/30 via-background to-background" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-red-500/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-20 w-80 h-80 bg-rose-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-orange-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-red-900/50 to-rose-900/50 border border-red-500/40 backdrop-blur-xl mb-8 shadow-lg shadow-red-500/20">
              <Infinity className="w-5 h-5 text-red-400 animate-spin" style={{ animationDuration: "10s" }} />
              <span className="text-sm font-semibold bg-gradient-to-r from-red-300 to-rose-300 bg-clip-text text-transparent">
                Infinite Realities · AI-Generated Worlds · Quantum Navigation
              </span>
              <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold mb-8 leading-none px-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-rose-400 to-orange-400 animate-gradient">
                Multiverse
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-rose-400 animate-gradient">
                Profile Network
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-4xl mx-auto px-4">
              One user, infinite versions across parallel worlds. Explore alternate realities, 
              compare different life paths, and discover your best possible self across the multiverse.
            </p>

            {/* Detailed How It Works Description */}
            <div className="bg-gradient-to-br from-red-950/60 to-rose-950/60 border border-red-500/40 rounded-2xl p-6 md:p-8 mb-10 max-w-4xl mx-auto backdrop-blur-sm text-left shadow-xl">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 text-center drop-shadow-lg">What is Multiverse Profile Network?</h2>
              <p className="text-sm md:text-base text-white/90 mb-4 leading-relaxed">
                The Multiverse Profile Network is an AI-powered platform that allows you to explore infinite versions of yourself across parallel universes. 
                Using advanced AI algorithms, we generate alternate realities based on different life choices, paths, and possibilities you could have taken.
              </p>
              
              <h3 className="text-lg font-bold text-yellow-300 mb-3 drop-shadow-md">How to Use:</h3>
              <ul className="space-y-2 text-sm md:text-base text-white/90 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">1.</span>
                  <span><strong className="text-white">Create Universe:</strong> Define a divergence point in your life (a decision you could have made differently) and let AI generate an alternate reality version of you.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">2.</span>
                  <span><strong className="text-white">My Universes:</strong> Browse and manage all your created parallel universes, view success scores, and explore different life paths.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">3.</span>
                  <span><strong className="text-white">Timeline Merger:</strong> Combine the best traits and achievements from multiple universes into an optimized version of yourself.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">4.</span>
                  <span><strong className="text-white">Best Self Finder:</strong> AI analyzes all your parallel versions and identifies your most successful self across all dimensions.</span>
                </li>
              </ul>

              <h3 className="text-lg font-bold text-yellow-300 mb-3 drop-shadow-md">Key Features:</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>AI-generated alternate realities</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>Unlimited universe exploration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>Timeline merging capabilities</span>
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>Best self identification</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>Secure & private data</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>Real-time AI analysis</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-6 justify-center text-sm mb-12">
              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-red-900/30 backdrop-blur-sm border border-red-500/30 shadow-lg">
                <Globe className="w-5 h-5 text-red-400" />
                <span>Infinite Universes</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-rose-900/30 backdrop-blur-sm border border-rose-500/30 shadow-lg">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <span>AI Reality Generation</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-orange-900/30 backdrop-blur-sm border border-orange-500/30 shadow-lg">
                <Users className="w-5 h-5 text-orange-400" />
                <span>200K+ Explorers</span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-lg px-8 py-6 shadow-xl shadow-red-500/30"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Explore Access Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - NOW DIRECTLY AFTER HERO */}
      <section id="pricing" className="py-16 px-4 bg-gradient-to-b from-red-950/10 to-background">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
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
                      ? 'border-red-500/50 shadow-2xl shadow-red-500/30 bg-gradient-to-br from-red-950/40 to-background' 
                      : 'border-red-700/30 hover:border-red-600/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {service.highlighted && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-red-500/50">
                      <Zap className="w-3.5 h-3.5" />
                      POPULAR
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="mb-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-rose-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative p-3 rounded-xl bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-sm w-fit border border-red-500/30">
                        <Icon className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2 group-hover:text-red-400 transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
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
                          <div className="mt-0.5 p-1 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-red-400 to-rose-400" />
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
                          ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/40'
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
      <section className="py-16 px-4 bg-gradient-to-b from-background to-red-950/10 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400">
              Navigate The Multiverse
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-3xl mx-auto">
            Discover infinite versions of yourself across parallel dimensions
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border-2 border-red-500/30 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-red-500/20">
                <Globe className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Create Universe</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI generates infinite parallel realities based on your choices and possibilities
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border-2 border-rose-500/30 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-rose-500/20">
                <Shuffle className="w-12 h-12 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Jump Realities</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Navigate between dimensions to explore different life paths and outcomes
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-orange-500/20">
                <Layers className="w-12 h-12 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Merge Timelines</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Combine the best aspects of multiple realities into one optimized path
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border-2 border-red-500/30 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-red-500/20">
                <Crown className="w-12 h-12 text-red-400" />
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
      <section className="py-24 px-4 bg-gradient-to-b from-red-950/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              Why Explore The Multiverse?
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-3xl mx-auto">
            Unlock infinite potential across parallel dimensions
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 border-2 border-red-500/30 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-red-500/20">
                <Sparkles className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-red-400 transition-colors">
                AI Universe Generation
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced quantum algorithms create infinite realistic parallel realities based on your life choices
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/20 border-2 border-rose-500/30 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rose-500/20">
                <Shield className="w-12 h-12 text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-rose-400 transition-colors">
                Quantum Secure
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your multiverse data is protected with quantum encryption across all dimensional layers
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/20">
                <Infinity className="w-12 h-12 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-orange-400 transition-colors">
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
