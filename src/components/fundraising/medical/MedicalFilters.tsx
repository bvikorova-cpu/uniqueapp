import { motion } from "framer-motion";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export type DiagnosisFilter = "all" | "cancer" | "surgery" | "rare-disease" | "transplant" | "chronic" | "other";
export type SortOption = "newest" | "urgent" | "almost-funded" | "most-donors";

interface MedicalFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  diagnosis: DiagnosisFilter;
  onDiagnosisChange: (val: DiagnosisFilter) => void;
  sort: SortOption;
  onSortChange: (val: SortOption) => void;
}

const DIAGNOSIS_OPTIONS: { value: DiagnosisFilter; label: string; emoji: string }[] = [
  { value: "all", label: "All Types", emoji: "🏥" },
  { value: "cancer", label: "Cancer", emoji: "🎗️" },
  { value: "surgery", label: "Surgery", emoji: "🔪" },
  { value: "rare-disease", label: "Rare Disease", emoji: "🧬" },
  { value: "transplant", label: "Transplant", emoji: "🫀" },
  { value: "chronic", label: "Chronic Illness", emoji: "💊" },
  { value: "other", label: "Other", emoji: "📋" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "urgent", label: "Most Urgent" },
  { value: "almost-funded", label: "Almost Funded" },
  { value: "most-donors", label: "Most Donors" },
];

export function MedicalFilters({
  search,
  onSearchChange,
  diagnosis,
  onDiagnosisChange,
  sort,
  onSortChange,
}: MedicalFiltersProps) {
  return (
    <>
      <FloatingHowItWorks title={"Medical Filters - How it works"} steps={[{ title: 'Open', desc: 'Access the Medical Filters section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Medical Filters.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-4xl mx-auto mb-8 space-y-3 px-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-full bg-card/80 backdrop-blur-sm border-border/50"
        />
      </div>

      {/* Filters row */}
      <div className="flex gap-2 flex-wrap">
        {/* Diagnosis chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1 min-w-0">
          {DIAGNOSIS_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => onDiagnosisChange(opt.value)}
              whileTap={{ scale: 0.95 }}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                diagnosis === opt.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card/60 border border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </motion.button>
          ))}
        </div>

        {/* Sort */}
        <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-auto min-w-[140px] rounded-full bg-card/60 border-border/50 text-xs">
            <ArrowUpDown className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    </>
  );
}
