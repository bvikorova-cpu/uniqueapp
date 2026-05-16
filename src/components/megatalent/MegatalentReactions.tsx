import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  submissionId: string;
}

const REACTIONS = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "😍", label: "Love" },
  { emoji: "🎉", label: "Party" },
  { emoji: "👏", label: "Clap" },
  { emoji: "🤯", label: "Mind blown" },
];

export default function MegatalentReactions({ submissionId }: Props) {
  const storageKey = `mt_reactions_${submissionId}`;
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCounts(parsed.counts || {});
        setPicked(parsed.picked || null);
      } else {
        // Seed pseudo-random counts so feed feels alive
        const seed: Record<string, number> = {};
        REACTIONS.forEach((r) => (seed[r.emoji] = Math.floor(Math.random() * 25)));
        setCounts(seed);
      }
    } catch {}
  }, [storageKey]);

  const react = (emoji: string) => {
    setCounts((prev) => {
      const next = { ...prev };
      if (picked === emoji) {
        next[emoji] = Math.max(0, (next[emoji] || 1) - 1);
        setPicked(null);
        try { localStorage.setItem(storageKey, JSON.stringify({ counts: next, picked: null })); } catch {}
      } else {
        if (picked) next[picked] = Math.max(0, (next[picked] || 1) - 1);
        next[emoji] = (next[emoji] || 0) + 1;
        setPicked(emoji);
        try { localStorage.setItem(storageKey, JSON.stringify({ counts: next, picked: emoji })); } catch {}
      }
      return next;
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTIONS.map((r) => (
        <motion.button
          key={r.emoji}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => react(r.emoji)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
            picked === r.emoji
              ? "bg-accent/20 border-accent/50"
              : "bg-muted/30 border-border/30 hover:bg-muted/50"
          }`}
        >
          <span className="text-base leading-none">{r.emoji}</span>
          <span className="font-semibold">{counts[r.emoji] || 0}</span>
        </motion.button>
      ))}
    </div>
  );
}
