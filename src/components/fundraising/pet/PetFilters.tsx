import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertCircle } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const petTypes = [
  { key: "all", label: "All Animals" },
  { key: "urgent", label: "🚨 Urgent Cases", icon: AlertCircle },
  { key: "dog", label: "🐕 Dogs" },
  { key: "cat", label: "🐈 Cats" },
  { key: "bird", label: "🐦 Birds" },
  { key: "rabbit", label: "🐰 Rabbits" },
  { key: "other", label: "🐾 Other" },
];

const sortOptions = [
  { key: "urgent_first", label: "🚨 Most Urgent" },
  { key: "newest", label: "Newest" },
  { key: "almost_funded", label: "Almost Funded" },
  { key: "most_supporters", label: "Most Supporters" },
];

interface PetFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  filter: string;
  onFilterChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
}

export const PetFilters = ({ search, onSearchChange, filter, onFilterChange, sort, onSortChange }: PetFiltersProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Pet Filters - How it works"} steps={[{ title: 'Open', desc: 'Access the Pet Filters section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pet Filters.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4" id="pet-campaigns">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by pet name or condition..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" />
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
        {petTypes.map((type) => (
          <Button key={type.key} variant={filter === type.key ? "default" : "outline"} size="sm" onClick={() => onFilterChange(type.key)} className="whitespace-nowrap">
            {type.label}
          </Button>
        ))}
      </div>
    </div>
    </>
  );
};
