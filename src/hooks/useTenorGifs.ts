import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TenorGif {
  id: string;
  title: string;
  preview: string;
  url: string;
  width?: number;
  height?: number;
}

export function useTenorGifs() {
  const [results, setResults] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tenor-search?q=${encodeURIComponent(query)}&limit=24`;
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch(url, {
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results ?? []);
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
