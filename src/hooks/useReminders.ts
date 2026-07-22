import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useReminders = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["post-reminders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("post_reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_sent", false)
        .order("remind_at", { ascending: true });

      if (error) throw error;
      return data;
    } });

  const setReminder = useMutation({ mutationFn: async ({
      postId,
      remindAt,
      reminderType }: {
      postId: string;
      remindAt: Date;
      reminderType?: "view" | "reply" | "share";
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("post_reminders").insert({ post_id: postId,
        user_id: user.id,
        remind_at: remindAt.toISOString(),
        reminder_type: reminderType || "view" });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Reminder set!" });
      queryClient.invalidateQueries({ queryKey: ["post-reminders"] });
    },
    onError: () => {
      toast({ title: "Failed to set reminder", variant: "destructive" });
    } });

  const deleteReminder = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from("post_reminders")
        .delete()
        .eq("id", reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Reminder deleted" });
      queryClient.invalidateQueries({ queryKey: ["post-reminders"] });
    } });

  return { reminders,
    isLoading,
    setReminder: setReminder.mutate,
    deleteReminder: deleteReminder.mutate };
};
