import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const categories = [
  { key: "medical",   label: "Medical",        emoji: "💊", route: "/fundraising/medical",  desc: "Treatments & surgeries", gradient: "from-rose-500/20 to-pink-500/10",      border: "border-rose-500/30",    glow: "shadow-[0_0_30px_-10px_rgba(244,63,94,0.4)]" },
  { key: "crisis",    label: "Crisis Relief",  emoji: "🆘", route: "/fundraising/crisis",   desc: "Emergencies & disasters", gradient: "from-red-600/20 to-orange-500/10",     border: "border-red-500/30",     glow: "shadow-[0_0_30px_-10px_rgba(239,68,68,0.4)]" },
  { key: "pet",       label: "Pet Rescue",     emoji: "🐾", route: "/fundraising/pet",      desc: "Animals in need",        gradient: "from-amber-500/20 to-orange-500/10",   border: "border-amber-500/30",   glow: "shadow-[0_0_30px_-10px_rgba(245,158,11,0.4)]" },
  { key: "student",   label: "Students",       emoji: "🎓", route: "/fundraising/student",  desc: "Education funding",      gradient: "from-blue-500/20 to-indigo-500/10",    border: "border-blue-500/30",    glow: "shadow-[0_0_30px_-10px_rgba(59,130,246,0.4)]" },
  { key: "dream",     label: "Dream Maker",    emoji: "✨", route: "/fundraising/dream",    desc: "Make wishes real",       gradient: "from-purple-500/20 to-fuchsia-500/10", border: "border-purple-500/30",  glow: "shadow-[0_0_30px_-10px_rgba(168,85,247,0.4)]" },
  { key: "hero",      label: "Community Hero", emoji: "🦸", route: "/fundraising/hero",     desc: "Local heroes",           gradient: "from-emerald-500/20 to-green-500/10",  border: "border-emerald-500/30", glow: "shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)]" },
  { key: "talent",    label: "Talent",         emoji: "🎭", route: "/fundraising/talent",   desc: "Sponsor artists",        gradient: "from-cyan-500/20 to-sky-500/10",       border: "border-cyan-500/30",    glow: "shadow-[0_0_30px_-10px_rgba(6,182,212,0.4)]" },
];

export function FundraisingCategoryCards() {
  const navigate = useNavigate();

  return (
    <>
      <FloatingHowItWorks title={"Fundraising Category Cards - How it works"} steps={[{ title: 'Open', desc: 'Access the Fundraising Category Cards section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Fundraising Category Cards.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black mb-2">
            <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              Browse Categories
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">Pick a cause and start making impact today</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(cat.route)}
              className={`group relative bg-gradient-to-br ${cat.gradient} backdrop-blur-sm border ${cat.border} rounded-2xl p-5 text-left transition-all hover:${cat.glow} ${cat.glow}`}
            >
              <motion.span
                className="text-4xl block mb-2"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.4 }}
              >
                {cat.emoji}
              </motion.span>
              <h3 className="font-bold text-base text-foreground mb-1">{cat.label}</h3>
              <p className="text-xs text-muted-foreground">{cat.desc}</p>
              <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-muted-foreground/40 group-hover:text-amber-500 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
