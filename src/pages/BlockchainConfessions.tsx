import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Scale className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Blockchain Confessions
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The world's first blockchain-based anonymous confession and redemption platform.
            Share your burdens, seek community absolution, and track your spiritual journey.
          </p>
        </div>
      </section>

      {/* Detailed Description Section */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-primary">What is Blockchain Confessions?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Blockchain Confessions is a revolutionary anonymous confession and redemption platform. 
                Share your burdens anonymously, receive community absolution through voting, and track your 
                spiritual journey with AI-powered guidance. All confessions are securely stored with complete privacy.
              </p>
              
              <h3 className="text-xl font-semibold mt-4">How to Use:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Confession Wall:</strong> Browse anonymous confessions from the community and vote to absolve or condemn using your tokens.</li>
                <li><strong>Post Confession:</strong> Share your own confession anonymously. AI will analyze and categorize your confession by sin type and severity.</li>
                <li><strong>Redemption:</strong> Track your redemption progress, view your karma balance, and follow personalized guidance for spiritual growth.</li>
                <li><strong>Services:</strong> Purchase absolution tokens, premium features, and specialized redemption programs.</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-4">Key Features:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>100% anonymous confession posting with encryption</li>
                <li>Community voting system for absolution</li>
                <li>AI-powered sin categorization and severity assessment</li>
                <li>Personalized redemption path recommendations</li>
                <li>Token-based economy for community participation</li>
              </ul>
              
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground italic">
                  <strong>Disclaimer:</strong> This platform is for entertainment and community support purposes only. 
                  It does not replace professional psychological, religious, or spiritual counseling services.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="wall" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-2 p-2 mb-8">
              <TabsTrigger value="wall" className="text-xs sm:text-sm">Confession Wall</TabsTrigger>
              <TabsTrigger value="post" className="text-xs sm:text-sm">Post Confession</TabsTrigger>
              <TabsTrigger value="redemption" className="text-xs sm:text-sm">Redemption</TabsTrigger>
              <TabsTrigger value="services" className="text-xs sm:text-sm">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="wall" className="space-y-6">
              <ConfessionWall />
            </TabsContent>

            <TabsContent value="post" className="space-y-6">
              <PostConfession />
            </TabsContent>

            <TabsContent value="redemption" className="space-y-6">
              <RedemptionDashboard />
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Card
                      key={service.id}
                      className={`relative border-border/50 hover:border-primary/50 transition-all duration-300 ${
                        service.highlighted ? "ring-2 ring-primary/20" : ""
                      }`}
                    >
                      {service.highlighted && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-foreground">{service.title}</CardTitle>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-3xl font-bold text-foreground">{service.price}</span>
                              <span className="text-sm text-muted-foreground">/ {service.priceType}</span>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-muted-foreground">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-3">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-foreground">
                              <Shield className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => handlePurchase(service.id)}
                          disabled={loading === service.id}
                          className="w-full"
                          size="lg"
                          variant={service.highlighted ? "default" : "outline"}
                        >
                          {loading === service.id ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Purchase Now`
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground">
            Why Confess With Us?
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
            The world's first blockchain-based anonymous confession and redemption platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">100% Anonymous</h3>
              <p className="text-muted-foreground">
                Your confessions are encrypted and stored on blockchain with complete anonymity
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Community Absolution</h3>
              <p className="text-muted-foreground">
                Receive forgiveness through community voting and spiritual support
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">AI Guidance</h3>
              <p className="text-muted-foreground">
                Personalized redemption paths powered by advanced AI spiritual counseling
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlockchainConfessions;