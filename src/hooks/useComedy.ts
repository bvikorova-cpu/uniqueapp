import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useComedyCurrency = () => {
  const { data: currency, isLoading, refetch } = useQuery({
    queryKey: ["comedy-currency"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("comedy_currency")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("comedy_currency")
          .insert({ user_id: user.id, coins: 100 })
          .select()
          .single();
        if (insertError) throw insertError;
        return newData;
      }
      return data;
    },
  });

  return { currency, isLoading, refetch };
};

export const useComedyShows = () => {
  const { data: shows, isLoading } = useQuery({
    queryKey: ["comedy-shows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comedy_shows")
        .select(`
          *,
          comedian:comedian_profiles(
            stage_name,
            avatar_url,
            follower_count,
            is_verified
          )
        `)
        .in("status", ["scheduled", "live"])
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  return { shows, isLoading };
};

export const useBuyTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ showId, price }: { showId: string; price: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Atomic spend (server-side balance check, race-safe)
      const { error: spendErr } = await supabase.rpc("spend_comedy_coins", { _amount: price });
      if (spendErr) {
        if (/insufficient/i.test(spendErr.message)) throw new Error("Insufficient coins");
        throw spendErr;
      }

      const { data, error } = await supabase
        .from("comedy_tickets")
        .insert({ show_id: showId, user_id: user.id, price_paid: price })
        .select()
        .single();

      if (error) {
        // Refund on failure
        await supabase.rpc("add_comedy_coins", { _user_id: user.id, _amount: price, _purchased: false });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comedy-currency"] });
      queryClient.invalidateQueries({ queryKey: ["user-tickets"] });
      toast.success("Ticket purchased! Enjoy the show!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useComedyBattles = () => {
  const { data: battles, isLoading, refetch } = useQuery({
    queryKey: ["comedy-battles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comedy_battles")
        .select(`
          *,
          battle_participants(
            id,
            comedian:comedian_profiles(stage_name, avatar_url),
            vote_count,
            placement
          )
        `)
        .in("status", ["registration", "live", "voting"])
        .order("starts_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return { battles, isLoading, refetch };
};

export const useSendTip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      comedianId,
      amount,
      tipType,
      showId,
      message,
    }: {
      comedianId: string;
      amount: number;
      tipType: string;
      showId?: string;
      message?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-comedy-tip", {
        body: { comedianId, amount, tipType, showId, message },
      });
      if (error) {
        const status = (error as any)?.context?.status;
        if (status === 402) throw new Error("Insufficient coins");
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comedy-currency"] });
      toast.success("Tip sent! The comedian will appreciate it!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUserTickets = () => {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["user-tickets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("comedy_tickets")
        .select(`
          *,
          show:comedy_shows(
            *,
            comedian:comedian_profiles(stage_name, avatar_url)
          )
        `)
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return { tickets, isLoading };
};

export const useComedianProfile = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["comedian-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("comedian_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return { profile, isLoading };
};

export const useCreateComedianProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stageName, bio }: { stageName: string; bio?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("comedian_profiles")
        .insert({
          user_id: user.id,
          stage_name: stageName,
          bio,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comedian-profile"] });
      toast.success("Comedian profile created!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useComedianEarnings = () => {
  const { data: earnings, isLoading } = useQuery({
    queryKey: ["comedian-earnings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("comedian_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("comedian_earnings")
        .select("*")
        .eq("comedian_id", profile.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return { earnings, isLoading };
};

export const useComedianShows = () => {
  const { data: shows, isLoading } = useQuery({
    queryKey: ["comedian-shows"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("comedian_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("comedy_shows")
        .select("*")
        .eq("comedian_id", profile.id)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return { shows, isLoading };
};

export const useComedyClips = () => {
  const { data: clips, isLoading } = useQuery({
    queryKey: ["comedy-clips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comedy_clips")
        .select("*");

      if (error) throw error;
      return data || [];
    },
  });

  return { clips, isLoading };
};

export const useBuyClip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clipId, price }: { clipId: string; price: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: currency } = await supabase
        .from("comedy_currency")
        .select("coins")
        .eq("user_id", user.id)
        .single();

      if (!currency || currency.coins < price) {
        throw new Error("Insufficient coins");
      }

      const { data, error } = await supabase
        .from("clip_purchases")
        .insert({
          clip_id: clipId,
          user_id: user.id,
          price_paid: price,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("comedy_currency")
        .update({ coins: currency.coins - price })
        .eq("user_id", user.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comedy-currency"] });
      toast.success("Clip purchased! Enjoy watching!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
