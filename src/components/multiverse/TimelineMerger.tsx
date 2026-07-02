import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Layers, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const TimelineMerger = () => {
  const [universes, setUniverses] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
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
        service_type_param: 'timeline_merging'
      });

      if (!error) {
        setHasAccess(data);
        if (data) {
          loadUniverses();
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
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

  const handleMerge = async () => {
    if (selectedIds.length < 2) {
      toast({
        title: "Select More Universes",
        description: "You need at least 2 universes to merge",
        variant: "destructive",
      });
      return;
    }

    try {
      setMerging(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('merge-timelines', {
        body: { universeIds: selectedIds }
      });

      if (error) throw error;

      toast({
        title: "Timeline Merged",
        description: `Created optimized universe: ${data.mergedUniverse.universe_name}`,
      });

      setSelectedIds([]);
      loadUniverses();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Merge Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setMerging(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (checkingAccess) {
    return (
      <>
        <FloatingHowItWorks
          title='Timeline Merger'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Timeline Merger panel from this page.' },
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
        body: { serviceType: 'timeline_merging' }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Opening Checkout",
          description: "Complete your purchase to unlock Timeline Merging",
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
            Purchase "Timeline Merging" for €79 (one-time) to combine parallel universes.
          </p>
          <Button 
            onClick={handlePurchase}
            className="bg-gradient-to-r from-violet-500 to-purple-500"
          >
            <Layers className="mr-2 h-4 w-4" />
            Purchase Timeline Merging - €79
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
            <Layers className="w-6 h-6 text-violet-400" />
            Merge Timelines
          </CardTitle>
          <CardDescription>
            Combine multiple universes into one optimized reality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Select {2 - selectedIds.length} or more universes to merge
            </p>
            <Button
              onClick={handleMerge}
              disabled={selectedIds.length < 2 || merging}
              className="bg-gradient-to-r from-violet-500 to-purple-500"
            >
              {merging && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {merging ? 'Merging...' : `Merge (${selectedIds.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      ) : universes.length === 0 ? (
        <Card className="border-muted">
          <CardContent className="py-12 text-center text-muted-foreground">
            No universes available. Create some first!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {universes.map((universe) => (
            <Card
              key={universe.id}
              className={`border-violet-500/20 cursor-pointer transition-all ${
                selectedIds.includes(universe.id)
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'hover:border-violet-500/40'
              }`}
              onClick={() => toggleSelection(universe.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-violet-400 flex-1">
                    {universe.universe_name}
                  </CardTitle>
                  <Checkbox
                    checked={selectedIds.includes(universe.id)}
                    onCheckedChange={() => toggleSelection(universe.id)}
                  />
                </div>
                <CardDescription className="text-sm">
                  Success Score: {universe.success_score}/100
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {universe.universe_description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineMerger;
