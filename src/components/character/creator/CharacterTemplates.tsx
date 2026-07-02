import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Template {
  id: string;
  name: string;
  emoji: string;
  description: string;
  presets: {
    hair: string;
    power: string;
    eyes: string;
    costume: string;
    age: string;
    personality: string;
    gender: string;
    skin: string;
  };
}

const TEMPLATES: Template[] = [
  {
    id: "space-warrior",
    name: "Space Warrior",
    emoji: "🚀",
    description: "Cosmic hero with super speed",
    presets: { hair: "blue", power: "super-speed", eyes: "purple", costume: "blue", age: "teen", personality: "brave", gender: "hero", skin: "medium" },
  },
  {
    id: "fairy-princess",
    name: "Fairy Princess",
    emoji: "🧚",
    description: "Magical fairy with spells",
    presets: { hair: "pink", power: "magic-spells", eyes: "green", costume: "pink", age: "kid", personality: "kind", gender: "heroine", skin: "light" },
  },
  {
    id: "shadow-ninja",
    name: "Shadow Ninja",
    emoji: "🥷",
    description: "Invisible stealth master",
    presets: { hair: "black", power: "invisibility", eyes: "brown", costume: "purple", age: "teen", personality: "smart", gender: "champion", skin: "medium-dark" },
  },
  {
    id: "wild-ranger",
    name: "Wild Ranger",
    emoji: "🦁",
    description: "Talks to all animals",
    presets: { hair: "brown", power: "talking-to-animals", eyes: "hazel", costume: "gold", age: "kid", personality: "adventurous", gender: "hero", skin: "medium-light" },
  },
  {
    id: "sky-guardian",
    name: "Sky Guardian",
    emoji: "🦅",
    description: "Soars above the clouds",
    presets: { hair: "blonde", power: "flying", eyes: "blue", costume: "red", age: "young-adult", personality: "brave", gender: "heroine", skin: "dark" },
  },
  {
    id: "mega-titan",
    name: "Mega Titan",
    emoji: "💪",
    description: "Strongest hero alive",
    presets: { hair: "red", power: "super-strength", eyes: "rainbow", costume: "rainbow", age: "young-adult", personality: "funny", gender: "hero", skin: "medium" },
  },
];

interface CharacterTemplatesProps {
  onApplyTemplate: (presets: Template["presets"], name: string) => void;
}

export function CharacterTemplates({ onApplyTemplate }: CharacterTemplatesProps) {
  return (
    <>
      <FloatingHowItWorks title={"Character Templates - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Templates section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Templates.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-2xl">⚡</span> Quick Start Templates
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TEMPLATES.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onApplyTemplate(t.presets, t.name.replace(" ", ""))}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-purple-400 shadow-sm hover:shadow-lg transition-all text-left group"
          >
            <span className="text-3xl block mb-2 group-hover:animate-bounce">{t.emoji}</span>
            <p className="font-bold text-sm text-gray-800">{t.name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{t.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
}
