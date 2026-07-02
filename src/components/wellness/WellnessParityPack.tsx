import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Brain, Sparkles, ClipboardList, Activity, Timer, Footprints,
  Music2, AlarmClock, Users, ShieldAlert, Coins,
} from "lucide-react";
import {
  useCBTReframer, useMHAssessment, useWalkingMeditation,
  useStressCheckins, usePomodoro, useSoundscapePresets, useWakeAlarms, useGroupSessions,
} from "@/hooks/useWellnessParity";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

// ============ 1. SOS Panic Relief ============
function SOSPanicRelief() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const steps = [
    "Breathe in slowly for 4 counts...",
    "Hold for 4 counts...",
    "Exhale gently for 6 counts...",
    "Name 5 things you can SEE around you.",
    "Name 4 things you can TOUCH.",
    "Name 3 things you can HEAR.",
    "Name 2 things you can SMELL.",
    "Name 1 thing you can TASTE.",
    "You are safe. You are here. You did it.",
  ];
  useEffect(() => {
    if (!open) return;
    setStep(0);
    const t = setInterval(() => setStep(s => (s < steps.length - 1 ? s + 1 : s)), 7000);
    return (
    <>
      <FloatingHowItWorks title={"Wellness Parity Pack - How it works"} steps={[{ title: 'Open', desc: 'Access the Wellness Parity Pack section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Wellness Parity Pack.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(t);
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-red-500/40 bg-gradient-to-br from-red-500/10 to-rose-500/5 backdrop-blur-xl hover:border-red-500/60 transition">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-red-400" />
            <p className="font-bold text-sm">SOS Panic Relief</p>
            <p className="text-xs text-muted-foreground">60s grounding</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>You're safe. Follow along...</DialogTitle></DialogHeader>
        <div className="py-12 text-center min-h-[180px] flex items-center justify-center">
          <p className="text-xl font-medium animate-fade-in">{steps[step]}</p>
        </div>
        <div className="flex justify-center gap-1">
          {steps.map((_, i) => <div key={i} className={`h-1.5 w-6 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />)}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ 2. CBT Thought Reframer ============
function CBTReframer() {
  const { items, reframe } = useCBTReframer();
  const [open, setOpen] = useState(false);
  const [situation, setSituation] = useState("");
  const [thought, setThought] = useState("");
  const [emotion, setEmotion] = useState("");
  const [intensity, setIntensity] = useState([7]);
  const latest = items[0];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-violet-500/5 backdrop-blur-xl hover:border-purple-500/60 transition">
          <CardContent className="pt-6 text-center">
            <Brain className="h-10 w-10 mx-auto mb-2 text-purple-400" />
            <p className="font-bold text-sm">CBT Reframer</p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Coins className="h-3 w-3" />6 / reframe</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Reframe a Negative Thought</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Situation</Label><Input value={situation} onChange={e => setSituation(e.target.value)} placeholder="What happened?" /></div>
          <div><Label>Negative thought</Label><Textarea rows={2} value={thought} onChange={e => setThought(e.target.value)} placeholder="What did you tell yourself?" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Emotion</Label><Input value={emotion} onChange={e => setEmotion(e.target.value)} placeholder="anxious, sad..." /></div>
            <div><Label>Intensity {intensity[0]}/10</Label><Slider value={intensity} onValueChange={setIntensity} min={1} max={10} step={1} /></div>
          </div>
          <Button className="w-full" disabled={reframe.isPending || !situation || !thought}
            onClick={() => reframe.mutate({ situation, negative_thought: thought, emotion, intensity_before: intensity[0] })}>
            {reframe.isPending ? "Reframing..." : "Reframe (6 cr)"}
          </Button>
          {latest && (
            <Card className="bg-card/60 border-purple-500/30 mt-2">
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex flex-wrap gap-1">
                  {(latest.distortions as string[] || []).map(d => <Badge key={d} variant="outline" className="text-[10px]">{d}</Badge>)}
                </div>
                <p><b>Reframe:</b> {latest.reframe}</p>
                <p><b>Balanced thought:</b> {latest.balanced_thought}</p>
                <p><b>Action step:</b> {latest.action_step}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ 3. Mental Health Assessment ============
const PHQ9 = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling/staying asleep or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself",
  "Trouble concentrating",
  "Moving/speaking slowly OR being fidgety",
  "Thoughts of being better off dead or self-harm",
];
const GAD7 = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];
function MHAssessment() {
  const { items, submit } = useMHAssessment();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"phq9" | "gad7">("phq9");
  const questions = type === "phq9" ? PHQ9 : GAD7;
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(0));
  useEffect(() => { setAnswers(Array(questions.length).fill(0)); }, [type, questions.length]);
  const total = answers.reduce((a, b) => a + b, 0);
  const latest = items[0];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl hover:border-blue-500/60 transition">
          <CardContent className="pt-6 text-center">
            <ClipboardList className="h-10 w-10 mx-auto mb-2 text-blue-400" />
            <p className="font-bold text-sm">MH Check-in</p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Coins className="h-3 w-3" />6 / insight</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Weekly Mental Health Check-in</DialogTitle></DialogHeader>
        <Tabs value={type} onValueChange={(v) => setType(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phq9">Depression (PHQ-9)</TabsTrigger>
            <TabsTrigger value="gad7">Anxiety (GAD-7)</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground">Over the last 2 weeks, how often have you been bothered by:</p>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {questions.map((q, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-xs">{i + 1}. {q}</p>
              <div className="grid grid-cols-4 gap-1">
                {["Not at all", "Several days", "More than half", "Nearly every day"].map((label, score) => (
                  <Button key={score} size="sm" variant={answers[i] === score ? "default" : "outline"}
                    className="text-[10px] h-7 px-1"
                    onClick={() => setAnswers(a => a.map((v, idx) => idx === i ? score : v))}>{label}</Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg">
          <span className="text-sm">Score: <b>{total}</b></span>
          <Button disabled={submit.isPending} onClick={() => submit.mutate({ assessment_type: type, answers, total_score: total })}>
            {submit.isPending ? "Analyzing..." : "Get AI Insight (6 cr)"}
          </Button>
        </div>
        {latest && (
          <Card className="bg-card/60 border-blue-500/30">
            <CardContent className="pt-4 text-sm space-y-1">
              <Badge>{latest.severity}</Badge>
              <p>{latest.ai_insight}</p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============ 4. Stress Check-in ============
function StressCheckin() {
  const { items, log } = useStressCheckins();
  const [open, setOpen] = useState(false);
  const [stress, setStress] = useState([5]);
  const [energy, setEnergy] = useState([5]);
  const [note, setNote] = useState("");
  const avg = items.length ? (items.reduce((a, b) => a + b.stress_level, 0) / items.length).toFixed(1) : "—";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-rose-500/5 backdrop-blur-xl hover:border-pink-500/60 transition">
          <CardContent className="pt-6 text-center">
            <Activity className="h-10 w-10 mx-auto mb-2 text-pink-400" />
            <p className="font-bold text-sm">Stress Check-in</p>
            <p className="text-[10px] text-muted-foreground">Avg {avg}/10</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>How are you right now?</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div><Label>Stress {stress[0]}/10</Label><Slider value={stress} onValueChange={setStress} min={1} max={10} step={1} /></div>
          <div><Label>Energy {energy[0]}/10</Label><Slider value={energy} onValueChange={setEnergy} min={1} max={10} step={1} /></div>
          <Textarea rows={2} placeholder="Optional note..." value={note} onChange={e => setNote(e.target.value)} />
          <Button className="w-full" disabled={log.isPending} onClick={() => { log.mutate({ stress_level: stress[0], energy_level: energy[0], note }); setNote(""); }}>
            Log check-in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ 5. Pomodoro Focus Timer ============
function PomodoroFocus() {
  const { start, complete } = usePomodoro();
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState("");
  const [duration, setDuration] = useState([25]);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds(s => {
      if (s <= 1) {
        if (sessionId) complete.mutate(sessionId);
        setRunning(false);
        return 0;
      }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [running, sessionId]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5 backdrop-blur-xl hover:border-orange-500/60 transition">
          <CardContent className="pt-6 text-center">
            <Timer className="h-10 w-10 mx-auto mb-2 text-orange-400" />
            <p className="font-bold text-sm">Focus Timer</p>
            <p className="text-[10px] text-muted-foreground">Pomodoro</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Deep Focus Session</DialogTitle></DialogHeader>
        {!running ? (
          <div className="space-y-3">
            <Input placeholder="What are you working on?" value={task} onChange={e => setTask(e.target.value)} />
            <Label>Duration: {duration[0]} min</Label>
            <Slider value={duration} onValueChange={setDuration} min={5} max={90} step={5} />
            <Button className="w-full" onClick={async () => {
              const data = await start.mutateAsync({ task, duration_minutes: duration[0] });
              setSessionId(data.id); setSeconds(duration[0] * 60); setRunning(true);
            }}>Start Focus</Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-6xl font-mono font-bold mb-4">{mm}:{ss}</p>
            <p className="text-sm text-muted-foreground mb-4">{task}</p>
            <Button variant="outline" onClick={() => { setRunning(false); setSeconds(0); }}>Stop</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============ 6. Walking Meditation ============
function WalkingMeditationCard() {
  const { items, generate } = useWalkingMeditation();
  const [open, setOpen] = useState(false);
  const [intention, setIntention] = useState("");
  const [environment, setEnvironment] = useState("");
  const [duration, setDuration] = useState([10]);
  const latest = items[0];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl hover:border-green-500/60 transition">
          <CardContent className="pt-6 text-center">
            <Footprints className="h-10 w-10 mx-auto mb-2 text-green-400" />
            <p className="font-bold text-sm">Walking Meditation</p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Coins className="h-3 w-3" />6 / session</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Mindful Walk</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Intention (calm, gratitude, clarity...)" value={intention} onChange={e => setIntention(e.target.value)} />
          <Input placeholder="Environment (park, city, beach...)" value={environment} onChange={e => setEnvironment(e.target.value)} />
          <Label>Duration: {duration[0]} min</Label>
          <Slider value={duration} onValueChange={setDuration} min={5} max={30} step={5} />
          <Button className="w-full" disabled={generate.isPending || !intention}
            onClick={() => generate.mutate({ intention, environment, duration_minutes: duration[0] })}>
            {generate.isPending ? "Creating audio..." : "Generate (6 cr)"}
          </Button>
          {latest?.audio_url && (
            <div className="space-y-2">
              <p className="text-xs font-medium">{latest.intention}</p>
              <audio controls src={latest.audio_url} className="w-full" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ 7. Soundscape Mixer ============
const SOUND_LAYERS = [
  { id: "rain", label: "Rain", url: "https://cdn.pixabay.com/audio/2022/03/15/audio_8e8e7e9b56.mp3" },
  { id: "ocean", label: "Ocean", url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { id: "fire", label: "Fireplace", url: "https://cdn.pixabay.com/audio/2022/01/18/audio_8db1f1b5a5.mp3" },
  { id: "forest", label: "Forest", url: "https://cdn.pixabay.com/audio/2022/03/10/audio_d1718ab41b.mp3" },
  { id: "wind", label: "Wind", url: "https://cdn.pixabay.com/audio/2022/10/14/audio_d4a3f3b1c2.mp3" },
];
function SoundscapeMixer() {
  const [open, setOpen] = useState(false);
  const { items, save, remove } = useSoundscapePresets();
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const audios = useRef<Record<string, HTMLAudioElement>>({});
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) {
      Object.values(audios.current).forEach(a => { try { a.pause(); } catch {} });
    }
  }, [open]);

  const setLayer = (id: string, vol: number) => {
    setVolumes(v => ({ ...v, [id]: vol }));
    const layer = SOUND_LAYERS.find(l => l.id === id)!;
    if (!audios.current[id]) {
      const a = new Audio(layer.url);
      a.loop = true;
      audios.current[id] = a;
    }
    const a = audios.current[id];
    a.volume = vol / 100;
    if (vol > 0 && a.paused) a.play().catch(() => {});
    if (vol === 0) a.pause();
  };

  const loadPreset = (layers: any[]) => {
    SOUND_LAYERS.forEach(l => setLayer(l.id, 0));
    layers.forEach(l => setLayer(l.id, l.volume));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 backdrop-blur-xl hover:border-indigo-500/60 transition">
          <CardContent className="pt-6 text-center">
            <Music2 className="h-10 w-10 mx-auto mb-2 text-indigo-400" />
            <p className="font-bold text-sm">Soundscape Mixer</p>
            <p className="text-[10px] text-muted-foreground">Layer ambience</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Build Your Soundscape</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {SOUND_LAYERS.map(l => (
            <div key={l.id} className="space-y-1">
              <div className="flex justify-between text-xs"><span>{l.label}</span><span>{volumes[l.id] || 0}%</span></div>
              <Slider value={[volumes[l.id] || 0]} onValueChange={v => setLayer(l.id, v[0])} min={0} max={100} step={5} />
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Preset name" value={name} onChange={e => setName(e.target.value)} />
            <Button disabled={!name} onClick={() => {
              const layers = SOUND_LAYERS.filter(l => (volumes[l.id] || 0) > 0).map(l => ({ id: l.id, volume: volumes[l.id] }));
              save.mutate({ name, layers });
              setName("");
            }}>Save</Button>
          </div>
          {items.length > 0 && (
            <div className="space-y-1 pt-2 border-t">
              <p className="text-xs text-muted-foreground">My presets</p>
              {items.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                  <button className="text-sm font-medium hover:text-primary" onClick={() => loadPreset(p.layers as any)}>{p.name}</button>
                  <Button size="sm" variant="ghost" onClick={() => remove.mutate(p.id)}>×</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ 8. Wake-Up Alarm ============
function WakeUpAlarms() {
  const { items, upsert, remove } = useWakeAlarms();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("07:00");
  const [label, setLabel] = useState("Morning");
  const [sound, setSound] = useState("sunrise");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 backdrop-blur-xl hover:border-yellow-500/60 transition">
          <CardContent className="pt-6 text-center">
            <AlarmClock className="h-10 w-10 mx-auto mb-2 text-yellow-400" />
            <p className="font-bold text-sm">Soothing Alarms</p>
            <p className="text-[10px] text-muted-foreground">{items.length} active</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Wake-up Alarms</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label" />
            <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            <select className="rounded-md border bg-background px-2 text-sm" value={sound} onChange={e => setSound(e.target.value)}>
              <option value="sunrise">Sunrise</option>
              <option value="birds">Birds</option>
              <option value="chimes">Chimes</option>
              <option value="ocean">Ocean</option>
            </select>
          </div>
          <Button className="w-full" onClick={() => upsert.mutate({ label, time_of_day: time, soundscape: sound })}>Add alarm</Button>
          <div className="space-y-1">
            {items.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                <div>
                  <p className="text-sm font-medium">{a.label || "Alarm"} · {a.time_of_day?.slice(0, 5)}</p>
                  <p className="text-[10px] text-muted-foreground">{a.soundscape}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(a.id)}>×</Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ 9. Group Live Sessions ============
function GroupSessionsCard() {
  const { items, create, rsvp } = useGroupSessions();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState([20]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-cyan-500/5 backdrop-blur-xl hover:border-teal-500/60 transition">
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 mx-auto mb-2 text-teal-400" />
            <p className="font-bold text-sm">Live Group Sessions</p>
            <p className="text-[10px] text-muted-foreground">{items.length} upcoming</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Group Meditations</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {items.map(s => (
            <Card key={s.id} className="bg-card/60">
              <CardContent className="pt-3 space-y-1">
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(s.starts_at).toLocaleString()} · {s.duration_minutes}min · {s.attendee_count} joining</p>
                <Button size="sm" className="w-full" onClick={() => rsvp.mutate(s.id)}>RSVP</Button>
              </CardContent>
            </Card>
          ))}
          <div className="pt-3 border-t space-y-2">
            <p className="text-xs font-medium">Host a session</p>
            <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} />
            <Label>Duration: {duration[0]} min</Label>
            <Slider value={duration} onValueChange={setDuration} min={10} max={60} step={5} />
            <Button className="w-full" disabled={!title || !when}
              onClick={() => { create.mutate({ title, starts_at: new Date(when).toISOString(), duration_minutes: duration[0] }); setTitle(""); setWhen(""); }}>
              Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Main Pack ============
export const WellnessParityPack = () => {
  return (
    <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Calm & Headspace Parity Pack
        </CardTitle>
        <p className="text-xs text-muted-foreground">9 premium wellness tools</p>
      </CardHeader>
      <CardContent className="relative grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SOSPanicRelief />
        <CBTReframer />
        <MHAssessment />
        <StressCheckin />
        <PomodoroFocus />
        <WalkingMeditationCard />
        <SoundscapeMixer />
        <WakeUpAlarms />
        <GroupSessionsCard />
      </CardContent>
    </Card>
  );
};

export default WellnessParityPack;
