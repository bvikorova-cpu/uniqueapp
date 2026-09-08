import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TutoringCredits {
  id: string;
  user_id: string;
  credits_remaining: number;
  total_credits_purchased: number;
  created_at: string;
  updated_at: string;
}

export const TUTORING_CREDIT_PACKAGES = [
  { id: "tutoring_starter",
    credits: 10,
    price: 5,
    label: "Starter" },
  { id: "tutoring_popular",
    credits: 30,
    price: 12,
    label: "Popular",
    popular: true },
  { id: "tutoring_best",
    credits: 100,
    price: 35,
    label: "Best Value",
    bestValue: true },
];

export const useTutoringCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["tutoring-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("ai_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data as TutoringCredits | null;
    } });

  // Atomic spend through the unified RPC so every deduction lands in ai_credits_ledger.
  const spendCredit = useMutation({
    mutationFn: async (amount: number = 1) => {
      const { data, error } = await (supabase as any).rpc("spend_ai_credits", {
        _amount: amount,
        _reason: "tutoring_ai",
        _source: "tutorial_platform" });
      if (error) throw error;
      if (!data?.ok) {
        throw new Error(data?.error === "insufficient" ? "Insufficient credits" : "Credit deduction failed");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutoring-credits"] });
      queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
      window.dispatchEvent(new Event("ai-credits-updated"));
    } });

  // Credits-only: tutoring uses the unified AI credits wallet, topped up at /ai-credits.
  const purchaseCredits = useMutation({
    mutationFn: async () => {
      window.location.href = "/ai-credits";
    } });

  // Credits-only: nothing to activate after a Stripe redirect anymore.
  const activatePurchase = useMutation({
    mutationFn: async (_sessionId: string) => {
      return { success: true } as { success: boolean; credits?: number; alreadyCredited?: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutoring-credits"] });
    } });


  // Refund previously-deducted credits (used when the AI call fails after deduction).
  const refundCredit = useMutation({
    mutationFn: async (args: string | { amount: number; reason: string }) => {
      const amount = typeof args === "string" ? 1 : args.amount;
      const reason = typeof args === "string" ? args : args.reason;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await (supabase as any).rpc("add_ai_credits", {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: `refund:${reason}`,
        p_source: "tutorial_platform" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutoring-credits"] });
      queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
      window.dispatchEvent(new Event("ai-credits-updated"));
    } });

  return { credits: credits?.credits_remaining ?? 0,
    totalPurchased: credits?.total_credits_purchased ?? 0,
    isLoading,
    spendCredit: spendCredit.mutateAsync,
    purchaseCredits: purchaseCredits.mutate,
    activatePurchase: activatePurchase.mutateAsync,
    refundCredit: refundCredit.mutateAsync,
    isUsingCredit: spendCredit.isPending };
};
