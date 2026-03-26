import { motion } from "framer-motion";

interface Template {
  title: string;
  icon: string;
  category: string;
  hypothesis: string;
  observations: string;
}

const templates: Template[] = [
  {
    title: "Sopka z octu",
    icon: "🌋",
    category: "chemistry",
    hypothesis: "Myslím, že keď zmiešam ocot a sódu bikarbónu, bude to bublať a peniť sa ako sopka.",
    observations: "Keď som nalial ocot na sódu, vznikla veľká pena, bublalo to a pena sa začala liať von z nádoby.",
  },
  {
    title: "Rastlina v tme",
    icon: "🌱",
    category: "biology",
    hypothesis: "Myslím, že rastlina v tme porastie pomalšie ako rastlina na svetle.",
    observations: "Po 2 týždňoch rastlina v tme bola žltá a slabá, zatiaľ čo tá na svetle bola zelená a silná.",
  },
  {
    title: "Farebné mlieko",
    icon: "🎨",
    category: "chemistry",
    hypothesis: "Myslím, že keď pridám saponát do mlieka s farbivom, farby sa budú pohybovať.",
    observations: "Keď som kvapol saponát, farby sa začali rýchlo pohybovať a miešať sa do psychedelických vzorov.",
  },
  {
    title: "Magnety a kovy",
    icon: "🧲",
    category: "physics",
    hypothesis: "Myslím, že magnet pritiahne všetky kovy.",
    observations: "Magnet pritiahol kancelársku sponku a klince, ale nepritiahol hliníkovú fóliu ani medenú mincu.",
  },
  {
    title: "Slnečná sústava",
    icon: "🪐",
    category: "astronomy",
    hypothesis: "Myslím, že Jupiter je najväčšia planéta v slnečnej sústave.",
    observations: "Podľa obrázkov a údajov je Jupiter naozaj najväčší. Do Jupitera by sa zmestilo viac ako 1300 Zemí.",
  },
  {
    title: "Zemetrasenie",
    icon: "🏔️",
    category: "earth",
    hypothesis: "Myslím, že zemetrasenia vznikajú pri okrajoch tektonických dosiek.",
    observations: "Na mape zemetrasení vidím, že väčšina bodov je pozdĺž línií, kde sa stretávajú tektonické dosky.",
  },
];

interface ExperimentTemplatesProps {
  onSelect: (template: Template) => void;
}

export const ExperimentTemplates = ({ onSelect }: ExperimentTemplatesProps) => {
  return (
    <div>
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        ⚡ Rýchly štart — vyber experiment
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
  );
};
