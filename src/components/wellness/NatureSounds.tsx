import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Cloud, Waves, Trees, Play, Pause, Volume2, VolumeX, Zap, Flame, Wind, Droplets, Clock, X } from "lucide-react";

const NATURE_SOUNDS = [
  {
    id: "rain",
    name: "Rain",
    icon: Cloud,
    url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_4037f5ea8e.mp3",
    description: "Gentle rain sounds for calming the mind"
  },
  {
    id: "waves",
    name: "Ocean Waves",
    icon: Waves,
    url: "https://cdn.pixabay.com/download/audio/2022/05/13/audio_c49e4b9ea9.mp3",
    description: "Relaxing sounds of ocean waves"
  },
  {
    id: "forest",
    name: "Forest",
    icon: Trees,
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_13d711e6c6.mp3",
    description: "Peaceful nature sounds with birds"
  },
  {
    id: "thunderstorm",
    name: "Thunderstorm",
    icon: Zap,
    url: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_4a656f830e.mp3",
    description: "Powerful thunder and rain for deep relaxation"
  },
  {
    id: "campfire",
    name: "Campfire",
    icon: Flame,
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_4a4cb2d5c7.mp3",
    description: "Crackling fire sounds for cozy atmosphere"
  },
  {
    id: "wind",
    name: "Wind",
    icon: Wind,
    url: "https://cdn.pixabay.com/download/audio/2022/03/20/audio_c6c4c67fff.mp3",
    description: "Gentle wind blowing through trees"
  },
  {
    id: "waterfall",
    name: "Waterfall",
    icon: Droplets,
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    description: "Flowing water for meditation and focus"
  }
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (remainingSeconds !== null && remainingSeconds > 0 && isPlaying) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev === null || prev <= 1) {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else if (!isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [remainingSeconds, isPlaying]);

  const handleSoundSelect = (soundId: string) => {
    const sound = NATURE_SOUNDS.find(s => s.id === soundId);
    if (!sound) return;

    if (selectedSound === soundId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume / 100;
      audioRef.current = audio;

      audio.play().then(() => {
        setIsPlaying(true);
        setSelectedSound(soundId);
      }).catch(err => {
        console.error("Error playing audio:", err);
      });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

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
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedSound && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Timer</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {TIMER_PRESETS.map((preset) => (
                      <Button
                        key={preset.minutes}
                        variant={timerMinutes === preset.minutes ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimer(preset.minutes)}
                        disabled={!isPlaying}
                      >
                        {preset.label}
                      </Button>
                    ))}
                    {remainingSeconds !== null && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearTimer}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {remainingSeconds !== null && (
                    <div className="text-center py-2">
                      <p className="text-2xl font-bold text-primary">
                        {formatTime(remainingSeconds)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sound will stop automatically
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                    className="h-12 w-12"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </Button>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-medium">{isMuted ? 0 : volume}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className="h-8 w-8 flex-shrink-0"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
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
                </div>
                
                <p className="text-sm text-center text-muted-foreground">
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
