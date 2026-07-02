import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Volume2, VolumeX, Play, Pause, CloudRain, Wind, Waves, Trees, Bird, Coffee, Flame, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface SoundChannel {
  id: string;
  name: string;
  icon: any;
  color: string;
  frequency: number; // Base frequency for oscillator
  type: OscillatorType;
}

const SOUNDS: SoundChannel[] = [
  { id: "rain", name: "Rain", icon: CloudRain, color: "from-blue-500 to-cyan-500", frequency: 0, type: "sawtooth" },
  { id: "wind", name: "Wind", icon: Wind, color: "from-gray-400 to-gray-600", frequency: 0, type: "sawtooth" },
  { id: "waves", name: "Ocean Waves", icon: Waves, color: "from-blue-400 to-blue-600", frequency: 0, type: "sine" },
  { id: "forest", name: "Forest", icon: Trees, color: "from-green-500 to-emerald-500", frequency: 0, type: "sawtooth" },
  { id: "birds", name: "Birds", icon: Bird, color: "from-yellow-400 to-orange-400", frequency: 800, type: "sine" },
  { id: "fire", name: "Fireplace", icon: Flame, color: "from-orange-500 to-red-500", frequency: 0, type: "sawtooth" },
  { id: "cafe", name: "Coffee Shop", icon: Coffee, color: "from-amber-600 to-amber-800", frequency: 0, type: "sawtooth" },
  { id: "binaural", name: "Binaural Beats", icon: Music, color: "from-purple-500 to-pink-500", frequency: 200, type: "sine" },
];

// Web Audio API noise generator
class NoiseGenerator {
  private ctx: AudioContext;
  private nodes: Map<string, { source: AudioNode; gain: GainNode }> = new Map();

  constructor() {
    this.ctx = new AudioContext();
  }

  createWhiteNoise(id: string, filterFreq: number, filterQ: number): GainNode {
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter).connect(gain).connect(this.ctx.destination);
    source.start();

    this.nodes.set(id, { source, gain });
    return gain;
  }

  createTone(id: string, freq: number, type: OscillatorType): GainNode {
    const osc = this.ctx.createOscillator();
    osc.frequency.value = freq;
    osc.type = type;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    osc.connect(gain).connect(this.ctx.destination);
    osc.start();

    this.nodes.set(id, { source: osc, gain });
    return gain;
  }

  setVolume(id: string, volume: number) {
    const node = this.nodes.get(id);
    if (node) node.gain.gain.setTargetAtTime(volume * 0.15, this.ctx.currentTime, 0.1);
  }

  stop(id: string) {
    const node = this.nodes.get(id);
    if (node) {
      node.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  resume() { this.ctx.resume(); }
  suspend() { this.ctx.suspend(); }
  close() { this.ctx.close(); }
}

export const AmbientSounds = ({ onBack }: Props) => {
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(70);
  const [timer, setTimer] = useState(0); // minutes, 0 = no timer
  const [elapsed, setElapsed] = useState(0);
  const generatorRef = useRef<NoiseGenerator | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return (
    <>
      <FloatingHowItWorks title={"Ambient Sounds - How it works"} steps={[{ title: 'Open', desc: 'Access the Ambient Sounds section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Ambient Sounds.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      generatorRef.current?.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timer > 0 && isPlaying) {
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= timer * 60) {
            stopAll();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [timer, isPlaying]);

  const ensureGenerator = () => {
    if (!generatorRef.current) {
      generatorRef.current = new NoiseGenerator();
      // Initialize all channels
      const noiseChannels = ["rain", "wind", "waves", "forest", "fire", "cafe"];
      const filterSettings: Record<string, [number, number]> = {
        rain: [2000, 0.5], wind: [400, 1], waves: [600, 0.8],
        forest: [3000, 0.3], fire: [800, 0.5], cafe: [4000, 0.2],
      };
      noiseChannels.forEach(id => {
        const [freq, q] = filterSettings[id];
        generatorRef.current!.createWhiteNoise(id, freq, q);
      });
      generatorRef.current.createTone("birds", 800, "sine");
      generatorRef.current.createTone("binaural", 200, "sine");
    }
    generatorRef.current.resume();
  };

  const setChannelVolume = (id: string, value: number) => {
    ensureGenerator();
    setVolumes(prev => ({ ...prev, [id]: value }));
    generatorRef.current?.setVolume(id, (value / 100) * (masterVolume / 100));
    if (value > 0 && !isPlaying) setIsPlaying(true);
  };

  const handleMasterVolume = (value: number) => {
    setMasterVolume(value);
    Object.entries(volumes).forEach(([id, vol]) => {
      generatorRef.current?.setVolume(id, (vol / 100) * (value / 100));
    });
  };

  const stopAll = () => {
    SOUNDS.forEach(s => generatorRef.current?.stop(s.id));
    setVolumes({});
    setIsPlaying(false);
    setElapsed(0);
    generatorRef.current?.suspend();
  };

  const activeCount = Object.values(volumes).filter(v => v > 0).length;
  const TIMERS = [0, 5, 10, 15, 30, 60];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
          Ambient Sound Mixer
        </h2>
        <p className="text-muted-foreground">Mix nature and ambient sounds to create your perfect relaxation environment.</p>
      </motion.div>

      {/* Master Controls */}
      <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant={isPlaying ? "destructive" : "default"} size="sm" onClick={isPlaying ? stopAll : () => {}}
              disabled={!isPlaying} className="gap-2">
              {isPlaying ? <><Pause className="h-4 w-4" /> Stop All</> : <><Play className="h-4 w-4" /> Select Sounds</>}
            </Button>
            <span className="text-sm text-muted-foreground">{activeCount} active</span>
          </div>
          <div className="flex items-center gap-2">
            {masterVolume === 0 ? <VolumeX className="h-4 w-4 text-muted-foreground" /> : <Volume2 className="h-4 w-4 text-muted-foreground" />}
            <Slider value={[masterVolume]} onValueChange={v => handleMasterVolume(v[0])} max={100} step={1} className="w-24" />
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Timer:</span>
          {TIMERS.map(t => (
            <Button key={t} variant={timer === t ? "default" : "outline"} size="sm" onClick={() => setTimer(t)} className="text-xs h-7 px-2">
              {t === 0 ? "Off" : `${t}m`}
            </Button>
          ))}
          {timer > 0 && isPlaying && (
            <span className="text-xs text-muted-foreground ml-2">
              {Math.floor((timer * 60 - elapsed) / 60)}:{String((timer * 60 - elapsed) % 60).padStart(2, "0")} left
            </span>
          )}
        </div>
      </Card>

      {/* Sound Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SOUNDS.map((sound, i) => {
          const vol = volumes[sound.id] || 0;
          const active = vol > 0;
          return (
            <motion.div key={sound.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`p-4 transition-all ${active ? "bg-card/80 border-primary/30 ring-1 ring-primary/20" : "bg-card/50 border-border/50"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${sound.color} flex items-center justify-center shrink-0 ${active ? "animate-pulse" : ""}`}>
                    <sound.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm">{sound.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{active ? `${vol}%` : "Off"}</p>
                  </div>
                </div>
                <Slider value={[vol]} onValueChange={v => setChannelVolume(sound.id, v[0])} max={100} step={1} />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
