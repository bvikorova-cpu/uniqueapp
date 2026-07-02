import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Category {
  id: string;
  name: string;
  icon: string;
}

type Difficulty = "all" | "easy" | "medium" | "hard" | "expert";

const difficultyConfig: Record<Exclude<Difficulty, "all">, { label: string; color: string; bgColor: string; borderColor: string }> = {
  easy: { label: "Easy", color: "text-green-600", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  medium: { label: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30" },
  hard: { label: "Hard", color: "text-orange-600", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
  expert: { label: "Expert", color: "text-red-600", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" },
};

interface GlassmorphismCategoriesProps {
  categories: Category[];
  onStartQuiz: (categoryId: string, difficulty?: string) => void;
}

export const GlassmorphismCategories = ({ categories, onStartQuiz }: GlassmorphismCategoriesProps) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <FloatingHowItWorks title="How Glassmorphism Categories works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-primary" /> AI-Generated Quizzes
        </CardTitle>
        <CardDescription>20 questions with instant AI feedback</CardDescription>

        <div className="flex flex-wrap gap-2 pt-3">
          <Button
            variant={selectedDifficulty === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDifficulty("all")}
            className="text-xs h-7"
          >
            <Filter className="w-3 h-3 mr-1" /> All
          </Button>
          {(Object.entries(difficultyConfig) as [Exclude<Difficulty, "all">, typeof difficultyConfig.easy][]).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedDifficulty === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(key)}
              className={`text-xs h-7 ${selectedDifficulty !== key ? `${config.bgColor} ${config.borderColor} ${config.color} border` : ""}`}
            >
              {config.label}
            </Button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-2 w-full px-3 py-2 text-sm rounded-xl bg-muted/30 border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
        />
      </CardHeader>
      <CardContent>
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.015 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3"
        >
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
            >
              <div
                onClick={() => onStartQuiz(category.id, selectedDifficulty !== "all" ? selectedDifficulty : undefined)}
                className="group cursor-pointer p-3 sm:p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30 
                  hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 
                  transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{category.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">20 questions</p>
                  </div>
                </div>
                {selectedDifficulty !== "all" && (
                  <Badge
                    variant="outline"
                    className={`mt-2 text-[9px] ${difficultyConfig[selectedDifficulty].bgColor} ${difficultyConfig[selectedDifficulty].borderColor} ${difficultyConfig[selectedDifficulty].color}`}
                  >
                    {difficultyConfig[selectedDifficulty].label}
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No categories found for "{searchQuery}"</p>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};
