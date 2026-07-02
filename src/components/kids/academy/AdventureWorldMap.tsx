import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PenTool, FlaskConical, Palette, BookOpen, Calculator, Briefcase, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { recordModuleVisit } from "@/lib/kidsAcademyEconomy";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const worlds = [
  {
    id: "story",
    name: "Story Island",
    emoji: "📖",
    icon: PenTool,
    description: "Create magical AI stories",
    path: "/kids-story-creator",
    gradient: "from-violet-500/20 to-pink-500/20",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/20",
    features: ["AI Illustrations", "Story Library"],
  },
  {
    id: "science",
    name: "Science Volcano",
    emoji: "🌋",
    icon: FlaskConical,
    description: "Virtual experiments & discoveries",
    path: "/kids-science-lab",
    gradient: "from-emerald-500/20 to-green-500/20",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    features: ["5 Categories", "AI Analysis"],
  },
  {
    id: "art",
    name: "Art Rainbow",
    emoji: "🌈",
    icon: Palette,
    description: "Learn to draw step by step",
    path: "/kids-drawing-buddy",
    gradient: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    features: ["Step-by-Step", "Canvas Tools"],
  },
  {
    id: "reading",
    name: "Reading Castle",
    emoji: "🏰",
    icon: BookOpen,
    description: "Understand texts & build vocabulary",
    path: "/kids-reading-companion",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
    features: ["Text Analysis", "Quiz Mode"],
  },
  {
    id: "homework",
    name: "Homework Treehouse",
    emoji: "🏠",
    icon: Calculator,
    description: "AI homework helper for all subjects",
    path: "/kids-homework-helper",
    gradient: "from-rose-500/20 to-pink-500/20",
    border: "border-rose-500/30",
    glow: "shadow-rose-500/20",
    features: ["Math", "Spelling", "Science"],
  },
  {
    id: "career",
    name: "Career Compass",
    emoji: "🧭",
    icon: Briefcase,
    description: "Discover your future career (13-18y)",
    path: "/teen-career-counselor",
    gradient: "from-indigo-500/20 to-purple-500/20",
    border: "border-indigo-500/30",
    glow: "shadow-indigo-500/20",
    features: ["AI Guidance", "Teens 13-18"],
  },
];

export const AdventureWorldMap = () => {
  const navigate = useNavigate();

  return (
    <>
      <FloatingHowItWorks title={"Adventure World Map - How it works"} steps={[{ title: 'Open', desc: 'Access the Adventure World Map section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Adventure World Map.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
          🗺️ Adventure World Map
        </h2>
        <p className="text-sm text-muted-foreground">Choose your destination and start exploring!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {worlds.map((world, i) => {
          const Icon = world.icon;
          return (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { recordModuleVisit(world.id); navigate(world.path); }}
              className={`relative cursor-pointer rounded-2xl bg-gradient-to-br ${world.gradient} backdrop-blur-sm border-2 ${world.border} p-5 shadow-lg ${world.glow} hover:shadow-xl transition-shadow`}
            >
              {/* Parent check badge */}
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-muted-foreground/30">
                  <Shield className="w-2.5 h-2.5 mr-0.5" />
                  Safe
                </Badge>
              </div>

              {/* World icon */}
              <div className="flex items-center gap-3 mb-3">
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                >
                  {world.emoji}
                </motion.span>
                <div>
                  <h3 className="font-bold text-foreground text-lg leading-tight">{world.name}</h3>
                  <p className="text-xs text-muted-foreground">{world.description}</p>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1.5">
                {world.features.map(f => (
                  <Badge key={f} variant="secondary" className="text-[10px]">
                    {f}
                  </Badge>
                ))}
              </div>

              {/* Enter arrow */}
              <div className="mt-3 text-xs font-semibold text-primary flex items-center gap-1">
                Enter World →
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
};
