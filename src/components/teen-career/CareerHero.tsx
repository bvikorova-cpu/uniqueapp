import { motion } from "framer-motion";
import { Briefcase, Sparkles, Rocket, GraduationCap, Target, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const floatingEmojis = ["🎓", "💼", "🚀", "⭐", "🎯", "💡", "🏆", "📊"];

const emojiPositions = [
  { left: "2%", top: "2%" },
  { left: "3%", top: "28%" },
  { left: "88%", top: "5%" },
  { left: "90%", top: "25%" },
  { left: "2%", top: "50%" },
  { left: "92%", top: "48%" },
  { left: "5%", top: "75%" },
  { left: "88%", top: "72%" },
];

const mascots = [
  { icon: GraduationCap, color: "text-primary", label: "Education" },
  { icon: Briefcase, color: "text-accent", label: "Career" },
  { icon: Rocket, color: "text-primary", label: "Growth" },
];

export const CareerHero = () => {
  return (
    <>
      <FloatingHowItWorks title={"Career Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Career Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Career Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative text-center mb-8 overflow-hidden">
      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-xl sm:text-2xl pointer-events-none select-none"
          style={{
            left: emojiPositions[i].left,
            top: emojiPositions[i].top,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Orbital ring */}
      <div className="relative mx-auto w-32 h-32 mb-6">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-dashed border-accent/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center mascot */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Briefcase className="h-10 w-10 text-primary-foreground" />
        </motion.div>

        {/* Orbiting icons */}
        {mascots.map((m, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center shadow-md"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.5,
            }}
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: `${-20 + i * 5}px ${-20 + i * 5}px`,
            }}
          >
            <m.icon className={`h-4 w-4 ${m.color}`} />
          </motion.div>
        ))}
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-xs font-semibold text-primary">AI-Powered Career Discovery</span>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
          Career Counselor
          <br />
          <span className="text-2xl sm:text-3xl">(Ages 13-18)</span>
        </h1>
        
        <p className="text-muted-foreground max-w-lg mx-auto mb-4">
          Discover career paths that match your interests, strengths, and goals with AI-powered guidance
        </p>

        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Target className="h-4 w-4" />
          <span>1st Guidance FREE • Additional sessions €5 each</span>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        className="flex justify-center gap-6 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[
          { icon: TrendingUp, label: "Career Paths", value: "500+" },
          { icon: GraduationCap, label: "Students Helped", value: "10K+" },
          { icon: Target, label: "Match Accuracy", value: "95%" },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <stat.icon className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
    </>
  );
};
