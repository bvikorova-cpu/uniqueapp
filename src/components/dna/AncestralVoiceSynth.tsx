import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, Play, Pause, Volume2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface AncestorVoice {
  id: string;
  ancestor_name: string | null;
  ancestor_era: string | null;
  ancestor_location: string | null;
  voice_synthesis_url: string | null;
  memory_story: string | null;
}

export const AncestralVoiceSynth = () => {
  const { toast } = useToast();
  const [ancestors, setAncestors] = useState<AncestorVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [selectedAncestor, setSelectedAncestor] = useState<string>("");
  const [customText, setCustomText] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadAncestors();
  }, []);

  const loadAncestors = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data } = await supabase
        .from("ancestral_memories")
        .select("id, ancestor_name, ancestor_era, ancestor_location, voice_synthesis_url, memory_story")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setAncestors(data || []);
      if (data?.length) setSelectedAncestor(data[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const synthesizeVoice = async () => {
    if (!selectedAncestor) return;
    const ancestor = ancestors.find(a => a.id === selectedAncestor);
    if (!ancestor) return;

    try {
      setSynthesizing(true);
      const textToSpeak = customText.trim() || ancestor.memory_story || "Greetings from your ancestors.";

      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text: textToSpeak, voice: "alloy" },
      });

      if (error) throw error;

      if (data?.audioUrl) {
        const audio = new Audio(data.audioUrl);
        setPlayingId(selectedAncestor);
        audio.onended = () => setPlayingId(null);
        audio.play();
        toast({ title: "Voice Synthesized!", description: `Hearing the voice of ${ancestor.ancestor_name || "your ancestor"}` });
      } else {
        toast({ title: "Voice Ready", description: "Voice synthesis completed. Audio playback will be available when the ElevenLabs API is connected." });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Synthesis Failed", description: "Could not synthesize voice. Ensure the ElevenLabs API key is configured.", variant: "destructive" });
    } finally {
      setSynthesizing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (ancestors.length === 0) {
    return (
      <>
        <FloatingHowItWorks
          title='Ancestral Voice Synth'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Ancestral Voice Synth panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Mic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-bold text-lg mb-2">No Ancestors Found</h3>
        <p className="text-sm text-muted-foreground">Complete a DNA Analysis to discover ancestors and synthesize their voices.</p>
      </Card>
      </>
    );
  }

  const selected = ancestors.find(a => a.id === selectedAncestor);

  return (
    <div className="space-y-6">
      <Card className="p-5 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Mic className="w-5 h-5 text-indigo-500" />
          <span className="font-black text-sm">Ancestral Voice Synthesizer</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Hear AI-reconstructed voices of your ancestors based on their era, region, and linguistic patterns.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Select Ancestor</label>
            <Select value={selectedAncestor} onValueChange={setSelectedAncestor}>
              <SelectTrigger className="bg-muted/10 border-border/50">
                <SelectValue placeholder="Choose an ancestor" />
              </SelectTrigger>
              <SelectContent>
                {ancestors.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.ancestor_name || "Unknown"} — {a.ancestor_era || "Unknown era"} ({a.ancestor_location || "Unknown"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block">Custom Text (optional)</label>
            <Textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Enter text for the ancestor to speak, or leave blank to use their memory story..."
              rows={3}
              className="bg-muted/10 border-border/50 text-sm"
            />
          </div>

          <Button onClick={synthesizeVoice} disabled={synthesizing || !selectedAncestor} className="w-full gap-2">
            {synthesizing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Synthesizing...</>
            ) : (
              <><Volume2 className="h-4 w-4" /> Synthesize Voice</>
            )}
          </Button>
        </div>
      </Card>

      {/* Ancestor cards with voice playback */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-2xl">
                🗣️
              </div>
              <div>
                <h3 className="font-bold text-sm">{selected.ancestor_name || "Unknown Ancestor"}</h3>
                <p className="text-xs text-muted-foreground">{selected.ancestor_era} • {selected.ancestor_location}</p>
              </div>
              {playingId === selected.id && (
                <Badge className="ml-auto bg-green-500/20 text-green-500 animate-pulse">
                  <Volume2 className="w-3 h-3 mr-1" /> Playing
                </Badge>
              )}
            </div>
            {selected.memory_story && (
              <p className="text-xs text-muted-foreground italic">"{selected.memory_story}"</p>
            )}
            {selected.voice_synthesis_url && (
              <audio controls className="w-full mt-3" src={selected.voice_synthesis_url} />
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
};
