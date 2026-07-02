import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2 } from "lucide-react";
import { CreativeCategory } from "@/hooks/useCreativeForgeCredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export interface QuickTemplate {
  label: string;
  title: string;
  genre: string;
  mood: string;
  description: string;
  characters: string;
  setting: string;
  styleReference: string;
}

const templates: Partial<Record<CreativeCategory, QuickTemplate[]>> = {
  song_lyrics: [
    { label: "Love Ballad", title: "Fading Stars", genre: "Pop Ballad", mood: "Romantic, Melancholic", description: "A love song about a couple watching stars on their last night together", characters: "", setting: "", styleReference: "Ed Sheeran" },
    { label: "Upbeat Anthem", title: "Rise Up", genre: "Pop Rock", mood: "Empowering, Energetic", description: "An uplifting anthem about overcoming obstacles and believing in yourself", characters: "", setting: "", styleReference: "none" },
    { label: "Heartbreak", title: "Empty Room", genre: "R&B", mood: "Sad, Reflective", description: "A song about coming home to an empty apartment after a breakup", characters: "", setting: "", styleReference: "Adele" },
  ],
  screenplay: [
    { label: "Thriller Opening", title: "The Last Signal", genre: "Thriller", mood: "Tense, Mysterious", description: "Opening scene of a tech thriller where a programmer discovers encrypted messages in satellite data", characters: "Dr. Sarah Chen - brilliant but paranoid programmer; Marcus - her skeptical colleague", setting: "Underground research lab, 2025", styleReference: "Christopher Nolan" },
    { label: "Romantic Comedy", title: "Wrong Coffee", genre: "Romantic Comedy", mood: "Light, Funny", description: "Two strangers keep accidentally getting each other's coffee orders at the same café", characters: "Alex - clumsy architect; Jamie - organized event planner", setting: "Cozy downtown café, present day", styleReference: "Nora Ephron" },
    { label: "Horror Scene", title: "The Mirror", genre: "Horror", mood: "Creepy, Suspenseful", description: "A character realizes their reflection is moving independently", characters: "Mia - a young woman living alone in an old house", setting: "Victorian house, midnight", styleReference: "none" },
  ],
  novel_chapter: [
    { label: "Fantasy Quest", title: "The Ember Crown", genre: "Fantasy", mood: "Epic, Mysterious", description: "A young mapmaker discovers their maps predict the future and must find a legendary crown before a dark empire does", characters: "Kira - a mapmaker's apprentice with hidden power; Thorne - a rogue knight seeking redemption", setting: "Medieval fantasy world with ancient ruins", styleReference: "J.K. Rowling" },
    { label: "Sci-Fi Colony", title: "New Dawn", genre: "Science Fiction", mood: "Hopeful, Tense", description: "First chapter of humans arriving at a new planet after Earth becomes uninhabitable", characters: "Commander Eva Singh - reluctant leader; Dr. Okafor - optimistic biologist", setting: "Colony ship Artemis, orbiting Kepler-442b", styleReference: "none" },
  ],
  poetry: [
    { label: "Nature Poem", title: "Morning Fog", genre: "Free Verse", mood: "Peaceful, Contemplative", description: "A poem about the quiet beauty of morning fog lifting over a lake", characters: "", setting: "", styleReference: "Robert Frost" },
    { label: "Urban Haiku", title: "City Lights", genre: "Haiku Collection", mood: "Observational, Modern", description: "A series of haikus capturing moments in a bustling city at night", characters: "", setting: "", styleReference: "none" },
  ],
  standup: [
    { label: "Tech Humor", title: "My Smart Home Hates Me", genre: "Observational Comedy", mood: "Sarcastic, Relatable", description: "A set about the absurdity of smart home devices that make life harder", characters: "", setting: "", styleReference: "John Mulaney" },
    { label: "Dating Life", title: "Swipe Right", genre: "Storytelling Comedy", mood: "Self-deprecating, Witty", description: "Hilarious stories about the worst online dating experiences", characters: "", setting: "", styleReference: "Ali Wong" },
  ],
  podcast_script: [
    { label: "True Crime", title: "The Vanishing", genre: "True Crime", mood: "Mysterious, Gripping", description: "Episode about a small-town disappearance with unexpected twists", characters: "", setting: "", styleReference: "none" },
    { label: "Interview Format", title: "Founders Chat", genre: "Business Interview", mood: "Insightful, Conversational", description: "Interview script with a startup founder about their journey from failure to success", characters: "", setting: "", styleReference: "Tim Ferriss" },
  ],
  ad_copy: [
    { label: "Product Launch", title: "EcoBottle Launch", genre: "Product Marketing", mood: "Inspiring, Modern", description: "Launch campaign for a self-cleaning water bottle made from 100% ocean plastic", characters: "", setting: "", styleReference: "Apple Style" },
    { label: "SaaS Landing", title: "FlowSync Pro", genre: "SaaS Marketing", mood: "Professional, Compelling", description: "Landing page copy for a project management tool that uses AI to predict deadlines", characters: "", setting: "", styleReference: "none" },
  ],
  theater_play: [
    { label: "Family Drama", title: "The Last Supper", genre: "Drama", mood: "Emotional, Tense", description: "A family dinner where long-held secrets are revealed one by one", characters: "Helen - the matriarch hiding the biggest secret; Tom - the prodigal son returning after 10 years", setting: "Family dining room, Christmas Eve", styleReference: "Arthur Miller" },
  ],
};

interface ForgeTemplatesProps {
  category: CreativeCategory;
  onApply: (template: QuickTemplate) => void;
}

export function ForgeTemplates({ category, onApply }: ForgeTemplatesProps) {
  const categoryTemplates = templates[category];
  if (!categoryTemplates || categoryTemplates.length === 0) return null;

  return (
    <>
      <FloatingHowItWorks title={"Forge Templates - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Templates section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Templates.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnimatePresence mode="wait">
      <motion.div
        key={category}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="space-y-2.5"
      >
        <div className="flex items-center gap-2">
          <Wand2 className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">Quick Templates</p>
          <Badge variant="outline" className="text-[10px] py-0">
            {categoryTemplates.length} available
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryTemplates.map((t, i) => (
            <motion.button
              key={t.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onApply(t)}
              className="group relative px-3.5 py-2 rounded-xl text-xs font-medium bg-card/60 backdrop-blur-sm text-foreground border border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                {t.label}
              </span>
              
              {/* Tooltip preview */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-popover border border-border shadow-lg text-[11px] text-muted-foreground w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                <p className="font-semibold text-foreground text-xs mb-0.5">{t.title}</p>
                <p className="line-clamp-2">{t.description}</p>
                {t.styleReference && t.styleReference !== "none" && (
                  <p className="mt-1 text-primary text-[10px]">Style: {t.styleReference}</p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
    </>
  );
}
