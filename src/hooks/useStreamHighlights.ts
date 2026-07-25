import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StreamHighlight {
  id: string;
  stream_id: string;
  kind: "top_tip" | "chat_moment";
  rank: number;
  title: string;
  payload: any;
  created_at: string;
}

export function useStreamHighlights(streamId: string | null | undefined) {
  return useQuery({
    queryKey: ["stream-highlights", streamId],
    enabled: !!streamId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("stream_highlights")
        .select("*")
        .eq("stream_id", streamId)
        .order("kind", { ascending: true })
        .order("rank", { ascending: true });
      if (error) throw error;
      return (data ?? []) as StreamHighlight[];
    },
  });
}
