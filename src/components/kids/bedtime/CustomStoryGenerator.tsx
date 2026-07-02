import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface CustomStoryGeneratorProps {
  onGenerate: (story: { title: string; text: string }) => void;
  isGenerating?: boolean;
}

const THEMES = [
  { emoji: "🏰", label: "Castle" },
  { emoji: "🚀", label: "Space" },
  { emoji: "🧜", label: "Ocean" },
  { emoji: "🌲", label: "Forest" },
  { emoji: "🦄", label: "Magic" },
  { emoji: "🐉", label: "Dragon" },
];

export function CustomStoryGenerator({ onGenerate, isGenerating }: CustomStoryGeneratorProps) {
  const [childName, setChildName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [favoriteThing, setFavoriteThing] = useState("");

  const handleGenerate = () => {
    const theme = THEMES.find(t => t.label === selectedTheme);
    onGenerate({
      title: `${childName}'s ${theme?.label || "Magical"} Dream`,
      text: `Create a calming bedtime story for a child named ${childName || "little one"} who loves ${favoriteThing || "adventures"}. The story theme is ${selectedTheme || "magical"}. Make it soothing, gentle, and about 200 words. End with the child drifting off to peaceful sleep.`,
    });
  };

  return (
    <>
      <FloatingHowItWorks title={"Custom Story Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the Custom Story Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Custom Story Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <h3 className="text-sm font-bold text-purple-100 flex items-center gap-1.5">
        <Wand2 className="h-4 w-4 text-pink-400" /> Create Your Story
      </h3>

      <Input
        placeholder="Child's name..."
        value={childName}
        onChange={(e) => setChildName(e.target.value)}
        className="bg-white/10 border-purple-400/30 text-white placeholder:text-gray-400 text-sm"
      />

      <Input
        placeholder="Favorite thing (e.g. dinosaurs, stars)..."
        value={favoriteThing}
        onChange={(e) => setFavoriteThing(e.target.value)}
        className="bg-white/10 border-purple-400/30 text-white placeholder:text-gray-400 text-sm"
      />

      {/* Theme selector */}
      <div className="grid grid-cols-3 gap-1.5">
        {THEMES.map((theme) => (
          <motion.button
            key={theme.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTheme(theme.label)}
            className={`py-2 rounded-lg text-center transition-all ${
              selectedTheme === theme.label
                ? "bg-purple-500/40 border border-purple-400/50 shadow-md"
                : "bg-white/5 border border-white/10 hover:bg-white/10"
            }`}
          >
            <span className="text-lg">{theme.emoji}</span>
            <p className={`text-[9px] font-medium ${selectedTheme === theme.label ? "text-purple-200" : "text-gray-400"}`}>
              {theme.label}
            </p>
          </motion.button>
        ))}
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl shadow-lg"
        >
          {isGenerating ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Magic...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> Generate Dream Story</>
          )}
        </Button>
      </motion.div>
    </div>
    </>
  );
}
