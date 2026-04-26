import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserCertificates = () => {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ["user-certificates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_castle_certificates")
        .select("*, castle:fairy_castles(*)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return { certificates, isLoading };
};

export const useSaveCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      castleId,
      completionTimeMs,
      unlockedMilestones,
      totalRooms,
    }: {
      castleId: string;
      completionTimeMs: number;
      unlockedMilestones: number[];
      totalRooms: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_castle_certificates")
        .insert({
          user_id: user.id,
          castle_id: castleId,
          completion_time_ms: completionTimeMs,
          unlocked_milestones: unlockedMilestones,
          total_rooms: totalRooms,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-certificates"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to save certificate: " + error.message);
    },
  });
};

export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (certificateId: string) => {
      const { error } = await supabase
        .from("user_castle_certificates")
        .delete()
        .eq("id", certificateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-certificates"] });
      toast.success("Certificate deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete certificate: " + error.message);
    },
  });
};
