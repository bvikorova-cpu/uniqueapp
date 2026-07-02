import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, PawPrint, Flower2, Flame, Trees, Car, Snowflake, BookOpen } from "lucide-react";

import templateCutePuppy from "@/assets/coloring/template-cute-puppy.jpg";
import templateMajesticLion from "@/assets/coloring/template-majestic-lion.jpg";
import templateMandalaFlower from "@/assets/coloring/template-mandala-flower.jpg";
import templateOceanMandala from "@/assets/coloring/template-ocean-mandala.jpg";
import templateFireDragon from "@/assets/coloring/template-fire-dragon.jpg";
import templateUnicornCastle from "@/assets/coloring/template-unicorn-castle.jpg";
import templateSpringGarden from "@/assets/coloring/template-spring-garden.jpg";
import templateForestScene from "@/assets/coloring/template-forest-scene.jpg";
import templateRaceCar from "@/assets/coloring/template-race-car.jpg";
import templateSpaceShuttle from "@/assets/coloring/template-space-shuttle.jpg";
import templateChristmasTree from "@/assets/coloring/template-christmas-tree.jpg";
import templateEasterEggs from "@/assets/coloring/template-easter-eggs.jpg";
import templateSolarSystem from "@/assets/coloring/template-solar-system.jpg";
import templateHumanBody from "@/assets/coloring/template-human-body.jpg";
import templateButterflyCollection from "@/assets/coloring/template-butterfly-collection.jpg";
import templateZenGarden from "@/assets/coloring/template-zen-garden.jpg";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "animals", label: "Animals", icon: PawPrint },
  { id: "mandala", label: "Mandalas", icon: Flower2 },
  { id: "fantasy", label: "Fantasy", icon: Flame },
  { id: "nature", label: "Nature", icon: Trees },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "holiday", label: "Holiday", icon: Snowflake },
  { id: "education", label: "Education", icon: BookOpen },
];

const TEMPLATES = [
  { id: "1", name: "Cute Puppy", category: "animals", difficulty: "easy", prompt: "A cute cartoon puppy sitting with big eyes, simple outlines for coloring", popular: true, image: templateCutePuppy },
  { id: "2", name: "Majestic Lion", category: "animals", difficulty: "medium", prompt: "A majestic lion with flowing mane, detailed fur patterns for coloring", popular: true, image: templateMajesticLion },
  { id: "3", name: "Mandala Flower", category: "mandala", difficulty: "hard", prompt: "An intricate mandala with flower patterns, symmetrical geometric design for coloring", popular: true, image: templateMandalaFlower },
  { id: "4", name: "Ocean Mandala", category: "mandala", difficulty: "hard", prompt: "A mandala with ocean waves and sea creatures, detailed patterns for coloring", image: templateOceanMandala },
  { id: "5", name: "Fire Dragon", category: "fantasy", difficulty: "medium", prompt: "A friendly dragon breathing fire, scales and wings detailed for coloring", popular: true, image: templateFireDragon },
  { id: "6", name: "Unicorn Castle", category: "fantasy", difficulty: "easy", prompt: "A unicorn in front of a fairy tale castle, simple magical scene for coloring", image: templateUnicornCastle },
  { id: "7", name: "Spring Garden", category: "nature", difficulty: "easy", prompt: "A beautiful garden with flowers, butterflies and a small pond for coloring", image: templateSpringGarden },
  { id: "8", name: "Forest Scene", category: "nature", difficulty: "medium", prompt: "A detailed forest scene with tall trees, mushrooms and woodland animals for coloring", image: templateForestScene },
  { id: "9", name: "Race Car", category: "vehicles", difficulty: "easy", prompt: "A cool race car with flames on the side, simple design for coloring", image: templateRaceCar },
  { id: "10", name: "Space Shuttle", category: "vehicles", difficulty: "medium", prompt: "A space shuttle launching into space with stars and planets, detailed for coloring", image: templateSpaceShuttle },
  { id: "11", name: "Christmas Tree", category: "holiday", difficulty: "easy", prompt: "A decorated Christmas tree with ornaments and presents underneath for coloring", image: templateChristmasTree },
  { id: "12", name: "Easter Eggs", category: "holiday", difficulty: "medium", prompt: "Decorated Easter eggs with intricate patterns in a basket for coloring", image: templateEasterEggs },
  { id: "13", name: "Solar System", category: "education", difficulty: "medium", prompt: "The solar system with all planets labeled, educational diagram for coloring", image: templateSolarSystem },
  { id: "14", name: "Human Body", category: "education", difficulty: "hard", prompt: "A simplified diagram of the human body with major organs labeled for coloring", image: templateHumanBody },
  { id: "15", name: "Butterfly Collection", category: "animals", difficulty: "medium", prompt: "A collection of different butterfly species with detailed wing patterns for coloring", image: templateButterflyCollection },
  { id: "16", name: "Zen Garden", category: "mandala", difficulty: "medium", prompt: "A peaceful zen garden with raked sand patterns and stones for coloring", image: templateZenGarden },
];

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-600 border-green-500/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  hard: "bg-red-500/10 text-red-600 border-red-500/30",
};

interface TemplateGalleryProps {
  onSelectTemplate: (prompt: string, difficulty: string) => void;
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const filtered = activeCategory === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <>
      <FloatingHowItWorks title={"Template Gallery - How it works"} steps={[{ title: 'Open', desc: 'Access the Template Gallery section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Template Gallery.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Template Gallery</h2>
        <p className="text-muted-foreground">Pick a theme and generate instantly — or use as inspiration!</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-muted/50 hover:bg-muted/80 text-muted-foreground border border-border/30"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-3.5 h-3.5" /> {cat.label}
            </motion.button>
          );
        })}
      </div>

      {/* Template grid */}
      <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((template, i) => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
            >
              <Card
                className="group cursor-pointer backdrop-blur-xl bg-card/80 border-border/30 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                onClick={() => onSelectTemplate(template.prompt, template.difficulty)}
              >
                <CardContent className="p-4 relative">
                  {template.popular && (
                    <Badge className="absolute top-2 right-2 bg-amber-500 text-white gap-1 text-xs z-10">
                      <Star className="w-3 h-3" /> Popular
                    </Badge>
                  )}
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <img src={template.image} alt={template.name} loading="lazy" width={512} height={512} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-primary transition-colors">{template.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${difficultyColors[template.difficulty]}`}>{template.difficulty}</Badge>
                    <span className="text-xs text-muted-foreground capitalize">{template.category}</span>
                  </div>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" className="w-full text-xs gap-1" onClick={(e) => { e.stopPropagation(); onSelectTemplate(template.prompt, template.difficulty); }}><Sparkles className="w-3 h-3" /> Generate</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
    </>
  );
}
