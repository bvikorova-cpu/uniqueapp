import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useAncestorTwin } from "@/hooks/useAncestorTwin";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const { subscription, loading, checkSubscription } = useAncestorTwin();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await checkSubscription();
      toast.success("Subscription status updated");
    } catch (error) {
      toast.error("Error updating subscription status");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("Failed to open subscription management portal");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Error opening subscription management portal");
    } finally {
      setIsOpeningPortal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/ancestor-twin")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Subscription Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscription and payment details
            </p>
          </div>
        </div>

        {/* Current Subscription Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription Status
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {subscription.hasSubscription ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {subscription.hasSubscription ? "Active Subscription" : "No Active Subscription"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.hasSubscription
                      ? "You have access to all Ancestor Twin features"
                      : "Purchase a subscription for unlimited access"}
                  </p>
                </div>
              </div>
              <Badge variant={subscription.hasSubscription ? "default" : "secondary"}>
                {subscription.hasSubscription ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>

            {subscription.hasSubscription && subscription.subscriptionEnd && (
              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Valid Until</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subscription.subscriptionEnd).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manage Subscription */}
        {subscription.hasSubscription && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Manage Subscription</CardTitle>
              <CardDescription>
                Update payment details, cancel or change subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleManageSubscription}
                disabled={isOpeningPortal}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {isOpeningPortal ? "Opening portal..." : "Open Stripe Portal"}
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                You will be redirected to the secure Stripe portal for subscription management
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Subscription - Call to Action */}
        {!subscription.hasSubscription && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started with Ancestor Twin</CardTitle>
              <CardDescription>
                Discover your historical lookalikes with our premium packages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/ancestor-twin")}
                className="w-full"
                size="lg"
              >
                View Pricing Packages
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="mt-6 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• All payments are processed securely via Stripe</p>
            <p>• Subscription automatically renews every month</p>
            <p>• You can cancel your subscription at any time without fees</p>
            <p>• For support, contact our team at support@megasocial.com</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
