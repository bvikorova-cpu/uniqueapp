import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PrivacySettings {
  id: string;
  user_id: string;
  profile_visibility: string;
  post_visibility: string;
  who_can_message: string;
  who_can_comment: string;
  who_can_tag: string;
  show_online_status: boolean;
  show_activity: boolean;
  show_birthday: boolean;
  show_friends_list: boolean;
}

export const usePrivacySettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["privacy-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("privacy_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      // Create default settings if none exist
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("privacy_settings")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        return newSettings;
      }

      return data;
    } });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<PrivacySettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("privacy_settings")
        .update({ ...updates,
          updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-settings"] });
      toast({ title: "Privacy settings updated!" });
    } });

  return { settings,
    isLoading,
    updateSettings: updateSettings.mutate };
};
