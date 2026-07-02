import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Video, Sparkles, Download, Play, Film } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CREDIT_COST = 25;

interface VideoResult {
  storyboard: {
    scene_number: number;
    scene_title: string;
    visual_description: string;
    camera_movement: string;
    lighting: string;
    music_mood: string;
    duration_seconds: number;
    transition: string;
  }[];
  overall_concept: string;
  recommended_soundtrack: string;
  color_grading: string;
  total_duration: string;
  production_notes: string;
}

export default function FashionShowVideoGenerator() {
  const [concept, setConcept] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [duration, setDuration] = useState("60");
  const [mood, setMood] = useState("");
  const [result, setResult] = useState<VideoResult | null>(null);
  const { credits, spendCredit } = useAICredits();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let i = 0; i < CREDIT_COST; i++) {
        const ok = await spendCredit("custom_generation", "Fashion Show Video Generator");
        if (!ok && i === 0) throw new Error("Insufficient credits");
      }

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "video-generator", concept, style, duration: parseInt(duration), mood },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult(data.videoStoryboard);
      toast.success("Video storyboard generated!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to generate video concept"),
  });

  return (
    <>
      <FloatingHowItWorks title="How Fashion Show Video Generator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Fashion Show Video Generator</h2>
            <p className="text-sm text-muted-foreground">Generate cinematic runway video storyboards with AI direction • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Show Concept</Label>
            <Textarea
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="Describe your fashion show concept... e.g., 'Futuristic haute couture collection inspired by bioluminescent ocean creatures'"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Video Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="editorial">Editorial</SelectItem>
                  <SelectItem value="documentary">Documentary</SelectItem>
                  <SelectItem value="music-video">Music Video</SelectItem>
                  <SelectItem value="avant-garde">Avant-Garde</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                  <SelectItem value="90">90 seconds</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mood / Atmosphere</Label>
              <Input value={mood} onChange={e => setMood(e.target.value)} placeholder="e.g., Ethereal, Bold, Dark luxury" />
            </div>
          </div>

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !concept.trim() || (credits?.credits_remaining || 0) < CREDIT_COST}
            className="w-full gap-2"
            size="lg"
          >
            {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating Storyboard...</> : <><Film className="h-4 w-4" /> Generate Video Storyboard ({CREDIT_COST} Credits)</>}
          </Button>

          {credits && credits.credits_remaining < CREDIT_COST && (
            <p className="text-sm text-destructive text-center">Insufficient credits ({credits.credits_remaining}/{CREDIT_COST})</p>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-red-500/10 to-pink-500/10 border-primary/30 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Play className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-black">Video Concept</h3>
              </div>
              <p className="text-sm mb-4">{result.overall_concept}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="font-semibold text-xs text-muted-foreground mb-1">Soundtrack</p>
                  <p>{result.recommended_soundtrack}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="font-semibold text-xs text-muted-foreground mb-1">Color Grading</p>
                  <p>{result.color_grading}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="font-semibold text-xs text-muted-foreground mb-1">Total Duration</p>
                  <p>{result.total_duration}</p>
                </div>
              </div>
            </Card>

            <h3 className="text-lg font-black flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" /> Scene-by-Scene Storyboard
            </h3>

            {result.storyboard?.map((scene, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="p-5 bg-card/80 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-sm font-black text-white">
                      {scene.scene_number}
                    </span>
                    <div>
                      <h4 className="font-bold">{scene.scene_title}</h4>
                      <p className="text-xs text-muted-foreground">{scene.duration_seconds}s • {scene.transition}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{scene.visual_description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <span className="font-semibold">📷 Camera:</span> {scene.camera_movement}
                    </div>
                    <div className="bg-accent/10 rounded-lg p-2">
                      <span className="font-semibold">💡 Lighting:</span> {scene.lighting}
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <span className="font-semibold">🎵 Music:</span> {scene.music_mood}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {result.production_notes && (
              <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <h4 className="font-bold mb-2">📝 Production Notes</h4>
                <p className="text-sm">{result.production_notes}</p>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
    );
}
