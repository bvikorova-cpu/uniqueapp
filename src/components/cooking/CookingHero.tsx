import { motion } from "framer-motion";
import heroVideo from "@/assets/cooking-hero.mp4.asset.json";
import { useLiveStats } from "@/hooks/useLiveStats";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const statQueries = [
  { key: "recipes", table: "activity_feed" },
  { key: "credits", table: "ai_credits" },
  { key: "logs", table: "activity_logs" },
];

export default function CookingHero() {
  const { stats, loading } = useLiveStats(statQueries);

  const heroStats = [
    { label: "Recipes", value: "25+" },
    { label: "AI Tools", value: "12" },
    { label: "Active Chefs", value: loading ? "—" : (stats.credits || 0).toString() },
    { label: "Meals Cooked", value: loading ? "—" : (stats.logs || 0).toString() },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Cooking Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Cooking Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Cooking Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[340px] md:h-[420px] rounded-2xl overflow-hidden mb-8">
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[1.15] saturate-[1.2]"
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-3xl md:text-5xl font-black mb-2"
          style={{
            WebkitTextStroke: "1.5px rgba(0,0,0,0.3)",
            textShadow: "0 0 30px rgba(249,115,22,0.6), 0 0 60px rgba(249,115,22,0.3)",
            background: "linear-gradient(135deg, #f97316, #ef4444, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🍳 AI Culinary Academy
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-sm md:text-base text-white/90 max-w-xl mb-4"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
        >
          Master the art of cooking with AI-powered recipe generation, meal planning, 
          and real-time culinary coaching from world-class virtual chefs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {heroStats.map((s, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-center">
              <div className="text-xl md:text-2xl font-black text-orange-400">{s.value}</div>
              <div className="text-[10px] md:text-xs text-white/70 font-medium">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
}
