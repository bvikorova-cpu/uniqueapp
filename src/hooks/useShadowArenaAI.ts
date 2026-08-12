import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SHADOW_AI_COSTS = { story: 4,
  narrator: 6,
  predictor: 5,
  avatar: 8 };

export const useShadowArenaCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["shadow-arena-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      // Unified balance — read straight from ai_credits (RLS scoped to the user).
      const { data, error } = await supabase
        .from("ai_credits")
        .select("credits_remaining, total_credits_purchased")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? { credits_remaining: 0, total_credits_purchased: 0 };
    } });

  return { credits, isLoading, refetch: () => queryClient.invalidateQueries({ queryKey: ["shadow-arena-credits"] }) };
};

export const useShadowAITools = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["shadow-arena-credits"] });

  const generateStory = useMutation({
    mutationFn: async (vars: { prompt: string; tone?: string; length?: string; generateImage?: boolean }) => {
      const { data, error } = await supabase.functions.invoke("shadow-ai-story-generator", { body: vars });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Story ready!"); },
    onError: (e: Error) => toast.error(e.message || "Story generation failed") });

  const narrate = useMutation({
    mutationFn: async (vars: { text: string; voiceId?: string; voiceLabel?: string; storyId?: string | null }) => {
      const { data, error } = await supabase.functions.invoke("shadow-ai-narrator", { body: vars });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Narration ready!"); },
    onError: (e: Error) => toast.error(e.message || "Narration failed") });

  const predictBattle = useMutation({
    mutationFn: async (vars: { battleId: string }) => {
      const { data, error } = await supabase.functions.invoke("shadow-battle-predictor", { body: vars });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Prediction ready!"); },
    onError: (e: Error) => toast.error(e.message || "Prediction failed") });

  const generateAvatar = useMutation({
    mutationFn: async (vars: { sourceImageUrl: string; style: string }) => {
      const { data, error } = await supabase.functions.invoke("shadow-nightmare-avatar", { body: vars });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Nightmare avatar ready!"); },
    onError: (e: Error) => toast.error(e.message || "Avatar generation failed") });

  return { generateStory, narrate, predictBattle, generateAvatar };
};
