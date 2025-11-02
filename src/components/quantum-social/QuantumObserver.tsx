import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, Sparkles } from "lucide-react";

const QuantumObserver = () => {
  const [hasObserverMode, setHasObserverMode] = useState(false);
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkObserverMode();
    fetchObservations();
  }, []);

  const checkObserverMode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("quantum_profiles")
      .select("observer_mode_active")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setHasObserverMode(data.observer_mode_active);
    }
  };

  const fetchObservations = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("quantum_observations")
      .select(`
        *,
        quantum_posts (
          base_content,
          versions_count
        ),
        quantum_post_versions (
          content,
          personality_tone
        )
      `)
      .eq("observer_id", user.id)
      .order("observed_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Failed to fetch observations", error);
    } else {
      setObservations(data || []);
    }
    setLoading(false);
  };

  const activateObserverMode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create subscription
    const { error: subError } = await supabase.from("quantum_subscriptions").insert([
      {
        user_id: user.id,
        subscription_type: "observer_mode",
        price: 19.99,
      },
    ]);

    if (subError) {
      toast({
        title: "Error",
        description: "Failed to activate observer mode",
        variant: "destructive",
      });
      return;
    }

    // Update profile
    const { error } = await supabase
      .from("quantum_profiles")
      .update({ observer_mode_active: true })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Observer Mode Activated",
        description: "You can now see all versions (19.99€/month)",
      });
      setHasObserverMode(true);
    }
  };

  if (!hasObserverMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-6 w-6" />
            Observer Mode
          </CardTitle>
          <CardDescription>See all quantum versions of posts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-6 text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-primary" />
            <h3 className="text-xl font-bold">Unlock Observer Mode</h3>
            <p className="text-muted-foreground">
              See all reality versions of every post - discover how others experience different quantum states
            </p>
            <div className="space-y-2">
              <p className="text-2xl font-bold">19.99€/month</p>
              <Button onClick={activateObserverMode} size="lg">
                <Eye className="h-5 w-5 mr-2" />
                Activate Observer Mode
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          Observer Mode Active
        </h2>
        <Badge variant="default">19.99€/month</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Observations</CardTitle>
          <CardDescription>Posts you've viewed with all their quantum versions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading observations...</p>
            ) : observations.length === 0 ? (
              <p className="text-muted-foreground">No observations yet</p>
            ) : (
              observations.map((obs: any) => (
                <Card key={obs.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {obs.quantum_post_versions?.content || "Post content"}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="capitalize">
                            {obs.quantum_post_versions?.personality_tone}
                          </Badge>
                          <Badge variant="secondary">
                            {obs.quantum_posts?.versions_count || 1} versions total
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuantumObserver;
