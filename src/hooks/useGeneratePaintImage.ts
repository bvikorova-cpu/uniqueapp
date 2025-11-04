import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGeneratePaintImage = () => {
  return useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase.functions.invoke('generate-paint-image', {
        body: { title }
      });

      if (error) {
        console.error('Generate paint image error:', error);
        throw new Error(data?.error || error.message || 'Failed to generate image');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data.imageUrl as string;
    },
  });
};
