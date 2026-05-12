// 13 standardized emotion categories (MeowTalk/Bowlingual style)
export const PET_EMOTIONS = [
  { key: "happy",       label: "Happy",       emoji: "😸" },
  { key: "hunger",      label: "Hunger",      emoji: "🍽️" },
  { key: "attention",   label: "Attention",   emoji: "👀" },
  { key: "play",        label: "Play",        emoji: "🎾" },
  { key: "resting",     label: "Resting",     emoji: "😴" },
  { key: "hunting",     label: "Hunting",     emoji: "🐭" },
  { key: "mating",      label: "Mating",      emoji: "💞" },
  { key: "pain",        label: "Pain",        emoji: "🤕" },
  { key: "fear",        label: "Fear",        emoji: "😨" },
  { key: "anger",       label: "Anger",       emoji: "😾" },
  { key: "warning",     label: "Warning",     emoji: "⚠️" },
  { key: "greeting",    label: "Greeting",    emoji: "👋" },
  { key: "lonely",      label: "Lonely",      emoji: "💭" },
] as const;

export type PetEmotionKey = (typeof PET_EMOTIONS)[number]["key"];

export default function PetEmotionPicker({ value, onChange }: { value?: PetEmotionKey | null; onChange: (k: PetEmotionKey) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PET_EMOTIONS.map((e) => (
        <button key={e.key} type="button" onClick={() => onChange(e.key)}
          className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
            value === e.key ? "bg-primary text-primary-foreground border-primary" : "border-border/40 hover:border-primary/40"
          }`}>
          <span className="mr-1">{e.emoji}</span>{e.label}
        </button>
      ))}
    </div>
  );
}
