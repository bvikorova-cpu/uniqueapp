import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Cloud, Waves, Trees, Play, Pause, Volume2, VolumeX, Zap, Flame, Droplets, Clock, X, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const NATURE_SOUNDS = [
  { id: "rain", name: "Rain", icon: Cloud, description: "Gentle rain for calming the mind", src: "/sounds/rain.mp3", color: "text-blue-400", bg: "from-blue-500/10 to-cyan-500/5" },
  { id: "waves", name: "Ocean Waves", icon: Waves, description: "Relaxing ocean waves", src: "/sounds/ocean.mp3", color: "text-cyan-400", bg: "from-cyan-500/10 to-teal-500/5" },
  { id: "forest", name: "Forest", icon: Trees, description: "Peaceful birds & nature", src: "/sounds/forest.mp3", color: "text-green-400", bg: "from-green-500/10 to-emerald-500/5" },
  { id: "thunderstorm", name: "Thunderstorm", icon: Zap, description: "Deep thunder for relaxation", src: "/sounds/thunderstorm.mp3", color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/5" },
  { id: "campfire", name: "Campfire", icon: Flame, description: "Crackling fire ambience", src: "/sounds/campfire.mp3", color: "text-orange-400", bg: "from-orange-500/10 to-amber-500/5" },
  { id: "waterfall", name: "Waterfall", icon: Droplets, description: "Flowing water for focus", src: "/sounds/waterfall.mp3", color: "text-sky-400", bg: "from-sky-500/10 to-blue-500/5" },
];

const TIMER_PRESETS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "Sleep", minutes: 120, icon: Moon },
];

export function NatureSounds() {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  useEffect(() => {
    if (remainingSeconds !== null && remainingSeconds > 0 && isPlaying) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev === null || prev <= 1) {
            audioRef.current?.pause();
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    } else if (!isPlaying && timerRef.current) { clearInterval(timerRef.current); }
  }, [remainingSeconds, isPlaying]);

  const handleSoundSelect = (soundId: string) => {
    if (selectedSound === soundId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const sound = NATURE_SOUNDS.find(s => s.id === soundId);
    if (!sound) return;
    const audio = new Audio(sound.src);
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume / 100;
    audioRef.current = audio;
    audio.play().then(() => { setIsPlaying(true); setSelectedSound(soundId); }).catch(console.error);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !selectedSound) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => { audioRef.current?.pause(); audioRef.current = null; if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const activeSound = NATURE_SOUNDS.find(s => s.id === selectedSound);

  return (
    <div className="space-y-6 mt-6">
      <FloatingHowItWorks title="NatureSounds — How it works" steps={[{title:"Open this tool",desc:"Access NatureSounds within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-primary/5 to-sky-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Volume2 className="w-5 h-5 text-emerald-400" />
            </div>
            Nature Sounds
            {isPlaying && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] animate-pulse">
                Playing
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Immerse yourself in calming nature soundscapes for relaxation and focus</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {NATURE_SOUNDS.map((sound) => {
              const Icon = sound.icon;
              const isActive = selectedSound === sound.id;
              return (
                <motion.div
                  key={sound.id}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Card
                    className={`cursor-pointer transition-all border ${
                      isActive
                        ? "border-primary/40 ring-1 ring-primary/20"
                        : "border-border/50 hover:border-primary/30"
                    } bg-gradient-to-br ${sound.bg} backdrop-blur-xl`}
                    onClick={() => handleSoundSelect(sound.id)}
                  >
                    <CardContent className="pt-5 pb-4 text-center">
                      <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isActive ? 'bg-primary/20' : 'bg-muted/30'
                      }`}>
                        <Icon className={`w-6 h-6 ${isActive ? sound.color : 'text-muted-foreground'}`} />
                      </div>
                      <h3 className="font-semibold text-sm mb-0.5">{sound.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{sound.description}</p>
                      {isActive && isPlaying && (
                        <div className="mt-2 flex items-center justify-center gap-1">
                          {[3, 4, 3, 5, 3].map((h, i) => (
                            <motion.div
                              key={i}
                              className={`w-1 rounded-full ${sound.color.replace('text-', 'bg-')}`}
                              animate={{ height: [h * 2, h * 4, h * 2] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                              style={{ height: h * 2 }}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedSound && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                  <CardContent className="pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" onClick={togglePlayPause} className="h-10 w-10">
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <div>
                          <span className="font-semibold text-sm">{activeSound?.name}</span>
                          {remainingSeconds !== null && (
                            <p className="text-xs text-muted-foreground">⏱ {formatTime(remainingSeconds)} remaining</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {TIMER_PRESETS.map(preset => (
                          <Button
                            key={preset.minutes}
                            variant={timerMinutes === preset.minutes ? "default" : "outline"}
                            size="sm"
                            onClick={() => { setTimerMinutes(preset.minutes); setRemainingSeconds(preset.minutes * 60); }}
                            className="text-xs gap-1 h-7"
                          >
                            {preset.icon ? <Moon className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {preset.label}
                          </Button>
                        ))}
                        {timerMinutes && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setTimerMinutes(null); setRemainingSeconds(null); if (timerRef.current) clearInterval(timerRef.current); }}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={(value) => { setVolume(value[0]); if (isMuted && value[0] > 0) setIsMuted(false); }}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">{isMuted ? 0 : volume}%</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
