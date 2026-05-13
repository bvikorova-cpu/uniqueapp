import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { useTenorGifs, TenorGif } from "@/hooks/useTenorGifs";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (gif: TenorGif) => void;
}

export function GifPickerDialog({ open, onOpenChange, onSelect }: Props) {
  const [q, setQ] = useState("");
  const { results, loading, error, search } = useTenorGifs();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => search(q || "trending"), 250);
    return () => clearTimeout(t);
  }, [q, open, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick a GIF</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Tenor..."
            className="pl-9"
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
          {loading && <Loader2 className="h-5 w-5 animate-spin col-span-3 mx-auto" />}
          {!loading &&
            results.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  onSelect(g);
                  onOpenChange(false);
                }}
                className="rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary transition"
              >
                <img src={g.preview} alt={g.title} loading="lazy" className="w-full h-auto" />
              </button>
            ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">Powered by Tenor</p>
      </DialogContent>
    </Dialog>
  );
}
