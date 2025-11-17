import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Music, Users, Video, MessageSquare, ShoppingBag, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MyConcerts from "@/components/holographic/MyConcerts";
import DedicationGenerator from "@/components/holographic/DedicationGenerator";
import MeetGreetScheduler from "@/components/holographic/MeetGreetScheduler";
import MyRecordings from "@/components/holographic/MyRecordings";
import MyDedications from "@/components/holographic/MyDedications";

const PRICE_IDS = {
  premiumTicket: "price_1SPkF8GaXSfGtYFtktFJm4ZO",
  vipMeetGreet: "price_1SPkJfGaXSfGtYFtAjbxOnWN",
  concertRecording: "price_1SPkJzGaXSfGtYFtM2DgvMFw",
  aiDedication: "price_1SPkKNGaXSfGtYFt79lMZjhi",
  merchCollection: "price_1SPkKpGaXSfGtYFtcliitpgd",
};

const HolographicConcerts = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    verifyPaymentIfNeeded();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setCheckingAuth(false);
  };

  const verifyPaymentIfNeeded = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      setVerifyingPayment(true);
      try {
        const { data, error } = await supabase.functions.invoke('verify-holographic-payment', {
          body: { sessionId }
        });

        if (error) throw error;

        if (data?.success) {
          toast({
            title: "Payment Successful! 🎉",
            description: "Your holographic concert access has been activated",
          });
          window.history.replaceState({}, '', '/holographic-concerts');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast({
          title: "Payment Verification Failed",
          description: "Please contact support if payment was deducted",
          variant: "destructive",
        });
      } finally {
        setVerifyingPayment(false);
      }
    }
  };

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
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-holographic-concert-checkout', {
        body: { priceId, featureName }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
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
    { icon: Music, title: "Premium Concert Ticket", price: "€150", description: "Experience legendary musicians brought back to life", priceId: PRICE_IDS.premiumTicket },
    { icon: Users, title: "VIP Holographic Meet & Greet", price: "€500", description: "Exclusive VIP experience with AI-powered holographic interaction", priceId: PRICE_IDS.vipMeetGreet },
    { icon: Video, title: "Concert Recording - HD", price: "€20", description: "High-quality recording of the full holographic concert", priceId: PRICE_IDS.concertRecording },
    { icon: MessageSquare, title: "AI Personalized Dedication", price: "€100", description: "Unique AI-personalized dedication from your favorite artist", priceId: PRICE_IDS.aiDedication },
    { icon: ShoppingBag, title: "Exclusive Merch Collection", price: "€200", description: "Limited edition holographic concert merchandise", priceId: PRICE_IDS.merchCollection }
  ];

  if (checkingAuth || verifyingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-background to-blue-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-background to-blue-950">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Holographic Concerts Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">Manage your holographic concert experiences</p>
          </div>

          <Tabs defaultValue="concerts" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px] mx-auto">
              <TabsTrigger value="concerts">Concerts</TabsTrigger>
              <TabsTrigger value="dedication">Dedication</TabsTrigger>
              <TabsTrigger value="meetgreet">Meet & Greet</TabsTrigger>
              <TabsTrigger value="recordings">Recordings</TabsTrigger>
              <TabsTrigger value="mydedications">Dedications</TabsTrigger>
            </TabsList>
            <TabsContent value="concerts"><MyConcerts /></TabsContent>
            <TabsContent value="dedication"><DedicationGenerator /></TabsContent>
            <TabsContent value="meetgreet"><MeetGreetScheduler /></TabsContent>
            <TabsContent value="recordings"><MyRecordings /></TabsContent>
            <TabsContent value="mydedications"><MyDedications /></TabsContent>
          </Tabs>

          <div className="mt-16" data-marketplace>
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ShoppingBag className="w-6 h-6 text-purple-400" />
                  Purchase Additional Services
                </CardTitle>
                <CardDescription>
                  Enhance your holographic concert experience
                </CardDescription>
              </CardHeader>
              <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-marketplace>
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card key={index} className="border-purple-500/30">
                        <CardHeader>
                          <Icon className="w-8 h-8 text-purple-400 mb-2" />
                          <CardTitle>{feature.title}</CardTitle>
                          <div className="text-2xl font-bold text-purple-400">{feature.price}</div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                          <Button 
                            onClick={() => handlePurchase(feature.priceId, feature.title)} 
                            disabled={loading === feature.title} 
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                          >
                            {loading === feature.title ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Purchase
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-background to-blue-950">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Holographic AI Concerts
          </h1>
          <p className="text-xl text-muted-foreground">Experience legendary musicians through holographic AI</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-purple-500/30">
                <CardHeader>
                  <Icon className="w-8 h-8 text-purple-400 mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                  <div className="text-2xl font-bold text-purple-400">{feature.price}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                  <Button onClick={() => handlePurchase(feature.priceId, feature.title)} disabled={loading === feature.title} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                    {loading === feature.title ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" />Purchase</>}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HolographicConcerts;
