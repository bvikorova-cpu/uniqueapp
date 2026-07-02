import { useTimeReversalSubscription } from "@/hooks/useTimeReversalSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Lock, Eye, ArrowRight } from "lucide-react";
import { TIME_REVERSAL_PRODUCTS, getTimeReversalProduct, hasTimeReversalFeature } from "@/config/timeReversalProducts";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function TimeReversalDashboard() {
  const { subscribed, activeFeatures, subscription_end, loading, refresh } = useTimeReversalSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && (!subscribed || activeFeatures.length === 0)) {
      toast({
        title: "Subscription Required",
        description: "You need an active Time Reversal subscription to access the dashboard",
        variant: "destructive",
      });
      navigate("/time-reversal-subscription");
    }
  }, [loading, subscribed, activeFeatures, navigate, toast]);

  if (loading) {
    return (
      
    <>
      <FloatingHowItWorks title="Time Reversal Dashboard" steps={[{ title: "See your timelines", desc: "All your rewinds and alt outcomes in one place." }, { title: "Filter by impact", desc: "High-impact reversals first." }, { title: "Reopen a rewind", desc: "Continue exploring branches." }, { title: "Export learnings", desc: "Save reflections to your journal." }]} />
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </>
  );
  }

  if (!subscribed || activeFeatures.length === 0) {
    return null; // Will redirect via useEffect
  }

  const hasTimeTravelSpeed = hasTimeReversalFeature(activeFeatures, TIME_REVERSAL_PRODUCTS.TIME_TRAVEL_SPEED.id);
  const hasAgeLocks = hasTimeReversalFeature(activeFeatures, TIME_REVERSAL_PRODUCTS.AGE_LOCKS.id);
  const hasFutureGlimpse = hasTimeReversalFeature(activeFeatures, TIME_REVERSAL_PRODUCTS.FUTURE_GLIMPSE.id);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              Time Reversal Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your time manipulation abilities
            </p>
            {subscription_end && (
              <Badge variant="secondary" className="text-sm mt-2">
                Active until {new Date(subscription_end).toLocaleDateString()}
              </Badge>
            )}
          </div>
          <Button variant="outline" onClick={() => navigate("/time-reversal-subscription")}>
            Manage Subscription
          </Button>
        </div>

        {/* Active Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Time Travel Speed */}
          <Card className={hasTimeTravelSpeed ? "border-primary shadow-lg" : "opacity-50"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Zap className={hasTimeTravelSpeed ? "h-8 w-8 text-primary" : "h-8 w-8 text-muted-foreground"} />
                {hasTimeTravelSpeed && <Badge className="bg-green-500">Active</Badge>}
              </div>
              <CardTitle>{TIME_REVERSAL_PRODUCTS.TIME_TRAVEL_SPEED.name}</CardTitle>
              <CardDescription>{TIME_REVERSAL_PRODUCTS.TIME_TRAVEL_SPEED.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {TIME_REVERSAL_PRODUCTS.TIME_TRAVEL_SPEED.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {hasTimeTravelSpeed ? (
                <Button className="w-full" onClick={() => {/* Navigate to feature */}}>
                  Use Feature
                </Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => navigate('/time-reversal-subscription')}>
                  Subscribe
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Age Locks */}
          <Card className={hasAgeLocks ? "border-primary shadow-lg" : "opacity-50"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Lock className={hasAgeLocks ? "h-8 w-8 text-primary" : "h-8 w-8 text-muted-foreground"} />
                {hasAgeLocks && <Badge className="bg-green-500">Active</Badge>}
              </div>
              <CardTitle>{TIME_REVERSAL_PRODUCTS.AGE_LOCKS.name}</CardTitle>
              <CardDescription>{TIME_REVERSAL_PRODUCTS.AGE_LOCKS.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {TIME_REVERSAL_PRODUCTS.AGE_LOCKS.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {hasAgeLocks ? (
                <Button className="w-full" onClick={() => {/* Navigate to feature */}}>
                  Use Feature
                </Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => navigate('/time-reversal-subscription')}>
                  Subscribe
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Future Glimpse */}
          <Card className={hasFutureGlimpse ? "border-primary shadow-lg" : "opacity-50"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Eye className={hasFutureGlimpse ? "h-8 w-8 text-primary" : "h-8 w-8 text-muted-foreground"} />
                {hasFutureGlimpse && <Badge className="bg-green-500">Active</Badge>}
              </div>
              <CardTitle>{TIME_REVERSAL_PRODUCTS.FUTURE_GLIMPSE.name}</CardTitle>
              <CardDescription>{TIME_REVERSAL_PRODUCTS.FUTURE_GLIMPSE.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {TIME_REVERSAL_PRODUCTS.FUTURE_GLIMPSE.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {hasFutureGlimpse ? (
                <Button className="w-full" onClick={() => {/* Navigate to feature */}}>
                  Use Feature
                </Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => navigate('/time-reversal-subscription')}>
                  Subscribe
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={refresh} variant="outline">
              Refresh Status
            </Button>
            <Button onClick={() => navigate('/time-reversal-subscription')} variant="outline">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
