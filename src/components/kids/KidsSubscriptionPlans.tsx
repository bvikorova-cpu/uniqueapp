import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, School, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const PRODUCT_TIERS = {
  basic: {
    product_id: "prod_TOhBTCURKFnRuI",
    price_id: "price_1SRtnN0QTWhd4oRpRKP8MB2R"
  },
  premium: {
    product_id: "prod_TOhaMSxuZqRwsr",
    price_id: "price_1SRuAzGaXSfGtYFt6pQB43Ob"
  },
  pro: {
    product_id: "prod_TOhCZbP0IpK2J8",
    price_id: "price_1SRtnfGaXSfGtYFtrf4jRN83"
  }
};

const subscriptionPlans = [
  {
    id: 'basic',
    name: '⭐ Basic',
    price: 5,
    interval: 'month',
    icon: Sparkles,
    color: 'from-yellow-500 to-orange-500',
    popular: false,
    features: [
      '20 stories/month',
      'HD illustrations',
      'Audio stories',
      'Create your hero',
      'Educational stories',
      'Bedtime stories',
      'Story games',
      'Chat with characters'
    ]
  },
  {
    id: 'premium',
    name: '✨ Premium',
    price: 20,
    interval: 'month',
    icon: Sparkles,
    color: 'from-pink-500 to-purple-500',
    popular: true,
    features: [
      '20 stories/month',
      'HD illustrations',
      'Audio stories',
      'Create your hero',
      'Educational stories',
      'Bedtime stories',
      'Story games',
      'Chat with characters',
      'Disney castle tours'
    ]
  },
  {
    id: 'pro',
    name: '👑 Pro',
    price: 120,
    interval: '12 months',
    icon: Users,
    color: 'from-purple-500 to-indigo-500',
    popular: false,
    features: [
      'Unlimited stories',
      'Video stories',
      'AR stories',
      'All premium features',
      'No ads',
      'Disney castle tours',
      'Save 50% from Premium plan'
    ]
  }
];

const payPerStory = [
  { id: 'basic', name: '📖 Basic story', price: 1.50 },
  { id: 'personalized', name: '🌟 Personalized story', price: 3.50 },
  { id: 'video', name: '🎬 Video story', price: 7.99 },
  { id: 'ar', name: '🥽 AR story', price: 12.99 }
];

export default function KidsSubscriptionPlans() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCheckingSubscription(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-kids-subscription');
      
      if (error) throw error;
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoading(prev => ({ ...prev, [planId]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('create-kids-subscription-checkout', {
        body: { tier: planId }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening checkout...');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (!currentSubscription?.subscribed) return false;
    const productId = PRODUCT_TIERS[planId as keyof typeof PRODUCT_TIERS]?.product_id;
    return currentSubscription.product_id === productId;
  };

  const handleBuyStory = async (storyType: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('Please sign in to purchase a story');
      return;
    }

    setLoading(prev => ({ ...prev, [storyType]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('create-story-payment', {
        body: { storyType }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening checkout...');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [storyType]: false }));
    }
  };

  const handleManageSubscription = async () => {
    setLoading(prev => ({ ...prev, portal: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('kids-customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening subscription portal...');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open portal. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, portal: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 pt-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choose Your Plan! ✨
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlimited stories full of adventure and imagination for your kids
          </p>
          
          {currentSubscription?.subscribed && (
            <Button 
              onClick={handleManageSubscription}
              disabled={loading.portal}
              variant="outline"
              className="mt-4"
            >
              {loading.portal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                '⚙️ Manage Subscription'
              )}
            </Button>
          )}
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto pt-8">
          {subscriptionPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.id}
                className={`relative overflow-hidden border-4 transform transition-all hover:scale-105 ${
                  plan.popular 
                    ? 'border-primary shadow-2xl' 
                    : 'border-transparent hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="gap-1 text-base px-4 py-2 shadow-lg bg-gradient-to-r from-yellow-400 to-orange-400 whitespace-nowrap">
                      <Sparkles className="h-4 w-4" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className={`h-3 bg-gradient-to-r ${plan.color}`} />
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-lg">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-center space-y-1">
                    <div className="text-4xl font-bold text-foreground">
                      €{plan.price}
                    </div>
                    <div className="text-sm text-muted-foreground">/{plan.interval}</div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan(plan.id) || loading[plan.id] || checkingSubscription}
                    className="w-full text-lg py-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {loading[plan.id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : isCurrentPlan(plan.id) ? (
                      '✓ Your Plan'
                    ) : (
                      'Choose Plan'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pay Per Story */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">🎨 Or buy just one story</h2>
            <p className="text-muted-foreground">No monthly subscription required</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {payPerStory.map((item) => (
              <Card key={item.id} className="text-center hover:border-primary transition-colors cursor-pointer">
                <CardContent className="pt-6 space-y-3">
                  <div className="text-xl font-semibold">{item.name}</div>
                  <div className="text-3xl font-bold text-primary">€{item.price}</div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleBuyStory(item.id)}
                    disabled={loading[item.id]}
                  >
                    {loading[item.id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Buy'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust & Guarantee */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>✓ No hidden fees · ✓ Cancel anytime · ✓ 14-day money-back guarantee</p>
          <p>🔒 Secure payments via Stripe</p>
        </div>
      </div>
    </div>
  );
}
