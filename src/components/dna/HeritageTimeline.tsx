import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Calendar, Sparkles, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface TimelineEntry {
  id: string;
  ancestor_name: string | null;
  ancestor_era: string | null;
  ancestor_location: string | null;
  memory_story: string | null;
  memory_type: string | null;
  historical_context: string | null;
  created_at: string | null;
}

export const HeritageTimeline = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data } = await supabase
        .from("ancestral_memories")
        .select("id, ancestor_name, ancestor_era, ancestor_location, memory_story, memory_type, historical_context, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      setEntries(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (entries.length === 0) {
    return (
      <>
        <FloatingHowItWorks
          title='Heritage Timeline'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Heritage Timeline panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-bold text-lg mb-2">No Heritage Data Yet</h3>
        <p className="text-sm text-muted-foreground">Complete a DNA Analysis to unlock your heritage timeline and trace your ancestral migration paths.</p>
      </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-5 h-5 text-emerald-500" />
          <span className="font-black text-sm">Ancestral Migration Path</span>
        </div>
        <p className="text-xs text-muted-foreground">{entries.length} ancestral connections discovered</p>
      </Card>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/30" />
        <div className="space-y-6">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-14"
            >
              <div className="absolute left-4 top-4 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background shadow-lg shadow-primary/30 z-10" />
              <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-bold text-sm">{entry.ancestor_name || "Unknown Ancestor"}</h3>
                  {entry.ancestor_era && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Calendar className="w-2.5 h-2.5" /> {entry.ancestor_era}
                    </Badge>
                  )}
                  {entry.ancestor_location && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {entry.ancestor_location}
                    </Badge>
                  )}
                </div>
                {entry.memory_story && (
                  <p className="text-xs text-muted-foreground italic mb-2 line-clamp-3">"{entry.memory_story}"</p>
                )}
                {entry.historical_context && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Historical Context</p>
                    <p className="text-xs text-muted-foreground">{entry.historical_context}</p>
                  </div>
                )}
                {entry.memory_type && (
                  <Badge className="mt-2 text-[10px] bg-primary/10 text-primary border-0">{entry.memory_type.replace("_", " ")}</Badge>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
