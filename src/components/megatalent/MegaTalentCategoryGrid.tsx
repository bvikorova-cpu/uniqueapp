import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CategoryItem {
  emoji: string;
  name: string;
  description: string;
  route: string;
}

const categories: CategoryItem[] = [
  { emoji: "🎨", name: "Art", description: "Drawing, Painting & More", route: "/megatalent/art" },
  { emoji: "🎤", name: "Music", description: "Singing & Instruments", route: "/megatalent/music" },
  { emoji: "💃", name: "Dance", description: "All Dance Styles", route: "/megatalent/dance" },
  { emoji: "📸", name: "Photography", description: "Best Photos", route: "/megatalent/photography" },
  { emoji: "👨‍🍳", name: "Cooking", description: "Culinary Creations", route: "/megatalent/cooking" },
  { emoji: "💻", name: "Digital Art", description: "Digital Creations", route: "/megatalent/digital_art" },
  { emoji: "💄", name: "Makeup Art", description: "Beauty Artistry", route: "/megatalent/makeup_art" },
  { emoji: "💪", name: "Sports", description: "Fitness & Training", route: "/megatalent/sports" },
  { emoji: "😂", name: "Entertainment", description: "Comedy & Fun", route: "/megatalent/entertainment" },
  { emoji: "💡", name: "Education", description: "Tutorials & Tips", route: "/megatalent/education" },
];

export default function MegaTalentCategoryGrid() {
  const navigate = useNavigate();

  return (
    <>
      <FloatingHowItWorks title={"Mega Talent Category Grid - How it works"} steps={[{ title: 'Open', desc: 'Access the Mega Talent Category Grid section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mega Talent Category Grid.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">Explore by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card
              className="cursor-pointer group hover:shadow-lg hover:border-primary/30 transition-all active:scale-[0.97] backdrop-blur-xl bg-card/80 border-border/30 overflow-hidden"
              onClick={() => navigate(cat.route)}
            >
              <CardContent className="p-4 sm:p-5 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {cat.emoji}
                  </div>
                  <h3 className="font-bold text-sm mb-0.5">{cat.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{cat.description}</p>
                  <ArrowRight className="w-3.5 h-3.5 mx-auto mt-2 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
}
