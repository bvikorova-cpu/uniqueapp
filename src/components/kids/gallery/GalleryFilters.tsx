import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Palette, Sparkles, PaintBucket, Heart, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export type GalleryCategory = "all" | "stories" | "drawings" | "characters" | "coloring" | "favorites";

interface GalleryFiltersProps {
  active: GalleryCategory;
  onChange: (cat: GalleryCategory) => void;
  search: string;
  onSearchChange: (val: string) => void;
  counts: Record<GalleryCategory, number>;
}

const categories: { key: GalleryCategory; label: string; icon: typeof LayoutGrid }[] = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "stories", label: "Stories", icon: BookOpen },
  { key: "drawings", label: "Drawings", icon: Palette },
  { key: "characters", label: "Characters", icon: Sparkles },
  { key: "coloring", label: "Coloring", icon: PaintBucket },
  { key: "favorites", label: "Favorites", icon: Heart },
];

export function GalleryFilters({ active, onChange, search, onSearchChange, counts }: GalleryFiltersProps) {
  return (
    <>
      <FloatingHowItWorks title={"Gallery Filters - How it works"} steps={[{ title: 'Open', desc: 'Access the Gallery Filters section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gallery Filters.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-4xl mx-auto mb-8 space-y-4">
      {/* Search bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search your creations..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-full bg-card/80 backdrop-blur-sm border-border/50"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => {
          const isActive = active === cat.key;
          return (
            <motion.button
              key={cat.key}
              onClick={() => onChange(cat.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card/60 border border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
              {counts[cat.key] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {counts[cat.key]}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
    </>
  );
}
