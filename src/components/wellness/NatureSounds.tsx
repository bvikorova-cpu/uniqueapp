import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Cloud, Waves, Trees, Play, Pause, Volume2, VolumeX, Zap, Flame, Wind, Droplets, Clock, X } from "lucide-react";

type SoundGenerator = {
  start: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
};

function createNoiseGenerator(ctx: AudioContext, gainNode: GainNode, type: 'white' | 'pink' | 'brown'): AudioBufferSourceNode {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else { // brown
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(gainNode);
  return source;
}

function createRainSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let sources: AudioBufferSourceNode[] = [];
  
  return {
    start() {
      // Brown noise for rain base
      const rainGain = ctx.createGain();
      rainGain.gain.value = 0.4;
      rainGain.connect(masterGain);
      const rain = createNoiseGenerator(ctx, rainGain, 'brown');
      
      // Filtered white noise for rain detail
      const detailGain = ctx.createGain();
      detailGain.gain.value = 0.15;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 8000;
      filter.Q.value = 0.5;
      detailGain.connect(filter);
      filter.connect(masterGain);
      const detail = createNoiseGenerator(ctx, detailGain, 'white');
      
      rain.start();
      detail.start();
      sources = [rain, detail];
    },
    stop() {
      sources.forEach(s => { try { s.stop(); } catch {} });
      sources = [];
    },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

function createOceanSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let sources: AudioBufferSourceNode[] = [];
  let lfo: OscillatorNode | null = null;

  return {
    start() {
      const baseGain = ctx.createGain();
      baseGain.gain.value = 0.5;
      baseGain.connect(masterGain);
      const base = createNoiseGenerator(ctx, baseGain, 'brown');
      
      // LFO for wave-like modulation
      lfo = ctx.createOscillator();
      lfo.frequency.value = 0.1;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(baseGain.gain);
      
      base.start();
      lfo.start();
      sources = [base];
    },
    stop() {
      sources.forEach(s => { try { s.stop(); } catch {} });
      if (lfo) { try { lfo.stop(); } catch {} }
      sources = [];
      lfo = null;
    },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

function createForestSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let sources: AudioNode[] = [];

  return {
    start() {
      // Gentle pink noise for wind through trees
      const windGain = ctx.createGain();
      windGain.gain.value = 0.15;
      windGain.connect(masterGain);
      const wind = createNoiseGenerator(ctx, windGain, 'pink');
      
      // Bird-like chirps using oscillators
      const birdGain = ctx.createGain();
      birdGain.gain.value = 0.08;
      birdGain.connect(masterGain);
      
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 2500;
      const vibrato = ctx.createOscillator();
      vibrato.frequency.value = 6;
      const vibratoGain = ctx.createGain();
      vibratoGain.gain.value = 200;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc1.frequency);
      osc1.connect(birdGain);
      
      wind.start();
      osc1.start();
      vibrato.start();
      sources = [wind, osc1, vibrato];
    },
    stop() {
      sources.forEach(s => { try { (s as any).stop(); } catch {} });
      sources = [];
    },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

function createThunderstormSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let sources: AudioBufferSourceNode[] = [];

  return {
    start() {
      // Heavy rain - brown + white noise
      const rainGain = ctx.createGain();
      rainGain.gain.value = 0.5;
      rainGain.connect(masterGain);
      const rain = createNoiseGenerator(ctx, rainGain, 'brown');
      
      const heavyGain = ctx.createGain();
      heavyGain.gain.value = 0.2;
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 3000;
      heavyGain.connect(lpf);
      lpf.connect(masterGain);
      const heavy = createNoiseGenerator(ctx, heavyGain, 'white');
      
      rain.start();
      heavy.start();
      sources = [rain, heavy];
    },
    stop() {
      sources.forEach(s => { try { s.stop(); } catch {} });
      sources = [];
    },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

function createCampfireSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let sources: AudioBufferSourceNode[] = [];
  let crackleInterval: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      // Base crackle - filtered noise
      const baseGain = ctx.createGain();
      baseGain.gain.value = 0.3;
      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = 1000;
      baseGain.connect(hpf);
      hpf.connect(masterGain);
      const base = createNoiseGenerator(ctx, baseGain, 'white');
      
      // Low rumble
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.2;
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 200;
      rumbleGain.connect(lpf);
      lpf.connect(masterGain);
      const rumble = createNoiseGenerator(ctx, rumbleGain, 'brown');
      
      base.start();
      rumble.start();
      sources = [base, rumble];
    },
    stop() {
      sources.forEach(s => { try { s.stop(); } catch {} });
      if (crackleInterval) clearInterval(crackleInterval);
      sources = [];
      crackleInterval = null;
    },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

function createWindSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let sources: AudioNode[] = [];

  return {
    start() {
      const windGain = ctx.createGain();
      windGain.gain.value = 0.4;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 500;
      bpf.Q.value = 0.3;
      windGain.connect(bpf);
      bpf.connect(masterGain);
      const wind = createNoiseGenerator(ctx, windGain, 'pink');
      
      // Slow modulation for gusting
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.2;
      lfo.connect(lfoGain);
      lfoGain.connect(windGain.gain);
      
      wind.start();
      lfo.start();
      sources = [wind, lfo];
    },
    stop() {
      sources.forEach(s => { try { (s as any).stop(); } catch {} });
      sources = [];
    },
    setVolume(v: number) { masterGain.gain.value = v; }
  };
}

function createWaterfallSound(ctx: AudioContext, masterGain: GainNode): SoundGenerator {
  let sources: AudioBufferSourceNode[] = [];

  return {
    start() {
      // White noise through bandpass for water
      const waterGain = ctx.createGain();
      waterGain.gain.value = 0.35;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 2000;
      bpf.Q.value = 0.2;
      waterGain.connect(bpf);
      bpf.connect(masterGain);
      const water = createNoiseGenerator(ctx, waterGain, 'white');
      
      // Low rumble for depth
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.25;
      rumbleGain.connect(masterGain);
      const rumble = createNoiseGenerator(ctx, rumbleGain, 'brown');
      
      water.start();
      rumble.start();
      sources = [water, rumble];
    },
    stop() {
      sources.forEach(s => { try { s.stop(); } catch {} });
      sources = [];
    },
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

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
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

  const handleSoundSelect = (soundId: string) => {
    if (selectedSound === soundId && isPlaying) {
      generatorRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    // Stop current sound
    generatorRef.current?.stop();

    const { ctx, gain } = getAudioContext();
    const factory = SOUND_FACTORIES[soundId];
    if (!factory) return;

    const generator = factory(ctx, gain);
    generatorRef.current = generator;
    generator.setVolume(isMuted ? 0 : volume / 100);
    generator.start();
    setIsPlaying(true);
    setSelectedSound(soundId);
  };

  const togglePlayPause = () => {
    if (!generatorRef.current || !selectedSound) return;

    if (isPlaying) {
      generatorRef.current.stop();
      setIsPlaying(false);
    } else {
      const { ctx, gain } = getAudioContext();
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
