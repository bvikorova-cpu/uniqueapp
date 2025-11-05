import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DecorSubscription {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  designs_used: number;
  designs_limit: number;
  loading: boolean;
}

export function useDecorSubscription() {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<DecorSubscription>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
    designs_used: 0,
    designs_limit: 0,
    loading: true,
  });

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscription({
          subscribed: false,
          product_id: null,
          subscription_end: null,
          designs_used: 0,
          designs_limit: 0,
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-decor-subscription");

      if (error) {
        console.error("Subscription check error:", error);
        setSubscription((prev) => ({ ...prev, loading: false }));
        return;
      }

      setSubscription({
        subscribed: data.subscribed || false,
        product_id: data.product_id || null,
        subscription_end: data.subscription_end || null,
        designs_used: data.designs_used || 0,
        designs_limit: data.designs_limit || 0,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscription((prev) => ({ ...prev, loading: false }));
    }
  };

  const subscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-decor-subscription");

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast({
          title: "Redirecting to Checkout",
          description: "Complete your subscription to unlock AI design features.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    }
  };

  const generateDesign = async (style: string, roomDescription?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-room-design", {
        body: { style, roomDescription },
      });

      if (error) {
        if (error.message.includes("subscription required")) {
          toast({
            title: "Subscription Required",
            description: "Please subscribe to Pro Designer to generate AI designs.",
            variant: "destructive",
          });
          return null;
        }
        if (error.message.includes("limit reached")) {
          toast({
            title: "Design Limit Reached",
            description: "You've used all your designs for this month. Upgrade or wait for next period.",
            variant: "destructive",
          });
          return null;
        }
        throw error;
      }

      // Refresh subscription to update designs_used count
      await checkSubscription();

      return data;
    } catch (error: any) {
      toast({
        title: "Design Generation Error",
        description: error.message || "Failed to generate design",
        variant: "destructive",
      });
      return null;
    }
  };

  const purchaseARPreview = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-ar-preview-payment", {
        body: { productId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast({
          title: "Redirecting to Checkout",
          description: "Complete payment to unlock AR preview for this item.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create AR preview payment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();

    // Auto-refresh subscription every minute
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    subscription,
    checkSubscription,
    subscribe,
    generateDesign,
    purchaseARPreview,
  };
}
