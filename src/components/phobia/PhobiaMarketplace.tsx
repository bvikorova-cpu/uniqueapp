import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, TrendingUp, Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PhobiaMarketplaceProps {
  onOpenPricing?: () => void;
}

const PhobiaMarketplace = ({ onOpenPricing }: PhobiaMarketplaceProps) => {
  const [trades, setTrades] = useState<any[]>([]);
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

      const { data, error } = await supabase.rpc('has_phobia_access', {
        user_id_param: session.user.id,
        service_type_param: 'fear_marketplace'
      });

      if (!error) {
        setHasAccess(data);
        if (data) {
          loadMarketplace();
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const loadMarketplace = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('trade-phobia', {
        body: { action: 'get_marketplace' }
      });

      if (error) throw error;

      setTrades(data.trades || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleBuy = async (tradeId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to trade phobias",
          variant: "destructive",
        });
        return;
      }

      const { chargePhobiaAction } = await import("@/lib/moduleCreditActions");
      const charge = await chargePhobiaAction("place-trade", { metadata: { tradeId, side: "buy" } });
      if (!charge.ok) return;

      const { error } = await supabase.functions.invoke('trade-phobia', {
        body: { action: 'buy', tradeId }
      });

      if (error) throw error;

      toast({
        title: "Purchase Successful",
        description: "Phobia has been transferred to your collection",
      });

      loadMarketplace();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Purchase Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (checkingAccess) {
    return (
    <>
      <FloatingHowItWorks title={"Phobia Marketplace - How it works"} steps={[{ title: 'Open', desc: 'Access the Phobia Marketplace section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Phobia Marketplace.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    </>
  );
  }

  if (!hasAccess) {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-background">
        <CardContent className="py-12 text-center space-y-4">
          <ShoppingCart className="w-16 h-16 text-yellow-400 mx-auto" />
          <h3 className="text-xl font-semibold text-foreground">Access Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You need to purchase "Fear Marketplace" to buy and sell phobias.
          </p>
          <Button 
            onClick={onOpenPricing}
            className="bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            View Pricing Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ShoppingCart className="w-6 h-6 text-cyan-400" />
            Fear Marketplace
          </CardTitle>
          <CardDescription>
            Browse and acquire phobias from the global community
          </CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : trades.length === 0 ? (
        <Card className="border-muted">
          <CardContent className="py-12 text-center text-muted-foreground">
            No phobias currently listed for trade
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trades.map((trade) => (
            <Card key={trade.id} className="border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-400">
                  {trade.user_phobias.phobia_name}
                </CardTitle>
                <CardDescription>
                  {trade.user_phobias.phobia_type}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {trade.user_phobias.description}
                  </p>
                  <p className="text-sm font-medium">
                    Severity: {trade.user_phobias.severity}/10
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-lg font-bold text-cyan-400">
                      €{trade.price}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBuy(trade.id)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500"
                  >
                    Acquire
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhobiaMarketplace;
