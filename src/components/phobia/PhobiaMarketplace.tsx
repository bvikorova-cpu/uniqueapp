import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, TrendingUp, Loader2 } from "lucide-react";

const PhobiaMarketplace = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    loadMarketplace();
  }, []);

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
