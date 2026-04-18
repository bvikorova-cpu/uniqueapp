import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SHADOW_AI_COSTS = {
  story: 4,
  narrator: 6,
  predictor: 5,
  avatar: 8,
};

export const useShadowArenaCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["shadow-arena-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.functions.invoke("shadow-arena-credits-init");
      if (error) throw error;
      return data?.credits || null;
    },
  });

  const buyCredits = useMutation({
    mutationFn: async (packageId: "starter" | "creator" | "pro") => {
      const { data, error } = await supabase.functions.invoke("shadow-credits-checkout", {
        body: { packageId },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      return data;
    },
    onError: (e: Error) => toast.error(e.message || "Checkout failed"),
  });

  return { credits, isLoading, buyCredits, refetch: () => queryClient.invalidateQueries({ queryKey: ["shadow-arena-credits"] }) };
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
    onSuccess: () => { invalidate(); toast.success("Horror story generated!"); },
    onError: (e: Error) => toast.error(e.message || "Story generation failed"),
  });

  const narrate = useMutation({
    mutationFn: async (vars: { text: string; voiceId?: string; voiceLabel?: string; storyId?: string | null }) => {
      const { data, error } = await supabase.functions.invoke("shadow-ai-narrator", { body: vars });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Narration ready!"); },
    onError: (e: Error) => toast.error(e.message || "Narration failed"),
  });

  const predictBattle = useMutation({
    mutationFn: async (vars: { battleId: string }) => {
      const { data, error } = await supabase.functions.invoke("shadow-battle-predictor", { body: vars });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Prediction ready!"); },
    onError: (e: Error) => toast.error(e.message || "Prediction failed"),
  });

  const generateAvatar = useMutation({
    mutationFn: async (vars: { sourceImageUrl: string; style: string }) => {
      const { data, error } = await supabase.functions.invoke("shadow-nightmare-avatar", { body: vars });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Nightmare avatar ready!"); },
    onError: (e: Error) => toast.error(e.message || "Avatar generation failed"),
  });

  return { generateStory, narrate, predictBattle, generateAvatar };
};
