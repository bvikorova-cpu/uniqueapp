import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";

interface GiphyItem {
  id: string;
  thumb: string;
  full: string;
}

const GIPHY_KEY = import.meta.env.VITE_GIPHY_API_KEY as string | undefined;

export const GifPicker = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!GIPHY_KEY) {
      setError(true);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const q = query.trim();
        const endpoint = q
          ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=50&rating=pg-13`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=50&rating=pg-13`;
        const res = await fetch(endpoint);
        const json = await res.json();
        if (!res.ok || !Array.isArray(json?.data)) throw new Error("load failed");
        setGifs(
          json.data.map((g: any) => ({
            id: g.id,
            thumb: g.images?.fixed_width_small?.url || g.images?.fixed_width?.url,
            full: g.images?.original?.url,
          }))
        );
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
