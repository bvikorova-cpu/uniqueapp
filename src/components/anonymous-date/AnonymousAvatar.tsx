import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  seed: string;
  size?: number;
  online?: boolean;
}

// 100% client-side anonymous avatar via DiceBear (free CDN)
export const AnonymousAvatar = ({ seed, size = 40, online }: Props) => {
  const url = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <FloatingHowItWorks
        title={"Anonymous Avatar"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <motion.img
        src={url}
        alt={`${seed} avatar`}
        loading="lazy"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-full border-2 border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.3)] object-cover"
        style={{ width: size, height: size }}
      />
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
            online ? "bg-emerald-500" : "bg-muted-foreground/40"
          }`}
        />
      )}
    </div>
  );
};
