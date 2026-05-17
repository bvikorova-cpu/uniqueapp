import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Send, FileText, Heart, Users, KeyRound, Activity, Sparkles, Eye, Loader2, Trash2, Copy } from "lucide-react";
import {
  useToxicityScans, usePlatformReports, useRestorativeLetters,
  useTrustedAllies, useSafeWord, useWellbeingPulse, useDailyAffirmation, useBystanderTrainer,
} from "@/hooks/useSafetyParity";
import { toast } from "sonner";

const SCENARIOS = [
  { key: "group-chat-pile-on", label: "Group chat pile-on", text: "A classmate is being mocked in a group chat by 4 others. You're in the chat." },
  { key: "lunchroom-isolation", label: "Lunchroom isolation", text: "You see someone eating alone after being publicly excluded by their friend group." },
  { key: "anonymous-threats", label: "Anonymous threats", text: "A friend shows you anonymous DMs threatening to leak their photos." },
];

const PLATFORMS = ["Instagram","TikTok","Snapchat","Discord","Roblox","X (Twitter)","YouTube","Facebook","WhatsApp"];

export function SafetyParityPack() {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 space-y-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <ShieldAlert className="w-5 h-5 text-orange-400" />
        <h2 className="text-xl sm:text-2xl font-black text-foreground">Safety Parity Pack</h2>
        <Badge variant="outline" className="border-orange-500/40 text-orange-300">8 new tools</Badge>
        <Badge variant="outline" className="border-teal-500/40 text-teal-300">6 credits / AI action</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ToxicityCard />
        <PlatformReportCard />
        <RestorativeLetterCard />
        <WellbeingPulseCard />
        <DailyAffirmationCard />
        <BystanderTrainerCard />
        <TrustedAlliesCard />
        <SafeWordCard />
      </div>
    </motion.section>
  );
}

// 1. Toxicity Scanner
function ToxicityCard() {
  const { items, scan } = useToxicityScans();
  const [text, setText] = useState("");
  const latest = items[0];
  return (
    <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/5 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Eye className="w-4 h-4 text-orange-400" /> Toxicity Scanner</CardTitle>
        <CardDescription className="text-xs">Paste any message — AI rates toxicity & flags categories.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the message..." rows={3} className="text-xs" />
        <Button size="sm" disabled={!text.trim() || scan.isPending} onClick={() => scan.mutate(text, { onSuccess: () => setText("") })} className="w-full bg-orange-600 hover:bg-orange-500">
          {scan.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} Scan (6 cr)
        </Button>
        {latest && (
          <div className="mt-2 p-2 rounded-md bg-background/50 border border-border/40 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold">Toxicity: {latest.toxicity_score}/100</span>
              <Badge variant={latest.toxicity_score > 70 ? "destructive" : latest.toxicity_score > 40 ? "secondary" : "outline"}>
                {latest.toxicity_score > 70 ? "Severe" : latest.toxicity_score > 40 ? "Moderate" : "Low"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{latest.ai_analysis}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 2. Platform Report Templates
function PlatformReportCard() {
  const { items, generate } = usePlatformReports();
  const [platform, setPlatform] = useState("Instagram");
  const [summary, setSummary] = useState("");
  const latest = items[0];
  return (
    <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Send className="w-4 h-4 text-blue-400" /> Platform Report Letter</CardTitle>
        <CardDescription className="text-xs">Auto-draft a Trust & Safety report for any major platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
          <SelectContent>{PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What happened? (dates, usernames, behavior)" rows={3} className="text-xs" />
        <Button size="sm" disabled={!summary.trim() || generate.isPending} onClick={() => generate.mutate({ platform, incident_summary: summary }, { onSuccess: () => setSummary("") })} className="w-full bg-blue-600 hover:bg-blue-500">
          {generate.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} Draft letter (6 cr)
        </Button>
        {latest?.generated_letter && (
          <div className="p-2 rounded-md bg-background/50 border border-border/40 text-xs space-y-1 max-h-32 overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-background/80 py-1">
              <span className="font-bold">{latest.platform}</span>
              <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => { navigator.clipboard.writeText(latest.generated_letter); toast.success("Copied"); }}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="whitespace-pre-wrap text-muted-foreground">{latest.generated_letter}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 3. Restorative Letter Writer
function RestorativeLetterCard() {
  const { items, write } = useRestorativeLetters();
  const [recipient, setRecipient] = useState("school_admin");
  const [tone, setTone] = useState("firm");
  const [context, setContext] = useState("");
  const latest = items[0];
  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><FileText className="w-4 h-4 text-violet-400" /> Restorative Letter</CardTitle>
        <CardDescription className="text-xs">Dignified letter to bully, parent, teacher or admin.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Select value={recipient} onValueChange={setRecipient}>
            <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bully">Bully</SelectItem>
              <SelectItem value="parent">Their parent</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="school_admin">School admin</SelectItem>
              <SelectItem value="principal">Principal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="firm">Firm</SelectItem>
              <SelectItem value="compassionate">Compassionate</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="What happened & what change you want..." rows={3} className="text-xs" />
        <Button size="sm" disabled={!context.trim() || write.isPending} onClick={() => write.mutate({ recipient_type: recipient, context, tone }, { onSuccess: () => setContext("") })} className="w-full bg-violet-600 hover:bg-violet-500">
          {write.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} Draft (6 cr)
        </Button>
        {latest?.generated_letter && (
          <div className="p-2 rounded-md bg-background/50 border border-border/40 text-xs max-h-32 overflow-y-auto">
            <p className="whitespace-pre-wrap text-muted-foreground">{latest.generated_letter}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 4. Wellbeing Pulse
function WellbeingPulseCard() {
  const { items, submit } = useWellbeingPulse();
  const [mood, setMood] = useState([6]);
  const [anxiety, setAnxiety] = useState([5]);
  const [safety, setSafety] = useState([7]);
  const latest = items[0];
  return (
    <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Activity className="w-4 h-4 text-emerald-400" /> Wellbeing Pulse</CardTitle>
        <CardDescription className="text-xs">3 sliders → AI risk assessment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <PulseSlider label="Mood" value={mood} onChange={setMood} />
        <PulseSlider label="Anxiety" value={anxiety} onChange={setAnxiety} />
        <PulseSlider label="Safety" value={safety} onChange={setSafety} />
        <Button size="sm" disabled={submit.isPending} onClick={() => submit.mutate({ mood_score: mood[0], anxiety_score: anxiety[0], safety_score: safety[0] })} className="w-full bg-emerald-600 hover:bg-emerald-500">
          {submit.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} Check in (6 cr)
        </Button>
        {latest && (
          <div className="p-2 rounded-md bg-background/50 border border-border/40 text-xs">
            <Badge variant={latest.ai_risk_level === "severe" ? "destructive" : "outline"} className="mb-1">{latest.ai_risk_level}</Badge>
            <p className="text-muted-foreground">{latest.ai_advice}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function PulseSlider({ label, value, onChange }: { label: string; value: number[]; onChange: (v: number[]) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs"><Label>{label}</Label><span className="text-muted-foreground">{value[0]}/10</span></div>
      <Slider value={value} onValueChange={onChange} min={1} max={10} step={1} />
    </div>
  );
}

// 5. Daily Affirmation
function DailyAffirmationCard() {
  const { today, generate } = useDailyAffirmation();
  const [theme, setTheme] = useState("resilience");
  return (
    <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-rose-500/5 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Heart className="w-4 h-4 text-pink-400" /> Daily Affirmation</CardTitle>
        <CardDescription className="text-xs">One supportive line, refreshed daily.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="resilience">Resilience</SelectItem>
            <SelectItem value="self-worth">Self-worth</SelectItem>
            <SelectItem value="courage">Courage</SelectItem>
            <SelectItem value="hope">Hope</SelectItem>
            <SelectItem value="boundaries">Boundaries</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" disabled={generate.isPending} onClick={() => generate.mutate(theme)} className="w-full bg-pink-600 hover:bg-pink-500">
          {generate.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} {today ? "Refresh" : "Generate"} (6 cr)
        </Button>
        {today && (
          <div className="p-3 rounded-md bg-background/50 border border-border/40 text-sm italic text-foreground">
            "{today.affirmation}"
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 6. Bystander Trainer
function BystanderTrainerCard() {
  const { items, score } = useBystanderTrainer();
  const [sc, setSc] = useState(SCENARIOS[0].key);
  const [choice, setChoice] = useState("");
  const latest = items[0];
  const scenario = SCENARIOS.find(s => s.key === sc)!;
  return (
    <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Users className="w-4 h-4 text-cyan-400" /> Bystander Trainer</CardTitle>
        <CardDescription className="text-xs">Rehearse safe intervention choices.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Select value={sc} onValueChange={setSc}>
          <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
          <SelectContent>{SCENARIOS.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground italic">{scenario.text}</p>
        <Textarea value={choice} onChange={(e) => setChoice(e.target.value)} placeholder="What would you do?" rows={2} className="text-xs" />
        <Button size="sm" disabled={!choice.trim() || score.isPending} onClick={() => score.mutate({ scenario_key: sc, choice }, { onSuccess: () => setChoice("") })} className="w-full bg-cyan-600 hover:bg-cyan-500">
          {score.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} Score (6 cr)
        </Button>
        {latest && (
          <div className="p-2 rounded-md bg-background/50 border border-border/40 text-xs">
            <span className="font-bold">Score: {latest.score}/100</span>
            <p className="text-muted-foreground mt-1">{latest.feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 7. Trusted Allies
function TrustedAlliesCard() {
  const { items, add, remove } = useTrustedAllies();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rel, setRel] = useState("");
  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Users className="w-4 h-4 text-amber-400" /> Trusted Allies ({items.length}/5)</CardTitle>
        <CardDescription className="text-xs">Quick-call emergency contacts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1.5">
          {items.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50 border border-border/40 text-xs">
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{a.ally_name} <span className="text-muted-foreground font-normal">{a.relationship}</span></div>
                {a.ally_phone && <a href={`tel:${a.ally_phone}`} className="text-amber-400 hover:underline">{a.ally_phone}</a>}
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => remove.mutate(a.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        {items.length < 5 && (
          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-8 text-xs" />
            <div className="grid grid-cols-2 gap-1.5">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-8 text-xs" />
              <Input value={rel} onChange={(e) => setRel(e.target.value)} placeholder="Relationship" className="h-8 text-xs" />
            </div>
            <Button size="sm" disabled={!name.trim() || add.isPending} onClick={() => add.mutate({ ally_name: name, ally_phone: phone, relationship: rel }, { onSuccess: () => { setName(""); setPhone(""); setRel(""); } })} className="w-full bg-amber-600 hover:bg-amber-500">
              Add ally
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 8. Safe Word
function SafeWordCard() {
  const { row, save } = useSafeWord();
  const [code, setCode] = useState(row?.code_phrase || "");
  const [msg, setMsg] = useState(row?.alert_message || "I need help. Please contact me.");
  return (
    <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-rose-500/5 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="w-4 h-4 text-red-400" /> Safe Word / Discreet SOS</CardTitle>
        <CardDescription className="text-xs">Type your code anywhere in chat → triggers alert.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder='e.g. "blue lighthouse"' className="h-8 text-xs" />
        <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={2} className="text-xs" />
        <Button size="sm" disabled={!code.trim() || save.isPending} onClick={() => save.mutate({ code_phrase: code, alert_message: msg })} className="w-full bg-red-600 hover:bg-red-500">
          Save safe word
        </Button>
        {row && <p className="text-xs text-muted-foreground">Active code: <span className="font-mono">{row.code_phrase}</span></p>}
      </CardContent>
    </Card>
  );
}
