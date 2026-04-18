import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCurseWheel = () => {
  const qc = useQueryClient();
  const { data: lastSpin } = useQuery({
    queryKey: ["curse-wheel-last"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const today = new Date(); today.setUTCHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("shadow_curse_wheel_spins")
        .select("*")
        .eq("user_id", user.id)
        .gte("spun_at", today.toISOString())
        .order("spun_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const spin = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("shadow-curse-wheel-spin");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.prize?.label || "Spin complete");
      qc.invalidateQueries({ queryKey: ["curse-wheel-last"] });
      qc.invalidateQueries({ queryKey: ["shadow-arena-credits"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { lastSpin, spin, hasSpunToday: !!lastSpin };
};

export const useBattleReactions = (battleId: string | undefined) => {
  const qc = useQueryClient();
  const { data: reactions } = useQuery({
    queryKey: ["battle-reactions", battleId],
    queryFn: async () => {
      if (!battleId) return [];
      const { data } = await supabase
        .from("shadow_battle_reactions")
        .select("emoji")
        .eq("battle_id", battleId);
      return data || [];
    },
    enabled: !!battleId,
    refetchInterval: 3000,
  });

  const send = useMutation({
    mutationFn: async (emoji: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !battleId) throw new Error("Not authenticated");
      const { error } = await supabase.from("shadow_battle_reactions").insert({
        battle_id: battleId, user_id: user.id, emoji,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["battle-reactions", battleId] }),
  });

  const counts = (reactions || []).reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return { counts, send, total: reactions?.length || 0 };
};

export const useStoryChains = () => {
  const qc = useQueryClient();
  const { data: chains, isLoading } = useQuery({
    queryKey: ["story-chains"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shadow_story_chains")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const createChain = useMutation({
    mutationFn: async (vars: { title: string; theme: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { data, error } = await supabase.from("shadow_story_chains").insert({
        title: vars.title, theme: vars.theme, starter_user_id: user.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["story-chains"] }); toast.success("Chain started!"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addSegment = useMutation({
    mutationFn: async (vars: { chainId: string; content: string; order: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { error } = await supabase.from("shadow_story_chain_segments").insert({
        chain_id: vars.chainId, user_id: user.id, content: vars.content, segment_order: vars.order,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["story-chains"] }); toast.success("Segment added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { chains, isLoading, createChain, addSegment };
};

export const useVoiceClone = () => {
  const qc = useQueryClient();
  const { data: clone } = useQuery({
    queryKey: ["voice-clone"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("shadow_voice_clones").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });

  const cloneVoice = useMutation({
    mutationFn: async (vars: { audioBase64: string; voiceName: string }) => {
      const { data, error } = await supabase.functions.invoke("shadow-voice-clone", { body: vars });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-clone"] });
      qc.invalidateQueries({ queryKey: ["shadow-arena-credits"] });
      toast.success("Your voice has been cloned!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { clone, cloneVoice };
};

export const useCursedAchievements = (userId?: string) => {
  return useQuery({
    queryKey: ["cursed-achievements", userId],
    queryFn: async () => {
      const target = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!target) return [];
      const { data } = await supabase.from("shadow_cursed_achievements").select("*").eq("user_id", target).order("unlocked_at", { ascending: false });
      return data || [];
    },
  });
};

export const useHorrorReels = () => {
  const qc = useQueryClient();
  const { data: reels, isLoading } = useQuery({
    queryKey: ["horror-reels"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shadow_horror_reels")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const generate = useMutation({
    mutationFn: async (vars: { prompt: string; storyId?: string; title?: string }) => {
      const { data, error } = await supabase.functions.invoke("shadow-horror-reel", { body: vars });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horror-reels"] });
      qc.invalidateQueries({ queryKey: ["shadow-arena-credits"] });
      toast.success("Horror reel generated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { reels, isLoading, generate };
};

export const usePushNotifications = () => {
  const qc = useQueryClient();
  const { data: subscription } = useQuery({
    queryKey: ["push-sub"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("shadow_push_subscriptions").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });

  const subscribe = useMutation({
    mutationFn: async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push notifications not supported");
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") throw new Error("Permission denied");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");

      // Register a minimal endpoint placeholder (full VAPID push handshake requires worker registration)
      const { error } = await supabase.from("shadow_push_subscriptions").upsert({
        user_id: user.id,
        endpoint: `local://${user.id}`,
        p256dh_key: "browser-managed",
        auth_key: "browser-managed",
        enabled_categories: ["battles", "wins", "patron"],
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["push-sub"] }); toast.success("Spooky alerts enabled 👻"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { subscription, subscribe, enabled: !!subscription };
};

export const usePatronCheckout = () => {
  return useMutation({
    mutationFn: async (vars: { authorUserId: string; tier: "bronze" | "silver" | "gold" }) => {
      const { data, error } = await supabase.functions.invoke("shadow-patron-checkout", { body: vars });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.location.href = data.url;
      return data;
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
