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
  { id: "price_1ScY0zGaXSfGtYFtoe91oxmX",
    credits: 10,
    price: 5,
    label: "Starter" },
  { id: "price_1ScY10GaXSfGtYFt3F1cPJaE",
    credits: 30,
    price: 12,
    label: "Popular",
    popular: true },
  { id: "price_1ScY12GaXSfGtYFt3zw96KfT",
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

  const purchaseCredits = useMutation({
    mutationFn: async (priceId: string) => {
      const { data, error } = await supabase.functions.invoke("tutoring-purchase-credits", {
        body: { priceId } });

      if (error) throw error;
      if (data?.url) {
        // Same-tab redirect so the user returns with ?session_id=... and credits activate.
        { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } }
      }
    },
    onError: (error) => {
      console.error("Purchase error:", error);
      toast.error("Failed to start purchase");
    } });

  // Activates credits after Stripe redirect. Server verifies the session and
  // resolves the credit amount from the Stripe price id (client value ignored).
  const activatePurchase = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.functions.invoke("tutoring-add-credits", {
        body: { session_id: sessionId } });
      if (error) throw error;
      return data as { success: boolean; credits?: number; alreadyCredited?: boolean };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tutoring-credits"] });
      if (!data?.alreadyCredited && data?.credits) {
        toast.success(`${data.credits} credits added!`);
      }
    },
    onError: (error) => {
      console.error("Activate purchase error:", error);
      toast.error("Could not activate purchase. Contact support.");
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
