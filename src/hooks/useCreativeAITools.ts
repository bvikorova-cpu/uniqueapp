import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const COWRITER_COST = 2;
export const STYLE_TRANSFER_COST = 8;
export const VOICE_TO_SCRIPT_COST = 10;
export const ROOM_AI_COST = 4;

export const useCreativeAITools = () => {
  const queryClient = useQueryClient();

  const styleTransfer = useMutation({
    mutationFn: async ({ text, targetStyle }: { text: string; targetStyle: string }) => {
      const { data, error } = await supabase.functions.invoke("creative-style-transfer", {
        body: { text, targetStyle },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
      toast.success("Style transformation complete!");
    },
    onError: (e: Error) => toast.error(e.message || "Style transfer failed"),
  });

  const voiceToScript = useMutation({
    mutationFn: async ({ transcript, category }: { transcript: string; category: string }) => {
      const { data, error } = await supabase.functions.invoke("creative-voice-to-script", {
        body: { transcript, category },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
      toast.success("Voice transcript turned into a draft!");
    },
    onError: (e: Error) => toast.error(e.message || "Voice-to-script failed"),
  });

  const askRoomAI = useMutation({
    mutationFn: async ({ roomId, action, prompt }: { roomId: string; action: "moderate" | "suggest" | "chat"; prompt?: string }) => {
      const { data, error } = await supabase.functions.invoke("creative-room-ai", {
        body: { roomId, action, prompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
      queryClient.invalidateQueries({ queryKey: ["room-messages", vars.roomId] });
    },
    onError: (e: Error) => toast.error(e.message || "AI moderator failed"),
  });

  return { styleTransfer, voiceToScript, askRoomAI };
};

export const useCreativeRooms = () => {
  return useQuery({
    queryKey: ["creative-rooms"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("creative_forge_rooms")
        .select("*")
        .or(`owner_id.eq.${user.id},is_public.eq.true`)
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
};

export const useRoomMessages = (roomId: string | null) => {
  return useQuery({
    queryKey: ["room-messages", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("creative_forge_room_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!roomId,
    refetchInterval: 5000,
  });
};
