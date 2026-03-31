import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookImage, Loader2, Sparkles, Heart, ImagePlus } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const species = ["Dog", "Cat", "Dragon", "Phoenix", "Unicorn", "Wolf", "Fox", "Rabbit", "Parrot", "Hamster"];
const albumThemes = ["First Year Together", "Battle Victories", "Training Montage", "Seasonal Adventures", "Best Friends Forever", "Evolution Journey", "Exploration Diary", "Holiday Memories"];

export const AIPetMemoryAlbum = ({ onBack }: Props) => {
  const [petName, setPetName] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [theme, setTheme] = useState("");
  const [customMemories, setCustomMemories] = useState("");
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { useCredit } = useAICredits();

  const handleGenerate = async () => {
    if (!petName || !selectedSpecies || !theme) return toast.error("Fill in all fields");

    const hasCredits = await useCredit("custom_generation", "Memory Album");
    if (!hasCredits) return toast.error("Not enough credits!");

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pet-memory-album", {
        body: { petName, species: selectedSpecies, theme, customMemories },
      });
      if (error) throw error;
      setAlbum(data);
      toast.success("Memory album created!");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" />Back to Dashboard</Button>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
          <BookImage className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black">AI Pet Memory Album</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          AI creates a beautiful narrative memory album with captions, emotional moments, and milestone descriptions for your pet's journey.
        </p>
        <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">5 Credits per album</span>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ImagePlus className="w-5 h-5" />Create Memory Album</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={petName} onChange={e => setPetName(e.target.value)} placeholder="Pet name..." />
          <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
            <SelectTrigger><SelectValue placeholder="Species..." /></SelectTrigger>
            <SelectContent>{species.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger><SelectValue placeholder="Album theme..." /></SelectTrigger>
            <SelectContent>{albumThemes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Textarea value={customMemories} onChange={e => setCustomMemories(e.target.value)}
            placeholder="Add special memories to include (optional)..." className="min-h-[60px]" />
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Creating album..." : "Generate Memory Album"}
          </Button>
        </CardContent>
      </Card>

      {album && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <h3 className="font-black text-lg">{album.album_title}</h3>
                <p className="text-xs text-muted-foreground italic">{album.dedication}</p>
              </div>

              <div className="space-y-4">
                {album.memories?.map((memory: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg bg-background/80 border border-border/40">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{memory.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold">{memory.title}</p>
                          <span className="text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{memory.date}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{memory.description}</p>
                        <p className="text-[10px] text-primary mt-2 italic flex items-center gap-1">
                          <Heart className="w-3 h-3" />{memory.caption}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <p className="text-xs font-bold mb-1">📝 Album Note</p>
                <p className="text-[11px] text-muted-foreground italic">{album.closing_note}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
