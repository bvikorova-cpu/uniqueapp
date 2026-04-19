import { motion } from "framer-motion";

export const TypingIndicator = ({ name }: { name: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-muted/40 backdrop-blur-md border border-border/40 self-start max-w-fit"
  >
    <span className="text-xs text-muted-foreground italic">{name} is typing</span>
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  </motion.div>
);
