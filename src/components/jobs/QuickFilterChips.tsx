import { Zap, Laptop, DollarSign, Clock, Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface QuickFilter {
  label: string;
  icon: React.ReactNode;
  key: string;
}

const QUICK_FILTERS: QuickFilter[] = [
  { label: "Remote", icon: <Laptop className="h-3.5 w-3.5" />, key: "remote" },
  { label: "Full Time", icon: <Clock className="h-3.5 w-3.5" />, key: "full_time" },
  { label: "Hot 🔥", icon: <Flame className="h-3.5 w-3.5" />, key: "hot" },
  { label: "New Today", icon: <Sparkles className="h-3.5 w-3.5" />, key: "new" },
  { label: "Tech", icon: <Zap className="h-3.5 w-3.5" />, key: "it_software" },
  { label: "High Salary", icon: <DollarSign className="h-3.5 w-3.5" />, key: "high_salary" },
  { label: "Part Time", icon: <Clock className="h-3.5 w-3.5" />, key: "part_time" },
  { label: "Internship", icon: <Sparkles className="h-3.5 w-3.5" />, key: "internship" },
];

interface QuickFilterChipsProps {
  activeFilter: string | null;
  onFilterChange: (key: string | null) => void;
}

export function QuickFilterChips({ activeFilter, onFilterChange }: QuickFilterChipsProps) {
  return (
    <>
      <FloatingHowItWorks title="How Quick Filter Chips works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
      {QUICK_FILTERS.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(activeFilter === filter.key ? null : filter.key)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border active:scale-95",
            activeFilter === filter.key
              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
              : "bg-card/60 backdrop-blur-sm text-muted-foreground border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          )}
        >
          {filter.icon}
          {filter.label}
        </button>
      ))}
    </div>
    </>
    );
}
