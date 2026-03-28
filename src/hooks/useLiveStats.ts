import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StatQuery {
  key: string;
  table: string;
  filter?: { column: string; value: string };
}

export function useLiveStats(queries: StatQuery[]) {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const results: Record<string, number> = {};
      await Promise.allSettled(
        queries.map(async (q) => {
          try {
            let query = (supabase as any).from(q.table).select("id", { count: "exact", head: true });
            if (q.filter) {
              query = query.eq(q.filter.column, q.filter.value);
            }
            const { count } = await query;
            results[q.key] = count || 0;
          } catch {
            results[q.key] = 0;
          }
        })
      );
      setStats(results);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return { stats, loading };
}
