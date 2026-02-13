import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Cloud, Waves, Trees, Play, Pause, Volume2, VolumeX, Zap, Flame, Wind, Droplets, Clock, X } from "lucide-react";

const NATURE_SOUNDS = [
  { id: "rain", name: "Rain", icon: Cloud, description: "Gentle rain sounds for calming the mind", src: "/sounds/rain.mp3" },
  { id: "waves", name: "Ocean Waves", icon: Waves, description: "Relaxing sounds of ocean waves", src: "/sounds/ocean.mp3" },
  { id: "forest", name: "Forest", icon: Trees, description: "Peaceful nature sounds with birds", src: "/sounds/forest.mp3" },
  { id: "thunderstorm", name: "Thunderstorm", icon: Zap, description: "Powerful thunder and rain for deep relaxation", src: "/sounds/thunderstorm.mp3" },
  { id: "campfire", name: "Campfire", icon: Flame, description: "Crackling fire sounds for cozy atmosphere", src: "/sounds/campfire.mp3" },
  { id: "wind", name: "Wind", icon: Wind, description: "Gentle wind blowing through trees", src: "/sounds/wind.mp3" },
  { id: "waterfall", name: "Waterfall", icon: Droplets, description: "Flowing water for meditation and focus", src: "/sounds/waterfall.mp3" },
];

const TIMER_PRESETS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 }
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

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Timer countdown
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

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else if (!isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [remainingSeconds, isPlaying]);

  const handleSoundSelect = (soundId: string) => {
    if (selectedSound === soundId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    // Stop current
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const sound = NATURE_SOUNDS.find(s => s.id === soundId);
    if (!sound) return;

    const audio = new Audio(sound.src);
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume / 100;
    audioRef.current = audio;
    audio.play().then(() => {
      setIsPlaying(true);
      setSelectedSound(soundId);
    }).catch(err => {
      console.error("Error playing sound:", err);
    });
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !selectedSound) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const setTimer = (minutes: number) => {
    setTimerMinutes(minutes);
    setRemainingSeconds(minutes * 60);
  };

  const clearTimer = () => {
    setTimerMinutes(null);
    setRemainingSeconds(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Nature Sounds
          </CardTitle>
          <CardDescription>
            Choose a nature sound for deeper relaxation and peace of mind
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {NATURE_SOUNDS.map((sound) => {
              const Icon = sound.icon;
              const isActive = selectedSound === sound.id;
              
              return (
                <Card
                  key={sound.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    isActive ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleSoundSelect(sound.id)}
                >
                  <CardContent className="pt-6 text-center">
                    <Icon
                      className={`w-12 h-12 mx-auto mb-3 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <h3 className="font-semibold mb-1">{sound.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {sound.description}
                    </p>
                    {isActive && isPlaying && (
                      <div className="mt-2 flex items-center justify-center gap-1">
                        <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                        <div className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        <div className="w-1 h-5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedSound && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <span className="font-medium">
                        {NATURE_SOUNDS.find(s => s.id === selectedSound)?.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {TIMER_PRESETS.map(preset => (
                        <Button
                          key={preset.minutes}
                          variant={timerMinutes === preset.minutes ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimer(preset.minutes)}
                          className="flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          {preset.label}
                        </Button>
                      ))}
                      {timerMinutes && (
                        <Button variant="ghost" size="icon" onClick={clearTimer}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {remainingSeconds !== null && (
                    <div className="text-center text-sm text-muted-foreground">
                      Time remaining: {formatTime(remainingSeconds)}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={(value) => {
                        setVolume(value[0]);
                        if (isMuted && value[0] > 0) {
                          setIsMuted(false);
                        }
                      }}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <p className="text-sm text-center text-muted-foreground mt-4">
                  Sound is playing on loop. Relax and let the sounds of nature carry you away.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}