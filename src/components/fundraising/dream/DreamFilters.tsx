import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const dreamTypes = [
  { key: "all", label: "All Dreams" },
  { key: "education", label: "🎓 Education" },
  { key: "travel", label: "✈️ Travel" },
  { key: "startup", label: "🚀 Startup" },
  { key: "creative", label: "🎨 Creative" },
  { key: "other", label: "✨ Other" },
];

const sortOptions = [
  { key: "newest", label: "Newest" },
  { key: "trending", label: "🔥 Trending" },
  { key: "almost_funded", label: "Almost Funded" },
  { key: "most_supporters", label: "Most Supporters" },
];

interface DreamFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  filter: string;
  onFilterChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
}

export const DreamFilters = ({ search, onSearchChange, filter, onFilterChange, sort, onSortChange }: DreamFiltersProps) => {
  return (
    <div className="space-y-4" id="dream-campaigns">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dreams..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {dreamTypes.map((type) => (
          <Button
            key={type.key}
            variant={filter === type.key ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(type.key)}
            className="whitespace-nowrap"
          >
            {type.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
