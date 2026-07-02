import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { useComedyCurrency } from "@/hooks/useComedy";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const ComedyCurrencyDisplay = () => {
  const { currency, isLoading, refetch } = useComedyCurrency();
  const { toast } = useToast();
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const sessionId = params.get("session_id");

    if (paymentStatus === "success" && sessionId) {
      handlePaymentSuccess(sessionId);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (paymentStatus === "canceled") {
      toast({
        title: "Payment Canceled",
        description: "Your coin purchase was canceled",
        variant: "destructive",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-comedy-payment", {
        body: { sessionId },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Coins Purchased!",
          description: `${data.coins} comedy coins added to your account`,
        });
        refetch();
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support if coins weren't added",
        variant: "destructive",
      });
    }
  };

  const handleBuyCoins = async (coins: number) => {
    setIsBuying(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-comedy-payment", {
        body: { coins },
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, "_blank");
      
      toast({
        title: "Opening Checkout",
        description: "Complete your purchase in the new tab",
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setIsBuying(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <FloatingHowItWorks title={"Comedy Currency Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Comedy Currency Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comedy Currency Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Coins className="h-10 w-10 text-yellow-500" />
          <div>
            <p className="text-sm text-muted-foreground">Comedy Coins</p>
            <p className="text-3xl font-bold">{currency?.coins || 0}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleBuyCoins(100)}
            disabled={isBuying}
          >
            {isBuying ? "Processing..." : "100 Coins - €5"}
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          💰 <strong>Earn coins:</strong> Perform shows, win battles, sell clips
          <br />
          🎭 <strong>Spend coins:</strong> Watch shows, vote in battles, send tips
        </p>
      </div>
    </Card>
    </>
  );
};
