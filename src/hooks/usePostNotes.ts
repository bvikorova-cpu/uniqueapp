import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePostNotes = (postId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: notes = [] } = useQuery({
    queryKey: ["post-notes", postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("post_notes")
        .select("*")
        .eq("post_id", postId)
        .order("helpful_count", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  const addNote = useMutation({
    mutationFn: async (body: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !postId) throw new Error("Missing");
      const { error } = await supabase.from("post_notes").insert({ post_id: postId, author_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["post-notes", postId] });
      toast({ title: "Note submitted for review" });
    },
  });

  const vote = useMutation({
    mutationFn: async ({ noteId, isHelpful }: { noteId: string; isHelpful: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("post_note_votes")
        .upsert({ note_id: noteId, user_id: user.id, is_helpful: isHelpful }, { onConflict: "note_id,user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["post-notes", postId] }),
  });

  return { notes, addNote: addNote.mutate, vote: vote.mutate };
};
