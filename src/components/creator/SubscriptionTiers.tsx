import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Tier {
  id: string;
  name: string;
  price: number;
  description: string | null;
  benefits: string[] | null;
}

interface SubscriptionTiersProps {
  creatorId: string;
  tiers: Tier[];
  currentTierId?: string | null;
  onSubscribe?: () => void;
}

export function SubscriptionTiers({ creatorId, tiers, currentTierId, onSubscribe }: SubscriptionTiersProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const getTierIcon = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('vip')) return Crown;
    if (name.includes('premium')) return Star;
    return Zap;
  };

  const getTierColor = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('vip')) return 'from-yellow-500 to-orange-500';
    if (name.includes('premium')) return 'from-purple-500 to-pink-500';
    return 'from-blue-500 to-cyan-500';
  };

  const handleSubscribe = async (tierId: string) => {
    setLoading(tierId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-creator-subscription', {
        body: { creatorId, tierId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to Checkout",
          description: "Complete your payment to activate membership",
        });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start subscription. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal-creator');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open subscription management.",
      });
    }
  };

  if (tiers.length === 0) {
    return (
    <>
      <FloatingHowItWorks title={"Subscription Tiers - How it works"} steps={[{ title: 'Open', desc: 'Access the Subscription Tiers section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Subscription Tiers.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            This creator hasn't set up membership tiers yet.
          </p>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Membership Tiers</h3>
        {currentTierId && (
          <Button onClick={handleManageSubscription} variant="outline">
            Manage Subscription
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const TierIcon = getTierIcon(tier.name);
          const isCurrentTier = currentTierId === tier.id;
          const colorClass = getTierColor(tier.name);

          return (
            <Card 
              key={tier.id} 
              className={`relative ${isCurrentTier ? 'border-primary border-2' : ''}`}
            >
              {isCurrentTier && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Your Plan
                </Badge>
              )}
              
              <CardHeader>
                <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center mb-4`}>
                  <TierIcon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description || 'Exclusive membership benefits'}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <span className="text-3xl font-bold">€{tier.price.toFixed(2)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <div className="space-y-2">
                  {tier.benefits && Array.isArray(tier.benefits) ? (
                    tier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Access to exclusive posts</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Community chat access</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Support the creator</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loading === tier.id || isCurrentTier}
                  variant={isCurrentTier ? "outline" : "default"}
                >
                  {loading === tier.id ? "Processing..." : isCurrentTier ? "Current Plan" : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
