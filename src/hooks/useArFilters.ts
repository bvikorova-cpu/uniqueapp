import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ArFilter {
  id: string;
  name: string;
  css_filter: string | null;
  sticker_url: string | null;
  category: string | null;
  is_premium: boolean;
}

export function useArFilters() {
  return useQuery({
    queryKey: ["ar-filters"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ar_filters").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as ArFilter[];
    },
  });
}
