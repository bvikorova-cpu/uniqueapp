import { CreativeCategory } from "@/hooks/useCreativeForgeCredits";

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
  ],
  screenplay: [
    { label: "Thriller Opening", title: "The Last Signal", genre: "Thriller", mood: "Tense, Mysterious", description: "Opening scene of a tech thriller where a programmer discovers encrypted messages in satellite data", characters: "Dr. Sarah Chen - brilliant but paranoid programmer; Marcus - her skeptical colleague", setting: "Underground research lab, 2025", styleReference: "Christopher Nolan" },
    { label: "Romantic Comedy", title: "Wrong Coffee", genre: "Romantic Comedy", mood: "Light, Funny", description: "Two strangers keep accidentally getting each other's coffee orders at the same café", characters: "Alex - clumsy architect; Jamie - organized event planner", setting: "Cozy downtown café, present day", styleReference: "Nora Ephron" },
  ],
  novel_chapter: [
    { label: "Fantasy Quest", title: "The Ember Crown", genre: "Fantasy", mood: "Epic, Mysterious", description: "A young mapmaker discovers their maps predict the future and must find a legendary crown before a dark empire does", characters: "Kira - a mapmaker's apprentice with hidden power; Thorne - a rogue knight seeking redemption", setting: "Medieval fantasy world with ancient ruins", styleReference: "J.K. Rowling" },
  ],
  poetry: [
    { label: "Nature Poem", title: "Morning Fog", genre: "Free Verse", mood: "Peaceful, Contemplative", description: "A poem about the quiet beauty of morning fog lifting over a lake", characters: "", setting: "", styleReference: "Robert Frost" },
  ],
  standup: [
    { label: "Tech Humor", title: "My Smart Home Hates Me", genre: "Observational Comedy", mood: "Sarcastic, Relatable", description: "A set about the absurdity of smart home devices that make life harder", characters: "", setting: "", styleReference: "John Mulaney" },
  ],
  ad_copy: [
    { label: "Product Launch", title: "EcoBottle Launch", genre: "Product Marketing", mood: "Inspiring, Modern", description: "Launch campaign for a self-cleaning water bottle made from 100% ocean plastic", characters: "", setting: "", styleReference: "Apple Style" },
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
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Quick Templates</p>
      <div className="flex flex-wrap gap-2">
        {categoryTemplates.map((t) => (
          <button
            key={t.label}
            onClick={() => onApply(t)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20 transition-colors"
          >
            ✨ {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
