import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trash2, Check, X, Play, Pause, RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";
import { KIDS_FEATURES, ChildPicker } from "./KidsHub";
import { useKidsChildren, kidsCall, KidsChild } from "@/hooks/useKidsRouter";

function Shell({ title, desc, children }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/kids-channel/hub" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Kids Hub</Link>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {desc && <p className="text-muted-foreground">{desc}</p>}
        </div>
        <ChildPicker />
        {children}
      </div>
    </div>
  );
}

function NeedChild() {
  return <Card className="p-6 text-center">Add or pick a child profile above to continue.</Card>;
}

// 1. Children manager
function ChildrenPanel() {
  const { children, refresh } = useKidsChildren();
  return (
    <div className="grid gap-3">
      {children.map(c => (
        <Card key={c.id} className="p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">{c.name} <Badge variant="secondary">{c.age}y</Badge></div>
            <div className="text-xs text-muted-foreground">Avatar {c.avatar} · Pet {c.pet}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={async () => { if (confirm("Delete profile?")) { await kidsCall("children.delete", { id: c.id }); await refresh(); } }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </Card>
      ))}
      {children.length === 0 && <Card className="p-6 text-center text-muted-foreground">No children yet — add one above.</Card>}
    </div>
  );
}

// 2. Age filter
function AgeFilterPanel({ child }: { child: KidsChild }) {
  const [s, setS] = useState<any>(null);
  useEffect(() => { kidsCall("age_band.get", { child_id: child.id }).then(r => setS((r as any).band || { band: "6-8", allow_videos: true, allow_ai_chat: true })); }, [child.id]);
  if (!s) return null;
  const save = async () => { await kidsCall("age_band.update", { child_id: child.id, ...s }); toast.success("Saved"); };
  return (
    <Card className="p-6 space-y-4">
      <div>
        <Label>Age band</Label>
        <Select value={s.band} onValueChange={v => setS({ ...s, band: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="6-8">Ages 6-8 (Gentle)</SelectItem>
            <SelectItem value="9-10">Ages 9-10 (Curious)</SelectItem>
            <SelectItem value="11-12">Ages 11-12 (Explorer)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between"><Label>Allow videos</Label><Switch checked={s.allow_videos} onCheckedChange={v => setS({...s,allow_videos:v})} /></div>
      <div className="flex items-center justify-between"><Label>Allow AI chat</Label><Switch checked={s.allow_ai_chat} onCheckedChange={v => setS({...s,allow_ai_chat:v})} /></div>
      <Button onClick={save}>Save</Button>
    </Card>
  );
}

// 3. Daily learning path
function PathPanel({ child }: { child: KidsChild }) {
  const [path, setPath] = useState<any>(null);
  const load = () => kidsCall("path.today", { child_id: child.id }).then(r => setPath((r as any).path));
  useEffect(() => { load(); }, [child.id]);
  const complete = async (id: string) => { await kidsCall("path.complete_step", { step_id: id }); await load(); toast.success("+10 XP, +5 🪙"); };
  if (!path) return null;
  const steps = (path.kids_learning_path_steps || []).sort((a:any,b:any)=>a.position-b.position);
  const done = steps.filter((s:any)=>s.completed).length;
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center"><div><div className="font-bold text-xl">Theme: {path.theme}</div><div className="text-xs text-muted-foreground">{path.day_date}</div></div><Badge>{done}/{steps.length}</Badge></div>
      <Progress value={(done/steps.length)*100} />
      <div className="space-y-2">
        {steps.map((s:any) => (
          <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg border ${s.completed?'bg-emerald-500/10 border-emerald-500/30':'bg-card'}`}>
            <div><div className="font-medium">{s.title}</div><div className="text-xs text-muted-foreground">{s.kind}</div></div>
            {s.completed ? <Badge className="bg-emerald-500"><Check className="w-3 h-3 mr-1"/>Done</Badge> : <Button size="sm" onClick={() => complete(s.id)}>Complete</Button>}
          </div>
        ))}
      </div>
    </Card>
  );
}

// 4. Saved/Offline
function SavedPanel({ child }: { child: KidsChild }) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const load = () => kidsCall("saved.list", { child_id: child.id }).then(r => setItems((r as any).items));
  useEffect(() => { load(); }, [child.id]);
  const add = async () => { if (!title) return; await kidsCall("saved.add", { child_id: child.id, kind: "note", title, payload: { offline: true } }); setTitle(""); await load(); };
  const remove = async (id: string) => { await kidsCall("saved.remove", { id }); await load(); };
  // mark offline-available via localStorage
  useEffect(() => { if (items.length) localStorage.setItem(`kids_saved_${child.id}`, JSON.stringify(items)); }, [items, child.id]);
  return (
    <Card className="p-6 space-y-4">
      <div className="flex gap-2"><Input placeholder="Save a story/video title..." value={title} onChange={e=>setTitle(e.target.value)} /><Button onClick={add}>Save</Button></div>
      <div className="text-xs text-muted-foreground">Cached locally for offline access ({items.length} items)</div>
      <div className="space-y-2">{items.map(i => (
        <div key={i.id} className="flex justify-between items-center p-3 border rounded-lg">
          <div><div className="font-medium">{i.title}</div><div className="text-xs text-muted-foreground">{i.kind}</div></div>
          <Button size="sm" variant="ghost" onClick={() => remove(i.id)}><Trash2 className="w-4 h-4"/></Button>
        </div>
      ))}</div>
    </Card>
  );
}

// 5. Parental reports
function ReportsPanel({ child }: { child: KidsChild }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { kidsCall("reports.summary", { child_id: child.id }).then(r => setData(r)); }, [child.id]);
  if (!data) return null;
  const mins = Math.round(data.total_seconds / 60);
  const topics = Object.entries(data.by_topic || {}) as any[];
  return (
    <Card className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center"><div className="text-3xl font-bold">{mins}</div><div className="text-xs text-muted-foreground">Minutes (7d)</div></Card>
        <Card className="p-4 text-center"><div className="text-3xl font-bold">{data.sample_count}</div><div className="text-xs text-muted-foreground">Activities</div></Card>
        <Card className="p-4 text-center"><div className="text-3xl font-bold">{topics.length}</div><div className="text-xs text-muted-foreground">Topics</div></Card>
      </div>
      <div className="space-y-2">
        {topics.map(([t, v]: any) => (
          <div key={t} className="p-3 border rounded-lg">
            <div className="flex justify-between"><span className="font-medium">{t}</span><span className="text-sm text-muted-foreground">{Math.round(v.seconds/60)}m · avg score {v.avg_score}</span></div>
            <Progress value={Math.min(100, v.avg_score)} className="mt-2" />
          </div>
        ))}
        {topics.length === 0 && <div className="text-center text-muted-foreground">No activity logged yet.</div>}
      </div>
    </Card>
  );
}

// 6. Screen time
function ScreenTimePanel({ child }: { child: KidsChild }) {
  const [s, setS] = useState<any>(null);
  const [used, setUsed] = useState(0);
  const load = () => kidsCall("screen.get", { child_id: child.id }).then((r: any) => { setS(r.rules); setUsed(r.used_seconds); });
  useEffect(() => { load(); }, [child.id]);
  if (!s) return null;
  const usedMin = Math.round(used / 60);
  const pct = Math.min(100, (usedMin / s.daily_minutes) * 100);
  const save = async () => { await kidsCall("screen.update", { child_id: child.id, ...s }); toast.success("Saved"); load(); };
  return (
    <Card className="p-6 space-y-4">
      <div>
        <div className="flex justify-between text-sm"><span>Today's use</span><span>{usedMin} / {s.daily_minutes} min</span></div>
        <Progress value={pct} className={pct>=100?"bg-red-200":""} />
        {pct >= 100 && s.hard_lock && <Badge variant="destructive" className="mt-2">Hard locked — limit reached</Badge>}
      </div>
      <div><Label>Daily minutes: {s.daily_minutes}</Label><Slider value={[s.daily_minutes]} min={15} max={240} step={5} onValueChange={v=>setS({...s,daily_minutes:v[0]})} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Bedtime start</Label><Input type="time" value={s.bedtime_start.slice(0,5)} onChange={e=>setS({...s,bedtime_start:e.target.value})} /></div>
        <div><Label>Bedtime end</Label><Input type="time" value={s.bedtime_end.slice(0,5)} onChange={e=>setS({...s,bedtime_end:e.target.value})} /></div>
      </div>
      <div className="flex justify-between items-center"><Label>Hard lock when limit hit</Label><Switch checked={s.hard_lock} onCheckedChange={v=>setS({...s,hard_lock:v})} /></div>
      <Button onClick={save}>Save</Button>
    </Card>
  );
}

// 7. Curriculum
function CurriculumPanel({ child }: { child: KidsChild }) {
  const [list, setList] = useState<any[]>([]);
  const load = () => kidsCall("curriculum.get", { child_id: child.id }).then((r:any) => setList(r.progress));
  useEffect(() => { load(); }, [child.id]);
  const bump = async (subject: string) => { await kidsCall("curriculum.bump", { child_id: child.id, subject, xp: 25 }); await load(); toast.success(`+25 XP in ${subject}`); };
  const subjects = ["math","reading","science","art","music"];
  return (
    <div className="grid gap-3">
      {subjects.map(s => {
        const p = list.find(x => x.subject === s);
        const xp = p?.xp || 0; const lvl = p?.level || 1; const inLvl = xp % 100;
        return (
          <Card key={s} className="p-4 space-y-2">
            <div className="flex justify-between"><span className="font-semibold capitalize">{s}</span><Badge>Level {lvl}</Badge></div>
            <Progress value={inLvl} />
            <div className="flex justify-between text-xs text-muted-foreground"><span>{xp} XP total</span><Button size="sm" variant="outline" onClick={() => bump(s)}>+25 XP</Button></div>
          </Card>
        );
      })}
    </div>
  );
}

// 8. AI recommendations
function RecommendPanel({ child }: { child: KidsChild }) {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const load = () => kidsCall("recs.list", { child_id: child.id }).then((r:any) => setRecs(r.recs));
  useEffect(() => { load(); }, [child.id]);
  const gen = async () => { setLoading(true); try { await kidsCall("recs.generate", { child_id: child.id, age: child.age }); await load(); } finally { setLoading(false); } };
  return (
    <Card className="p-6 space-y-4">
      <Button onClick={gen} disabled={loading}><RefreshCw className={`w-4 h-4 mr-1 ${loading?'animate-spin':''}`}/>Generate fresh ideas</Button>
      <div className="space-y-2">{recs.map(r => (
        <Link to={r.target_route || "/kids-channel/hub"} key={r.id}>
          <Card className="p-4 hover:scale-[1.01] transition cursor-pointer"><div className="font-semibold">{r.title}</div><div className="text-sm text-muted-foreground">{r.reason}</div></Card>
        </Link>
      ))}</div>
    </Card>
  );
}

// 9. Safety
function SafetyPanel() {
  const [s, setS] = useState<any>(null);
  const [bl, setBl] = useState("");
  useEffect(() => { kidsCall("safety.get").then((r:any) => setS(r.safety)); }, []);
  if (!s) return null;
  const save = async () => { await kidsCall("safety.update", s); toast.success("Saved"); };
  return (
    <Card className="p-6 space-y-3">
      <div className="flex justify-between items-center"><Label>Block violence</Label><Switch checked={s.block_violence} onCheckedChange={v=>setS({...s,block_violence:v})}/></div>
      <div className="flex justify-between items-center"><Label>Block scary content</Label><Switch checked={s.block_scary} onCheckedChange={v=>setS({...s,block_scary:v})}/></div>
      <div className="flex justify-between items-center"><Label>Block external links</Label><Switch checked={s.block_external_links} onCheckedChange={v=>setS({...s,block_external_links:v})}/></div>
      <div className="flex justify-between items-center"><Label>Strict: block unknown topics</Label><Switch checked={s.block_unknown_topics} onCheckedChange={v=>setS({...s,block_unknown_topics:v})}/></div>
      <div>
        <Label>Custom blocked keywords</Label>
        <div className="flex gap-2"><Input value={bl} onChange={e=>setBl(e.target.value)} placeholder="word" /><Button onClick={() => { if(bl){ setS({...s, custom_blocklist:[...(s.custom_blocklist||[]),bl]}); setBl(""); } }}>Add</Button></div>
        <div className="flex gap-1 flex-wrap mt-2">{(s.custom_blocklist||[]).map((w:string,i:number)=>(
          <Badge key={i} variant="secondary" className="cursor-pointer" onClick={()=>setS({...s,custom_blocklist:s.custom_blocklist.filter((_:any,j:number)=>j!==i)})}>{w} ×</Badge>
        ))}</div>
      </div>
      <Button onClick={save}>Save</Button>
    </Card>
  );
}

// 10. Approval queue
function ApprovalPanel({ child }: { child: KidsChild }) {
  const [items, setItems] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const load = () => kidsCall("approval.list").then((r:any) => setItems(r.items));
  useEffect(() => { load(); }, []);
  const submit = async () => { if (!draft) return; await kidsCall("approval.submit", { child_id: child.id, kind: "story", content: draft }); setDraft(""); await load(); toast.success("Sent for review"); };
  const review = async (id: string, status: string) => { await kidsCall("approval.review", { id, status }); await load(); };
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-2">
        <Label>Simulate a kid-submitted AI output</Label>
        <Textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="AI-generated story or answer..." />
        <Button onClick={submit}>Submit for parent review</Button>
      </Card>
      <div className="space-y-2">
        {items.map(i => (
          <Card key={i.id} className="p-4">
            <div className="flex justify-between"><Badge>{i.kind}</Badge><Badge variant={i.status==='pending'?'secondary':i.status==='approved'?'default':'destructive'}>{i.status}</Badge></div>
            <p className="mt-2">{i.content}</p>
            {i.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => review(i.id,'approved')}><Check className="w-4 h-4 mr-1"/>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => review(i.id,'rejected')}><X className="w-4 h-4 mr-1"/>Reject</Button>
              </div>
            )}
          </Card>
        ))}
        {items.length === 0 && <Card className="p-6 text-center text-muted-foreground">No pending outputs.</Card>}
      </div>
    </div>
  );
}

// 11. Narration
function NarrationPanel({ child }: { child: KidsChild }) {
  const [s, setS] = useState<any>(null);
  const [text, setText] = useState("Once upon a time, a curious fox went on a big adventure.");
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => { kidsCall("narration.get", { child_id: child.id }).then((r:any) => setS(r.prefs || { voice:"alloy", speed:1, auto_read:true })); }, [child.id]);
  if (!s) return null;
  const save = async () => { await kidsCall("narration.update", { child_id: child.id, ...s }); toast.success("Saved"); };
  const play = () => {
    if (!("speechSynthesis" in window)) { toast.error("TTS not supported"); return; }
    const u = new SpeechSynthesisUtterance(text); u.rate = s.speed; u.onend = () => setSpeaking(false);
    speechSynthesis.speak(u); setSpeaking(true);
  };
  const stop = () => { speechSynthesis.cancel(); setSpeaking(false); };
  return (
    <Card className="p-6 space-y-4">
      <div><Label>Voice</Label>
        <Select value={s.voice} onValueChange={v=>setS({...s,voice:v})}>
          <SelectTrigger><SelectValue/></SelectTrigger>
          <SelectContent>{["alloy","echo","fable","onyx","nova","shimmer"].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>Speed: {s.speed.toFixed(1)}x</Label><Slider value={[s.speed]} min={0.5} max={1.8} step={0.1} onValueChange={v=>setS({...s,speed:v[0]})}/></div>
      <div className="flex items-center justify-between"><Label>Auto-read</Label><Switch checked={s.auto_read} onCheckedChange={v=>setS({...s,auto_read:v})}/></div>
      <Textarea value={text} onChange={e=>setText(e.target.value)} />
      <div className="flex gap-2">
        {!speaking ? <Button onClick={play}><Play className="w-4 h-4 mr-1"/>Read aloud</Button> : <Button onClick={stop} variant="destructive"><Pause className="w-4 h-4 mr-1"/>Stop</Button>}
        <Button variant="outline" onClick={save}>Save prefs</Button>
      </div>
    </Card>
  );
}

// 12. Phonics
function PhonicsPanel({ child }: { child: KidsChild }) {
  const words = useMemo(() => ["cat","dog","sun","tree","star","moon","fish","book","frog","jump"], []);
  const [i, setI] = useState(0); const [ans, setAns] = useState(""); const [score, setScore] = useState(0); const [done, setDone] = useState(false);
  const target = words[i];
  const submit = async () => {
    const ok = ans.trim().toLowerCase() === target;
    if (ok) setScore(s => s+1);
    setAns("");
    if (i+1 >= words.length) {
      setDone(true);
      await kidsCall("minigame.submit", { child_id: child.id, game: "phonics", score: score + (ok?1:0), max_score: words.length, duration_seconds: 60 });
    } else setI(i+1);
  };
  if (done) return <Card className="p-6 text-center space-y-3"><h3 className="text-2xl font-bold">Done!</h3><p>Score: {score}/{words.length}</p><Button onClick={() => { setI(0); setScore(0); setDone(false); }}>Play again</Button></Card>;
  return (
    <Card className="p-6 space-y-4 text-center">
      <div className="text-sm text-muted-foreground">Word {i+1}/{words.length} · Score {score}</div>
      <Button variant="outline" onClick={() => { const u = new SpeechSynthesisUtterance(target); speechSynthesis.speak(u); }}><Play className="w-4 h-4 mr-1"/>Hear word</Button>
      <Input className="text-center text-xl" value={ans} onChange={e=>setAns(e.target.value)} placeholder="Type what you hear" onKeyDown={e=>e.key==='Enter'&&submit()} />
      <Button onClick={submit}>Check</Button>
    </Card>
  );
}

// 13. Math
function MathPanel({ child }: { child: KidsChild }) {
  const [diff, setDiff] = useState(1);
  useEffect(() => { kidsCall("difficulty.get", { child_id: child.id }).then((r:any) => { const m = (r.state||[]).find((x:any)=>x.subject==='math'); if (m) setDiff(m.difficulty); }); }, [child.id]);
  const max = diff * 10;
  const gen = () => ({ a: 1 + Math.floor(Math.random()*max), b: 1 + Math.floor(Math.random()*max) });
  const [q, setQ] = useState(gen()); const [ans, setAns] = useState(""); const [i, setI] = useState(0); const [score, setScore] = useState(0); const [done, setDone] = useState(false);
  const total = 10;
  const submit = async () => {
    const ok = parseInt(ans) === q.a + q.b; if (ok) setScore(s=>s+1);
    setAns("");
    if (i+1 >= total) {
      setDone(true);
      await kidsCall("minigame.submit", { child_id: child.id, game: "math", score: score + (ok?1:0), max_score: total, duration_seconds: 60 });
    } else { setI(i+1); setQ(gen()); }
  };
  if (done) return <Card className="p-6 text-center space-y-3"><h3 className="text-2xl font-bold">Done!</h3><p>Score: {score}/{total} · Difficulty {diff}</p><Button onClick={() => { setI(0); setScore(0); setDone(false); setQ(gen()); }}>Play again</Button></Card>;
  return (
    <Card className="p-6 text-center space-y-4">
      <div className="text-sm text-muted-foreground">Q {i+1}/{total} · Difficulty {diff} · Score {score}</div>
      <div className="text-4xl font-bold">{q.a} + {q.b} = ?</div>
      <Input className="text-center text-2xl" type="number" value={ans} onChange={e=>setAns(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} />
      <Button onClick={submit}>Check</Button>
    </Card>
  );
}

// 14. Difficulty
function DifficultyPanel({ child }: { child: KidsChild }) {
  const [state, setState] = useState<any[]>([]);
  useEffect(() => { kidsCall("difficulty.get", { child_id: child.id }).then((r:any) => setState(r.state)); }, [child.id]);
  return (
    <div className="grid gap-3">
      {state.map(s => (
        <Card key={s.id} className="p-4">
          <div className="flex justify-between"><span className="font-semibold capitalize">{s.subject}</span><Badge>Difficulty {s.difficulty}/10</Badge></div>
          <Progress value={s.difficulty*10} className="mt-2" />
          <div className="text-xs text-muted-foreground mt-1">Streak {s.streak} · auto-tunes after each game</div>
        </Card>
      ))}
      {state.length === 0 && <Card className="p-6 text-center text-muted-foreground">Play mini-games to seed difficulty.</Card>}
    </div>
  );
}

// 15. Pet/Avatar
function PetPanel({ child }: { child: KidsChild }) {
  const { refresh } = useKidsChildren();
  const [avatar, setAvatar] = useState(child.avatar);
  const [pet, setPet] = useState(child.pet);
  useEffect(() => { setAvatar(child.avatar); setPet(child.pet); }, [child.id]);
  const avatars = ["fox","bear","panda","owl","bunny","robot"];
  const pets = ["cat","dog","dragon","unicorn","turtle","penguin"];
  const save = async () => { await kidsCall("children.update", { id: child.id, avatar, pet }); await refresh(); toast.success("Updated"); };
  const emoji = (k: string) => ({fox:"🦊",bear:"🐻",panda:"🐼",owl:"🦉",bunny:"🐰",robot:"🤖",cat:"🐱",dog:"🐶",dragon:"🐉",unicorn:"🦄",turtle:"🐢",penguin:"🐧"} as any)[k] || "⭐";
  return (
    <Card className="p-6 space-y-4">
      <div className="text-center text-7xl">{emoji(avatar)} {emoji(pet)}</div>
      <div><Label>Avatar</Label>
        <div className="grid grid-cols-6 gap-2 mt-1">{avatars.map(a => <Button key={a} variant={avatar===a?"default":"outline"} onClick={()=>setAvatar(a)}>{emoji(a)}</Button>)}</div>
      </div>
      <div><Label>Pet companion</Label>
        <div className="grid grid-cols-6 gap-2 mt-1">{pets.map(p => <Button key={p} variant={pet===p?"default":"outline"} onClick={()=>setPet(p)}>{emoji(p)}</Button>)}</div>
      </div>
      <Button onClick={save}>Save</Button>
    </Card>
  );
}

// 16. Economy
function EconomyPanel({ child }: { child: KidsChild }) {
  const [e, setE] = useState<any>(null);
  useEffect(() => { kidsCall("economy.get", { child_id: child.id }).then((r:any) => setE(r.economy)); }, [child.id]);
  if (!e) return <Card className="p-6">No activity yet.</Card>;
  const level = Math.floor(e.xp / 100) + 1;
  const next = (level * 100) - e.xp;
  return (
    <Card className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <Card className="p-4"><div className="text-4xl font-bold">{e.xp}</div><div className="text-xs text-muted-foreground">XP · Lv {level}</div></Card>
        <Card className="p-4"><div className="text-4xl font-bold">🪙 {e.coins}</div><div className="text-xs text-muted-foreground">Coins</div></Card>
        <Card className="p-4"><div className="text-4xl font-bold">🔥 {e.streak_days}</div><div className="text-xs text-muted-foreground">Day streak</div></Card>
      </div>
      <div><Label>Next level: {next} XP to go</Label><Progress value={((e.xp % 100))} /></div>
    </Card>
  );
}

// 17. Assignments
function AssignmentsPanel({ child }: { child: KidsChild }) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [reward, setReward] = useState(10);
  const load = () => kidsCall("assignments.list").then((r:any) => setItems(r.items));
  useEffect(() => { load(); }, []);
  const create = async () => { if (!title) return; await kidsCall("assignments.create", { child_id: child.id, title, description: desc, reward_coins: reward }); setTitle(""); setDesc(""); await load(); };
  const done = async (id: string) => { await kidsCall("assignments.complete", { id }); await load(); toast.success("Marked done · coins awarded"); };
  const del = async (id: string) => { await kidsCall("assignments.delete", { id }); await load(); };
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-2">
        <Input placeholder="Assignment title" value={title} onChange={e=>setTitle(e.target.value)} />
        <Textarea placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
        <div className="flex gap-2 items-center"><Label>Reward coins</Label><Input className="w-24" type="number" value={reward} onChange={e=>setReward(parseInt(e.target.value)||0)} /><Button onClick={create}>Create</Button></div>
      </Card>
      <div className="space-y-2">{items.map(i => (
        <Card key={i.id} className="p-4 flex justify-between items-center">
          <div><div className="font-semibold">{i.title} {i.kids_child_profiles && <Badge variant="secondary">{i.kids_child_profiles.name}</Badge>}</div><div className="text-xs text-muted-foreground">{i.description} · 🪙 {i.reward_coins}</div></div>
          <div className="flex gap-2">{i.status!=='done' && <Button size="sm" onClick={() => done(i.id)}><Check className="w-4 h-4"/></Button>}<Button size="sm" variant="ghost" onClick={() => del(i.id)}><Trash2 className="w-4 h-4"/></Button></div>
        </Card>
      ))}</div>
    </div>
  );
}

// 18. Share
function SharePanel({ child }: { child: KidsChild }) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const load = () => kidsCall("shares.list").then((r:any) => setItems(r.items));
  useEffect(() => { load(); }, []);
  const create = async () => { if (!title) return; await kidsCall("shares.create", { child_id: child.id, kind: "creation", title, payload: {} }); setTitle(""); await load(); };
  const revoke = async (id: string) => { await kidsCall("shares.revoke", { id }); await load(); };
  const copyLink = (token: string) => { const url = `${window.location.origin}/kids-channel/share/${token}`; navigator.clipboard.writeText(url); toast.success("Link copied"); };
  return (
    <div className="space-y-4">
      <Card className="p-4 flex gap-2"><Input placeholder="Creation title" value={title} onChange={e=>setTitle(e.target.value)}/><Button onClick={create}>Create share link</Button></Card>
      <div className="space-y-2">{items.map(i => (
        <Card key={i.id} className="p-4 flex justify-between items-center">
          <div><div className="font-semibold">{i.title}</div><div className="text-xs text-muted-foreground">{i.kind} · token {i.share_token.slice(0,8)}…</div></div>
          <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => copyLink(i.share_token)}><Copy className="w-4 h-4"/></Button><Button size="sm" variant="ghost" onClick={() => revoke(i.id)}><Trash2 className="w-4 h-4"/></Button></div>
        </Card>
      ))}</div>
    </div>
  );
}

export default function KidsFeature() {
  const { slug } = useParams();
  const feature = KIDS_FEATURES.find(f => f.slug === slug);
  const { activeChild, loading } = useKidsChildren();
  if (!feature) return <Shell title="Not found"><Card className="p-6">Unknown feature.</Card></Shell>;

  const needsChild = !["safety","approval"].includes(feature.slug);
  if (needsChild && loading) return <Shell title={feature.title} desc={feature.desc}><Card className="p-6 text-center text-muted-foreground">Loading profile…</Card></Shell>;
  if (needsChild && !activeChild) return <Shell title={feature.title} desc={feature.desc}><NeedChild /></Shell>;

  let content: JSX.Element = <Card className="p-6">Coming soon</Card>;
  switch (feature.slug) {
    case "children": content = <ChildrenPanel />; break;
    case "age-filter": content = <AgeFilterPanel child={activeChild!} />; break;
    case "path": content = <PathPanel child={activeChild!} />; break;
    case "saved": content = <SavedPanel child={activeChild!} />; break;
    case "reports": content = <ReportsPanel child={activeChild!} />; break;
    case "screen-time": content = <ScreenTimePanel child={activeChild!} />; break;
    case "curriculum": content = <CurriculumPanel child={activeChild!} />; break;
    case "recommend": content = <RecommendPanel child={activeChild!} />; break;
    case "safety": content = <SafetyPanel />; break;
    case "approval": content = activeChild ? <ApprovalPanel child={activeChild} /> : <NeedChild/>; break;
    case "narration": content = <NarrationPanel child={activeChild!} />; break;
    case "phonics": content = <PhonicsPanel child={activeChild!} />; break;
    case "math": content = <MathPanel child={activeChild!} />; break;
    case "difficulty": content = <DifficultyPanel child={activeChild!} />; break;
    case "pet": content = <PetPanel child={activeChild!} />; break;
    case "economy": content = <EconomyPanel child={activeChild!} />; break;
    case "assignments": content = <AssignmentsPanel child={activeChild!} />; break;
    case "share": content = <SharePanel child={activeChild!} />; break;
  }
  return <Shell title={feature.title} desc={feature.desc}>{content}</Shell>;
}
