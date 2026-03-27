import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Music, Film, Theater, BookOpen, Feather, Mic2, Podcast, Megaphone } from "lucide-react";
import { CreativeCategory, CREDIT_COSTS } from "@/hooks/useCreativeForgeCredits";

const CATEGORIES = [
  { id: "song_lyrics", name: "Song Lyrics", icon: Music, description: "Professional lyrics with verses & chorus", emoji: "🎵" },
  { id: "screenplay", name: "Screenplay", icon: Film, description: "Hollywood-format scripts", emoji: "🎬" },
  { id: "theater_play", name: "Theater Play", icon: Theater, description: "Stage plays with directions", emoji: "🎭" },
  { id: "novel_chapter", name: "Novel Chapter", icon: BookOpen, description: "Compelling prose & storytelling", emoji: "📖" },
  { id: "poetry", name: "Poetry", icon: Feather, description: "Poems in various forms", emoji: "✨" },
  { id: "standup", name: "Stand-up", icon: Mic2, description: "Comedy routines & punchlines", emoji: "🎤" },
  { id: "podcast_script", name: "Podcast", icon: Podcast, description: "Engaging podcast scripts", emoji: "🎙️" },
  { id: "ad_copy", name: "Ad Copy", icon: Megaphone, description: "Persuasive advertising", emoji: "📢" },
];

interface ForgeCategorySelectorProps {
  selected: CreativeCategory;
  onSelect: (cat: CreativeCategory) => void;
}

export function ForgeCategorySelector({ selected, onSelect }: ForgeCategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {CATEGORIES.map((cat, i) => {
        const isSelected = selected === cat.id;
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2, scale: 1.02 }}
            onClick={() => onSelect(cat.id as CreativeCategory)}
            className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${
              isSelected
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                : "border-border/50 bg-card/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{cat.name}</div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
              {CREDIT_COSTS[cat.id as CreativeCategory]} cr
            </Badge>
          </motion.button>
        );
      })}
    </div>
  );
}

export { CATEGORIES };
