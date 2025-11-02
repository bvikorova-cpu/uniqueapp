import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Zap, Check, X } from "lucide-react";

interface Subscription {
  id: string;
  subscription_type: string;
  price: number;
  status: string;
  started_at: string;
  expires_at: string | null;
}

const QuantumSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("quantum_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions",
        variant: "destructive",
      });
    } else {
      setSubscriptions(data || []);
    }
    setLoading(false);
  };

  const cancelSubscription = async (subscriptionId: string) => {
    const { error } = await supabase
      .from("quantum_subscriptions")
      .update({ status: "cancelled" })
      .eq("id", subscriptionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Subscription cancelled",
      });
      fetchSubscriptions();
    }
  };

  const getSubscriptionName = (type: string) => {
    switch (type) {
      case "quantum_profiles":
        return "Quantum Profiles (3 Versions)";
      case "observer_mode":
        return "Observer Mode";
      case "quantum_entanglement":
        return "Quantum Entanglement";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Subscriptions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quantum Profiles</CardTitle>
            <Badge variant="default">12.99€/month</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5" />
              <span className="text-sm">3 reality versions</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5" />
              <span className="text-sm">Personalized content for each viewer</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5" />
              <span className="text-sm">Multiple personality tones</span>
            </div>
            <Button className="w-full mt-4">
              <Zap className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observer Mode</CardTitle>
            <Badge variant="default">19.99€/month</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5" />
              <span className="text-sm">See all quantum versions</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5" />
              <span className="text-sm">Discover different realities</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5" />
              <span className="text-sm">Access observation history</span>
            </div>
            <Button className="w-full mt-4">
              <Zap className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum Entanglement</CardTitle>
            <Badge variant="default">9.99€/month</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5" />
              <span className="text-sm">Connect with someone</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5" />
              <span className="text-sm">Shared reality experience</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5" />
              <span className="text-sm">Always see same versions</span>
            </div>
            <Button className="w-full mt-4">
              <Zap className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>Manage your quantum subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading subscriptions...</p>
            ) : subscriptions.length === 0 ? (
              <p className="text-muted-foreground">No active subscriptions</p>
            ) : (
              subscriptions.map((sub) => (
                <Card key={sub.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{getSubscriptionName(sub.subscription_type)}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={sub.status === "active" ? "default" : "secondary"} className="capitalize">
                            {sub.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{sub.price.toFixed(2)}€/month</span>
                        </div>
                      </div>
                      {sub.status === "active" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cancelSubscription(sub.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {sub.expires_at && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Expires: {new Date(sub.expires_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuantumSubscriptions;
