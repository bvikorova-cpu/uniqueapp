import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
}

const difficultyOptions = ["All", "Easy", "Medium", "Hard"];

export const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
}: CategoryFilterProps) => {
  return (
    <>
      <FloatingHowItWorks title="How Category Filter works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-border p-4 mb-6"
    >
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-muted/50 border-none"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-3">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(cat)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${selectedCategory === cat
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex gap-1.5">
          {difficultyOptions.map((diff) => (
            <button
              key={diff}
              onClick={() => onDifficultyChange(diff.toLowerCase())}
              className={`
                px-2.5 py-1 rounded-md text-xs font-medium transition-all
                ${selectedDifficulty === diff.toLowerCase()
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
    </>
    );
};
