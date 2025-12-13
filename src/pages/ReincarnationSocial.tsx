import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Heart, Crown, Eye, Infinity, Star, Globe, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PastLifeRegressionSection } from "@/components/reincarnation/PastLifeRegressionSection";
import { KarmicDebtTracker } from "@/components/reincarnation/KarmicDebtTracker";
import { SoulmateMatchingSection } from "@/components/reincarnation/SoulmateMatchingSection";
import { ReincarnationPlanSection } from "@/components/reincarnation/ReincarnationPlanSection";

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
  const [searchParams] = useSearchParams();
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && sessionId) {
      verifyPayment(sessionId);
    } else if (payment === "canceled") {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. No charges were made.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    setVerifyingPayment(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke(
        "verify-reincarnation-payment",
        {
          body: { sessionId },
        }
      );

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✨ Payment Successful!",
          description: `You now have access to ${data.service_type.replace(/_/g, " ")}. Check the service tabs!`,
        });
        
        setTimeout(() => {
          window.history.replaceState({}, '', '/reincarnation-social');
        }, 2000);
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification Error",
        description: error.message || "Could not verify payment.",
        variant: "destructive",
      });
    } finally {
      setVerifyingPayment(false);
    }
  };

  const services: Service[] = [
    {
      id: "past_life_regression",
      title: "Past Life Regression",
      description: "Explore your previous incarnations",
      price: "€79",
      priceType: "one-time",
      icon: Eye,
      features: [
        "AI-guided past life exploration",
        "Detailed regression reports",
        "Historical context",
        "Soul pattern recognition",
        "Spiritual timeline mapping",
      ],
    },
    {
      id: "karmic_debt_calculator",
      title: "Karmic Debt Calculator",
      description: "Track your karmic balance",
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
      title: "Soulmate Matching",
      description: "Connect with souls from past lives",
      price: "€29",
      priceType: "per month",
      icon: Heart,
      features: [
        "Cross-lifetime soul matching",
        "Past relationship detection",
        "Karmic connection analysis",
        "Soul contract insights",
        "Reunion probability",
      ],
      highlighted: true,
    },
    {
      id: "reincarnation_guarantee",
      title: "Reincarnation Guarantee™",
      description: "Lifetime spiritual planning",
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
          description: "Please sign in to access services",
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
        description: "Failed to process purchase.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  if (verifyingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <Card className="max-w-md border-primary/30">
          <CardContent className="py-12 text-center space-y-4">
            <Sparkles className="h-16 w-16 mx-auto text-primary animate-pulse" />
            <h2 className="text-2xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground">Activating your services</p>
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.1),transparent)]" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <Sparkles className="w-20 h-20 mx-auto text-primary mb-6 animate-pulse" />
            
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Reincarnation
              </span>
              <br />
              <span className="text-foreground">Social</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Journey through lifetimes. Discover your past lives, balance your karma, 
              and reconnect with souls through AI-powered spiritual intelligence.
            </p>
            
            <div className="flex flex-wrap gap-6 justify-center">
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-background/60 backdrop-blur-md border border-primary/30">
                <Star className="w-5 h-5 text-primary" />
                <span>AI Spiritual Analysis</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-background/60 backdrop-blur-md border border-primary/30">
                <Shield className="w-5 h-5 text-primary" />
                <span>Sacred & Secure</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-background/60 backdrop-blur-md border border-primary/30">
                <Globe className="w-5 h-5 text-primary" />
                <span>15K+ Connections</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Description Section */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-primary">What is Reincarnation Social?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reincarnation Social is an AI-powered spiritual platform that helps you explore your past lives, 
                understand your karmic patterns, find soulmate connections, and plan your spiritual journey. 
                Using advanced AI analysis, we provide deep insights into your soul's journey across multiple lifetimes.
              </p>
              
              <h3 className="text-xl font-semibold mt-4">How to Use:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Past Lives:</strong> Upload your photo or provide birth details to receive AI-generated past life readings and discover who you were in previous incarnations.</li>
                <li><strong>Karma Analysis:</strong> Understand your karmic debts, lessons, and patterns that influence your current life circumstances.</li>
                <li><strong>Soulmate Finder:</strong> Connect with souls you have shared past lives with and discover deep spiritual connections.</li>
                <li><strong>Next Life Planning:</strong> Receive guidance on spiritual growth and prepare for your soul's future journey.</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-4">Key Features:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>AI-powered past life regression analysis</li>
                <li>Detailed karma balance and healing recommendations</li>
                <li>Soulmate and twin flame compatibility matching</li>
                <li>Personalized spiritual growth guidance</li>
                <li>Community of like-minded spiritual seekers</li>
              </ul>
              
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground italic">
                  <strong>Disclaimer:</strong> This service is for entertainment and spiritual exploration purposes only. 
                  Past life readings are AI-generated interpretations and should not replace professional psychological or medical advice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="flex flex-wrap w-full mb-8 h-auto p-1 gap-1">
              <TabsTrigger value="services" className="flex-1 min-w-[calc(33%-0.25rem)] sm:min-w-0">Services</TabsTrigger>
              <TabsTrigger value="regression" className="flex-1 min-w-[calc(33%-0.25rem)] sm:min-w-0"><Eye className="w-4 h-4 mr-1 sm:mr-2" /><span className="text-xs sm:text-sm">Past Lives</span></TabsTrigger>
              <TabsTrigger value="karma" className="flex-1 min-w-[calc(33%-0.25rem)] sm:min-w-0"><Infinity className="w-4 h-4 mr-1 sm:mr-2" /><span className="text-xs sm:text-sm">Karma</span></TabsTrigger>
              <TabsTrigger value="soulmates" className="flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0"><Heart className="w-4 h-4 mr-1 sm:mr-2" /><span className="text-xs sm:text-sm">Soulmates</span></TabsTrigger>
              <TabsTrigger value="plan" className="flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0"><Crown className="w-4 h-4 mr-1 sm:mr-2" /><span className="text-xs sm:text-sm">Next Life</span></TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-8">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-4xl font-bold">Premium Spiritual Services</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Choose your spiritual journey and unlock profound insights
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Card 
                      key={service.id} 
                      className={`group transition-all hover:shadow-xl hover:scale-105 border-2 ${
                        service.highlighted 
                          ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-background' 
                          : 'border-primary/20'
                      }`}
                    >
                      {service.highlighted && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                          <Crown className="w-3 h-3" />POPULAR
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="mb-6">
                          <div className="p-4 rounded-2xl bg-primary/10 w-fit border border-primary/20">
                            <Icon className="w-10 h-10 text-primary" />
                          </div>
                        </div>
                        <CardTitle className="text-2xl">{service.title}</CardTitle>
                        <CardDescription className="text-base">{service.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="mb-6">
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-primary">{service.price}</span>
                            <span className="text-muted-foreground text-sm">{service.priceType}</span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          {service.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button 
                          onClick={() => handlePurchase(service.id)}
                          disabled={loading === service.id}
                          className="w-full"
                          size="lg"
                        >
                          {loading === service.id ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                          ) : (
                            <>Unlock Service<Sparkles className="ml-2 h-4 w-4" /></>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="regression"><PastLifeRegressionSection /></TabsContent>
            <TabsContent value="karma"><KarmicDebtTracker /></TabsContent>
            <TabsContent value="soulmates"><SoulmateMatchingSection /></TabsContent>
            <TabsContent value="plan"><ReincarnationPlanSection /></TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default ReincarnationSocial;
