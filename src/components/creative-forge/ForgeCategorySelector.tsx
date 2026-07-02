import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Music, Film, Theater, BookOpen, Feather, Mic2, Podcast, Megaphone, Sparkles } from "lucide-react";
import { CreativeCategory, CREDIT_COSTS } from "@/hooks/useCreativeForgeCredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const CATEGORIES = [
  { id: "song_lyrics", name: "Song Lyrics", icon: Music, description: "Professional lyrics with verses, chorus & bridge structure", emoji: "🎵", gradient: "from-pink-500/15 to-rose-500/10" },
  { id: "screenplay", name: "Screenplay", icon: Film, description: "Hollywood-format scripts with scenes & dialogue", emoji: "🎬", gradient: "from-amber-500/15 to-orange-500/10" },
  { id: "theater_play", name: "Theater Play", icon: Theater, description: "Stage plays with stage directions & acts", emoji: "🎭", gradient: "from-violet-500/15 to-purple-500/10" },
  { id: "novel_chapter", name: "Novel Chapter", icon: BookOpen, description: "Compelling prose, rich world-building & storytelling", emoji: "📖", gradient: "from-emerald-500/15 to-green-500/10" },
  { id: "poetry", name: "Poetry", icon: Feather, description: "Poems in sonnets, haiku, free verse & more", emoji: "✨", gradient: "from-sky-500/15 to-cyan-500/10" },
  { id: "standup", name: "Stand-up", icon: Mic2, description: "Comedy routines with setups & punchlines", emoji: "🎤", gradient: "from-red-500/15 to-rose-500/10" },
  { id: "podcast_script", name: "Podcast", icon: Podcast, description: "Engaging podcast scripts with segues & CTAs", emoji: "🎙️", gradient: "from-indigo-500/15 to-blue-500/10" },
  { id: "ad_copy", name: "Ad Copy", icon: Megaphone, description: "Persuasive advertising & marketing copy", emoji: "📢", gradient: "from-yellow-500/15 to-amber-500/10" },
];

interface ForgeCategorySelectorProps {
  selected: CreativeCategory;
  onSelect: (cat: CreativeCategory) => void;
}

export function ForgeCategorySelector({ selected, onSelect }: ForgeCategorySelectorProps) {
  return (
    <>
      <FloatingHowItWorks title={"Forge Category Selector - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Category Selector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Category Selector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {CATEGORIES.map((cat, i) => {
        const isSelected = selected === cat.id;
        const Icon = cat.icon;
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(cat.id as CreativeCategory)}
            className={`relative p-4 rounded-xl border text-left transition-all duration-300 backdrop-blur-xl overflow-hidden group ${
              isSelected
                ? "border-primary/40 bg-primary/10 shadow-lg shadow-primary/15 ring-1 ring-primary/20"
                : "border-border/50 bg-card/60 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            }`}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Selected indicator glow */}
            {isSelected && (
              <motion.div
                layoutId="category-glow"
                className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            <div className="relative flex items-start gap-3">
              <div className={`p-2 rounded-lg transition-all ${
                isSelected ? 'bg-primary/20' : 'bg-muted/50 group-hover:bg-primary/10'
              }`}>
                <Icon className={`h-5 w-5 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  {cat.name}
                  {isSelected && <Sparkles className="h-3 w-3 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{cat.description}</p>
              </div>
            </div>

            <Badge 
              variant="secondary" 
              className={`absolute top-2 right-2 text-[10px] transition-all ${
                isSelected ? 'bg-primary/20 text-primary border-primary/30' : ''
              }`}
            >
              {CREDIT_COSTS[cat.id as CreativeCategory]} cr
            </Badge>
          </motion.button>
        );
      })}
    </div>
    </>
  );
}

export { CATEGORIES };
