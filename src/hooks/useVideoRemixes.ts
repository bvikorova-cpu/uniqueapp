import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useVideoRemixes(parentPostId?: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: remixes = [] } = useQuery({
    queryKey: ["video-remixes", parentPostId],
    enabled: !!parentPostId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("video_remixes").select("*").eq("parent_post_id", parentPostId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const createRemix = useMutation({
    mutationFn: async ({ parentId, remixPostId, type }: { parentId: string; remixPostId: string; type: "duet" | "stitch" }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sign in");
      const { error } = await (supabase as any).from("video_remixes").insert({
        parent_post_id: parentId, remix_post_id: remixPostId, user_id: u.user.id, remix_type: type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Remix created" });
      qc.invalidateQueries({ queryKey: ["video-remixes"] });
    },
  });

  return { remixes, createRemix };
}
