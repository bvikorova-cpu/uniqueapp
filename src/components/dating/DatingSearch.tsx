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
    <div className="relative w-full overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent p-4 shadow-sm">
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-14 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search people by name, city or interest…"
            aria-label="Search dating profiles"
            className="h-12 rounded-2xl border-0 bg-background/80 pl-9 pr-9 text-sm shadow-inner backdrop-blur placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          type="button"
          onClick={onOpenFilters}
          size="icon"
          className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md transition-transform hover:scale-105"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <p className="relative mt-2.5 flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Smart match order · {resultCount} {resultCount === 1 ? "person" : "people"} found
      </p>
    </div>
  );
}
