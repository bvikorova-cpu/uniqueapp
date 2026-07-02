import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Pause, Volume2, Clock, MapPin, Star, SkipBack, SkipForward } from "lucide-react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PastLifeStory {
  id: string;
  era: string;
  location: string;
  name: string;
  story: string;
  karmic_theme: string;
  created_at: string;
}

export const PastLifeAudioStories = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<PastLifeStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [currentStory, setCurrentStory] = useState<PastLifeStory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadStories();
    return () => {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const loadStories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("past_life_readings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setStories(data.map((r: any) => ({
          id: r.id,
          era: r.era || "Unknown Era",
          location: (r.reading_result as any)?.location || "Unknown",
          name: (r.reading_result as any)?.occupation || "Past Life",
          story: (r.reading_result as any)?.story || (r.reading_result as any)?.narrative || r.reading_type || "",
          karmic_theme: (r.reading_result as any)?.karmic_lesson || "Growth",
          created_at: r.created_at,
        })));
      }
    } catch (error) {
      console.error("Error loading stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNarration = (story: PastLifeStory) => {
    if (!story.story) {
      toast({ title: "No story content", description: "This reading has no narrative to narrate.", variant: "destructive" });
      return;
    }

    window.speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);

    setGenerating(story.id);
    setCurrentStory(story);
    setProgress(0);

    const introText = `Past Life Story: ${story.name}. Era: ${story.era}. Location: ${story.location}. `;
    const fullText = introText + story.story;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = volume / 100;

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) ||
                    voices.find(v => v.lang.startsWith("en")) ||
                    voices[0];
    if (enVoice) utterance.voice = enVoice;

    utterance.onstart = () => {
      setGenerating(null);
      setIsPlaying(true);
      const totalChars = fullText.length;
      let charIndex = 0;
      intervalRef.current = setInterval(() => {
        charIndex += 5;
        const pct = Math.min((charIndex / totalChars) * 100, 99);
        setProgress(pct);
      }, 100);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utterance.onerror = () => {
      setGenerating(null);
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      toast({ title: "Narration Error", description: "Could not generate audio narration.", variant: "destructive" });
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  };

  const stopNarration = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentStory(null);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleVolumeChange = (val: number[]) => {
    setVolume(val[0]);
    if (utteranceRef.current) {
      utteranceRef.current.volume = val[0] / 100;
    }
  };

  const playNext = () => {
    if (!currentStory) return;
    const idx = stories.findIndex(s => s.id === currentStory.id);
    const next = stories[(idx + 1) % stories.length];
    stopNarration();
    setTimeout(() => generateNarration(next), 200);
  };

  const playPrev = () => {
    if (!currentStory) return;
    const idx = stories.findIndex(s => s.id === currentStory.id);
    const prev = stories[(idx - 1 + stories.length) % stories.length];
    stopNarration();
    setTimeout(() => generateNarration(prev), 200);
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Past Life Audio Stories'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Audio Stories panel from this page.' },
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
        <h3 className="text-lg font-black mb-2">Past Life Audio Stories</h3>
        <p className="text-sm text-muted-foreground">
          Listen to AI-narrated audio versions of your discovered past lives. Each story is brought to life
          with immersive narration using your browser's speech synthesis engine.
        </p>
      </Card>

      {/* Now Playing Card */}
      {currentStory && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] bg-primary/10">NOW PLAYING</Badge>
            </div>
            <h4 className="font-bold text-base mb-1">{currentStory.name}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{currentStory.era}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{currentStory.location}</span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{Math.round(progress)}%</span>
                <span>{progress >= 100 ? "Complete" : "Playing..."}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={playPrev} className="h-8 w-8">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={togglePlayPause} className="h-10 w-10 rounded-full">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={playNext} className="h-8 w-8">
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={stopNarration} className="text-xs">
                  Stop
                </Button>
              </div>
              <div className="flex items-center gap-2 w-28">
                <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} className="flex-1" />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Story List */}
      {stories.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <Volume2 className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground mb-1">No past lives discovered yet</p>
          <p className="text-xs text-muted-foreground">Use the Past Life Regression tool to explore, then come back to listen</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all ${
                  currentStory?.id === story.id ? "border-primary/50 shadow-lg shadow-primary/10" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <Button
                    size="icon"
                    variant={currentStory?.id === story.id && isPlaying ? "default" : "outline"}
                    className="h-10 w-10 rounded-full shrink-0"
                    disabled={generating === story.id}
                    onClick={() => {
                      if (currentStory?.id === story.id && isPlaying) togglePlayPause();
                      else generateNarration(story);
                    }}
                  >
                    {generating === story.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : currentStory?.id === story.id && isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{story.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{story.era}
                      <MapPin className="h-3 w-3 ml-1" />{story.location}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    <Star className="h-2.5 w-2.5 mr-1" />{story.karmic_theme}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
