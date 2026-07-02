import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, Clock, MapPin, Star, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PastLife {
  id: string;
  era: string;
  location: string;
  name: string;
  story: string;
  karmic_theme: string;
  created_at: string;
}

export const PastLifeGallery = () => {
  const { toast } = useToast();
  const [lives, setLives] = useState<PastLife[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLife, setSelectedLife] = useState<PastLife | null>(null);

  useEffect(() => {
    loadLives();
  }, []);

  const loadLives = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("past_life_readings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setLives(data.map((r: any) => ({
          id: r.id,
          era: r.era || "Unknown Era",
          location: (r.reading_result as any)?.location || "Unknown",
          name: (r.reading_result as any)?.occupation || "Past Life",
          story: (r.reading_result as any)?.story || r.reading_type || "",
          karmic_theme: (r.reading_result as any)?.karmic_lesson || "Growth",
          created_at: r.created_at,
        })));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLife = async (id: string) => {
    try {
      const { error } = await supabase.from("past_life_readings").delete().eq("id", id);
      if (error) throw error;
      setLives((prev) => prev.filter((l) => l.id !== id));
      if (selectedLife?.id === id) setSelectedLife(null);
      toast({ title: "Reading removed" });
    } catch (error) {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Past Life Gallery'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Gallery panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
      </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">Past Life Gallery</h3>
        <p className="text-sm text-muted-foreground">
          Your collection of all discovered past lives. Click on any life to view its full story,
          key events, and karmic lessons. Use the Past Life Regression tool to add more discoveries.
        </p>
      </Card>

      {lives.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <ImageIcon className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground mb-1">No past lives discovered yet</p>
          <p className="text-xs text-muted-foreground">Use the Past Life Regression tool to begin exploring</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lives.map((life, i) => (
            <motion.div
              key={life.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`p-4 cursor-pointer bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all ${
                  selectedLife?.id === life.id ? "border-primary/50 shadow-lg shadow-primary/10" : ""
                }`}
                onClick={() => setSelectedLife(selectedLife?.id === life.id ? null : life)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-sm">{life.name}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); deleteLife(life.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Clock className="h-3 w-3" />{life.era}
                  <MapPin className="h-3 w-3 ml-1" />{life.location}
                </div>
                <Badge variant="outline" className="text-[10px]">
                  <Star className="h-2.5 w-2.5 mr-1" />{life.karmic_theme}
                </Badge>

                {selectedLife?.id === life.id && life.story && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-3 pt-3 border-t border-border/30"
                  >
                    <p className="text-xs text-muted-foreground leading-relaxed">{life.story}</p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
