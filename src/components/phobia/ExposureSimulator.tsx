import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Eye, Play, ChevronRight, ChevronLeft, Shield, Heart, Timer, Zap,
  Sparkles, Loader2, Activity, CheckCircle2, RotateCcw, Wind,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const COST = 2;

type Step = {
  number: number;
  title: string;
  suds_target: number;
  duration_seconds: number;
  scene: string;
  body_cues: string[];
  coping_script: string;
  success_criteria: string;
  if_too_much: string;
};

type Scenario = {
  title: string;
  fear_summary: string;
  safety_note: string;
  steps: Step[];
  aftercare: string[];
  progress_markers: string[];
};

const PRESETS = [
  { emoji: "🕷️", fear: "Spiders (arachnophobia)", environment: "At home, evening, in the bathroom", sensory: ["sudden movement", "many legs", "webs"] },
  { emoji: "🏔️", fear: "Heights (acrophobia)", environment: "Balcony and glass elevators", sensory: ["looking down", "open edges", "wind"] },
  { emoji: "👥", fear: "Speaking in front of people", environment: "Meeting room with 10-20 colleagues", sensory: ["eyes on me", "silence", "my own voice"] },
  { emoji: "✈️", fear: "Flying (aviophobia)", environment: "Short-haul flight, window seat", sensory: ["turbulence", "engine noise", "no exit"] },
  { emoji: "🚪", fear: "Enclosed spaces (claustrophobia)", environment: "Elevators, MRI scanner, crowded metro", sensory: ["tight walls", "warm air", "no control"] },
  { emoji: "🌙", fear: "Darkness (nyctophobia)", environment: "Bedroom and hallway at night", sensory: ["shadows", "unexplained sounds", "not seeing"] },
  { emoji: "🩸", fear: "Needles and blood (trypanophobia)", environment: "Clinic, blood draw chair", sensory: ["sharp point", "smell of alcohol", "skin prick"] },
  { emoji: "🐕", fear: "Dogs (cynophobia)", environment: "Park, unleashed dogs on the path", sensory: ["barking", "running toward me", "teeth"] },
  { emoji: "🌊", fear: "Deep water (thalassophobia)", environment: "Lake or sea, out of my depth", sensory: ["dark below", "no bottom", "waves"] },
];

const SENSORY_OPTIONS = [
  "sudden movement", "sounds", "smells", "touch", "being watched",
  "loss of control", "confined space", "heights", "darkness", "pain",
];

export const ExposureSimulator = () => {
  // form state
  const [fear, setFear] = useState("");
  const [intensity, setIntensity] = useState(6);
  const [environment, setEnvironment] = useState("");
  const [sensory, setSensory] = useState<string[]>([]);
  const [copingStyle, setCopingStyle] = useState("Slow 4-7-8 breathing");
  const [tone, setTone] = useState("calm and encouraging");
  const [steps, setSteps] = useState(6);

  // session state
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [sudsBefore, setSudsBefore] = useState<number>(50);
  const [sudsAfter, setSudsAfter] = useState<number>(30);
  const [log, setLog] = useState<{ step: number; before: number; after: number }[]>([]);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => () => { if (intervalRef.current) window.clearInterval(intervalRef.current); }, []);

  const toggleSensory = (s: string) =>
    setSensory(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));

  const applyPreset = (p: typeof PRESETS[number]) => {
    setFear(p.fear);
    setEnvironment(p.environment);
    setSensory(p.sensory);
  };

  const generate = async () => {
    if (fear.trim().length < 2) {
      toast.error("Describe the fear you want to work on first.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("phobia-router", {
        body: {
          action: "exposure_scenario",
          fear: fear.trim(),
          intensity,
          environment: environment.trim() || undefined,
          sensory,
          copingStyle,
          tone,
          steps,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const sc = (data as any).scenario as Scenario;
      setScenario(sc);
      setStepIndex(0);
      setLog([]);
      setFinished(false);
      setTimer(0);
      setSudsBefore(Math.min(95, Math.max(5, intensity * 10)));
      setSudsAfter(Math.max(5, intensity * 10 - 15));
      toast.success(`Ladder ready — ${sc.steps.length} personalised steps`);
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      toast.error(msg.includes("credit") || msg.includes("Insufficient") ? "Not enough AI credits (2 needed)." : msg || "Could not generate the scenario.");
    } finally {
      setLoading(false);
    }
  };

  const current = scenario?.steps[stepIndex];

  const beginStep = () => {
    if (!current) return;
    setRunning(true);
    setTimer(current.duration_seconds);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          setRunning(false);
          toast.success("Exposure held to the end — rate your anxiety now.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopStep = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setRunning(false);
    setTimer(0);
  };

  const saveAndAdvance = () => {
    if (!scenario || !current) return;
    setLog(prev => [...prev.filter(l => l.step !== current.number), { step: current.number, before: sudsBefore, after: sudsAfter }]);
    if (stepIndex >= scenario.steps.length - 1) {
      setFinished(true);
      toast.success("🎉 Full ladder completed. Habituation takes repetition — come back tomorrow.");
      return;
    }
    setStepIndex(i => i + 1);
    setTimer(0);
    setSudsBefore(sudsAfter);
    setSudsAfter(Math.max(5, sudsAfter - 10));
  };

  const reset = () => {
    stopStep();
    setScenario(null);
    setFinished(false);
    setLog([]);
  };

  /* ───────────── Session view ───────────── */
  if (scenario && current && !finished) {
    const progress = ((stepIndex) / scenario.steps.length) * 100;
    return (
      <>
        <FloatingHowItWorks
          title="Exposure Simulator - How it works"
          steps={[
            { title: "Describe", desc: "Tell the AI your fear, its intensity, where it happens and which senses trigger it." },
            { title: "Generate", desc: "For 2 credits the AI builds a personalised exposure ladder of 4-10 graded steps." },
            { title: "Practise", desc: "Read the scene, hold the exposure for the timer, and follow the coping script." },
            { title: "Rate", desc: "Score your anxiety (SUDS) before and after each step to see habituation happen." },
          ]}
        />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset}>← Exit session</Button>
            <Badge variant="outline" className="ml-auto text-[10px]">
              Step {current.number} / {scenario.steps.length}
            </Badge>
          </div>

          <Card className="p-4 sm:p-6 bg-card/80 backdrop-blur-xl border-border/50 space-y-4">
            <div className="text-center">
              <h3 className="font-black text-lg leading-tight">{scenario.title}</h3>
              {scenario.fear_summary && (
                <p className="text-xs text-muted-foreground mt-1">{scenario.fear_summary}</p>
              )}
            </div>

            <Progress value={progress} className="h-2" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <Card className="p-4 bg-muted/10 border-border/30">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-bold">{current.title}</span>
                    <Badge variant="outline" className="text-[10px]">Target SUDS ~{current.suds_target}</Badge>
                    <Badge variant="outline" className="text-[10px]">{current.duration_seconds}s</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{current.scene}</p>
                </Card>

                {current.body_cues.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {current.body_cues.map((c, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] gap-1">
                        <Activity className="h-2.5 w-2.5" /> {c}
                      </Badge>
                    ))}
                  </div>
                )}

                {current.coping_script && (
                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-700 dark:text-cyan-300">
                    <Wind className="h-3 w-3 inline mr-1" />
                    {current.coping_script}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {running ? (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Timer className="h-5 w-5 text-cyan-400" />
                  <span className="text-3xl font-black text-cyan-400">{timer}s</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                  <span>Stay with it. Breathe out longer than you breathe in.</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{current.if_too_much}</p>
                <Button variant="outline" className="w-full" onClick={stopStep}>Stop early</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Anxiety before (SUDS {sudsBefore})</Label>
                  <Slider value={[sudsBefore]} min={0} max={100} step={5} onValueChange={v => setSudsBefore(v[0])} />
                </div>
                <Button onClick={beginStep} className="w-full">
                  <Play className="h-4 w-4 mr-2" /> Start {current.duration_seconds}s exposure
                </Button>
                <div className="space-y-2">
                  <Label className="text-xs">Anxiety after (SUDS {sudsAfter})</Label>
                  <Slider value={[sudsAfter]} min={0} max={100} step={5} onValueChange={v => setSudsAfter(v[0])} />
                  <p className="text-[11px] text-muted-foreground">{current.success_criteria}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" disabled={stepIndex === 0} onClick={() => { setStepIndex(i => Math.max(0, i - 1)); setTimer(0); }}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button className="flex-1" onClick={saveAndAdvance}>
                    {stepIndex >= scenario.steps.length - 1 ? "Finish ladder" : "Next step"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-muted/10 border border-border/30 text-[11px] text-muted-foreground">
              <Shield className="h-3 w-3 inline mr-1" />
              {scenario.safety_note}
            </div>
          </Card>
        </div>
      </>
    );
  }

  /* ───────────── Summary view ───────────── */
  if (scenario && finished) {
    const avgDrop = log.length
      ? Math.round(log.reduce((a, l) => a + (l.before - l.after), 0) / log.length)
      : 0;
    return (
      <div className="space-y-4">
        <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50 space-y-4">
          <div className="text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-black text-lg">Ladder completed</h3>
            <p className="text-xs text-muted-foreground">{scenario.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 text-center bg-muted/10 border-border/30">
              <p className="text-2xl font-black text-cyan-400">{log.length}</p>
              <p className="text-[11px] text-muted-foreground">Steps rated</p>
            </Card>
            <Card className="p-3 text-center bg-muted/10 border-border/30">
              <p className="text-2xl font-black text-green-500">-{avgDrop}</p>
              <p className="text-[11px] text-muted-foreground">Avg. SUDS drop</p>
            </Card>
          </div>

          <div className="space-y-1.5">
            {log.map(l => (
              <div key={l.step} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/10">
                <span>Step {l.step}</span>
                <span className="font-mono">{l.before} → {l.after}</span>
              </div>
            ))}
          </div>

          {scenario.aftercare.length > 0 && (
            <div>
              <p className="text-sm font-bold mb-1">Aftercare</p>
              <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                {scenario.aftercare.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}

          {scenario.progress_markers.length > 0 && (
            <div>
              <p className="text-sm font-bold mb-1">Signs you are really improving</p>
              <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                {scenario.progress_markers.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setFinished(false); setStepIndex(0); setLog([]); }}>
              <RotateCcw className="h-4 w-4 mr-1" /> Repeat ladder
            </Button>
            <Button className="flex-1" onClick={reset}>New scenario</Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ───────────── Builder view ───────────── */
  return (
    <>
      <FloatingHowItWorks
        title="Exposure Simulator - How it works"
        steps={[
          { title: "Describe", desc: "Tell the AI your fear, its intensity, where it happens and which senses trigger it." },
          { title: "Generate", desc: "For 2 credits the AI builds a personalised exposure ladder of 4-10 graded steps." },
          { title: "Practise", desc: "Read the scene, hold the exposure for the timer, and follow the coping script." },
          { title: "Rate", desc: "Score your anxiety (SUDS) before and after each step to see habituation happen." },
        ]}
      />
      <div className="space-y-4">
        <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Eye className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold">AI Exposure Ladder</h3>
            <Badge className="bg-primary/15 text-primary border border-primary/30 text-[10px] font-bold gap-1">
              <Zap className="h-2.5 w-2.5" /> {COST} cr
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            No generic checklists — the AI writes a graded, personalised desensitisation ladder for your exact fear,
            with immersive scenes, expected body reactions, coping scripts and SUDS tracking.
          </p>
        </Card>

        <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Quick start</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.fear}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1.5 rounded-full border border-border/50 bg-muted/10 text-[11px] hover:border-cyan-500/40 transition-colors"
                >
                  <span className="mr-1">{p.emoji}</span>{p.fear.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">What exactly are you afraid of?</Label>
            <Input value={fear} onChange={e => setFear(e.target.value)} placeholder="e.g. Speaking up in team meetings" maxLength={200} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Where / when does it happen?</Label>
            <Textarea
              value={environment}
              onChange={e => setEnvironment(e.target.value)}
              placeholder="e.g. Office meeting room, 12 colleagues, Monday mornings"
              rows={2}
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Anxiety intensity today: {intensity}/10</Label>
            <Slider value={[intensity]} min={1} max={10} step={1} onValueChange={v => setIntensity(v[0])} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Sensory triggers</Label>
            <div className="flex flex-wrap gap-1.5">
              {SENSORY_OPTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSensory(s)}
                  className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                    sensory.includes(s)
                      ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
                      : "border-border/50 bg-muted/10 text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Coping style</Label>
              <Select value={copingStyle} onValueChange={setCopingStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Slow 4-7-8 breathing">4-7-8 breathing</SelectItem>
                  <SelectItem value="5-4-3-2-1 grounding">5-4-3-2-1 grounding</SelectItem>
                  <SelectItem value="Muscle relaxation">Muscle relaxation</SelectItem>
                  <SelectItem value="Cognitive reframing">Cognitive reframing</SelectItem>
                  <SelectItem value="Mindful observation">Mindful observation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Guidance tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm and encouraging">Calm & encouraging</SelectItem>
                  <SelectItem value="clinical and factual">Clinical & factual</SelectItem>
                  <SelectItem value="warm and compassionate">Warm & compassionate</SelectItem>
                  <SelectItem value="direct and challenging">Direct & challenging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Ladder length</Label>
              <Select value={String(steps)} onValueChange={v => setSteps(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 steps (gentle)</SelectItem>
                  <SelectItem value="6">6 steps (standard)</SelectItem>
                  <SelectItem value="8">8 steps (deep)</SelectItem>
                  <SelectItem value="10">10 steps (intensive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {loading ? "Building your ladder..." : `Generate exposure ladder (${COST} credits)`}
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            Self-help practice only — not a replacement for professional therapy. Stop any time.
          </p>
        </Card>
      </div>
    </>
  );
};
