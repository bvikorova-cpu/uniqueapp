import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { Sparkles, Zap, Star, Package, CreditCard, ArrowLeft, Image, Brush, Pencil, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AICreditsStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits } = useAICredits();
  const [loading, setLoading] = useState(false);

  const creditPackages = [
    { name: "Starter", credits: 10, price: 5, icon: Sparkles, popular: false, description: "Try AI features", perCredit: 0.50 },
    { name: "Basic", credits: 25, price: 10, icon: Star, popular: true, description: "Most popular", perCredit: 0.40, savings: "20%" },
    { name: "Pro", credits: 60, price: 20, icon: Zap, popular: false, description: "Power creators", perCredit: 0.33, savings: "34%" },
    { name: "Ultimate", credits: 150, price: 40, icon: Package, popular: false, description: "Best value", perCredit: 0.27, savings: "46%" },
  ];

  const usageCosts = [
    { icon: Image, label: "Image Generation", cost: "5 credits" },
    { icon: Pencil, label: "Image Editing", cost: "3 credits" },
    { icon: Brush, label: "Style Transfer", cost: "3 credits" },
    { icon: ArrowUpRight, label: "AI Upscaler", cost: "2 credits" },
  ];

  const handlePurchase = async (pkg: typeof creditPackages[0]) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", description: "Please sign in to purchase credits", variant: "destructive" });
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke('create-credits-payment', {
        body: { credits: pkg.credits, price: pkg.price }
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({ title: "Payment Error", description: error?.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-12">
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Preparing Payment</h3>
            <p className="text-muted-foreground">Please wait...</p>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/ai-generation')} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Studio
        </Button>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Badge className="mb-4" variant="default">
            <CreditCard className="h-3 w-3 mr-1" /> AI Credits Store
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Power Your <span className="text-primary">Creative AI</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-lg mx-auto">
            Credits fuel all AI tools — generate, edit, stylize, and upscale images
          </p>
          <Card className="max-w-sm mx-auto border-2 border-primary/20">
            <CardContent className="pt-6 flex items-center justify-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-4xl font-black">{credits?.credits_remaining || 0}</span>
              <span className="text-muted-foreground">credits available</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
          {creditPackages.map((pkg, i) => {
            const Icon = pkg.icon;
            return (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`relative h-full ${pkg.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  {pkg.savings && (
                    <div className="absolute -top-3 right-3">
                      <Badge className="bg-green-500 text-white">-{pkg.savings}</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4 pt-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${pkg.popular ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`h-6 w-6 ${pkg.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="mt-3">
                      <span className="text-3xl font-black">€{pkg.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{pkg.credits} credits · €{pkg.perCredit}/credit</p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      variant={pkg.popular ? 'default' : 'outline'}
                      disabled={loading}
                      onClick={() => handlePurchase(pkg)}
                    >
                      Buy Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Usage Costs */}
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> Credit Usage Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {usageCosts.map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-bold text-sm">{item.cost}</p>
                    <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Credits are valid for 12 months · Usable across all AI features on the platform
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AICreditsStore;
