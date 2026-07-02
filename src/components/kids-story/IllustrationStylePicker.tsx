import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface IllustrationStylePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const STYLES = [
  { value: "storybook", label: "Storybook Classic", emoji: "📖", desc: "Warm, traditional illustrations" },
  { value: "watercolor", label: "Watercolor", emoji: "🎨", desc: "Soft, flowing brushstrokes" },
  { value: "cartoon", label: "Cartoon", emoji: "🖍️", desc: "Bold, colorful and fun" },
  { value: "pixel-art", label: "Pixel Art", emoji: "👾", desc: "Retro 8-bit game style" },
  { value: "anime", label: "Anime", emoji: "⛩️", desc: "Japanese animation style" },
  { value: "3d-render", label: "3D Render", emoji: "🎬", desc: "Pixar-like 3D look" },
];

export const IllustrationStylePicker = ({ value, onChange }: IllustrationStylePickerProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Illustration Style Picker - How it works"} steps={[{ title: 'Open', desc: 'Access the Illustration Style Picker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Illustration Style Picker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Illustration Style</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STYLES.map((style) => (
          <motion.button
            key={style.value}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(style.value)}
            className={`p-3 rounded-xl text-left border-2 transition-all ${
              value === style.value
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border/50 hover:border-border bg-card/50"
            }`}
          >
            <span className="text-2xl">{style.emoji}</span>
            <p className={`text-xs font-bold mt-1 ${value === style.value ? "text-primary" : "text-foreground"}`}>
              {style.label}
            </p>
            <p className="text-[10px] text-muted-foreground">{style.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
};
