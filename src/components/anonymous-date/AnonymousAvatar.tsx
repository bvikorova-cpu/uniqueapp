import { motion } from "framer-motion";

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
