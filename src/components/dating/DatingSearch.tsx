import { useState } from "react";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface DatingSuggestion {
  user_id: string;
  display_name: string | null;
  age?: number | null;
  location?: string | null;
  profile_photo_url?: string | null;
}

interface DatingSearchProps {
  value: string;
  onChange: (v: string) => void;
  onOpenFilters: () => void;
  resultCount: number;
  suggestions?: DatingSuggestion[];
  onSelectSuggestion?: (userId: string) => void;
}

export function DatingSearch({
  value,
  onChange,
  onOpenFilters,
  resultCount,
  suggestions = [],
  onSelectSuggestion,
}: DatingSearchProps) {
  const [focused, setFocused] = useState(false);
  const showList = focused && value.trim().length >= 1;

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
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

      {showList && (
        <div className="absolute left-0 right-0 top-14 z-50 max-h-72 overflow-y-auto rounded-2xl border border-border/60 bg-popover p-1 shadow-lg">
          {suggestions.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">No people found</p>
          ) : (
            suggestions.map((s) => (
              <button
                key={s.user_id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectSuggestion?.(s.user_id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={s.profile_photo_url || undefined} />
                  <AvatarFallback>{s.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.display_name || "Unknown"}
                    {s.age ? `, ${s.age}` : ""}
                  </p>
                  {s.location && (
                    <p className="truncate text-xs text-muted-foreground">{s.location}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Smart match order · {resultCount} {resultCount === 1 ? "person" : "people"}
      </p>
    </div>
  );
}
