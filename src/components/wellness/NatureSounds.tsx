import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Cloud, Waves, Trees, Play, Pause, Volume2, VolumeX, Zap, Flame, Wind, Droplets, Clock, X } from "lucide-react";

type SoundGenerator = {
  start: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
};

// Utility: create a very soft filtered noise layer
function createSoftNoise(ctx: AudioContext, output: GainNode, volume: number, lowcut: number, highcut: number): AudioBufferSourceNode {
  const len = 2 * ctx.sampleRate;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    d[i] = (last + 0.02 * w) / 1.02;
    last = d[i];
    d[i] *= 3.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  const g = ctx.createGain();
  g.gain.value = volume;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = highcut;
  lp.Q.value = 0.5;

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = lowcut;
  hp.Q.value = 0.5;

  src.connect(g);
  g.connect(lp);
  lp.connect(hp);
  hp.connect(output);
  return src;
}

// Utility: gentle sine pad with slow vibrato
function createPad(ctx: AudioContext, output: GainNode, freq: number, vol: number, vibratoRate = 0.2, vibratoDepth = 2): { nodes: AudioNode[], start: () => void } {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;

  const vibOsc = ctx.createOscillator();
  vibOsc.frequency.value = vibratoRate;
  const vibGain = ctx.createGain();
  vibGain.gain.value = vibratoDepth;
  vibOsc.connect(vibGain);
  vibGain.connect(osc.frequency);

  const g = ctx.createGain();
  g.gain.value = vol;
  osc.connect(g);
  g.connect(output);

  return {
    nodes: [osc, vibOsc],
    start() { osc.start(); vibOsc.start(); }
  };
}

// ---- RAIN: very soft brown noise + gentle deep drone ----
function createRainSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let all: AudioNode[] = [];
  return {
    start() {
      const noise = createSoftNoise(ctx, masterGain, 0.08, 80, 600);
      const pad1 = createPad(ctx, masterGain, 174, 0.06, 0.08, 1);
      const pad2 = createPad(ctx, masterGain, 220, 0.04, 0.12, 1.5);
      noise.start();
      pad1.start();
      pad2.start();
      all = [noise, ...pad1.nodes, ...pad2.nodes];
    },
    stop() { all.forEach(n => { try { (n as any).stop(); } catch {} }); all = []; },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

// ---- OCEAN: slow sweeping pads like waves ----
function createOceanSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let all: AudioNode[] = [];
  return {
    start() {
      const noise = createSoftNoise(ctx, masterGain, 0.06, 40, 400);
      // Slow sweeping pad
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 110;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06; // very slow
      const lfoG = ctx.createGain();
      lfoG.gain.value = 20;
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.value = 0.07;
      osc.connect(g);
      g.connect(masterGain);
      // Second harmonic
      const pad = createPad(ctx, masterGain, 165, 0.04, 0.04, 3);
      noise.start(); osc.start(); lfo.start(); pad.start();
      all = [noise, osc, lfo, ...pad.nodes];
    },
    stop() { all.forEach(n => { try { (n as any).stop(); } catch {} }); all = []; },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

// ---- FOREST: gentle high sine tones (birds) + soft wind ----
function createForestSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let all: AudioNode[] = [];
  return {
    start() {
      const noise = createSoftNoise(ctx, masterGain, 0.04, 100, 800);
      // Gentle "bird" - very quiet high sine with slow tremolo
      const bird = ctx.createOscillator();
      bird.type = 'sine';
      bird.frequency.value = 1200;
      const trem = ctx.createOscillator();
      trem.frequency.value = 3;
      const tremG = ctx.createGain();
      tremG.gain.value = 0.02;
      trem.connect(tremG);
      const birdG = ctx.createGain();
      birdG.gain.value = 0.03;
      bird.connect(birdG);
      tremG.connect(birdG.gain);
      birdG.connect(masterGain);
      // Warm base pad
      const pad = createPad(ctx, masterGain, 196, 0.05, 0.1, 1);
      const pad2 = createPad(ctx, masterGain, 262, 0.03, 0.07, 1);
      noise.start(); bird.start(); trem.start(); pad.start(); pad2.start();
      all = [noise, bird, trem, ...pad.nodes, ...pad2.nodes];
    },
    stop() { all.forEach(n => { try { (n as any).stop(); } catch {} }); all = []; },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

// ---- THUNDERSTORM: deep bass drone + soft noise ----
function createThunderstormSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let all: AudioNode[] = [];
  return {
    start() {
      const noise = createSoftNoise(ctx, masterGain, 0.1, 30, 500);
      const pad = createPad(ctx, masterGain, 55, 0.08, 0.05, 2);
      const pad2 = createPad(ctx, masterGain, 82, 0.05, 0.08, 1.5);
      noise.start(); pad.start(); pad2.start();
      all = [noise, ...pad.nodes, ...pad2.nodes];
    },
    stop() { all.forEach(n => { try { (n as any).stop(); } catch {} }); all = []; },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

// ---- CAMPFIRE: warm crackling tone + cozy drone ----
function createCampfireSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let all: AudioNode[] = [];
  return {
    start() {
      const noise = createSoftNoise(ctx, masterGain, 0.05, 200, 2000);
      const pad = createPad(ctx, masterGain, 146, 0.06, 0.15, 1);
      const pad2 = createPad(ctx, masterGain, 220, 0.04, 0.1, 1);
      const pad3 = createPad(ctx, masterGain, 293, 0.025, 0.08, 0.5);
      noise.start(); pad.start(); pad2.start(); pad3.start();
      all = [noise, ...pad.nodes, ...pad2.nodes, ...pad3.nodes];
    },
    stop() { all.forEach(n => { try { (n as any).stop(); } catch {} }); all = []; },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

// ---- WIND: very soft filtered noise with slow modulation ----
function createWindSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let all: AudioNode[] = [];
  return {
    start() {
      const noise = createSoftNoise(ctx, masterGain, 0.07, 60, 500);
      const pad = createPad(ctx, masterGain, 130, 0.05, 0.05, 3);
      const pad2 = createPad(ctx, masterGain, 196, 0.035, 0.03, 2);
      noise.start(); pad.start(); pad2.start();
      all = [noise, ...pad.nodes, ...pad2.nodes];
    },
    stop() { all.forEach(n => { try { (n as any).stop(); } catch {} }); all = []; },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

// ---- WATERFALL: gentle flowing tone ----
function createWaterfallSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let all: AudioNode[] = [];
  return {
    start() {
      const noise = createSoftNoise(ctx, masterGain, 0.06, 100, 1200);
      const pad = createPad(ctx, masterGain, 261, 0.05, 0.06, 2);
      const pad2 = createPad(ctx, masterGain, 392, 0.03, 0.04, 1.5);
      noise.start(); pad.start(); pad2.start();
      all = [noise, ...pad.nodes, ...pad2.nodes];
    },
    stop() { all.forEach(n => { try { (n as any).stop(); } catch {} }); all = []; },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

const SOUND_FACTORIES: Record<string, (ctx: AudioContext, gain: GainNode) => SoundGenerator> = {
  rain: createRainSound,
  waves: createOceanSound,
  forest: createForestSound,
  thunderstorm: createThunderstormSound,
  campfire: createCampfireSound,
  wind: createWindSound,
  waterfall: createWaterfallSound,
};

const NATURE_SOUNDS = [
  { id: "rain", name: "Rain", icon: Cloud, description: "Gentle rain sounds for calming the mind" },
  { id: "waves", name: "Ocean Waves", icon: Waves, description: "Relaxing sounds of ocean waves" },
  { id: "forest", name: "Forest", icon: Trees, description: "Peaceful nature sounds with birds" },
  { id: "thunderstorm", name: "Thunderstorm", icon: Zap, description: "Powerful thunder and rain for deep relaxation" },
  { id: "campfire", name: "Campfire", icon: Flame, description: "Crackling fire sounds for cozy atmosphere" },
  { id: "wind", name: "Wind", icon: Wind, description: "Gentle wind blowing through trees" },
  { id: "waterfall", name: "Waterfall", icon: Droplets, description: "Flowing water for meditation and focus" },
];

const TIMER_PRESETS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 }
];

export function NatureSounds() {
  const { toast } = useToast();
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const generatorRef = useRef<SoundGenerator | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getAudioContext = useCallback(async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    return { ctx: audioCtxRef.current, gain: masterGainRef.current! };
  }, []);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (remainingSeconds !== null && remainingSeconds > 0 && isPlaying) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev === null || prev <= 1) {
            generatorRef.current?.stop();
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

  const handleSoundSelect = async (soundId: string) => {
    try {
      if (selectedSound === soundId && isPlaying) {
        generatorRef.current?.stop();
        setIsPlaying(false);
        return;
      }

      // Stop current sound
      generatorRef.current?.stop();

      const { ctx, gain } = await getAudioContext();
      const factory = SOUND_FACTORIES[soundId];
      if (!factory) {
        console.error("No sound factory for:", soundId);
        return;
      }

      const generator = factory(ctx, gain);
      generatorRef.current = generator;
      generator.setVolume(isMuted ? 0 : volume / 100);
      generator.start();
      setIsPlaying(true);
      setSelectedSound(soundId);
      console.log("Sound started:", soundId, "AudioContext state:", ctx.state);
    } catch (err) {
      console.error("Error starting sound:", err);
      toast({
        title: "Sound Error",
        description: "Could not play sound. Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePlayPause = async () => {
    if (!generatorRef.current || !selectedSound) return;

    if (isPlaying) {
      generatorRef.current.stop();
      setIsPlaying(false);
    } else {
      const { ctx, gain } = await getAudioContext();
      const factory = SOUND_FACTORIES[selectedSound];
      if (!factory) return;
      const generator = factory(ctx, gain);
      generatorRef.current = generator;
      generator.setVolume(isMuted ? 0 : volume / 100);
      generator.start();
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

  useEffect(() => {
    return () => {
      generatorRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
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
