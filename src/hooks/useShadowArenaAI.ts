import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";

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
    mutationFn: async (vars: { prompt: string; tone?: string; length?: string; generateImage?: boolean }) =>
      shadowArenaCall("ai_story_generate", vars),
    onSuccess: () => { invalidate(); toast.success("Story ready!"); },
    onError: (e: Error) => toast.error(e.message || "Story generation failed") });

  const narrate = useMutation({
    mutationFn: async (vars: { text: string; voiceId?: string; voiceLabel?: string; storyId?: string | null }) =>
      shadowArenaCall("ai_narrate", vars),
    onSuccess: () => { invalidate(); toast.success("Narration ready!"); },
    onError: (e: Error) => toast.error(e.message || "Narration failed") });

  const predictBattle = useMutation({
    mutationFn: async (vars: { battleId: string }) =>
      shadowArenaCall("battle_predict", vars),
    onSuccess: () => { invalidate(); toast.success("Prediction ready!"); },
    onError: (e: Error) => toast.error(e.message || "Prediction failed") });

  const generateAvatar = useMutation({
    mutationFn: async (vars: { sourceImageUrl: string; style: string }) =>
      shadowArenaCall("nightmare_avatar", vars),
    onSuccess: () => { invalidate(); toast.success("Nightmare avatar ready!"); },
    onError: (e: Error) => toast.error(e.message || "Avatar generation failed") });

  return { generateStory, narrate, predictBattle, generateAvatar };
};
