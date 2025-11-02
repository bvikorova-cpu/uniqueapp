import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Link as LinkIcon, Zap } from "lucide-react";

interface Entanglement {
  id: string;
  user_id_1: string;
  user_id_2: string;
  entanglement_strength: number;
  shared_reality: boolean;
  created_at: string;
  expires_at: string;
}

const QuantumEntanglements = () => {
  const [entanglements, setEntanglements] = useState<Entanglement[]>([]);
  const [targetUserId, setTargetUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntanglements();
  }, []);

  const fetchEntanglements = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("quantum_entanglements")
      .select("*")
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch entanglements",
        variant: "destructive",
      });
    } else {
      setEntanglements(data || []);
    }
    setLoading(false);
  };

  const createEntanglement = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create entanglements",
        variant: "destructive",
      });
      return;
    }

    if (!targetUserId) {
      toast({
        title: "Missing Information",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    // Ensure user_id_1 < user_id_2 for the CHECK constraint
    const userId1 = user.id < targetUserId ? user.id : targetUserId;
    const userId2 = user.id < targetUserId ? targetUserId : user.id;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error } = await supabase.from("quantum_entanglements").insert([
      {
        user_id_1: userId1,
        user_id_2: userId2,
        entanglement_strength: 1.0,
        shared_reality: true,
        price_paid: 9.99,
        expires_at: expiresAt.toISOString(),
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create entanglement",
        variant: "destructive",
      });
    } else {
      // Create subscription
      await supabase.from("quantum_subscriptions").insert([
        {
          user_id: user.id,
          subscription_type: "quantum_entanglement",
          price: 9.99,
          expires_at: expiresAt.toISOString(),
        },
      ]);

      toast({
        title: "Entanglement Created",
        description: "Quantum connection established (9.99€/month)",
      });
      setTargetUserId("");
      fetchEntanglements();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quantum Entanglements</h2>
        <Badge variant="outline">9.99€/month each</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Create New Entanglement
          </CardTitle>
          <CardDescription>
            Connect with someone - you'll always see each other's same reality version
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter user ID to entangle with"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
            />
            <Button onClick={createEntanglement}>
              <Zap className="h-4 w-4 mr-2" />
              Entangle (9.99€)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Entanglements</CardTitle>
          <CardDescription>Active quantum connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading entanglements...</p>
            ) : entanglements.length === 0 ? (
              <p className="text-muted-foreground">No entanglements yet. Create your first quantum connection!</p>
            ) : (
              entanglements.map((ent) => (
                <Card key={ent.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Entanglement #{ent.id.slice(0, 8)}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default">
                            Strength: {(ent.entanglement_strength * 100).toFixed(0)}%
                          </Badge>
                          {ent.shared_reality && (
                            <Badge variant="outline">Shared Reality</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Expires: {new Date(ent.expires_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuantumEntanglements;
