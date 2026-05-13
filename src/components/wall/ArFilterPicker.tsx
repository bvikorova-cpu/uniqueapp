import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useArFilters, type ArFilter } from "@/hooks/useArFilters";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  selectedFilter: string | null;
  onSelect: (cssFilter: string | null) => void;
}

export function ArFilterPicker({ selectedFilter, onSelect }: Props) {
  const { data: filters = [] } = useArFilters();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" variant="ghost" className="gap-1">
          <Sparkles className="h-4 w-4" /> Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <ScrollArea className="h-64">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSelect(null)}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs ${!selectedFilter ? "border-primary" : "border-border"}`}
            >
              None
            </button>
            {filters.map((f: ArFilter) => (
              <button
                key={f.id}
                onClick={() => onSelect(f.css_filter)}
                className={`aspect-square rounded-lg border-2 overflow-hidden relative ${selectedFilter === f.css_filter ? "border-primary" : "border-border"}`}
                style={{ filter: f.css_filter ?? undefined }}
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-white drop-shadow">{f.name}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
