import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const COWRITER_COST = 2;
export const STYLE_TRANSFER_COST = 8;
export const VOICE_TO_SCRIPT_COST = 10;
export const ROOM_AI_COST = 4;

/** Supabase hides the edge-function body inside FunctionsHttpError — read it for a real message. */
const invokeCreative = async (fn: string, body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    const res = (error as any)?.context;
    let payload: any = null;
    let status: number | undefined;
    if (res && typeof res.json === "function") {
      status = res.status;
      try { payload = await res.clone().json(); } catch { payload = null; }
    }
    const msg = payload?.error || payload?.message;
    if (status === 402 || /insufficient credits/i.test(msg || "")) {
      throw new Error(msg && !/insufficient credits/i.test(msg) ? msg : "Not enough Creative Forge credits.");
    }
    if (status === 429) throw new Error(msg || "AI is busy right now. Please try again in a few seconds.");
    if (status === 401 || status === 403) throw new Error("Please sign in again to use this tool.");
    if (status === 404) throw new Error("This AI tool is not available right now.");
    throw new Error(msg || (error as any)?.message || "AI request failed");
  }
  if (data?.error) throw new Error(data.error);
  return data;
};

export const useCreativeAITools = () => {
  const queryClient = useQueryClient();

  const styleTransfer = useMutation({
    mutationFn: async ({ text, targetStyle }: { text: string; targetStyle: string }) =>
      invokeCreative("creative-style-transfer", { text, targetStyle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast.success("Style transformation complete!");
    },
    onError: (e: Error) => toast.error(e.message || "Style transfer failed") });

  const voiceToScript = useMutation({
    mutationFn: async ({ transcript, category }: { transcript: string; category: string }) =>
      invokeCreative("creative-voice-to-script", { transcript, category }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast.success("Voice transcript turned into a draft!");
    },
    onError: (e: Error) => toast.error(e.message || "Voice-to-script failed") });

  const askRoomAI = useMutation({
    mutationFn: async ({ roomId, action, prompt }: { roomId: string; action: "moderate" | "suggest" | "chat"; prompt?: string }) =>
      invokeCreative("creative-room-ai", { roomId, action, prompt }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
      queryClient.invalidateQueries({ queryKey: ["room-messages", vars.roomId] });
      window.dispatchEvent(new Event("ai-credits-updated"));
    },
    onError: (e: Error) => toast.error(e.message || "AI moderator failed") });

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
    } });
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
    refetchInterval: 5000 });
};
