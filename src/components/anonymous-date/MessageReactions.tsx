import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { MessageReaction } from "@/hooks/useAnonymousChat";

const EMOJIS = ["❤️", "🔥", "😂", "😍", "🤯", "👀"];

interface Props {
  messageId: string;
  reactions: MessageReaction[];
  currentUserId: string;
  onToggle: (messageId: string, emoji: string) => void;
  align?: "left" | "right";
}

export const MessageReactions = ({ messageId, reactions, currentUserId, onToggle, align = "left" }: Props) => {
  const [open, setOpen] = useState(false);

  const grouped = reactions.reduce<Record<string, { count: number; mine: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
    acc[r.emoji].count++;
    if (r.user_id === currentUserId) acc[r.emoji].mine = true;
    return acc;
  }, {});

  return (
    <div className={`relative flex items-center gap-1 mt-1 ${align === "right" ? "justify-end" : "justify-start"}`}>
      {Object.entries(grouped).map(([emoji, { count, mine }]) => (
        <motion.button
          key={emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => onToggle(messageId, emoji)}
          className={`text-xs px-2 py-0.5 rounded-full border backdrop-blur-md transition-colors ${
            mine ? "bg-primary/25 border-primary/60" : "bg-card/60 border-border/40 hover:border-primary/40"
          }`}
        >
          {emoji} {count}
        </motion.button>
      ))}

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setOpen(o => !o)}
              className="text-muted-foreground hover:text-primary transition p-1 rounded-full"
              aria-label="Add reaction"
            >
              <Smile className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[10px]">React with an emoji</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            className={`absolute z-20 ${align === "right" ? "right-0" : "left-0"} -top-10 flex gap-1 p-1.5 rounded-full bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl`}
          >
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => { onToggle(messageId, e); setOpen(false); }}
                className="hover:scale-125 transition-transform text-lg"
              >
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
