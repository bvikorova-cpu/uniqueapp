import { motion } from "framer-motion";
import { CheckCircle, PartyPopper, Heart } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const SUCCESS_PLACEHOLDERS = [
  {
    emoji: "🎉",
    title: "Goal Reached — Treatment Started",
    desc: "A campaign successfully funded a life-changing medical procedure",
    raised: "€12,400",
    donors: 187,
  },
  {
    emoji: "💪",
    title: "Surgery Funded Successfully",
    desc: "Community donors came together to cover surgery costs",
    raised: "€8,750",
    donors: 124,
  },
  {
    emoji: "❤️‍🩹",
    title: "Recovery in Progress",
    desc: "Thanks to generous donors, treatment is underway",
    raised: "€5,200",
    donors: 93,
  },
];

export function MedicalSuccessStories() {
  return (
    <>
      <FloatingHowItWorks title={"Medical Success Stories - How it works"} steps={[{ title: 'Open', desc: 'Access the Medical Success Stories section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Medical Success Stories.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <PartyPopper className="w-5 h-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Success Stories</h2>
        </div>

        <p className="text-sm text-muted-foreground text-center mb-6 max-w-lg mx-auto">
          Real campaigns that reached their goals — your donations make this possible
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUCCESS_PLACEHOLDERS.map((story, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 text-center"
            >
              <motion.span
                className="text-3xl block mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              >
                {story.emoji}
              </motion.span>

              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold mb-2">
                <CheckCircle className="w-3 h-3" /> Funded
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1">{story.title}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 leading-tight">{story.desc}</p>

              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{story.raised}</span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {story.donors}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
