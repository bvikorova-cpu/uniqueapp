import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GiphyItem {
  id: string;
  thumb: string;
  full: string;
}

export const GifPicker = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("giphy-search", {
          body: null,
          method: "GET" as any,
          headers: {},
        } as any);
        // Use direct URL with query params instead
        const url = new URL(
          `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/giphy-search`
        );
        if (query.trim()) url.searchParams.set("q", query.trim());
        url.searchParams.set("limit", "50");
        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        });
        const json = await res.json();
        if (!res.ok || !Array.isArray(json?.gifs)) throw new Error(json?.error || "load failed");
        setGifs(json.gifs);
      } catch (e) {
        console.error("GIF load failed", e);
        setError(true);
        setGifs([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="w-full">
      <Input
        placeholder="Search GIFs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2 h-8"
      />
      {error && (
        <div className="flex items-start gap-2 mb-2 text-[11px] text-muted-foreground bg-muted/40 rounded p-2">
          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
          <span>Couldn't load GIFs. Try again in a moment.</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
        {loading && (
          <div className="col-span-2 flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading &&
          gifs.map((g) => (
            <img
              key={g.id}
              src={g.thumb}
              alt="GIF"
              loading="lazy"
              className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSelect(g.full)}
            />
          ))}
        {!loading && !error && gifs.length === 0 && (
          <div className="col-span-2 text-center text-xs text-muted-foreground py-4">
            No GIFs found
          </div>
        )}
      </div>
    </div>
  );
};
