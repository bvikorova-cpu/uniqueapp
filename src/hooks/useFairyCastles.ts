import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDisneyCastles = () => {
  const { data: castles, isLoading } = useQuery({
    queryKey: ["disney-castles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fairy_castles")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  return { castles, isLoading };
};

export const useCastleRooms = (castleId: string) => {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["castle-rooms", castleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fairy_castle_rooms")
        .select("*")
        .eq("castle_id", castleId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!castleId,
  });

  return { rooms, isLoading };
};

export const useUserVisits = () => {
  const { data: visits, isLoading } = useQuery({
    queryKey: ["user-castle-visits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_castle_visits")
        .select("*, castle:fairy_castles(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  return { visits, isLoading };
};

export const useUserStamps = () => {
  const { data: stamps, isLoading } = useQuery({
    queryKey: ["user-castle-stamps"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_castle_stamps")
        .select("*, castle:fairy_castles(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  return { stamps, isLoading };
};

export const useStartTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ castleId, price }: { castleId: string; price: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to start tour");

      // Check if already visited
      const { data: existing } = await supabase
        .from("user_castle_visits")
        .select("*")
        .eq("user_id", user.id)
        .eq("castle_id", castleId)
        .single();

      if (existing) {
        return existing;
      }

      // Check coins balance (assuming kids channel has coins system)
      // You'll need to implement this based on your existing system

      // Record visit
      const { data, error } = await supabase
        .from("user_castle_visits")
        .insert({
          user_id: user.id,
          castle_id: castleId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-castle-visits"] });
      toast.success("Tour started! Enjoy your magical journey!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCompleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, roomId }: { visitId: string; roomId: string }) => {
      const { data: visit } = await supabase
        .from("user_castle_visits")
        .select("rooms_visited")
        .eq("id", visitId)
        .single();

      const roomsVisited = visit?.rooms_visited || [];
      if (!roomsVisited.includes(roomId)) {
        roomsVisited.push(roomId);
      }

      const { data, error } = await supabase
        .from("user_castle_visits")
        .update({ rooms_visited: roomsVisited })
        .eq("id", visitId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-castle-visits"] });
    },
  });
};

export const useEarnStamp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ castleId }: { castleId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_castle_stamps")
        .insert({
          user_id: user.id,
          castle_id: castleId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-castle-stamps"] });
      toast.success("🏆 New stamp earned! You're a true Disney Explorer!");
    },
  });
};
