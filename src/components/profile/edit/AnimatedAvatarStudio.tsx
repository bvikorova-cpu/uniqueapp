import { useRef, useState } from "react";
import { Loader2, Pause, Play, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  imageUrl: string | null;
  audioUrl: string | null;
  onSaved: (image: string, audio: string) => void;
}

export const AnimatedAvatarStudio = ({ imageUrl, audioUrl, onSaved }: Props) => {
  const { toast } = useToast();
  const [desc, setDesc] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generate = async () => {
    if (!desc.trim() || !text.trim()) {
      toast({ title: "Fill in both fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("animated-avatar", {
        body: { description: desc, text },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onSaved(data.image_url, data.audio_url);
      toast({ title: "Animated avatar created" });
    } catch (e: any) {
      toast({ title: "Generation error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Animated Avatar Studio - How it works"} steps={[{ title: 'Open', desc: 'Access the Animated Avatar Studio section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Animated Avatar Studio.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="h-5 w-5 text-fuchsia-400" />
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Animated Avatar</p>
          <p className="text-base font-black bg-gradient-to-r from-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
            Pixar-style portrait + voiceover
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-5 items-start">
        <div className="relative mx-auto">
          {imageUrl ? (
            <div className="relative">
              <img src={imageUrl} alt="Animated avatar" className={`w-44 h-44 rounded-2xl object-cover border border-fuchsia-400/40 shadow-xl ${playing ? "animate-pulse" : ""}`} />
              {audioUrl && (
                <Button
                  size="icon"
                  onClick={togglePlay}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-background shadow-lg"
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              )}
              {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} className="hidden" />}
            </div>
          ) : (
            <div className="w-44 h-44 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 flex items-center justify-center text-muted-foreground text-xs text-center px-3">
              Your animated avatar will appear here
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Describe how you want to look (Pixar style)</Label>
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. cheerful young woman, brown curly hair, freckles, hoodie"
              maxLength={150}
            />
          </div>
          <div>
            <Label className="text-xs">Say something (max 250 chars) — your avatar will speak it</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Hey there! Welcome to my profile — happy you stopped by."
              rows={3}
              maxLength={250}
            />
            <p className="text-[10px] text-muted-foreground mt-1">{text.length}/250</p>
          </div>
          <Button
            onClick={generate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-background font-bold"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate animated avatar
          </Button>
          <p className="text-[10px] text-muted-foreground italic">Costs 5 AI credits per generation.</p>
        </div>
      </div>
    </div>
    </>
  );
};
