import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Scale, Users, TrendingUp, Flame, Shield, Lock, Award, Loader2 } from "lucide-react";
import { ConfessionWall } from "@/components/confessions/ConfessionWall";
import { PostConfession } from "@/components/confessions/PostConfession";
import { RedemptionDashboard } from "@/components/confessions/RedemptionDashboard";

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

const BlockchainConfessions = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    
    if (payment === "success" && sessionId) {
      verifyPayment(sessionId);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      setVerifying(true);
      const { data, error } = await supabase.functions.invoke("verify-confession-payment", {
        body: { sessionId },
      });

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: `${data.serviceType} activated`,
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const services: Service[] = [
    {
      id: "absolution_tokens",
      title: "Absolution Tokens",
      description: "Receive community forgiveness for your confessions",
      price: "€5",
      priceType: "token pack",
      icon: Award,
      features: [
        "10 Absolution Tokens",
        "Community voting rights",
        "Instant forgiveness validation",
        "Blockchain-verified redemption",
        "Anonymous confession posting",
      ],
    },
    {
      id: "sin_collection",
      title: "Sin Collection Premium",
      description: "Archive and categorize confessions with AI analysis",
      price: "€24",
      priceType: "per month",
      icon: Scale,
      features: [
        "Unlimited confession storage",
        "AI severity assessment",
        "Sin categorization system",
        "Historical guilt tracking",
        "Advanced analytics dashboard",
      ],
      highlighted: true,
    },
    {
      id: "redemption_path",
      title: "Redemption Path",
      description: "Personalized AI-guided spiritual coaching program",
      price: "€49",
      priceType: "one-time",
      icon: TrendingUp,
      features: [
        "Custom redemption roadmap",
        "AI spiritual counseling",
        "Community support group",
        "Progress tracking system",
        "Certificate of redemption",
      ],
    },
    {
      id: "purgatory_mode",
      title: "Purgatory Mode",
      description: "Intensive community judgment and accelerated redemption",
      price: "€39",
      priceType: "per month",
      icon: Flame,
      features: [
        "Real-time judgment system",
        "Accelerated absolution path",
        "Public confession display",
        "Community trial access",
        "Redemption multiplier boost",
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
          description: "Please sign in to access confession services",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-confession-checkout', {
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

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary mb-4" />
            <p className="text-foreground">Verifying Payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-background to-background" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm mb-8">
              <Lock className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-semibold text-slate-300">
                Anonymous · Blockchain-Verified · AI-Judged
              </span>
              <Shield className="w-5 h-5 text-slate-400" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200">
                Blockchain
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-red-400">
                Guilt & Confessions
              </span>
            </h1>
            
            <p className="text-xl md:text-3xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
              Confess anonymously. Let AI judge your sins. Allow the community to forgive 
              or condemn. Find redemption through blockchain-verified absolution.
            </p>
            
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <Lock className="w-5 h-5 text-slate-400" />
                <span>Complete Anonymity</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <Scale className="w-5 h-5 text-orange-400" />
                <span>AI Severity Analysis</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <Users className="w-5 h-5 text-red-400" />
                <span>50K+ Community Judges</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-slate-900/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
              The Judgment Process
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4">
                <Circle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">1. Confess</h3>
              <p className="text-sm text-muted-foreground">Submit your guilt anonymously to the blockchain</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 mb-4">
                <Scale className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">2. AI Analysis</h3>
              <p className="text-sm text-muted-foreground">AI evaluates severity and categorizes your sin</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                <Users className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">3. Community Votes</h3>
              <p className="text-sm text-muted-foreground">The community decides: forgive or condemn</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
                <Award className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">4. Redemption</h3>
              <p className="text-sm text-muted-foreground">Receive absolution and begin your path forward</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
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
                      ? 'border-orange-500/50 shadow-lg shadow-orange-500/20 bg-gradient-to-br from-orange-950/20 to-background' 
                      : 'border-slate-700/30 hover:border-slate-600/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {service.highlighted && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      POPULAR
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm w-fit border border-slate-700/30">
                        <Icon className="w-10 h-10 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl mb-3 group-hover:text-orange-400 transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
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
                          <div className="mt-1 p-1.5 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20">
                            <ChevronRight className="w-3 h-3 text-orange-400" />
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
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30'
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

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-900/20 to-background">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-slate-200 to-orange-400 bg-clip-text text-transparent">
              Why Confess With Us?
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
            The world's first blockchain-based anonymous confession and redemption platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-slate-300 transition-colors">
                Total Anonymity
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your confessions are encrypted and stored on the blockchain, ensuring complete privacy and anonymity
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Scale className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-orange-400 transition-colors">
                AI Judgment
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced algorithms assess the severity of your confession and guide the community's response
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-red-400 transition-colors">
                Community Justice
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Join thousands in creating a fair judgment system where forgiveness and accountability coexist
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlockchainConfessions;
