import { motion } from "framer-motion";

const categories = [
  { key: "medical", label: "Medical", emoji: "💊", gradient: "from-red-500/10 to-pink-500/10", border: "border-red-500/20" },
  { key: "education", label: "Education", emoji: "🎓", gradient: "from-blue-500/10 to-indigo-500/10", border: "border-blue-500/20" },
  { key: "animals", label: "Animals", emoji: "🐾", gradient: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/20" },
  { key: "emergency", label: "Emergency", emoji: "🆘", gradient: "from-red-600/10 to-rose-500/10", border: "border-red-600/20" },
  { key: "community", label: "Community", emoji: "🤝", gradient: "from-green-500/10 to-emerald-500/10", border: "border-green-500/20" },
  { key: "environment", label: "Environment", emoji: "🌍", gradient: "from-teal-500/10 to-cyan-500/10", border: "border-teal-500/20" },
];

export function FundraisingCategoryCards() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-foreground mb-6 text-center">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-2xl p-5 text-center transition-shadow hover:shadow-lg`}
            >
              <motion.span
                className="text-3xl block mb-2"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              >
                {cat.emoji}
              </motion.span>
              <span className="text-sm font-bold text-foreground">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
