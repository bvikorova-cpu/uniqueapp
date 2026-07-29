import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CREDIT_COSTS = { song_lyrics: 8,
  screenplay: 15,
  theater_play: 12,
  novel_chapter: 10,
  poetry: 5,
  standup: 8,
  podcast_script: 10,
  ad_copy: 6,
  revision: 3 } as const;

export type CreativeCategory = keyof typeof CREDIT_COSTS;

export const useCreativeForgeCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["creative-forge-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const [{ data: paidRow, error: paidError }, { data: freeRow, error: freeError }] = await Promise.all([
        supabase.from("ai_credits").select("credits_remaining, total_credits_purchased").eq("user_id", user.id).maybeSingle(),
        (supabase as any).from("free_tier_credits").select("balance").eq("user_id", user.id).maybeSingle(),
      ]);

      if (paidError) throw paidError;
      if (freeError) throw freeError;

      const paidCredits = paidRow?.credits_remaining || 0;
      const freeCredits = (freeRow as any)?.balance || 0;

      return {
        user_id: user.id,
        credits_remaining: paidCredits + freeCredits,
        free_credits_remaining: freeCredits,
        paid_credits_remaining: paidCredits,
        total_credits_purchased: paidRow?.total_credits_purchased || 0,
      };
    } });

  const purchaseCredits = async (creditAmount: number): Promise<string | null> => {
    try {
      // Universal credit-checkout router (Phase 3). Falls back to legacy
      // create-creative-forge-payment if router rejects the package.
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { credits: creditAmount, creditType: "creative_forge" } });

      if (error || !data?.url) {
        // Legacy fallback (kept for backward compatibility)
        const legacy = await supabase.functions.invoke("create-creative-forge-payment", {
          body: { credits: creditAmount } });
        if (legacy.error) throw legacy.error;
        return legacy.data?.url || null;
      }
      return data.url;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error creating payment session");
      return null;
    }
  };

  const verifyPayment = async (sessionId: string, credits: number) => {
    try {
      // Universal verify endpoint
      const { data, error } = await supabase.functions.invoke("verify-credits-payment", {
        body: { session_id: sessionId } });

      if (error) {
        // Fallback to legacy verifier
        const legacy = await supabase.functions.invoke("verify-creative-forge-payment", {
          body: { sessionId, credits } });
        if (legacy.error) throw legacy.error;
        queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
        queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
        queryClient.invalidateQueries({ queryKey: ["unified-credits"] });
        return legacy.data;
      }

      queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
      queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
      queryClient.invalidateQueries({ queryKey: ["unified-credits"] });
      return data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  };

  const refreshCredits = () => {
    queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
    queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
    queryClient.invalidateQueries({ queryKey: ["unified-credits"] });
  };

  return { credits,
    isLoading,
    purchaseCredits,
    verifyPayment,
    refreshCredits };
};
