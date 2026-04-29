import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CHAT_CREDITS_PER_MESSAGE = 1;

interface ChatCreditsState {
  credits_remaining: number;
  total_credits_purchased: number;
  loading: boolean;
}

/**
 * Paid-only Character Chat credits (1 credit per message).
 * Backed by `chat_credits` table + universal `create-checkout` router.
 */
export const useChatCredits = () => {
  const [state, setState] = useState<ChatCreditsState>({
    credits_remaining: 0,
    total_credits_purchased: 0,
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ credits_remaining: 0, total_credits_purchased: 0, loading: false });
        return;
      }

      const { data, error } = await supabase
        .from("chat_credits")
        .select("credits_remaining, total_credits_purchased")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setState({
          credits_remaining: data.credits_remaining ?? 0,
          total_credits_purchased: data.total_credits_purchased ?? 0,
          loading: false,
        });
      } else {
        // Lazy-create row (only readable by the user; insert here will fail under RLS,
        // so leave it to the edge function on first chat attempt).
        setState({ credits_remaining: 0, total_credits_purchased: 0, loading: false });
      }
    } catch (e) {
      console.error("Load chat credits error:", e);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const purchaseCredits = useCallback(async (credits: number): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to buy Chat credits.");
        return null;
      }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { credits, creditType: "chat" },
      });
      if (error) throw error;
      return data?.url || null;
    } catch (e: any) {
      console.error("Chat purchase error:", e);
      toast.error(e?.message || "Failed to start checkout");
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    canSendMessage: state.credits_remaining >= CHAT_CREDITS_PER_MESSAGE,
    refresh,
    purchaseCredits,
  };
};
