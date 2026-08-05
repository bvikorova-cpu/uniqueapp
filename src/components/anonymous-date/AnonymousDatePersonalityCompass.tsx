import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Compass, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const TRAITS = [
  { id: "adventurous", label: "Adventurous", emoji: "🌍", color: "from-orange-500 to-pink-500" },
  { id: "creative", label: "Creative", emoji: "🎨", color: "from-violet-500 to-purple-500" },
  { id: "intellectual", label: "Intellectual", emoji: "📚", color: "from-blue-500 to-cyan-500" },
  { id: "romantic", label: "Romantic", emoji: "💕", color: "from-pink-500 to-rose-500" },
  { id: "spiritual", label: "Spiritual", emoji: "🧘", color: "from-emerald-500 to-teal-500" },
  { id: "playful", label: "Playful", emoji: "🎭", color: "from-amber-500 to-yellow-500" },
  { id: "ambitious", label: "Ambitious", emoji: "🚀", color: "from-red-500 to-orange-500" },
  { id: "introverted", label: "Deep", emoji: "🌙", color: "from-indigo-500 to-violet-500" },
];

export const AnonymousDatePersonalityCompass = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [myTraits, setMyTraits] = useState<string[]>([]);

  const { data: counts, isLoading } = useQuery({
    queryKey: ["anon-date-trait-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_anon_date_trait_counts");
      if (error) throw error;
      const map: Record<string, number> = {};
      (data as { trait: string; user_count: number }[] | null)?.forEach((r) => {
        map[String(r.trait).toLowerCase()] = Number(r.user_count) || 0;
      });
      return map;
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase
        .from("anonymous_dating_profiles")
        .select("personality_traits")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (active) setMyTraits(((data?.personality_traits as string[] | null) ?? []).map((t) => t.toLowerCase()));
    })();
    return () => {
      active = false;
    };
  }, []);


  return (
    <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
      <FloatingHowItWorks
        title={"Anonymous Date Personality Compass"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-pink-500/20">
          <Compass className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-black text-base">Personality Compass</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Live trait map of active anonymous members {isLoading && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
      </p>

      <div className="grid grid-cols-4 gap-2">
        {TRAITS.map((t, i) => {
          const count = counts?.[t.id] ?? 0;
          const mine = myTraits.includes(t.id);
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.93 }}
              whileHover={{ y: -2 }}
              onClick={() => setSelected(t.id === selected ? null : t.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                selected === t.id
                  ? `bg-gradient-to-br ${t.color} text-white border-transparent shadow-lg`
                  : "bg-muted/20 border-border/40 hover:border-primary/40"
              } ${mine && selected !== t.id ? "ring-1 ring-primary/50" : ""}`}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-[9px] font-bold leading-tight text-center px-1">{t.label}</span>
              <span className="text-[9px] font-black opacity-80">{count}</span>
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-pink-500/10 border border-primary/20"
        >
          <p className="text-xs">
            <span className="font-bold text-primary">
              {counts?.[selected] ?? 0} active {(counts?.[selected] ?? 0) === 1 ? "member" : "members"}
            </span>{" "}
            share this trait{myTraits.includes(selected) ? " — including you" : ""}. Start a search to meet them anonymously.
          </p>
        </motion.div>
      )}

    </Card>
  );
};
