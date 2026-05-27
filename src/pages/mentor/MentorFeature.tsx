import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mentorCall, useMentor, useMentorMutation, useMentorPremium } from "@/hooks/useMentorRouter";
import { toast } from "sonner";
import { ArrowLeft, Send, Plus, Check, Copy, Crown } from "lucide-react";

const AREAS = ["career", "fitness", "mindset", "relationships"];

export default function MentorFeature() {
  const { feature } = useParams();
  const navigate = useNavigate();
  const { data: sub } = useMentorPremium();

  if (sub && !sub.subscribed) {
    return (
      <div className="container mx-auto pt-20 pb-12 max-w-xl text-center">
        <Helmet><title>Premium required</title></Helmet>
        <Crown className="w-12 h-12 mx-auto text-primary mb-3" />
        <h1 className="text-2xl font-black mb-2">Premium feature</h1>
        <p className="text-muted-foreground mb-4">Unlock all 18 Personal Mentor tools.</p>
        <Button onClick={() => navigate("/ai-mentor/premium")}>See plans</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Mentor · {feature}</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-4xl">
        <Link to="/ai-mentor/hub" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>
        {feature === "memory" && <MemoryPanel />}
        {feature === "skills" && <SkillsPanel />}
        {feature === "personality" && <PersonalityPanel />}
        {feature === "roleplay" && <RolePlayPanel />}
        {feature === "feedback360" && <Feedback360Panel />}
        {feature === "nudges" && <NudgesPanel />}
        {feature === "goals" && <GoalsPanel />}
        {feature === "reflections" && <ReflectionsPanel />}
        {feature === "habits" && <HabitsPanel />}
        {feature === "coach" && <CoachPanel />}
        {feature === "summaries" && <SummariesPanel />}
        {feature === "voice-journal" && <VoiceJournalPanel />}
        {feature === "cbt" && <CBTPanel />}
      </div>
    </>
  );
}

// ────── MEMORY ──────
function MemoryPanel() {
  const { data, refetch } = useMentor("memory.list");
  const [area, setArea] = useState("mindset");
  const [k, setK] = useState(""); const [v, setV] = useState("");
  const save = async () => { if (!k || !v) return; await mentorCall("memory.upsert", { area, fact_key: k, fact_value: v, importance: 3 }); setK(""); setV(""); refetch(); };
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Coach Memory</h1>
      <Card className="bg-card/80 backdrop-blur-xl mb-4"><CardContent className="p-4 space-y-2">
        <div className="flex gap-2 flex-wrap">{AREAS.map((a) => <Badge key={a} variant={area === a ? "default" : "outline"} className="cursor-pointer" onClick={() => setArea(a)}>{a}</Badge>)}</div>
        <Input placeholder="e.g. preferred_role" value={k} onChange={(e) => setK(e.target.value)} />
        <Textarea placeholder="e.g. wants to become engineering manager by Q3" value={v} onChange={(e) => setV(e.target.value)} />
        <Button onClick={save}><Plus className="w-4 h-4 mr-1" />Save fact</Button>
      </CardContent></Card>
      <div className="space-y-2">{(data?.memory ?? []).map((m: any) => (
        <Card key={m.id} className="bg-card/80"><CardContent className="p-3 text-sm">
          <div className="flex justify-between"><span className="font-bold">{m.fact_key}</span><Badge variant="outline">{m.area}</Badge></div>
          <p className="text-muted-foreground">{m.fact_value}</p>
        </CardContent></Card>
      ))}</div>
    </div>
  );
}

// ────── SKILLS ──────
function SkillsPanel() {
  const { data, refetch } = useMentor("skills.list_with_progress");
  const practice = async (id: string) => { await mentorCall("skills.practice", { skill_id: id, score_delta: 5 }); refetch(); };
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Skill Tracker (20 skills)</h1>
      <div className="grid sm:grid-cols-2 gap-3">{(data?.skills ?? []).map((s: any) => (
        <Card key={s.id} className="bg-card/80 backdrop-blur-xl"><CardContent className="p-4">
          <div className="flex justify-between items-center mb-1"><h3 className="font-bold text-sm">{s.name}</h3><Badge variant="outline">{s.area}</Badge></div>
          <p className="text-xs text-muted-foreground mb-2">{s.description}</p>
          <Progress value={s.progress?.score ?? 0} className="h-2 mb-2" />
          <div className="flex justify-between items-center text-xs">
            <span>{s.progress?.score ?? 0}/100 · {s.progress?.practice_count ?? 0} sessions</span>
            <Button size="sm" variant="outline" onClick={() => practice(s.id)}>+5</Button>
          </div>
        </CardContent></Card>
      ))}</div>
    </div>
  );
}

// ────── PERSONALITY ──────
const BIG5_QS = [
  { q: "I see myself as outgoing and sociable", trait: "extraversion" },
  { q: "I tend to be quiet and reserved", trait: "extraversion", reverse: true },
  { q: "I sympathise with others' feelings", trait: "agreeableness" },
  { q: "I find fault with others", trait: "agreeableness", reverse: true },
  { q: "I do a thorough job", trait: "conscientiousness" },
  { q: "I tend to be disorganised", trait: "conscientiousness", reverse: true },
  { q: "I am relaxed and handle stress well", trait: "neuroticism", reverse: true },
  { q: "I get nervous easily", trait: "neuroticism" },
  { q: "I have an active imagination", trait: "openness" },
  { q: "I have few artistic interests", trait: "openness", reverse: true },
];

function PersonalityPanel() {
  const { data, refetch } = useMentor("personality.latest");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const submit = useMentorMutation("personality.submit");
  const onSubmit = async () => {
    const payload = BIG5_QS.map((q, i) => ({ trait: q.trait, value: q.reverse ? 6 - (answers[i] ?? 3) : (answers[i] ?? 3) }));
    await submit.mutateAsync({ type: "big_five", answers: payload }); refetch();
  };
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Personality (Big Five)</h1>
      {data?.assessment ? (
        <Card className="bg-card/80 backdrop-blur-xl"><CardContent className="p-4">
          <h2 className="font-black mb-3">Your profile</h2>
          {Object.entries(data.assessment.result).map(([k, v]: any) => (
            <div key={k} className="mb-2"><div className="flex justify-between text-sm"><span className="capitalize">{k}</span><span className="font-bold">{v}%</span></div><Progress value={v} className="h-2" /></div>
          ))}
          <div className="mt-4 text-sm whitespace-pre-wrap">{data.assessment.insights}</div>
          <Button className="mt-3" variant="outline" onClick={() => refetch()}>Retake</Button>
        </CardContent></Card>
      ) : (
        <Card className="bg-card/80 backdrop-blur-xl"><CardContent className="p-4 space-y-3">
          {BIG5_QS.map((q, i) => (
            <div key={i}>
              <p className="text-sm mb-1">{q.q}</p>
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => (
                <Button key={n} size="sm" variant={answers[i] === n ? "default" : "outline"} onClick={() => setAnswers({ ...answers, [i]: n })}>{n}</Button>
              ))}</div>
            </div>
          ))}
          <Button onClick={onSubmit} disabled={submit.isPending}>Get my profile</Button>
        </CardContent></Card>
      )}
    </div>
  );
}

// ────── ROLE-PLAY ──────
function RolePlayPanel() {
  const { data } = useMentor("roleplay.list");
  const [active, setActive] = useState<any>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [msg, setMsg] = useState(""); const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState<{ score: number; feedback: string } | null>(null);

  const start = async (s: any) => {
    setActive(s); setScore(null);
    const r = await mentorCall("roleplay.start", { scenario_id: s.id });
    setSessionId(r.session_id); setTranscript(r.transcript);
  };
  const send = async () => {
    if (!msg || !sessionId) return;
    const um = msg; setMsg("");
    const r = await mentorCall("roleplay.reply", { session_id: sessionId, user_message: um });
    setTranscript(r.transcript);
  };
  const complete = async () => {
    if (!sessionId) return;
    const r = await mentorCall("roleplay.complete", { session_id: sessionId });
    setScore({ score: r.score, feedback: r.feedback });
  };

  if (active) return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => setActive(null)}>← Scenarios</Button>
      <h1 className="text-xl font-black mb-3">{active.title}</h1>
      <Card className="bg-card/80 mb-3 min-h-[300px]"><CardContent className="p-4 space-y-2">
        {transcript.map((t, i) => (<div key={i} className={`p-2 rounded ${t.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}><div className="text-xs uppercase text-muted-foreground">{t.role}</div><div className="text-sm whitespace-pre-wrap">{t.content}</div></div>))}
      </CardContent></Card>
      {score ? (
        <Card className="bg-primary/10"><CardContent className="p-4">
          <div className="font-black text-lg mb-2">Score: {score.score}/100</div>
          <p className="text-sm whitespace-pre-wrap">{score.feedback}</p>
        </CardContent></Card>
      ) : (
        <div className="flex gap-2">
          <Input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Your reply..." />
          <Button onClick={send}><Send className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={complete}>Finish</Button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Role-Play Scenarios</h1>
      <div className="grid sm:grid-cols-2 gap-3">{(data?.scenarios ?? []).map((s: any) => (
        <Card key={s.id} className="bg-card/80 hover:border-primary/40 cursor-pointer" onClick={() => start(s)}><CardContent className="p-4">
          <div className="flex justify-between mb-1"><h3 className="font-bold text-sm">{s.title}</h3><Badge variant="outline">{s.difficulty}</Badge></div>
          <p className="text-xs text-muted-foreground">{s.description}</p>
        </CardContent></Card>
      ))}</div>
    </div>
  );
}

// ────── 360 ──────
function Feedback360Panel() {
  const { data, refetch } = useMentor("feedback360.list");
  const create = async () => { await mentorCall("feedback360.create", {}); refetch(); };
  const copy = (token: string) => { navigator.clipboard.writeText(`${window.location.origin}/mentor-360/${token}`); toast.success("Link copied"); };
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">360° Feedback</h1>
      <Button onClick={create} className="mb-4"><Plus className="w-4 h-4 mr-1" />New request</Button>
      <div className="space-y-3">{(data?.requests ?? []).map((r: any) => {
        const responses = (data?.responses ?? []).filter((rs: any) => rs.request_id === r.id);
        return (
          <Card key={r.id} className="bg-card/80"><CardContent className="p-4">
            <div className="flex justify-between mb-2"><span className="text-sm font-bold">{responses.length} responses</span><Button size="sm" variant="outline" onClick={() => copy(r.token)}><Copy className="w-3 h-3 mr-1" />Copy link</Button></div>
            {responses.map((rs: any) => (
              <div key={rs.id} className="text-xs text-muted-foreground p-2 bg-muted rounded mb-1">
                <div className="font-bold">{rs.relationship ?? "Anonymous"}</div>
                {Object.entries(rs.responses).map(([q, a]: any) => (<div key={q}><span className="opacity-70">{q}:</span> {a}</div>))}
              </div>
            ))}
          </CardContent></Card>
        );
      })}</div>
    </div>
  );
}

// ────── NUDGES ──────
function NudgesPanel() {
  const { data, refetch } = useMentor("nudges.today");
  const gen = async (area: string) => { await mentorCall("nudges.generate", { area }); refetch(); };
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Daily Nudges</h1>
      <div className="flex gap-2 flex-wrap mb-4">{AREAS.map((a) => <Button key={a} size="sm" variant="outline" onClick={() => gen(a)}>+ {a}</Button>)}</div>
      <div className="space-y-2">{(data?.nudges ?? []).map((n: any) => (
        <Card key={n.id} className="bg-card/80"><CardContent className="p-3 text-sm flex items-start gap-2">
          <Badge variant="outline">{n.area}</Badge>
          <span className="flex-1">{n.message}</span>
        </CardContent></Card>
      ))}</div>
    </div>
  );
}

// ────── GOALS ──────
function GoalsPanel() {
  const { data, refetch } = useMentor("goals.list");
  const [title, setTitle] = useState(""); const [area, setArea] = useState("career"); const [deadline, setDeadline] = useState("");
  const create = useMentorMutation("goals.create", ["goals.list"]);
  const onCreate = async () => { if (!title) return; await create.mutateAsync({ title, area, deadline: deadline || null }); setTitle(""); refetch(); };
  const toggle = async (id: string, c: boolean) => { await mentorCall("goals.toggle_milestone", { milestone_id: id, completed: c }); refetch(); };
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">SMART Goals</h1>
      <Card className="bg-card/80 mb-4"><CardContent className="p-4 space-y-2">
        <Input placeholder="Goal title..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex gap-2 flex-wrap">{AREAS.map((a) => <Badge key={a} variant={area === a ? "default" : "outline"} className="cursor-pointer" onClick={() => setArea(a)}>{a}</Badge>)}</div>
        <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <Button onClick={onCreate} disabled={create.isPending}>{create.isPending ? "AI breaking down..." : "Create with AI milestones"}</Button>
      </CardContent></Card>
      <div className="space-y-3">{(data?.goals ?? []).map((g: any) => (
        <Card key={g.id} className="bg-card/80"><CardContent className="p-4">
          <div className="flex justify-between mb-1"><h3 className="font-bold">{g.title}</h3><Badge>{g.progress}%</Badge></div>
          <Progress value={g.progress} className="h-2 mb-2" />
          {g.smart_specific && <p className="text-xs text-muted-foreground mb-2"><b>S:</b> {g.smart_specific}</p>}
          {(g.milestones ?? []).map((m: any) => (
            <label key={m.id} className="flex items-center gap-2 text-sm mb-1 cursor-pointer">
              <input type="checkbox" checked={m.completed} onChange={(e) => toggle(m.id, e.target.checked)} />
              <span className={m.completed ? "line-through text-muted-foreground" : ""}>{m.title}</span>
            </label>
          ))}
        </CardContent></Card>
      ))}</div>
    </div>
  );
}

// ────── REFLECTIONS ──────
function ReflectionsPanel() {
  const [area, setArea] = useState("mindset"); const [mood, setMood] = useState("neutral"); const [prompt, setPrompt] = useState<any>(null);
  const draw = async () => { const r = await mentorCall("prompts.draw", { area, mood }); setPrompt(r.prompt); };
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Reflection Prompts</h1>
      <div className="flex gap-2 flex-wrap mb-2">{AREAS.map((a) => <Badge key={a} variant={area === a ? "default" : "outline"} className="cursor-pointer" onClick={() => setArea(a)}>{a}</Badge>)}</div>
      <div className="flex gap-2 mb-3">{["low", "neutral", "high"].map((m) => <Badge key={m} variant={mood === m ? "default" : "outline"} className="cursor-pointer" onClick={() => setMood(m)}>{m}</Badge>)}</div>
      <Button onClick={draw}>Draw a prompt</Button>
      {prompt && <Card className="bg-card/80 mt-4"><CardContent className="p-5"><p className="text-lg font-bold mb-2">{prompt.prompt}</p>{prompt.follow_up && <p className="text-sm text-muted-foreground">→ {prompt.follow_up}</p>}</CardContent></Card>}
    </div>
  );
}

// ────── HABITS ──────
function HabitsPanel() {
  const { data, refetch } = useMentor("habits.list");
  const [title, setTitle] = useState(""); const [area, setArea] = useState("fitness");
  const create = async () => { if (!title) return; await mentorCall("habits.create", { title, area }); setTitle(""); refetch(); };
  const log = async (id: string) => { await mentorCall("habits.log", { habit_id: id, completed: true }); refetch(); toast.success("Logged"); };
  const freeze = async (id: string) => { await mentorCall("habits.use_freeze", { habit_id: id }); refetch(); toast.success("Freeze used"); };
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Habits</h1>
      <Card className="bg-card/80 mb-4"><CardContent className="p-3 space-y-2 flex flex-col">
        <Input placeholder="e.g. 20-min walk" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex gap-2 flex-wrap">{AREAS.map((a) => <Badge key={a} variant={area === a ? "default" : "outline"} className="cursor-pointer" onClick={() => setArea(a)}>{a}</Badge>)}</div>
        <Button onClick={create}>Add habit</Button>
      </CardContent></Card>
      <div className="space-y-2">{(data?.habits ?? []).map((h: any) => (
        <Card key={h.id} className="bg-card/80"><CardContent className="p-3 flex justify-between items-center">
          <div><div className="font-bold text-sm">{h.title}</div><div className="text-xs text-muted-foreground">🔥 {h.current_streak} · best {h.best_streak} · ❄️ {h.freeze_tokens}</div></div>
          <div className="flex gap-1"><Button size="sm" onClick={() => log(h.id)}><Check className="w-3 h-3" /></Button><Button size="sm" variant="outline" disabled={h.freeze_tokens < 1} onClick={() => freeze(h.id)}>❄️</Button></div>
        </CardContent></Card>
      ))}</div>
    </div>
  );
}

// ────── COACH ──────
function CoachPanel() {
  const { data } = useMentor("coach.list");
  const [active, setActive] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]); const [input, setInput] = useState("");
  const [area, setArea] = useState("mindset");
  const send = async () => {
    if (!input || !active) return;
    const um = input; setInput("");
    const next = [...msgs, { role: "user", content: um }];
    setMsgs(next);
    const r = await mentorCall("coach.chat", { coach_slug: active.slug, area, message: um, history: msgs });
    setMsgs([...next, { role: "assistant", content: r.reply }]);
  };
  if (active) return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => { setActive(null); setMsgs([]); }}>← Coaches</Button>
      <h1 className="text-xl font-black mb-2">{active.name}</h1>
      <div className="flex gap-2 mb-3 flex-wrap">{AREAS.map((a) => <Badge key={a} variant={area === a ? "default" : "outline"} className="cursor-pointer" onClick={() => setArea(a)}>{a}</Badge>)}</div>
      <Card className="bg-card/80 mb-3 min-h-[300px]"><CardContent className="p-4 space-y-2">
        {msgs.map((m, i) => <div key={i} className={`p-2 rounded text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}>{m.content}</div>)}
      </CardContent></Card>
      <div className="flex gap-2"><Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Talk to your coach..." /><Button onClick={send}><Send className="w-4 h-4" /></Button></div>
    </div>
  );
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Coach Personalities</h1>
      <div className="grid sm:grid-cols-2 gap-3">{(data?.coaches ?? []).map((c: any) => (
        <Card key={c.id} className={`bg-gradient-to-br ${c.color} bg-opacity-10 cursor-pointer hover:scale-[1.02] transition`} onClick={() => setActive(c)}>
          <CardContent className="p-5"><h3 className="font-black text-lg mb-1">{c.name}</h3><p className="text-sm opacity-90">{c.description}</p></CardContent>
        </Card>
      ))}</div>
    </div>
  );
}

// ────── SUMMARIES ──────
function SummariesPanel() {
  const { data } = useMentor("summary.list");
  const [area, setArea] = useState("mindset"); const [transcript, setTranscript] = useState("");
  const gen = async () => { if (!transcript) return; await mentorCall("summary.generate", { area, transcript }); setTranscript(""); toast.success("Saved"); };
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Session Summaries</h1>
      <Card className="bg-card/80 mb-4"><CardContent className="p-4 space-y-2">
        <div className="flex gap-2 flex-wrap">{AREAS.map((a) => <Badge key={a} variant={area === a ? "default" : "outline"} className="cursor-pointer" onClick={() => setArea(a)}>{a}</Badge>)}</div>
        <Textarea rows={5} placeholder="Paste session transcript..." value={transcript} onChange={(e) => setTranscript(e.target.value)} />
        <Button onClick={gen}>Summarise with AI</Button>
      </CardContent></Card>
      <div className="space-y-2">{(data?.summaries ?? []).map((s: any) => (
        <Card key={s.id} className="bg-card/80"><CardContent className="p-4 text-sm">
          <div className="flex justify-between mb-1"><Badge>{s.area}</Badge><span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span></div>
          <p className="mb-2">{s.summary}</p>
          {!!s.commitments?.length && <div><b>Commitments:</b><ul className="list-disc list-inside text-xs">{s.commitments.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul></div>}
        </CardContent></Card>
      ))}</div>
    </div>
  );
}

// ────── VOICE JOURNAL ──────
function VoiceJournalPanel() {
  const { data, refetch } = useMentor("voice.list");
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transcribeBlob = async (blob: Blob, format: "webm" | "mp3" | "wav" | "m4a") => {
    setTranscribing(true);
    try {
      const b64 = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onloadend = () => res((r.result as string).split(",")[1]);
        r.readAsDataURL(blob);
      });
      const { data: tr, error } = await supabaseInvoke("voice-to-text", { audio: b64, format });
      if (error || tr?.error) {
        toast.error(tr?.error ?? "Transcription failed");
        return;
      }
      setText((prev) => (prev ? `${prev}\n\n${tr?.text ?? ""}` : tr?.text ?? ""));
      toast.success("Transcribed");
    } finally {
      setTranscribing(false);
    }
  };

  const start = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("Microphone not available. Use file upload or type below.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream); recRef.current = rec; chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeBlob(blob, "webm");
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start(); setRecording(true);
    } catch (e: any) {
      toast.error(e.message ?? "Mic access denied — use file upload instead");
    }
  };
  const stop = () => { recRef.current?.stop(); setRecording(false); };

  const onFile = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    const ext = (f.name.split(".").pop() ?? "webm").toLowerCase();
    const format = (["mp3", "wav", "m4a", "webm"].includes(ext) ? ext : "webm") as "webm" | "mp3" | "wav" | "m4a";
    await transcribeBlob(f, format);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const save = async () => {
    if (!text.trim()) return;
    await mentorCall("voice.journal", { transcript: text });
    setText("");
    refetch();
    toast.success("Saved with AI insights");
  };

  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Voice Journal</h1>
      <Card className="bg-card/80 mb-4"><CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={recording ? stop : start} variant={recording ? "destructive" : "default"} disabled={transcribing}>
            {recording ? "⏹ Stop" : "🎙️ Record"}
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={transcribing || recording}>
            📁 Upload audio
          </Button>
          <input ref={fileInputRef} type="file" accept="audio/*,.webm,.mp3,.wav,.m4a" className="hidden" onChange={onFile} />
        </div>
        {transcribing && <p className="text-xs text-muted-foreground">Transcribing…</p>}
        <Textarea rows={5} placeholder="Or type your entry directly here…" value={text} onChange={(e) => setText(e.target.value)} />
        <Button onClick={save} disabled={!text.trim() || transcribing}>Save with emotion detection</Button>
        <p className="text-[10px] text-muted-foreground">No mic? Upload an audio file or type your entry — AI will still detect emotion + add insights.</p>
      </CardContent></Card>
      <div className="space-y-2">{(data?.entries ?? []).map((e: any) => (
        <Card key={e.id} className="bg-card/80"><CardContent className="p-3 text-sm">
          <div className="flex justify-between mb-1"><Badge variant="outline">{e.detected_emotion}</Badge><span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</span></div>
          <p className="text-xs whitespace-pre-wrap mb-2">{e.transcript}</p>
          {e.ai_insights && <p className="text-xs text-primary">{e.ai_insights}</p>}
        </CardContent></Card>
      ))}</div>
    </div>
  );
}

async function supabaseInvoke(fn: string, body: any) {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase.functions.invoke(fn, { body });
}

// ────── CBT ──────
function CBTPanel() {
  const { data, refetch } = useMentor("cbt.programs");
  const start = async (id: string) => { await mentorCall("cbt.start", { program_id: id }); refetch(); };
  const completeDay = async (program_id: string, day: number) => { await mentorCall("cbt.complete_day", { program_id, day }); refetch(); };
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">CBT Programs</h1>
      <div className="space-y-3">{(data?.programs ?? []).map((p: any) => {
        const prog = p.progress;
        const day = prog?.current_day ?? 1;
        const today = (p.days ?? []).find((d: any) => d.day === day);
        return (
          <Card key={p.id} className="bg-card/80"><CardContent className="p-4">
            <div className="flex justify-between mb-1"><h3 className="font-bold">{p.title}</h3><Badge>{p.duration_days} days</Badge></div>
            <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
            {prog ? (
              <div>
                <Progress value={(prog.completed_days?.length ?? 0) / p.duration_days * 100} className="h-2 mb-2" />
                <div className="text-sm">Day {day}{today ? `: ${today.title}` : ""}</div>
                {today && <p className="text-xs text-muted-foreground mb-2">{today.exercise}</p>}
                <Button size="sm" onClick={() => completeDay(p.id, day)}>Mark day {day} done</Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => start(p.id)}>Start program</Button>
            )}
          </CardContent></Card>
        );
      })}</div>
    </div>
  );
}
