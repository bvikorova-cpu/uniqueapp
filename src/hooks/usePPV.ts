import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PPVPost {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  preview_url: string | null;
  content_url: string;
  content_type: string;
  price_cents: number;
  currency: string;
  is_active: boolean;
  total_unlocks: number;
}

/** Buy a PPV post — redirects to Stripe Checkout. */
export function usePPVCheckout() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const buy = useCallback(async (postId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ppv-checkout", {
        body: { postId },
      });
      if (error) throw error;
      if (data?.alreadyUnlocked) {
        toast({ title: "Already unlocked", description: "You already own this post." });
        return;
      }
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { buy, loading };
}

/** Check if the current user has unlocked a PPV post. */
export function usePPVUnlockStatus(postId: string | null | undefined) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setUnlocked(false); return; }
      const { data } = await supabase
        .from("influking_ppv_unlocks")
        .select("id")
        .eq("post_id", postId)
        .eq("buyer_id", user.id)
        .eq("status", "completed")
        .maybeSingle();
      if (!cancelled) setUnlocked(!!data);
    })();
    return () => { cancelled = true; };
  }, [postId]);

  return unlocked;
}
