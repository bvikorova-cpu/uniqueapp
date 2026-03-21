import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Sparkles, Zap, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [currentTier, setCurrentTier] = useState<string>('basic');
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);

      // Check current subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub) {
        setCurrentTier(sub.tier);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string, price: number) => {
    if (!user) return;

    try {
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        setStripeUrl(data.url);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to create payment",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || currentTier === 'basic') return;

    setCanceling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionType: 'general' }
      });

      if (error) throw error;

      toast({
        title: "Subscription cancelled",
        description: data.message || "Subscription will be cancelled at the end of the current period",
      });

      await checkAuth();
    } catch (error) {
      console.error('Cancellation error:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const tier = urlParams.get('tier');

      if (success === 'true' && tier) {
        toast({
          title: "Payment processing",
          description: "Verifying subscription status...",
        });

        // Check subscription status
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (!error && data?.tier) {
          setCurrentTier(data.tier);
          toast({
            title: "Success!",
            description: `${tier.toUpperCase()} subscription has been activated`,
          });
        }

        // Clean URL
        window.history.replaceState({}, '', '/subscription');
      }
    };

    if (user) {
      checkPaymentStatus();
    }
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const plans = [
    {
      tier: 'basic',
      name: 'Basic',
      price: 5,
      icon: Check,
      popular: false,
      features: [
        '5 Bazaar listings/month',
        '5 auctions/month',
        'All basic features',
        '3% sales commission',
        '20 AI generations/month',
        'Email support'
      ],
    },
    {
      tier: 'premium',
      name: 'Premium',
      price: 15,
      icon: Crown,
      popular: true,
      features: [
        'Unlimited listings',
        'Unlimited auctions',
        '0% sales commission',
        '50 AI generations/month',
        'Featured listings (3/month)',
        'Priority support',
        'Analytics & statistics'
      ],
    },
    {
      tier: 'business',
      name: 'Business',
      price: 50,
      icon: Zap,
      popular: false,
      features: [
        'Everything from Premium',
        '0% commission forever',
        'Unlimited AI features',
        'Unlimited featured listings',
        'Custom branding',
        'API access',
        'Dedicated support',
        'Personal account manager'
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <AlertDialog open={!!stripeUrl} onOpenChange={() => setStripeUrl(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Subscription Ready
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Click the button below to complete payment via Stripe:</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={() => {
                if (stripeUrl) {
                  window.open(stripeUrl, '_blank');
                }
              }}
              className="w-full gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Stripe Payment
            </Button>
            <Button
              variant="outline"
              onClick={() => setStripeUrl(null)}
              className="w-full"
            >
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Subscription
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Get more from the Unique platform
          </p>
          {currentTier !== 'basic' && (
            <Badge className="mt-4" variant="default">
              Current: {currentTier.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentTier === plan.tier;
            
            return (
              <Card 
                key={plan.tier}
                className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''} ${isCurrent ? 'border-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      Current
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`h-8 w-8 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={isCurrent}
                    onClick={() => handleSubscribe(plan.tier, plan.price)}
                  >
                    {isCurrent ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {currentTier !== 'basic' && (
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              {canceling ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All prices are in EUR. Subscription is monthly and can be cancelled anytime.</p>
          <p className="mt-2">Commissions are charged only on successful sales in Auctions and Bazaar.</p>
          <p className="mt-2">When cancelling subscription, it remains active until the end of the paid period. Paid amount is non-refundable.</p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;