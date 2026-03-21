import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, HeartPulse, Brain, TrendingUp, AlertCircle, Shield, Zap, ArrowRightLeft, Star, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PhobiaDetector from "@/components/phobia/PhobiaDetector";
import PhobiaMarketplace from "@/components/phobia/PhobiaMarketplace";
import PhobiaCureDashboard from "@/components/phobia/PhobiaCureDashboard";
import MyPhobias from "@/components/phobia/MyPhobias";

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

const PhobiaTrading = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

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

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && searchParams.get('payment') === 'success') {
      verifyPayment(sessionId);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      setVerifying(true);
      const { data, error } = await supabase.functions.invoke('verify-phobia-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Payment Successful",
          description: `Access to ${data.serviceType} activated!`,
        });
        window.history.replaceState({}, '', '/phobia-trading');
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
      id: "fear_marketplace",
      title: "Fear Marketplace",
      description: "Trade, buy, and sell phobias with the global community",
      price: "€15",
      priceType: "per month",
      icon: ShoppingCart,
      features: [
        "Access global phobia exchange",
        "Buy and sell unlimited fears",
        "AI-powered pricing algorithm",
        "Secure blockchain transactions",
        "Real-time market analytics",
      ],
      highlighted: true,
    },
    {
      id: "phobia_cure",
      title: "Phobia Cure Premium",
      description: "AI-powered personalized treatment for your fears",
      price: "€39",
      priceType: "per month",
      icon: HeartPulse,
      features: [
        "Personalized cure strategies",
        "AI therapy sessions",
        "Progress tracking dashboard",
        "24/7 AI support assistant",
        "Evidence-based techniques",
      ],
      highlighted: true,
    },
    {
      id: "exposure_therapy",
      title: "AI Exposure Therapy",
      description: "Complete virtual reality exposure therapy program",
      price: "€69",
      priceType: "one-time",
      icon: Brain,
      features: [
        "VR-enabled exposure sessions",
        "Gradual intensity control",
        "AI-guided relaxation",
        "Custom fear scenarios",
        "Professional supervision mode",
      ],
    },
    {
      id: "rare_fear_collector",
      title: "Rare Fear Collector",
      description: "Collect and catalog unique and exotic phobias",
      price: "€29",
      priceType: "per month",
      icon: Star,
      features: [
        "Access to rare phobia catalog",
        "Exclusive collector community",
        "Trading card system",
        "Achievement & badge system",
        "Phobia rarity scoring",
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
          description: "Please sign in to access phobia services",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-phobia-checkout', {
        body: { serviceType }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
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
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cyan-950/10 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-700/50 backdrop-blur-sm mb-8">
              <AlertCircle className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold text-cyan-300">
                AI-Powered Fear Detection · Blockchain Trading · Clinical Support
              </span>
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400">
                Phobia Trading
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">
                Network
              </span>
            </h1>
            
            <p className="text-xl md:text-3xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              The world's first AI-powered phobia detection and trading platform. 
              Exchange fears, discover cures, and connect with others facing similar challenges.
            </p>
            
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-cyan-900/30 backdrop-blur-sm border border-cyan-700/50">
                <Brain className="w-5 h-5 text-cyan-400" />
                <span>AI Fear Detection</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-900/30 backdrop-blur-sm border border-blue-700/50">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                <span>Blockchain Trading</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-teal-900/30 backdrop-blur-sm border border-teal-700/50">
                <HeartPulse className="w-5 h-5 text-teal-400" />
                <span>100K+ Users Helped</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gradient-to-b from-cyan-950/10 to-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              How Phobia Trading Works
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            A revolutionary approach to understanding and managing fears
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Brain className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. AI Detection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our AI analyzes your behavior and identifies specific phobias with clinical accuracy
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-blue-500/30 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <ShoppingCart className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Trade Fears</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Exchange phobias in our secure marketplace or collect rare and unique fears
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <HeartPulse className="w-10 h-10 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Get Cured</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access AI-powered therapy programs designed to help you overcome your fears
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <TrendingUp className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">4. Track Progress</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monitor your journey to recovery with detailed analytics and insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
              Choose Your Path
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Select the service that best fits your needs
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={service.id} 
                  className={`group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 border-2 ${
                    service.highlighted 
                      ? 'border-cyan-500/50 shadow-xl shadow-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-background' 
                      : 'border-cyan-700/30 hover:border-cyan-600/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {service.highlighted && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      <Zap className="w-3 h-3" />
                      POPULAR
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-sm w-fit border border-cyan-700/30">
                        <Icon className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl mb-3 group-hover:text-cyan-400 transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
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
                          <div className="mt-1 p-1.5 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400" />
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
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/30'
                          : ''
                      }`}
                      variant={service.highlighted ? "default" : "outline"}
                    >
                      {loading === service.id ? "Processing..." : "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Functional Dashboard */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              Your Phobia Management Hub
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Detect, trade, and overcome your fears with AI-powered tools
          </p>

          {/* Feature Description */}
          <Card className="mb-8 border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-background">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">What is Phobia Trading Network?</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Phobia Trading Network is the world's first AI-powered platform for detecting, understanding, trading, and overcoming your fears. Using advanced machine learning algorithms and evidence-based therapeutic techniques, we help you identify your phobias and provide personalized paths to recovery.
              </p>
              
              <h4 className="font-semibold text-foreground mb-3">How to Use:</h4>
              <ul className="space-y-2 text-muted-foreground text-sm mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">1.</span>
                  <span><strong>Detect Phobia:</strong> Use our AI-powered detection tool to identify your specific fears through a series of questions and behavioral analysis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">2.</span>
                  <span><strong>My Phobias:</strong> View and manage your detected phobias, track your progress, and access personalized insights about each fear.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">3.</span>
                  <span><strong>Marketplace:</strong> Browse the global phobia exchange to trade fears with others, discover rare phobias, and connect with people facing similar challenges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">4.</span>
                  <span><strong>Cure Dashboard:</strong> Access AI-powered therapy sessions, VR exposure therapy, personalized treatment plans, and track your journey to recovery.</span>
                </li>
              </ul>
              
              <div className="p-3 bg-slate-800 border border-slate-600 rounded-lg">
                <p className="text-xs text-slate-100">
                  <strong className="text-white">Disclaimer:</strong> This platform is designed for entertainment and self-improvement purposes. It does not replace professional psychological or psychiatric treatment. If you experience severe anxiety or phobias, please consult a qualified mental health professional.
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="detect" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-2 p-2 mb-8">
              <TabsTrigger value="detect" className="text-xs sm:text-sm py-2">
                <Brain className="w-4 h-4 mr-1 sm:mr-2" />
                Detect Phobia
              </TabsTrigger>
              <TabsTrigger value="my-phobias" className="text-xs sm:text-sm py-2">
                <Brain className="w-4 h-4 mr-1 sm:mr-2" />
                My Phobias
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="text-xs sm:text-sm py-2">
                <ShoppingCart className="w-4 h-4 mr-1 sm:mr-2" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="cure" className="text-xs sm:text-sm py-2">
                <HeartPulse className="w-4 h-4 mr-1 sm:mr-2" />
                Cure</TabsTrigger>
            </TabsList>

            <TabsContent value="detect">
              <PhobiaDetector onPhobiaDetected={() => {
                toast({
                  title: "Phobia Added",
                  description: "Your phobia has been saved to your profile",
                });
              }} />
            </TabsContent>

            <TabsContent value="my-phobias">
              <MyPhobias onPhobiaListed={() => {
                toast({
                  title: "Phobia Listed",
                  description: "Check the Marketplace tab to see your listing",
                });
              }} />
            </TabsContent>

            <TabsContent value="marketplace">
              <PhobiaMarketplace />
            </TabsContent>

            <TabsContent value="cure">
              <PhobiaCureDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-cyan-950/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Why Choose Phobia Trading?
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
            Revolutionary technology meets clinical psychology for effective fear management
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-cyan-400 transition-colors">
                AI-Powered Analysis
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced machine learning algorithms detect and analyze phobias with clinical precision
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-blue-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors">
                Secure & Private
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your fear data is encrypted and protected with military-grade security protocols
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <HeartPulse className="w-10 h-10 text-teal-400" />
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-teal-400 transition-colors">
                Proven Results
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Join over 100,000 users who have successfully managed their fears with our platform
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PhobiaTrading;
