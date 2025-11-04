import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GenerateTemplateParams {
  title: string;
  description?: string;
}

interface GeneratedImages {
  templateImageUrl: string;
}

export const useGeneratePaintTemplate = () => {
  return useMutation({
    mutationFn: async ({ title, description }: GenerateTemplateParams) => {
      const { data, error } = await supabase.functions.invoke('generate-paint-by-numbers', {
        body: { title, description }
      });

      if (error) throw error;
      if (!data?.templateImageUrl) {
        throw new Error("No template returned");
      }

      return data as GeneratedImages;
    },
  });
};
