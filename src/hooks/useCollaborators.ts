import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Collaborator {
  id: string;
  post_id: string;
  collaborator_id: string;
  invited_by: string;
  status: string;
  created_at: string;
}

export const useCollaborators = (postId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: collaborators } = useQuery({
    queryKey: ["post-collaborators", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("post_collaborators")
        .select("*")
        .eq("post_id", postId);

      if (error) throw error;
      const ids = (data || []).map((c: any) => c.collaborator_id);
      if (ids.length === 0) return data;
      const { data: profiles } = await (supabase as any)
        .from("profiles_public")
        .select("id, full_name, avatar_url")
        .in("id", ids);
      const map = new Map((profiles || []).map((p: any) => [p.id, p]));
      return (data || []).map((c: any) => ({ ...c, profiles: map.get(c.collaborator_id) || null }));
    },
    enabled: !!postId,
  });

  const inviteCollaborator = useMutation({
    mutationFn: async ({ postId, collaboratorId }: {
      postId: string;
      collaboratorId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("post_collaborators")
        .insert({
          post_id: postId,
          collaborator_id: collaboratorId,
          invited_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-collaborators"] });
      toast({ title: "Collaborator invited!" });
    },
  });

  const respondToInvite = useMutation({
    mutationFn: async ({ inviteId, status }: {
      inviteId: string;
      status: "accepted" | "declined";
    }) => {
      const { error } = await supabase
        .from("post_collaborators")
        .update({ status })
        .eq("id", inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-collaborators"] });
      toast({ title: "Response recorded!" });
    },
  });

  return {
    collaborators: collaborators || [],
    inviteCollaborator: inviteCollaborator.mutate,
    respondToInvite: respondToInvite.mutate,
  };
};
