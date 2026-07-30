import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HandwritingStats {
  /** ISO dates (yyyy-mm-dd) with at least one analysis, last 60 days */
  activeDates: string[];
  /** Consecutive-day streak ending today or yesterday */
  streak: number;
  /** Count per analysis_type */
  counts: Record<string, number>;
  total: number;
}

const EMPTY: HandwritingStats = { activeDates: [], streak: 0, counts: {}, total: 0 };

const dayKey = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const useHandwritingStats = () => {
  return useQuery<HandwritingStats>({
    queryKey: ["handwriting-stats"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return EMPTY;

      const since = new Date();
      since.setDate(since.getDate() - 60);

      const { data, error } = await supabase
        .from("handwriting_analyses")
        .select("analysis_type, created_at")
        .eq("user_id", uid)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      const rows = data ?? [];
      const daySet = new Set(rows.map((r: any) => dayKey(new Date(r.created_at))));

      const counts: Record<string, number> = {};
      for (const r of rows as any[]) {
        const t = String(r.analysis_type ?? "unknown").toLowerCase();
        counts[t] = (counts[t] ?? 0) + 1;
      }

      let streak = 0;
      const cursor = new Date();
      if (!daySet.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
      for (let i = 0; i < 60; i++) {
        if (daySet.has(dayKey(cursor))) {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
        } else break;
      }

      return {
        activeDates: Array.from(daySet),
        streak,
        counts,
        total: rows.length,
      };
    },
    staleTime: 30_000,
  });
};
