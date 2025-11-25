import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PostDraft {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  draft_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export const useDrafts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drafts, isLoading } = useQuery({
    queryKey: ["post-drafts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("post_drafts")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as PostDraft[];
    },
  });

  const saveDraft = useMutation({
    mutationFn: async ({ content, mediaUrls, draftData }: {
      content?: string;
      mediaUrls?: string[];
      draftData?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("post_drafts")
        .insert({
          user_id: user.id,
          content: content || null,
          media_urls: mediaUrls || null,
          draft_data: draftData as unknown as any || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-drafts"] });
      toast({ title: "Draft saved!" });
    },
  });

  const updateDraft = useMutation({
    mutationFn: async ({ id, content, mediaUrls, draftData }: {
      id: string;
      content?: string;
      mediaUrls?: string[];
      draftData?: Record<string, unknown>;
    }) => {
      const { error } = await supabase
        .from("post_drafts")
        .update({
          content: content || null,
          media_urls: mediaUrls || null,
          draft_data: draftData as unknown as any || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-drafts"] });
      toast({ title: "Draft updated!" });
    },
  });

  const deleteDraft = useMutation({
    mutationFn: async (draftId: string) => {
      const { error } = await supabase
        .from("post_drafts")
        .delete()
        .eq("id", draftId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-drafts"] });
      toast({ title: "Draft deleted" });
    },
  });

  return {
    drafts: drafts || [],
    isLoading,
    saveDraft: saveDraft.mutate,
    updateDraft: updateDraft.mutate,
    deleteDraft: deleteDraft.mutate,
  };
};
