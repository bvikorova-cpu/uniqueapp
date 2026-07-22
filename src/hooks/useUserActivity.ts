import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useUserActivity = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: activity, isLoading } = useQuery({
    queryKey: ["user-activity", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId });

  const updateStatus = useMutation({
    mutationFn: async ({ status, customStatus }: { status: string; customStatus?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("user_activity")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_activity")
          .update({ status,
            custom_status: customStatus,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString() })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_activity").insert({ user_id: user.id,
          status,
          custom_status: customStatus });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-activity"] });
    } });

  // Auto-update user as online when they're active
  useEffect(() => {
    const updateOnlineStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        updateStatus.mutate({ status: "online" });
      }
    };

    updateOnlineStatus();

    // Update every 5 minutes
    const interval = setInterval(updateOnlineStatus, 5 * 60 * 1000);

    // Update on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateOnlineStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const isOnline = () => {
    if (!activity) return false;
    return activity.status === "online" || activity.status === "away";
  };

  return { activity,
    isOnline: isOnline(),
    updateStatus: updateStatus.mutate,
    isLoading };
};
