import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Zap, Sparkles, Brain, Shield, Flame, Loader2 } from "lucide-react";

export function HeroCreationForm() {
  const [name, setName] = useState("");
  const [powerType, setPowerType] = useState("strength");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const powerTypes = [
    { id: "strength", name: "Strength", icon: Shield, description: "Raw physical power" },
    { id: "speed", name: "Speed", icon: Zap, description: "Lightning fast movements" },
    { id: "intelligence", name: "Intelligence", icon: Brain, description: "Superior intellect" },
    { id: "energy", name: "Energy", icon: Sparkles, description: "Energy manipulation" },
    { id: "elemental", name: "Elemental", icon: Flame, description: "Control elements" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to create a hero",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-superhero', {
        body: { name, powerType },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error,
        });
        return;
      }

      toast({
        title: "Hero Created! 🦸",
        description: `${data.hero.name} is ready for battle! Rarity: ${data.hero.rarity.toUpperCase()}`,
      });

      navigate("/superhero-universe");
    } catch (error: any) {
      console.error("Error creating hero:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create hero",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Hero</CardTitle>
        <CardDescription>
          Choose your hero's name and power type. Rarity and stats will be generated randomly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Hero Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter hero name"
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-3">
            <Label>Power Type *</Label>
            <RadioGroup value={powerType} onValueChange={setPowerType}>
              {powerTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value={type.id} id={type.id} />
                    <Label htmlFor={type.id} className="flex items-center gap-3 cursor-pointer flex-1">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">{type.name}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Rarity Chances:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>Common: 45% (+0% stats)</li>
              <li>Rare: 30% (+10% stats)</li>
              <li>Epic: 15% (+25% stats)</li>
              <li>Legendary: 8% (+50% stats)</li>
              <li>Mythic: 2% (+100% stats)</li>
            </ul>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Hero...
              </>
            ) : (
              "Create Hero"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
