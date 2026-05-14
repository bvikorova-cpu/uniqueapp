import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSuperChats } from "@/hooks/useSuperChats";

interface Props {
  streamId: string;
}

export const SuperChatFeed = ({ streamId }: Props) => {
  const { superChats } = useSuperChats(streamId);

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {superChats.slice(0, 10).map((sc) => (
          <motion.div
            key={sc.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg p-3 border-l-4 backdrop-blur-md"
            style={{
              borderColor: sc.highlight_color,
              background: `linear-gradient(90deg, ${sc.highlight_color}33, transparent)`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> €{(sc.amount_cents / 100).toFixed(2)}
              </span>
            </div>
            {sc.message && <p className="text-sm mt-1">{sc.message}</p>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
