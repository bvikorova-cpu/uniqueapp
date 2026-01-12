import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, School, Users, Loader2, Crown, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { SafeContentBadge } from "./SafeContentBadge";

const PRODUCT_TIERS = {
  monthly: {
    product_id: "prod_TPWmSQy8vJrtpe",
    price_id: "price_1SShj2GaXSfGtYFtcKlTJYGa"
  },
  annual: {
    product_id: "prod_TPWmNY3AZcnjUH",
    price_id: "price_1SShj3GaXSfGtYFtGEneXVhs"
  },
  gold_pass: {
    product_id: "prod_KidsGoldPass",
    price_id: "price_KidsGoldPass"
  }
};

const subscriptionPlans = [
  {
    id: 'monthly',
    name: '✨ Premium Monthly',
    price: 5,
    interval: 'month',
    icon: Sparkles,
    color: 'from-pink-500 to-purple-500',
    popular: false,
    featured: false,
    features: [
      'Unlimited homework questions',
      'AI-powered explanations',
      'Fun facts included',
      'Kid-friendly guidance',
      'All subjects covered',
      'Track progress & achievements',
      'Daily challenges with bonus points',
      'Priority support'
    ]
  },
  {
    id: 'gold_pass',
    name: '👑 Unique Kids Gold Pass',
    price: 30,
    interval: 'month',
    icon: Crown,
    color: 'from-yellow-400 via-amber-500 to-orange-500',
    popular: true,
    featured: true,
    features: [
      '🎓 Homework Helper - Unlimited',
      '📖 Story Creator - Unlimited',
      '🎨 Drawing Buddy - Unlimited',
      '🔬 Science Lab - Unlimited',
      '📚 Reading Companion - Unlimited',
      '🎨 Coloring Pages - Unlimited',
      '🏰 Disney Castles - Full Access',
      '💬 Character Chat - Unlimited',
      '🌙 Bedtime Stories - All Content',
      '👨‍👩‍👧 Up to 5 child profiles',
      '📊 Parental analytics dashboard',
      '⭐ Priority support 24/7'
    ]
  },
  {
    id: 'annual',
    name: '👑 Premium Annual',
    price: 50,
    interval: 'year',
    icon: Users,
    color: 'from-purple-500 to-indigo-500',
    popular: false,
    featured: false,
    features: [
      'Unlimited homework questions',
      'AI-powered explanations',
      'Fun facts included',
      'Kid-friendly guidance',
      'All subjects covered',
      'Track progress & achievements',
      'Daily challenges with bonus points',
      'Priority support',
      '💰 Save €10 (2 months free!)'
    ]
  }
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
            Kids Channel Premium 🌟
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlimited access to Bedtime Stories, Character Chat, Story Videos, Reading Companion & more!
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
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
          {subscriptionPlans.map((plan) => {
            const Icon = plan.icon;
            const isGoldPass = plan.id === 'gold_pass';
            
            return (
              <Card 
                key={plan.id}
                className={`relative overflow-hidden transform transition-all hover:scale-105 ${
                  isGoldPass 
                    ? 'border-4 border-yellow-400 shadow-2xl shadow-yellow-300/30 ring-2 ring-yellow-400/50' 
                    : plan.popular 
                      ? 'border-4 border-primary shadow-2xl' 
                      : 'border-4 border-transparent hover:border-primary/30'
                }`}
                style={isGoldPass ? {
                  background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.3) 0%, rgba(253, 230, 138, 0.2) 50%, rgba(251, 191, 36, 0.15) 100%)',
                } : undefined}
              >
                {/* Gold Pass Glow Effect */}
                {isGoldPass && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-amber-500/5 to-orange-500/10 pointer-events-none" />
                )}
                
                {/* Badge */}
                {(plan.popular || plan.featured) && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                    <Badge className={`gap-1 text-base px-4 py-2 shadow-lg whitespace-nowrap ${
                      isGoldPass 
                        ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white border-2 border-yellow-300' 
                        : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                    }`}>
                      {isGoldPass ? (
                        <>
                          <Crown className="h-4 w-4" />
                          BEST FOR FAMILIES
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Most Popular
                        </>
                      )}
                    </Badge>
                  </div>
                )}
                
                <div className={`h-3 bg-gradient-to-r ${plan.color}`} />
                
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                    isGoldPass 
                      ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400' 
                      : 'bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900'
                  }`}>
                    <Icon className={`h-10 w-10 ${isGoldPass ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <CardTitle className={`text-2xl ${isGoldPass ? 'text-amber-700 dark:text-amber-300' : ''}`}>
                    {plan.name}
                  </CardTitle>
                  <div className="text-center space-y-1">
                    <div className={`text-4xl font-bold ${isGoldPass ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                      €{plan.price}
                    </div>
                    <div className="text-sm text-muted-foreground">/{plan.interval}</div>
                    {isGoldPass && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2">
                        All Kids Channel modules included!
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 relative z-10">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isGoldPass 
                              ? 'bg-yellow-100 dark:bg-yellow-900' 
                              : 'bg-green-100 dark:bg-green-900'
                          }`}>
                            {isGoldPass ? (
                              <Star className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                            ) : (
                              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${isGoldPass ? 'text-amber-800 dark:text-amber-200' : ''}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan(plan.id) || loading[plan.id] || checkingSubscription}
                    className={`w-full text-lg py-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow ${
                      isGoldPass 
                        ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-white border-2 border-yellow-300' 
                        : ''
                    }`}
                    variant={plan.popular || isGoldPass ? 'default' : 'outline'}
                  >
                    {loading[plan.id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : isCurrentPlan(plan.id) ? (
                      '✓ Your Plan'
                    ) : isGoldPass ? (
                      <>
                        <Crown className="mr-2 h-5 w-5" />
                        Get Gold Pass
                      </>
                    ) : (
                      'Choose Plan'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Safe Content Badge */}
        <div className="max-w-2xl mx-auto">
          <SafeContentBadge />
        </div>

        {/* Trust & Guarantee */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>✓ No hidden fees · ✓ Cancel anytime · ✓ 14-day money-back guarantee</p>
          <p>🔒 Secure payments via Stripe · 🛡️ Child-safe AI content</p>
        </div>
      </div>
    </div>
  );
}
