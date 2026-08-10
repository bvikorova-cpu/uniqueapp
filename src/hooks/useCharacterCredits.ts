import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Character Arena runs entirely on the unified platform AI credits pool
 * (`public.ai_credits`). There is no separate arena currency and nothing
 * is bought with EUR inside the arena — users top up AI credits in the
 * AI Credits store and spend them here.
 */
export const CREDIT_COSTS = { basic_character: 5,
  premium_character: 15,
  quick_battle: 2,
  tournament_entry: 5,
  popularity_vote: 1,
  character_fusion: 30,
  equipment: 10,
  training: 10 } as const;

export type CharacterServiceType = keyof typeof CREDIT_COSTS;

export const useCharacterCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading, refetch } = useQuery({
    queryKey: ["character-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("ai_credits")
        .select("credits_remaining, total_credits_purchased")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data ?? { credits_remaining: 0, total_credits_purchased: 0 };
    } });

  /** Spends AI credits for an arena action handled purely on the client. */
  const spendCredits = async (amount: number, description: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to continue");
      return false;
    }
    const { data: row } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const remaining = row?.credits_remaining ?? 0;
    if (remaining < amount) {
      toast.error(`Not enough AI credits — you need ${amount}, you have ${remaining}.`);
      return false;
    }
    const { error } = await supabase
      .from("ai_credits")
      .update({ credits_remaining: remaining - amount, last_used_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("credits_remaining", remaining);
    if (error) {
      toast.error("Could not deduct credits, please try again");
      return false;
    }
    await supabase.from("ai_usage_history").insert({ user_id: user.id,
      usage_type: "custom_generation",
      credits_used: amount,
      description });
    queryClient.invalidateQueries({ queryKey: ["character-credits"] });
    window.dispatchEvent(new Event("ai-credits-updated"));
    return true;
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["character-credits"] });
    refetch();
  };

  return { credits, isLoading, spendCredits, refresh, costs: CREDIT_COSTS };
};
