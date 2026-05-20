import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";

// Use a real Giphy API key from env when available. The old public beta key
// (dc6zaTOxFJmzC) was permanently banned by Giphy in 2024, so without a real
// key we fall back to a curated local trending list.
const GIPHY_KEY = (import.meta as any).env?.VITE_GIPHY_API_KEY || "";

const FALLBACK_GIFS = [
  "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
  "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif",
  "https://media.giphy.com/media/3o7TKz2fKpYhu3i168/giphy.gif",
  "https://media.giphy.com/media/xT0xezQGU5xCDJuCPe/giphy.gif",
  "https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif",
  "https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
  "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif",
  "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
  "https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif",
];

interface GiphyItem {
  id: string;
  thumb: string;
  full: string;
}

export const GifPicker = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    // No key configured → show curated fallback list immediately.
    if (!GIPHY_KEY) {
      setUsingFallback(true);
      setGifs(FALLBACK_GIFS.map((url, i) => ({ id: `f-${i}`, thumb: url, full: url })));
      return;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      setUsingFallback(false);
      try {
        const endpoint = query.trim()
          ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=50&rating=pg-13`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=50&rating=pg-13`;
        const res = await fetch(endpoint);
        const json = await res.json();
        if (!res.ok || json?.meta?.status >= 400 || !Array.isArray(json?.data)) {
          throw new Error(json?.meta?.msg || `HTTP ${res.status}`);
        }
        setGifs(
          json.data.map((g: any) => ({
            id: g.id,
            thumb: g.images?.fixed_height_small?.url || g.images?.original?.url,
            full: g.images?.original?.url,
          }))
        );
      } catch (e) {
        console.error("GIF load failed", e);
        setUsingFallback(true);
        setGifs(FALLBACK_GIFS.map((url, i) => ({ id: `f-${i}`, thumb: url, full: url })));
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
        disabled={!GIPHY_KEY}
      />
      {usingFallback && (
        <div className="flex items-start gap-2 mb-2 text-[11px] text-muted-foreground bg-muted/40 rounded p-2">
          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
          <span>Showing curated GIFs. Add a Giphy API key (VITE_GIPHY_API_KEY) to enable search.</span>
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
        {!loading && gifs.length === 0 && (
          <div className="col-span-2 text-center text-xs text-muted-foreground py-4">
            No GIFs found
          </div>
        )}
      </div>
    </div>
  );
};
