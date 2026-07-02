import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface LifeNode {
  era: string;
  location: string;
  role: string;
  lesson: string;
  year_range: string;
}

export const SoulJourneyMap = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [journeyNodes, setJourneyNodes] = useState<LifeNode[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadJourneyHistory();
  }, []);

  const loadJourneyHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingHistory(false); return; }

      const { data } = await supabase
        .from("past_life_readings")
        .select("reading_result, era, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(20);

      if (data && data.length > 0) {
        const nodes: LifeNode[] = data.map((r: any) => ({
          era: r.era || "Unknown Era",
          location: (r.reading_result as any)?.location || "Unknown",
          role: (r.reading_result as any)?.occupation || "Unknown",
          lesson: (r.reading_result as any)?.karmic_lesson || "Self-discovery",
          year_range: r.era || "Ancient",
        }));
        setJourneyNodes(nodes);
      }
    } catch (error) {
      console.error("Error loading journey:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateNewLife = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-past-life-regression");
      if (error) throw error;

      const newNode: LifeNode = {
        era: data.regression?.life_era || "Unknown",
        location: data.regression?.life_location || "Unknown",
        role: data.regression?.life_name || "Unknown",
        lesson: data.regression?.karmic_theme || "Growth",
        year_range: data.regression?.life_era || "Ancient",
      };
      setJourneyNodes((prev) => [...prev, newNode]);
      toast({ title: "New past life discovered!", description: `${newNode.role} in ${newNode.location}` });
    } catch (error) {
      toast({ title: "Discovery failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingHistory) {
    return (
      <>
        <FloatingHowItWorks
          title='Soul Journey Map'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Soul Journey Map panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-3">Loading your soul journey...</p>
      </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">Soul Journey Map</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Visualize your soul's migration through lifetimes. Each node represents a discovered past life
          with its era, location, role, and karmic lesson learned.
        </p>
        <Button onClick={generateNewLife} disabled={loading} className="w-full sm:w-auto">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Discovering...</> : <><Sparkles className="mr-2 h-4 w-4" />Discover New Life</>}
        </Button>
      </Card>

      {journeyNodes.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <MapPin className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground">No lives discovered yet. Start your journey above!</p>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/20" />

          <div className="space-y-4">
            {journeyNodes.map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-14"
              >
                {/* Timeline dot */}
                <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/30 border-2 border-background" />

                <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm">{node.role}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{node.year_range}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{node.location}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Life #{i + 1}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Lesson: {node.lesson}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
