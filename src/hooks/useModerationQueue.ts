import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useModerationQueue = (communityId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["mod-queue", communityId],
    queryFn: async () => {
      let q = supabase.from("moderation_queue").select("*").order("created_at", { ascending: false }).limit(100);
      if (communityId) q = q.eq("community_id", communityId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const submitReport = useMutation({
    mutationFn: async (input: { content_type: string; content_id: string; community_id?: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("moderation_queue").insert({
        ...input,
        reporter_id: user?.id ?? null,
      });
      if (error) throw error;
      // fire AI triage in background
      try {
        await supabase.functions.invoke("triage-report", {
          body: { content_type: input.content_type, content_id: input.content_id, reason: input.reason },
        });
      } catch (e) {
        console.warn("triage failed", e);
      }
    },
    onSuccess: () => {
      toast({ title: "Report submitted" });
      qc.invalidateQueries({ queryKey: ["mod-queue"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const review = useMutation({
    mutationFn: async ({ id, status, action }: { id: string; status: string; action?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("moderation_queue")
        .update({ status, action_taken: action, reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mod-queue"] });
      toast({ title: "Updated" });
    },
  });

  return {
    items,
    isLoading,
    submitReport: submitReport.mutate,
    review: review.mutate,
  };
};
