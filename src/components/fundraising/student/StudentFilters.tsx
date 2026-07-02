import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const categories = [
  { key: "all", label: "All", emoji: "📋" },
  { key: "tuition", label: "Tuition", emoji: "🎓" },
  { key: "books", label: "Books", emoji: "📚" },
  { key: "course", label: "Course", emoji: "💻" },
  { key: "equipment", label: "Equipment", emoji: "🔬" },
  { key: "other", label: "Other", emoji: "📖" },
];

interface StudentFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  filter: string;
  onFilterChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
}

export function StudentFilters({ search, onSearchChange, filter, onFilterChange, sort, onSortChange }: StudentFiltersProps) {
  return (
    <>
      <FloatingHowItWorks title={"Student Filters - How it works"} steps={[{ title: 'Open', desc: 'Access the Student Filters section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Student Filters.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, school, or field..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card/50 border-border/50"
          />
        </div>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-48 bg-card/50 border-border/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">🆕 Newest</SelectItem>
            <SelectItem value="almost_funded">🏁 Almost Funded</SelectItem>
            <SelectItem value="most_supporters">👥 Most Supporters</SelectItem>
            <SelectItem value="pay_forward">🔄 Pay-it-Forward</SelectItem>
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
                ? "bg-primary text-primary-foreground shadow-md"
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
