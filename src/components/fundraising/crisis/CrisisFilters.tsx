import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const categories = [
  { key: "all", label: "All", emoji: "📋" },
  { key: "fire", label: "Fire", emoji: "🔥" },
  { key: "flood", label: "Flood", emoji: "🌊" },
  { key: "accident", label: "Accident", emoji: "⚠️" },
  { key: "natural_disaster", label: "Disaster", emoji: "🌪️" },
  { key: "other", label: "Other", emoji: "🆘" },
];

interface CrisisFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  filter: string;
  onFilterChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
}

export function CrisisFilters({ search, onSearchChange, filter, onFilterChange, sort, onSortChange }: CrisisFiltersProps) {
  return (
    <>
      <FloatingHowItWorks title={"Crisis Filters - How it works"} steps={[{ title: 'Open', desc: 'Access the Crisis Filters section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crisis Filters.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by location, crisis type..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-10 bg-card/50 border-border/50" />
        </div>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-48 bg-card/50 border-border/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent_first">🚨 Most Urgent</SelectItem>
            <SelectItem value="expiring_soon">⏰ Expiring Soon</SelectItem>
            <SelectItem value="almost_funded">🏁 Almost Funded</SelectItem>
            <SelectItem value="newest">🆕 Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onFilterChange(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === cat.key
                ? "bg-destructive text-destructive-foreground shadow-md"
                : "bg-card/60 border border-border/50 text-muted-foreground hover:bg-accent/50"
            }`}
          >
            <span>{cat.emoji}</span> {cat.label}
          </button>
        ))}
      </div>
    </motion.div>
    </>
  );
}
