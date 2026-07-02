import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const load = async () => {
    const { data } = await (supabase as any)
      .from("mt_submission_reactions")
      .select("emoji,user_id")
      .eq("submission_id", submissionId);
    const c: Record<string, number> = {};
    const m = new Set<string>();
    (data || []).forEach((r: any) => {
      c[r.emoji] = (c[r.emoji] || 0) + 1;
      if (userId && r.user_id === userId) m.add(r.emoji);
    });
    setCounts(c);
    setMine(m);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`mt-reactions-${submissionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mt_submission_reactions", filter: `submission_id=eq.${submissionId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId, userId]);

  const react = async (emoji: string) => {
    if (!userId) {
      toast.error("Sign in to react");
      return;
    }
    if (busy) return;
    setBusy(emoji);
    const had = mine.has(emoji);
    // optimistic
    setMine((prev) => {
      const n = new Set(prev);
      had ? n.delete(emoji) : n.add(emoji);
      return n;
    });
    setCounts((prev) => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] || 0) + (had ? -1 : 1)) }));
    try {
      if (had) {
        await (supabase as any)
          .from("mt_submission_reactions")
          .delete()
          .eq("submission_id", submissionId)
          .eq("user_id", userId)
          .eq("emoji", emoji);
      } else {
        await (supabase as any)
          .from("mt_submission_reactions")
          .insert({ submission_id: submissionId, user_id: userId, emoji });
      }
    } catch (e: any) {
      toast.error("Reaction failed", { description: e?.message });
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTIONS.map((r) => (
        <motion.button
          key={r.emoji}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => react(r.emoji)}
          disabled={busy === r.emoji}
          aria-label={r.label}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
            mine.has(r.emoji) ? "bg-accent/20 border-accent/50" : "bg-muted/30 border-border/30 hover:bg-muted/50"
          }`}
        >
          <span className="text-base leading-none">{r.emoji}</span>
          <span className="font-semibold">{counts[r.emoji] || 0}</span>
        </motion.button>
      ))}
    </div>
  );
}
