import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reportPost = useMutation({
    mutationFn: async ({
      postId,
      reportType,
      reason,
    }: {
      postId: string;
      reportType: string;
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("user_reports").insert({
        reporter_id: user.id,
        reported_post_id: postId,
        report_type: reportType,
        reason,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Report submitted. We'll review it shortly." });
    },
  });

  const reportUser = useMutation({
    mutationFn: async ({
      userId,
      reportType,
      reason,
    }: {
      userId: string;
      reportType: string;
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("user_reports").insert({
        reporter_id: user.id,
        reported_user_id: userId,
        report_type: reportType,
        reason,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Report submitted. We'll review it shortly." });
    },
  });

  return {
    reportPost: reportPost.mutate,
    reportUser: reportUser.mutate,
    isReporting: reportPost.isPending || reportUser.isPending,
  };
};
