import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PhobiaStatus {
  subscribed: boolean;
  subscription_end: string | null;
  credits_remaining: number;
  total_credits_purchased: number;
}

export function usePhobiaCredits() {
  const { toast } = useToast();
  const [status, setStatus] = useState<PhobiaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }

      const { data, error } = await supabase.functions.invoke("check-phobia-subscription");
      if (error) throw error;
      setStatus(data);
    } catch (err) {
      console.error("Error checking phobia status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseCredits = async (credits: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in", variant: "destructive" }); return; }

      const { data, error } = await supabase.functions.invoke("purchase-phobia-credits", {
        body: { credits } });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const purchaseSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in", variant: "destructive" }); return; }

      const { data, error } = await supabase.functions.invoke("create-phobia-subscription");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return { status, isLoading, purchaseCredits, purchaseSubscription, refresh: checkStatus };
}
