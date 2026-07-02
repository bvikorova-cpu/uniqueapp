import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Play, Square, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { CHAKRAS } from "../crystalData";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const SESSIONS = [
  { name: "Full Chakra Journey", chakras: CHAKRAS.map(c => c.name), duration: "21 min", description: "3 minutes per chakra, ascending from Root to Crown" },
  { name: "Heart Opening", chakras: ["Heart", "Throat", "Crown"], duration: "9 min", description: "Focus on love, expression, and spiritual connection" },
  { name: "Grounding Session", chakras: ["Root", "Sacral", "Solar Plexus"], duration: "9 min", description: "Strengthen your foundation and personal power" },
  { name: "Third Eye Activation", chakras: ["Third Eye", "Crown"], duration: "6 min", description: "Enhance intuition and cosmic awareness" },
];

export const CrystalSoundBathTool = () => {
  const [playing, setPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState<typeof SESSIONS[0] | null>(null);
  const [currentChakraIdx, setCurrentChakraIdx] = useState(0);
  const [volume, setVolume] = useState(15);
  const [elapsed, setElapsed] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const playFrequency = useCallback((freq: number) => {
    try {
      if (oscRef.current) { oscRef.current.stop(); }
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioContext();
        gainRef.current = audioCtxRef.current.createGain();
        gainRef.current.connect(audioCtxRef.current.destination);
      }
      gainRef.current!.gain.value = volume / 200;
      const osc = audioCtxRef.current!.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gainRef.current!);
      osc.start();
      oscRef.current = osc;
    } catch {}
  }, [volume]);

  const startSession = (session: typeof SESSIONS[0]) => {
    setCurrentSession(session);
    setCurrentChakraIdx(0);
    setElapsed(0);
    setPlaying(true);
    const chakra = CHAKRAS.find(c => c.name === session.chakras[0]);
    if (chakra) playFrequency(chakra.frequency);
    toast.success(`Starting ${session.name}`);
  };

  const stopSession = () => {
    setPlaying(false);
    try { oscRef.current?.stop(); audioCtxRef.current?.close(); } catch {}
    oscRef.current = null;
    audioCtxRef.current = null;
    toast.success("Sound bath session ended 🔔");
  };

  useEffect(() => {
    if (!playing || !currentSession) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        const perChakra = 180; // 3 min
        const newIdx = Math.floor(next / perChakra);
        if (newIdx !== currentChakraIdx && newIdx < currentSession.chakras.length) {
          setCurrentChakraIdx(newIdx);
          const chakra = CHAKRAS.find(c => c.name === currentSession.chakras[newIdx]);
          if (chakra) playFrequency(chakra.frequency);
        }
        if (newIdx >= currentSession.chakras.length) {
          stopSession();
          return 0;
        }
        return next;
      });
    }, 1000);
    return (
    <>
      <FloatingHowItWorks title={"Crystal Sound Bath Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Sound Bath Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Sound Bath Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(interval);
  }, [playing, currentSession, currentChakraIdx]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume / 200;
  }, [volume]);

  useEffect(() => () => { try { oscRef.current?.stop(); audioCtxRef.current?.close(); } catch {} }, []);

  const activeChakra = currentSession ? CHAKRAS.find(c => c.name === currentSession.chakras[currentChakraIdx]) : null;

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Music className="w-5 h-5" /> Crystal Sound Bath
        </CardTitle>
        <p className="text-sm text-muted-foreground">Immersive healing sessions with crystal singing bowl frequencies</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {playing && activeChakra ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center animate-pulse" style={{ backgroundColor: activeChakra.color + "30", border: `3px solid ${activeChakra.color}` }}>
              <Volume2 className="w-10 h-10" style={{ color: activeChakra.color }} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{activeChakra.name} Chakra</h3>
              <p className="text-sm text-muted-foreground">{activeChakra.frequency} Hz • {activeChakra.location}</p>
            </div>
            <div className="flex items-center gap-3 max-w-xs mx-auto">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} min={0} max={50} step={1} className="flex-1" />
            </div>
            <p className="text-xs text-muted-foreground">Chakra {currentChakraIdx + 1} of {currentSession?.chakras.length}</p>
            <Button onClick={stopSession} variant="destructive" className="gap-2"><Square className="w-4 h-4" /> Stop Session</Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {SESSIONS.map(session => (
              <div key={session.name} className="p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-all cursor-pointer" onClick={() => startSession(session)}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm">{session.name}</h4>
                  <span className="text-xs text-muted-foreground">{session.duration}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{session.description}</p>
                <div className="flex gap-1">
                  {session.chakras.map(name => {
                    const c = CHAKRAS.find(ch => ch.name === name);
                    return c ? <div key={name} className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} title={name} /> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
