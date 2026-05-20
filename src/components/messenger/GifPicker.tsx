import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

// Giphy public beta key — fine for client demos
const GIPHY_KEY = "dc6zaTOxFJmzC";

interface GiphyItem {
  id: string;
  images: { fixed_height_small: { url: string }; original: { url: string } };
}

export const GifPicker = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const endpoint = query.trim()
          ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=50&rating=pg-13`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=50&rating=pg-13`;
        const res = await fetch(endpoint);
        const json = await res.json();
        setGifs(json.data || []);
      } catch (e) {
        console.error("GIF load failed", e);
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
              src={g.images.fixed_height_small.url}
              alt="GIF"
              loading="lazy"
              className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSelect(g.images.original.url)}
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
