import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface UniverseCreatorProps {
  onUniverseCreated: () => void;
}

const UniverseCreator = ({ onUniverseCreated }: UniverseCreatorProps) => {
  const [universeName, setUniverseName] = useState("");
  const [divergencePoint, setDivergencePoint] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCheckingAccess(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_multiverse_access', {
        user_id_param: session.user.id,
        service_type_param: 'universe_creation'
      });

      if (!error) {
        setHasAccess(data);
      }
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleCreate = async () => {
    if (!universeName.trim() || !divergencePoint.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create universes",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-universe', {
        body: {
          universeName,
          divergencePoint,
          parameters: {},
        }
      });

      if (error) throw error;

      toast({
        title: "Universe Created",
        description: `${universeName} has been generated!`,
      });

      setUniverseName("");
      setDivergencePoint("");
      onUniverseCreated();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Creation Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <>
        <FloatingHowItWorks
          title='Universe Creator'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Universe Creator panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
      </>
    );
  }

  const handlePurchase = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-multiverse-checkout', {
        body: { serviceType: 'universe_creation' }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Opening Checkout",
          description: "Complete your purchase to unlock Universe Creation",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to open checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!hasAccess) {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-background">
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto" />
          <h3 className="text-xl font-semibold text-foreground">Access Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Purchase "Universe Creation" for €49 (one-time) to create parallel universes.
          </p>
          <Button 
            onClick={handlePurchase}
            className="bg-gradient-to-r from-violet-500 to-purple-500"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Purchase Universe Creation - €49
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Globe className="w-6 h-6 text-violet-400" />
            Create Parallel Universe
          </CardTitle>
          <CardDescription>
            Generate an alternate reality with AI-powered universe creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Universe Name</Label>
            <Input
              id="name"
              placeholder="e.g., Success Timeline, Dream Career Path"
              value={universeName}
              onChange={(e) => setUniverseName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="divergence">Divergence Point</Label>
            <Textarea
              id="divergence"
              placeholder="Describe the key decision or event that creates this alternate reality... e.g., 'What if I had pursued music instead of my corporate career?'"
              value={divergencePoint}
              onChange={(e) => setDivergencePoint(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={handleCreate} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Creating Universe...
              </>
            ) : (
              'Create Universe'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniverseCreator;
