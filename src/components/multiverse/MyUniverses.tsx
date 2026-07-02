import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Loader2, TrendingUp, Shuffle, Zap, AlertCircle, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MyUniverses = () => {
  const [universes, setUniverses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUniverse, setSelectedUniverse] = useState<any>(null);
  const [jumping, setJumping] = useState(false);
  const [hasJumpAccess, setHasJumpAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUniverses();
    checkJumpAccess();
  }, []);

  const checkJumpAccess = async () => {
    try {
      setCheckingAccess(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.rpc('has_multiverse_access', {
        user_id_param: session.user.id,
        service_type_param: 'reality_jumping'
      });

      if (!error) {
        setHasJumpAccess(data);
      }
    } catch (error) {
      console.error('Error checking jump access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const loadUniverses = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('get-user-universes');

      if (error) throw error;

      setUniverses(data.universes || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseJump = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-multiverse-checkout', {
        body: { serviceType: 'reality_jumping' }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Opening Checkout",
          description: "Complete your purchase to unlock Reality Jumping",
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

  const handleJump = async (universe: any) => {
    if (!hasJumpAccess) {
      toast({
        title: "Subscription Required",
        description: "Reality Jumping requires an active subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      setJumping(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('reality-jump', {
        body: {
          action: 'jump',
          toUniverseId: universe.id,
          jumpReason: `Jumping to ${universe.universe_name}`
        }
      });

      if (error) throw error;

      toast({
        title: "Reality Jump Successful! 🌌",
        description: `You've jumped to ${universe.universe_name}`,
      });

      setSelectedUniverse(universe);
    } catch (error) {
      console.error('Error jumping:', error);
      toast({
        title: "Jump Failed",
        description: error instanceof Error ? error.message : "Could not complete reality jump",
        variant: "destructive",
      });
    } finally {
      setJumping(false);
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='My Universes'
          steps={[
          { title: 'Open the tool', desc: 'Launch the My Universes panel from this page.' },
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

  if (universes.length === 0) {
    return (
      <Card className="border-muted">
        <CardContent className="py-12 text-center text-muted-foreground">
          No universes created yet. Start by creating your first parallel universe!
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
            My Parallel Universes
          </CardTitle>
          <CardDescription>
            Explore your alternate realities and parallel timelines
          </CardDescription>
        </CardHeader>
      </Card>

      {!hasJumpAccess && !checkingAccess && universes.length > 0 && (
        <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-background">
          <CardContent className="py-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Reality Jumping Locked</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Subscribe to Reality Jumping (€59/month) to jump between your parallel universes.
                </p>
                <Button 
                  onClick={handlePurchaseJump}
                  size="sm"
                  className="bg-gradient-to-r from-violet-500 to-purple-500"
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  Subscribe to Reality Jumping - €59/month
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {universes.map((universe) => (
          <Card key={universe.id} className="border-violet-500/20 hover:border-violet-500/40 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-violet-400">
                  {universe.universe_name}
                </CardTitle>
                <Badge variant="secondary" className="bg-violet-500/20 text-violet-300">
                  {universe.success_score}/100
                </Badge>
              </div>
              <CardDescription className="text-sm">
                Diverged at: {universe.divergence_point}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {universe.universe_description}
              </p>

              {universe.parameters?.majorDifferences && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-violet-400">Key Differences:</p>
                  <div className="flex flex-wrap gap-1">
                    {universe.parameters.majorDifferences.slice(0, 3).map((diff: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <span>Success: {universe.success_score}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className={hasJumpAccess ? "border-violet-500/30" : "border-yellow-500/30"}
                  onClick={() => hasJumpAccess ? handleJump(universe) : handlePurchaseJump()}
                  disabled={jumping || checkingAccess}
                >
                  {jumping ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : hasJumpAccess ? (
                    <Shuffle className="w-4 h-4 mr-1" />
                  ) : (
                    <Crown className="w-4 h-4 mr-1 text-yellow-400" />
                  )}
                  {hasJumpAccess ? 'Jump' : 'Subscribe'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedUniverse} onOpenChange={() => setSelectedUniverse(null)}>
        <DialogContent className="border-violet-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-400">
              <Zap className="w-5 h-5" />
              Reality Jump Complete
            </DialogTitle>
            <DialogDescription>
              You are now in: {selectedUniverse?.universe_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedUniverse?.universe_description}
            </p>
            <div className="flex items-center justify-between pt-4">
              <Badge variant="secondary" className="bg-violet-500/20 text-violet-300">
                Success Score: {selectedUniverse?.success_score}/100
              </Badge>
              <Button onClick={() => setSelectedUniverse(null)}>
                Explore Universe
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyUniverses;
