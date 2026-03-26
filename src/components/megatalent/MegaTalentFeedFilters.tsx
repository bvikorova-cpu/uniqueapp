import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, TrendingUp } from "lucide-react";

type FeedFilter = "hot" | "new" | "top";

interface FeedFiltersProps {
  active: FeedFilter;
  onChange: (filter: FeedFilter) => void;
}

const filters: { value: FeedFilter; label: string; icon: typeof Flame }[] = [
  { value: "hot", label: "Hot", icon: Flame },
  { value: "new", label: "New", icon: Clock },
  { value: "top", label: "Top", icon: TrendingUp },
];

export default function MegaTalentFeedFilters({ active, onChange }: FeedFiltersProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {filters.map((f) => (
        <Button
          key={f.value}
          variant={active === f.value ? "default" : "outline"}
          size="sm"
          className="gap-1.5 h-8 text-xs"
          onClick={() => onChange(f.value)}
        >
          <f.icon className="h-3.5 w-3.5" />
          {f.label}
        </Button>
      ))}
    </div>
  );
}

export type { FeedFilter };
