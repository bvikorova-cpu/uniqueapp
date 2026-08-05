import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DatingSearchProps {
  value: string;
  onChange: (v: string) => void;
  onOpenFilters: () => void;
  resultCount: number;
}

export function DatingSearch({ value, onChange, onOpenFilters, resultCount }: DatingSearchProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search people…"
            aria-label="Search dating profiles"
            className="h-12 rounded-full border-border/60 bg-card pl-11 pr-10 text-sm shadow-sm placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          type="button"
          onClick={onOpenFilters}
          size="icon"
          variant="outline"
          className="h-12 w-12 shrink-0 rounded-full border-border/60 bg-card shadow-sm"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-5 w-5 text-primary" />
        </Button>
      </div>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Smart match order · {resultCount} {resultCount === 1 ? "person" : "people"}
      </p>
    </div>
  );
}
