import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Cloud, Waves, Trees, Play, Pause, Volume2, VolumeX } from "lucide-react";

const NATURE_SOUNDS = [
  {
    id: "rain",
    name: "Dážď",
    icon: Cloud,
    url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_4037f5ea8e.mp3",
    description: "Jemný zvuk dažďa pre upokojenie mysle"
  },
  {
    id: "waves",
    name: "Vlny",
    icon: Waves,
    url: "https://cdn.pixabay.com/download/audio/2022/05/13/audio_c49e4b9ea9.mp3",
    description: "Relaxačné zvuky oceánskych vĺn"
  },
  {
    id: "forest",
    name: "Les",
    icon: Trees,
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_13d711e6c6.mp3",
    description: "Pokojné zvuky prírody a vtákov"
  }
];

export function NatureSounds() {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Zvuky prírody
          </CardTitle>
          <CardDescription>
            Vyber si zvuk prírody pre hlbšiu relaxáciu a upokojenie mysle
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
                <div className="flex items-center gap-4 mb-4">
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
                      <span className="text-muted-foreground">Hlasitosť</span>
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
                  Zvuk sa prehráva v slučke. Relaxuj a nechaj sa uniesť zvukmi prírody.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
