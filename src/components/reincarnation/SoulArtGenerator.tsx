import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Paintbrush, Download, Clock, MapPin, Star, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PastLifeForArt {
  id: string;
  era: string;
  location: string;
  name: string;
  story: string;
  karmic_theme: string;
}

const artStyles = [
  { id: "renaissance", label: "Renaissance Oil Painting" },
  { id: "watercolor", label: "Ethereal Watercolor" },
  { id: "digital", label: "Digital Fantasy Art" },
  { id: "stained-glass", label: "Stained Glass Window" },
  { id: "tarot", label: "Tarot Card Style" },
  { id: "mandala", label: "Sacred Mandala" },
  { id: "ukiyo-e", label: "Japanese Ukiyo-e" },
  { id: "art-nouveau", label: "Art Nouveau" },
];

export const SoulArtGenerator = () => {
  const { toast } = useToast();
  const [pastLives, setPastLives] = useState<PastLifeForArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedLife, setSelectedLife] = useState<string>("");
  const [artStyle, setArtStyle] = useState<string>("renaissance");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedArts, setGeneratedArts] = useState<{ prompt: string; style: string; life: string; timestamp: string }[]>([]);

  useEffect(() => {
    loadPastLives();
  }, []);

  const loadPastLives = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("past_life_readings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setPastLives(data.map((r: any) => ({
          id: r.id,
          era: r.era || "Unknown Era",
          location: (r.reading_result as any)?.location || "Unknown",
          name: (r.reading_result as any)?.occupation || "Past Life",
          story: (r.reading_result as any)?.story || "",
          karmic_theme: (r.reading_result as any)?.karmic_lesson || "Growth",
        })));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSoulArt = async () => {
    const life = pastLives.find(l => l.id === selectedLife);
    if (!life && !customPrompt) {
      toast({ title: "Select a past life or enter a custom description", variant: "destructive" });
      return;
    }

    setGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const styleLabel = artStyles.find(s => s.id === artStyle)?.label || artStyle;
      const baseDescription = life
        ? `A ${life.name} from ${life.era} in ${life.location}. Karmic theme: ${life.karmic_theme}. ${life.story.substring(0, 200)}`
        : customPrompt;

      const prompt = `Create a ${styleLabel} depicting a soul's past life: ${baseDescription}`;

      const { data, error } = await supabase.functions.invoke("create-reincarnation-plan", {
        body: {
          planName: `Soul Art: ${life?.name || "Custom Vision"}`,
          goalDescription: `Generate a detailed visual description for soul art in ${styleLabel} style. The scene depicts: ${baseDescription}. 
          Provide: 1) A vivid scene description (colors, composition, mood, symbolism) 2) Key symbolic elements 3) Emotional resonance 4) Spiritual meaning of the artwork.
          Format as a detailed art direction brief.`
        }
      });

      if (error) throw error;

      const newArt = {
        prompt: data?.plan?.next_life_goal || prompt,
        style: styleLabel,
        life: life?.name || "Custom Vision",
        timestamp: new Date().toISOString(),
      };

      setGeneratedArts(prev => [newArt, ...prev]);

      // Save to ai_generated_content for persistence
      await supabase.from("ai_generated_content").insert({
        user_id: user.id,
        content_type: "blog_article" as any,
        title: `Soul Art: ${life?.name || "Custom Vision"}`,
        prompt: prompt,
        generated_text: data?.plan?.next_life_goal || prompt,
        metadata: {
          type: "soul_art",
          art_style: styleLabel,
          source_life: life?.name || "Custom",
        },
      });

      toast({ title: "Soul Art Generated!", description: `${styleLabel} vision created for ${life?.name || "your custom vision"}` });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message || "Could not generate soul art", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Soul Art Generator'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Soul Art Generator panel from this page.' },
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
        <h3 className="text-lg font-black mb-2">Soul Art Generator</h3>
        <p className="text-sm text-muted-foreground">
          Transform your past life stories into vivid artistic visions. Select a discovered life and art style,
          and the AI will generate a detailed visual description of your soul's journey.
        </p>
      </Card>

      {/* Generator Controls */}
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50 space-y-4">
        <h4 className="font-bold text-sm flex items-center gap-2">
          <Paintbrush className="h-4 w-4 text-primary" /> Create New Soul Art
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Source Past Life</label>
            <Select value={selectedLife} onValueChange={setSelectedLife}>
              <SelectTrigger>
                <SelectValue placeholder="Select a past life..." />
              </SelectTrigger>
              <SelectContent>
                {pastLives.map(life => (
                  <SelectItem key={life.id} value={life.id}>
                    {life.name} - {life.era}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Art Style</label>
            <Select value={artStyle} onValueChange={setArtStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {artStyles.map(style => (
                  <SelectItem key={style.id} value={style.id}>{style.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Custom Description (optional - overrides past life selection)</label>
          <Textarea
            placeholder="Describe a spiritual scene or past life vision to transform into art..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={generateSoulArt} disabled={generating} className="w-full" size="lg">
          {generating ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Channeling Artistic Vision...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> Generate Soul Art</>
          )}
        </Button>
      </Card>

      {/* Art Style Preview Grid */}
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h4 className="font-bold text-sm mb-4">Available Art Styles</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {artStyles.map((style) => (
            <div
              key={style.id}
              className={`p-3 rounded-xl text-center cursor-pointer transition-all border ${
                artStyle === style.id
                  ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-border/30 bg-muted/10 hover:border-primary/30"
              }`}
              onClick={() => setArtStyle(style.id)}
            >
              <Paintbrush className={`h-6 w-6 mx-auto mb-2 ${artStyle === style.id ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-[10px] font-medium">{style.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Generated Arts */}
      {generatedArts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-sm">Generated Visions</h4>
          {generatedArts.map((art, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-bold text-sm">{art.life}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{art.style}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(art.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ImageIcon className="h-5 w-5 text-primary/40" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {art.prompt}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {generatedArts.length === 0 && pastLives.length === 0 && (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <ImageIcon className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground mb-1">No past lives to visualize yet</p>
          <p className="text-xs text-muted-foreground">Discover past lives first, then transform them into art</p>
        </Card>
      )}
    </div>
  );
};
