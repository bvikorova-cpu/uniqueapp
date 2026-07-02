import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <>
      <FloatingHowItWorks title={"Mega Talent Feed Filters - How it works"} steps={[{ title: 'Open', desc: 'Access the Mega Talent Feed Filters section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mega Talent Feed Filters.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
}

export type { FeedFilter };
