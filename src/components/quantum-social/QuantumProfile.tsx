import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Atom, Settings, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuantumProfile {
  quantum_mode: string;
  reality_versions: number;
  observer_mode_active: boolean;
  is_premium: boolean;
}

const QuantumProfile = () => {
  const [profile, setProfile] = useState<QuantumProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("quantum_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive",
      });
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const createProfile = async (mode: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const versions = mode === "triple" ? 3 : mode === "unlimited" ? 5 : 1;

    const { error } = await supabase.from("quantum_profiles").insert([
      {
        user_id: user.id,
        quantum_mode: mode,
        reality_versions: versions,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Quantum profile created",
      });
      fetchProfile();
    }
  };

  const updateMode = async (mode: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const versions = mode === "triple" ? 3 : mode === "unlimited" ? 5 : 1;

    const { error } = await supabase
      .from("quantum_profiles")
      .update({
        quantum_mode: mode,
        reality_versions: versions,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update mode",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Quantum mode updated",
      });
      fetchProfile();
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading profile...</p>;
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Quantum Profile</CardTitle>
          <CardDescription>Choose how many reality versions you want</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg" onClick={() => createProfile("single")}>
              <CardHeader>
                <CardTitle className="text-lg">Standard</CardTitle>
                <Badge variant="outline">1 Version</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Everyone sees the same you</p>
                <p className="text-lg font-bold mt-2">Free</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg border-primary" onClick={() => createProfile("triple")}>
              <CardHeader>
                <CardTitle className="text-lg">Quantum</CardTitle>
                <Badge variant="default">3 Versions</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">3 different realities of you</p>
                <p className="text-lg font-bold mt-2">12.99€/month</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg border-gold" onClick={() => createProfile("unlimited")}>
              <CardHeader>
                <CardTitle className="text-lg">Unlimited</CardTitle>
                <Badge className="bg-gold text-gold-foreground">5+ Versions</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Unlimited quantum realities</p>
                <p className="text-lg font-bold mt-2">24.99€/month</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Atom className="h-6 w-6 text-primary" />
            Your Quantum Profile
          </CardTitle>
          <CardDescription>Manage your quantum reality versions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Mode:</span>
            <Badge variant="default" className="capitalize">{profile.quantum_mode}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Reality Versions:</span>
            <Badge variant="outline">{profile.reality_versions} versions</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Observer Mode:</span>
            <Badge variant={profile.observer_mode_active ? "default" : "secondary"}>
              {profile.observer_mode_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Premium Status:</span>
            <Badge variant={profile.is_premium ? "default" : "secondary"}>
              {profile.is_premium ? "Premium" : "Standard"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade Quantum Mode</CardTitle>
          <CardDescription>Change your reality version settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={profile.quantum_mode} onValueChange={updateMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Standard (Free - 1 Version)</SelectItem>
              <SelectItem value="triple">Quantum (12.99€/mo - 3 Versions)</SelectItem>
              <SelectItem value="unlimited">Unlimited (24.99€/mo - 5+ Versions)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuantumProfile;
