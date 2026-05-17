import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquareWarning, Mail, LineChart, Bell, BookOpen, Bot, ShieldCheck, Brain, Loader2, Trash2, Send,
} from "lucide-react";
import {
  useChatImport, useEmailScan, useSentimentTimeline, useWatchlist,
  useRedFlagLookup, useTruthChat, useTrustScore, useTacticClassify,
} from "@/hooks/useLieDetectorParity";

const COST = 6;

const Header = ({ icon: Icon, title, color }: any) => (
  <CardHeader className="pb-3">
    <CardTitle className="text-base flex items-center gap-2">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span>{title}</span>
      <Badge variant="outline" className="ml-auto text-[10px]">{COST} credits</Badge>
    </CardTitle>
  </CardHeader>
);

// ==== 1. Chat Import ====
function ChatImportTool() {
  const { items, run } = useChatImport();
  const [text, setText] = useState("");
  const [app, setApp] = useState("whatsapp");
  const latest = run.data || items[0]?.analysis;
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <Header icon={MessageSquareWarning} title="Chat Import Analyzer" color="from-rose-500 to-red-500" />
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {["whatsapp", "imessage", "telegram"].map((a) => (
            <Button key={a} size="sm" variant={app === a ? "default" : "outline"} onClick={() => setApp(a)} className="capitalize">{a}</Button>
          ))}
        </div>
        <Textarea rows={5} placeholder="Paste exported chat (e.g. WhatsApp .txt content)" value={text} onChange={(e) => setText(e.target.value)} />
        <Button disabled={run.isPending || text.length < 30} onClick={() => run.mutate({ raw_text: text, source_app: app })} className="w-full">
          {run.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Analyze ({COST} cr)
        </Button>
        {latest && (
          <div className="text-xs space-y-2 p-3 rounded-lg bg-muted/30">
            <div>Overall score: <strong>{latest.overall_score}/100</strong></div>
            <div className="text-muted-foreground">{latest.summary}</div>
            {(latest.red_flag_phrases || []).slice(0, 5).map((p: string, i: number) => (
              <Badge key={i} variant="destructive" className="mr-1 text-[10px]">{p}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==== 2. Email Scan ====
function EmailScanTool() {
  const { run } = useEmailScan();
  const [subject, setSubject] = useState("");
  const [sender, setSender] = useState("");
  const [body, setBody] = useState("");
  const r = run.data;
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <Header icon={Mail} title="Email Lie & Phishing Scan" color="from-orange-500 to-amber-500" />
      <CardContent className="space-y-3">
        <Input placeholder="From: (optional)" value={sender} onChange={(e) => setSender(e.target.value)} />
        <Input placeholder="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Textarea rows={4} placeholder="Email body" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button disabled={run.isPending || body.length < 20} onClick={() => run.mutate({ subject, sender, body })} className="w-full">
          {run.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Scan Email ({COST} cr)
        </Button>
        {r && (
          <div className="text-xs space-y-2 p-3 rounded-lg bg-muted/30">
            <div>Truthfulness: <strong>{r.truthfulness_score}/100</strong> · Phishing risk: <Badge variant={r.phishing_risk === "high" ? "destructive" : "outline"}>{r.phishing_risk}</Badge></div>
            <div className="text-muted-foreground">{r.summary}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==== 3. Sentiment Timeline ====
function SentimentTimelineTool() {
  const { run } = useSentimentTimeline();
  const [text, setText] = useState("");
  const r = run.data;
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <Header icon={LineChart} title="Sentiment Timeline" color="from-cyan-500 to-blue-500" />
      <CardContent className="space-y-3">
        <Textarea rows={5} placeholder="One message per line" value={text} onChange={(e) => setText(e.target.value)} />
        <Button disabled={run.isPending || text.split("\n").filter(Boolean).length < 3} onClick={() => run.mutate({ messages: text.split("\n").filter(Boolean) })} className="w-full">
          {run.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Map Timeline ({COST} cr)
        </Button>
        {r?.points && (
          <div className="space-y-1">
            {r.points.slice(0, 12).map((p: any) => (
              <div key={p.idx} className="flex items-center gap-2 text-[11px]">
                <span className="w-6 text-muted-foreground">#{p.idx}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${p.sentiment >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${Math.min(100, Math.abs(p.sentiment))}%`, marginLeft: p.sentiment < 0 ? 0 : "50%" }}
                  />
                </div>
                <span className="text-muted-foreground w-20 truncate">{p.label}</span>
              </div>
            ))}
            {r.summary && <p className="text-xs text-muted-foreground pt-2">{r.summary}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==== 4. Watchlist Triggers (no AI) ====
function WatchlistTool() {
  const { items, create, remove, scan } = useWatchlist();
  const [label, setLabel] = useState("");
  const [kw, setKw] = useState("");
  const [scanText, setScanText] = useState("");
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </div>
          Watchlist Triggers
          <Badge variant="outline" className="ml-auto text-[10px]">Free</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Input placeholder="Label (e.g. Gaslighting words)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Input placeholder="Keywords (comma-separated)" value={kw} onChange={(e) => setKw(e.target.value)} />
          <Button size="sm" disabled={create.isPending || !label || !kw} onClick={() => {
            create.mutate({ label, keywords: kw.split(",").map((x) => x.trim()).filter(Boolean) });
            setLabel(""); setKw("");
          }} className="w-full">Add Trigger</Button>
        </div>
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {items.map((t: any) => (
              <div key={t.id} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs">
                <div className="flex-1">
                  <div className="font-medium">{t.label}</div>
                  <div className="text-muted-foreground truncate">{(t.keywords || []).join(", ")}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove.mutate(t.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Textarea rows={2} placeholder="Paste text to scan against triggers" value={scanText} onChange={(e) => setScanText(e.target.value)} />
        <Button size="sm" variant="outline" disabled={!scanText || scan.isPending} onClick={() => scan.mutate(scanText)} className="w-full">Scan</Button>
        {scan.data && (
          <div className="text-xs p-2 rounded bg-muted/30">
            {scan.data.total === 0 ? "No matches." : (
              <div>
                <div className="font-medium mb-1">{scan.data.total} matches:</div>
                {scan.data.hits.map((h: any, i: number) => (
                  <Badge key={i} variant="destructive" className="mr-1 text-[10px]">{h.label}: {h.keyword}</Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==== 5. Red Flag Dictionary ====
function RedFlagTool() {
  const { run } = useRedFlagLookup();
  const [phrase, setPhrase] = useState("");
  const r = run.data;
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <Header icon={BookOpen} title="Red Flag Dictionary" color="from-red-500 to-pink-500" />
      <CardContent className="space-y-3">
        <Input placeholder='e.g. "You\'re overreacting"' value={phrase} onChange={(e) => setPhrase(e.target.value)} />
        <Button disabled={run.isPending || !phrase} onClick={() => run.mutate(phrase)} className="w-full">
          {run.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Look Up ({COST} cr)
        </Button>
        {r && (
          <div className="text-xs space-y-2 p-3 rounded-lg bg-muted/30">
            <div className="flex gap-2"><Badge>{r.category}</Badge><Badge variant="outline">{r.manipulation_type}</Badge><Badge variant={r.severity === "high" ? "destructive" : "outline"}>{r.severity}</Badge></div>
            <p><strong>Why it's a red flag:</strong> {r.why_red_flag}</p>
            <p><strong>Typical intent:</strong> {r.typical_intent}</p>
            {r.healthier_alternatives && (
              <div>
                <strong>Healthier:</strong>
                <ul className="list-disc pl-4 mt-1">
                  {r.healthier_alternatives.map((a: string, i: number) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==== 6. Truth Chat ====
function TruthChatTool() {
  const { sessions, send } = useTruthChat();
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [msg, setMsg] = useState("");
  const current = sessions.find((s: any) => s.id === sessionId) || (send.data as any)?.session;
  const messages = (current?.messages || []) as any[];

  const onSend = () => {
    if (!msg.trim()) return;
    send.mutate({ session_id: sessionId, message: msg }, {
      onSuccess: (data: any) => { setSessionId(data.session?.id); setMsg(""); },
    });
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <Header icon={Bot} title="Truth Chat — Detective Vox" color="from-indigo-500 to-purple-500" />
      <CardContent className="space-y-3">
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" variant={!sessionId ? "default" : "outline"} onClick={() => setSessionId(undefined)}>New</Button>
          {sessions.slice(0, 4).map((s: any) => (
            <Button key={s.id} size="sm" variant={sessionId === s.id ? "default" : "outline"} onClick={() => setSessionId(s.id)} className="text-[10px] max-w-[120px] truncate">
              {s.title}
            </Button>
          ))}
        </div>
        <ScrollArea className="h-48 rounded-lg border bg-background/30 p-2">
          {messages.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">Ask Detective Vox about any suspicious message, behavior, or situation.</p>}
          <div className="space-y-2">
            {messages.map((m: any, i: number) => (
              <div key={i} className={`text-xs p-2 rounded-lg ${m.role === "user" ? "bg-primary/10 ml-6" : "bg-muted/40 mr-6"}`}>
                <div className="font-medium mb-1 text-[10px] uppercase text-muted-foreground">{m.role === "user" ? "You" : "Vox"}</div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input placeholder="Ask the detective..." value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSend()} />
          <Button size="icon" disabled={send.isPending || !msg} onClick={onSend}>
            {send.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">{COST} credits per reply</p>
      </CardContent>
    </Card>
  );
}

// ==== 7. Trust Score Tracker ====
function TrustScoreTool() {
  const { items, score, remove } = useTrustScore();
  const [contact, setContact] = useState("");
  const [text, setText] = useState("");
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <Header icon={ShieldCheck} title="Trust Score Tracker" color="from-emerald-500 to-teal-500" />
      <CardContent className="space-y-3">
        <Input placeholder="Contact name" value={contact} onChange={(e) => setContact(e.target.value)} />
        <Textarea rows={3} placeholder="Paste a message from them to score" value={text} onChange={(e) => setText(e.target.value)} />
        <Button disabled={score.isPending || !contact || text.length < 10} onClick={() => { score.mutate({ contact_name: contact, sample_text: text }); setText(""); }} className="w-full">
          {score.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Score Sample ({COST} cr)
        </Button>
        <div className="space-y-2">
          {items.map((it: any) => (
            <div key={it.id} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs">
              <div className="flex-1">
                <div className="font-medium">{it.contact_name}</div>
                <div className="text-muted-foreground">{it.sample_count} samples</div>
              </div>
              <div className={`text-lg font-bold ${it.score >= 70 ? "text-emerald-500" : it.score >= 40 ? "text-amber-500" : "text-rose-500"}`}>{it.score}</div>
              <Button size="icon" variant="ghost" onClick={() => remove.mutate(it.id)}><Trash2 className="w-3 h-3" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ==== 8. Tactic Classifier ====
function TacticClassifyTool() {
  const { run } = useTacticClassify();
  const [text, setText] = useState("");
  const r = run.data;
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <Header icon={Brain} title="Manipulation Tactic Classifier" color="from-fuchsia-500 to-pink-500" />
      <CardContent className="space-y-3">
        <Textarea rows={4} placeholder="Paste a message — detects gaslighting, DARVO, love-bombing, deflection, etc." value={text} onChange={(e) => setText(e.target.value)} />
        <Button disabled={run.isPending || text.length < 10} onClick={() => run.mutate(text)} className="w-full">
          {run.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Classify ({COST} cr)
        </Button>
        {r && (
          <div className="text-xs space-y-2 p-3 rounded-lg bg-muted/30">
            <div className="flex gap-2 flex-wrap">
              {(r.tactics || []).map((t: any, i: number) => (
                <Badge key={i} variant="destructive">{t.name} · {Math.round(t.confidence * 100)}%</Badge>
              ))}
            </div>
            {r.educational_note && <p className="text-muted-foreground">{r.educational_note}</p>}
            {r.summary && <p>{r.summary}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LieDetectorParityPack() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
        <span className="text-xs font-mono uppercase tracking-widest text-pink-400">Parity Pack — Conversational Forensics</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
      </div>
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full h-auto">
          <TabsTrigger value="chat" className="text-[10px]">Chat</TabsTrigger>
          <TabsTrigger value="email" className="text-[10px]">Email</TabsTrigger>
          <TabsTrigger value="sentiment" className="text-[10px]">Sentiment</TabsTrigger>
          <TabsTrigger value="watch" className="text-[10px]">Watchlist</TabsTrigger>
          <TabsTrigger value="redflag" className="text-[10px]">Red Flags</TabsTrigger>
          <TabsTrigger value="truth" className="text-[10px]">Truth Chat</TabsTrigger>
          <TabsTrigger value="trust" className="text-[10px]">Trust</TabsTrigger>
          <TabsTrigger value="tactic" className="text-[10px]">Tactics</TabsTrigger>
        </TabsList>
        <TabsContent value="chat"><ChatImportTool /></TabsContent>
        <TabsContent value="email"><EmailScanTool /></TabsContent>
        <TabsContent value="sentiment"><SentimentTimelineTool /></TabsContent>
        <TabsContent value="watch"><WatchlistTool /></TabsContent>
        <TabsContent value="redflag"><RedFlagTool /></TabsContent>
        <TabsContent value="truth"><TruthChatTool /></TabsContent>
        <TabsContent value="trust"><TrustScoreTool /></TabsContent>
        <TabsContent value="tactic"><TacticClassifyTool /></TabsContent>
      </Tabs>
    </div>
  );
}
