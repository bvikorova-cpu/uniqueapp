import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { eduCall } from "./useEducationRouter";
import { toast } from "sonner";

export const useNotes = () => {
  return useQuery({
    queryKey: ["edu-notes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("education_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useSaveNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: { id?: string; title: string; content_md: string; subject?: string; is_public?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (note.id) {
        const { data, error } = await supabase
          .from("education_notes")
          .update({ title: note.title, content_md: note.content_md, subject: note.subject, is_public: note.is_public })
          .eq("id", note.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("education_notes")
        .insert({ user_id: user.id, title: note.title, content_md: note.content_md, subject: note.subject ?? null, is_public: note.is_public ?? false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["edu-notes"] }),
  });
};

export const useAIGenerateNote = () =>
  useMutation({
    mutationFn: async (topic: string) => eduCall<{ markdown: string }>("notes.generate", { topic }),
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

export const useMathSolver = () =>
  useMutation({
    mutationFn: async (p: { problem_text?: string; image_url?: string }) =>
      eduCall<{ solution: { steps: any[]; answer: string } }>("math.solve", p),
    onError: (e: any) => toast.error(e?.message === "insufficient_credits" ? "Buy homework credits to solve" : e?.message ?? "Failed"),
  });

export const useTutorChat = () =>
  useMutation({
    mutationFn: async (p: { message: string; context?: string }) =>
      eduCall<{ reply: string }>("tutor.chat", p),
    onError: (e: any) => toast.error(e?.message === "insufficient_credits" ? "Buy homework credits to chat" : e?.message ?? "Failed"),
  });
