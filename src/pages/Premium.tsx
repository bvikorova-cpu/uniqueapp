import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, Sparkles, Zap, Shield, Infinity as InfinityIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

const PREMIUM_MODULES = [
  "Psychology AI", "Creator Studio", "Holographic Avatars", "Lottery Tuning",
  "Phobia Therapy", "Skill Swap", "Sports Insights", "Time Capsule",
  "Time Reversal", "Tipster AI", "Universal Analyzer", "Astrology Pro",
  "Coloring Studio", "Wellness Coach",
];

const BENEFITS = [
  { icon: InfinityIcon, title: "All 14 premium modules", desc: "One subscription unlocks every gated tier across UniqueApp." },
  { icon: Zap, title: "Priority AI processing", desc: "Faster generations and higher rate limits on every AI tool." },
  { icon: Shield, title: "Cancel anytime", desc: "Manage or cancel from the Stripe customer portal in one click." },
  { icon: Sparkles, title: "Future modules included", desc: "New premium features added to UniqueApp are unlocked automatically." },
];

const Premium = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const status = params.get("status");
    if (status === "success") {
      toast({
        title: "Welcome to Premium! 🎉",
        description: "Your UniqueApp Premium subscription is now active.",
      });
    } else if (status === "canceled") {
      toast({
        title: "Checkout canceled",
        description: "No worries — you can subscribe anytime.",
        variant: "destructive",
      });
    }
  }, [params, toast]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/premium");
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-premium-subscription");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      toast({
        title: "Couldn't start checkout",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>UniqueApp Premium — Unlock all 14 modules | €9.99/mo</title>
        <meta name="description" content="One subscription unlocks every premium module on UniqueApp: Psychology, Astrology, Wellness, Holographic, Time Reversal and more. €9.99/month, cancel anytime." />
        <link rel="canonical" href="https://uniqueapp.fun/premium" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container max-w-5xl mx-auto px-4 py-12 md:py-20">
          {/* Hero */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              All-in-One Premium
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              UniqueApp Premium
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              One subscription. Every premium module. <span className="text-foreground font-semibold">€9.99/month.</span>
            </p>
          </motion.header>

          {/* Pricing card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto mb-16"
          >
            <Card className="relative overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
              <div className="relative p-8">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold">€9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Billed monthly · Cancel anytime
                </p>

                <Button
                  size="lg"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary shadow-lg shadow-primary/20"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting checkout…
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Get Premium
                    </>
                  )}
                </Button>

                <ul className="mt-6 space-y-2.5">
                  {BENEFITS.map((b) => (
                    <li key={b.title} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span><strong className="text-foreground">{b.title}</strong> — <span className="text-muted-foreground">{b.desc}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>

          {/* Modules grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
              Unlock 14 premium modules
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Everything that previously required individual subscriptions — now bundled.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {PREMIUM_MODULES.map((mod) => (
                <Card key={mod} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{mod}</span>
                  </div>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Trust line */}
          <p className="text-center text-xs text-muted-foreground mt-12">
            Secure payment via Stripe · GDPR compliant · Manage from your account
          </p>
        </div>
      </div>
    </>
  );
};

export default Premium;
