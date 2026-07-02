import { useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface FlipBenefitCardProps {
  icon: LucideIcon;
  emoji: string;
  title: string;
  shortDesc: string;
  details: string[];
  color: string;
}

export function FlipBenefitCard({ icon: Icon, emoji, title, shortDesc, details, color }: FlipBenefitCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <>
      <FloatingHowItWorks title={"Flip Benefit Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Flip Benefit Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Flip Benefit Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div
      className="perspective-1000 h-56 cursor-pointer"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-2xl border border-border/50 p-6 flex flex-col items-center justify-center gap-3 bg-gradient-to-br ${color} shadow-lg`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-4xl">{emoji}</span>
          <h3 className="font-bold text-lg text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground text-center">{shortDesc}</p>
          <span className="text-xs text-muted-foreground/60 mt-auto">Hover to see more →</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border border-primary/30 p-5 flex flex-col bg-card shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
          <ul className="space-y-1.5 flex-1 overflow-auto">
            {details.map((d, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-primary mt-0.5">✦</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
    </>
  );
}
