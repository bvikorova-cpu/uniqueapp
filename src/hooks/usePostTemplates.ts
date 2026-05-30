import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PostTemplate {
  id: string;
  user_id: string | null;
  name: string;
  content: string;
  category: string | null;
  is_public: boolean;
  uses_count: number;
  thumbnail: string | null;
  tags: string[];
}

export const usePostTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["post-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_templates")
        .select("*")
        .order("uses_count", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createTemplate = useMutation({
    mutationFn: async ({ name, content, category, tags }: {
      name: string;
      content: string;
      category?: string;
      tags?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("post_templates")
        .insert({
          user_id: user.id,
          name,
          content,
          category,
          tags: tags || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-templates"] });
      toast({ title: "Template created!" });
    },
  });

  const applyTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      // First get current uses_count
      const { data: template } = await supabase
        .from("post_templates")
        .select("uses_count")
        .eq("id", templateId)
        .single();

      if (template) {
        const { error } = await supabase
          .from("post_templates")
          .update({ uses_count: template.uses_count + 1 })
          .eq("id", templateId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-templates"] });
    },
  });

  return {
    templates: templates || [],
    isLoading,
    createTemplate: createTemplate.mutate,
    applyTemplate: applyTemplate.mutate,
  };
};
