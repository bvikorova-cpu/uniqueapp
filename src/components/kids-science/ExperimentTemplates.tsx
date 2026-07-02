import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Template {
  title: string;
  icon: string;
  category: string;
  hypothesis: string;
  observations: string;
}

const templates: Template[] = [
  {
    title: "Vinegar Volcano",
    icon: "🌋",
    category: "chemistry",
    hypothesis: "I think that when I mix vinegar and baking soda, it will bubble and foam like a volcano.",
    observations: "When I poured vinegar onto the baking soda, a large foam formed, it bubbled and the foam started flowing out of the container.",
  },
  {
    title: "Plant in the Dark",
    icon: "🌱",
    category: "biology",
    hypothesis: "I think that a plant in the dark will grow slower than a plant in the light.",
    observations: "After 2 weeks, the plant in the dark was yellow and weak, while the one in the light was green and strong.",
  },
  {
    title: "Colorful Milk",
    icon: "🎨",
    category: "chemistry",
    hypothesis: "I think that when I add dish soap to milk with food coloring, the colors will move.",
    observations: "When I dropped the dish soap, the colors started moving quickly and mixing into psychedelic patterns.",
  },
  {
    title: "Magnets and Metals",
    icon: "🧲",
    category: "physics",
    hypothesis: "I think that a magnet will attract all metals.",
    observations: "The magnet attracted a paper clip and nails, but did not attract aluminum foil or a copper coin.",
  },
  {
    title: "Solar System",
    icon: "🪐",
    category: "astronomy",
    hypothesis: "I think that Jupiter is the largest planet in the solar system.",
    observations: "According to images and data, Jupiter is indeed the largest. More than 1,300 Earths could fit inside Jupiter.",
  },
  {
    title: "Earthquakes",
    icon: "🏔️",
    category: "earth",
    hypothesis: "I think that earthquakes occur at the edges of tectonic plates.",
    observations: "On the earthquake map, I can see that most points are along lines where tectonic plates meet.",
  },
];

interface ExperimentTemplatesProps {
  onSelect: (template: Template) => void;
}

export const ExperimentTemplates = ({ onSelect }: ExperimentTemplatesProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Experiment Templates - How it works"} steps={[{ title: 'Open', desc: 'Access the Experiment Templates section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Experiment Templates.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        ⚡ Quick Start — Choose an Experiment
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map((t, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(t)}
            className="p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/50 text-left transition-all hover:shadow-md"
          >
            <span className="text-2xl block mb-2">{t.icon}</span>
            <span className="font-semibold text-sm block">{t.title}</span>
            <span className="text-xs text-muted-foreground capitalize">{t.category}</span>
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
};