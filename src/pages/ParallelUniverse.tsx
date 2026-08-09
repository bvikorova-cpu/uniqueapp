import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles, GitBranch, Atom, Infinity as InfinityIcon, Telescope, Layers,
  Loader2, Copy, Download, Zap, Compass, Coins, Globe2, Wand2, Shuffle,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AiMarkdown } from "@/components/common/AiMarkdown";

type Scenario = {
  icon: typeof GitBranch;
  title: string;
  desc: string;
  cost: number;
  focus: string;
};

const SCENARIOS: Scenario[] = [
  { icon: GitBranch, title: "Pivotal Decision", desc: "The fork you almost took — traced 20 years forward", cost: 5, focus: "one single decision reversed, and the compounding consequences year by year" },
  { icon: Atom, title: "Career Multiverse", desc: "Three alternate professional lives, fully lived", cost: 5, focus: "three distinct career timelines with concrete milestones, incomes, cities and trade-offs" },
  { icon: Telescope, title: "Future Self in 2046", desc: "Most likely, most unexpected, most fulfilled", cost: 5, focus: "three versions of the user 20 years from now and the habit that separates them" },
  { icon: Layers, title: "Romantic Timelines", desc: "Love branches that diverged from one message", cost: 5, focus: "relationship timelines, who they became, and the emotional lesson each branch carries" },
  { icon: Globe2, title: "The City You Didn't Move To", desc: "A whole life in the place you left behind", cost: 5, focus: "a geographic divergence — daily life, language, friendships, identity shift" },
  { icon: Coins, title: "The Risk You Didn't Take", desc: "If you had bet on yourself that year", cost: 5, focus: "a financial or entrepreneurial risk taken, including the failure branch and the recovery" },
  { icon: InfinityIcon, title: "Dream Self Reality", desc: "Every abandoned dream, actually pursued", cost: 4, focus: "the dream fully pursued — the cost it demanded and what it gave back" },
  { icon: Sparkles, title: "Soul Mission Variant", desc: "The version of you living the deeper purpose", cost: 4, focus: "purpose, service, and inner life rather than external achievement" },
  { icon: Compass, title: "Convergence Point", desc: "Where all your timelines meet again", cost: 4, focus: "the traits that survive in every timeline — the unchangeable core of this person" },
];

const TONES = [
  { value: "cinematic", label: "Cinematic & vivid" },
  { value: "hopeful", label: "Warm & hopeful" },
  { value: "brutally honest", label: "Brutally honest" },
  { value: "literary", label: "Literary & poetic" },
  { value: "analytical", label: "Analytical & strategic" },
];

const DEPTHS = [
  { value: "short", label: "Snapshot", hint: "~250 words" },
  { value: "standard", label: "Full story", hint: "~500 words" },
  { value: "deep", label: "Deep dive", hint: "~900 words" },
];

export default function ParallelUniverse() {
  const { user } = useAuth();
  const [seed, setSeed] = useState("");
  const [age, setAge] = useState("");
  const [crossroad, setCrossroad] = useState("");
  const [divergeYear, setDivergeYear] = useState("");
  const [tone, setTone] = useState("cinematic");
  const [depth, setDepth] = useState("standard");
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

  const wordTarget = depth === "short" ? 250 : depth === "deep" ? 900 : 500;

  const buildPrompt = (s: Scenario) => `You are a speculative-biography writer who maps alternate life timelines with emotional precision. Never use bullet-point filler, never repeat the user's input back verbatim, never give generic advice.

Write a "parallel universe" reading titled "${s.title}".
Angle: ${s.focus}.
Tone: ${tone}. Voice: second person ("you"). Target length: about ${wordTarget} words.

Structure it in clean Markdown with these sections:
## The Divergence
The exact moment reality splits${divergeYear ? ` (around ${divergeYear})` : ""} — one concrete scene, sensory detail.
## The Timeline
Chronological beats of that other life, each with a year label and a real consequence (work, money, people, place, health).
## Who You Became
The personality of that other self: what they are proud of, what quietly costs them.
## What This Timeline Is Telling You
2–3 sharp, specific insights the user can act on in *this* reality. No platitudes.

USER CONTEXT
${age ? `Age: ${age}\n` : ""}${crossroad ? `Key crossroad: ${crossroad}\n` : ""}Self-description: ${seed}`;

  const run = async (s: Scenario) => {
    if (!user) {
      toast.error("Please sign in first");
      window.location.href = "/auth?redirect=/parallel-universe";
      return;
    }
    if (seed.trim().length < 25) {
      toast.error("Write at least a sentence or two about yourself — the richer the context, the better the timeline");
      return;
    }
    setLoading(s.title);
    setResult(null);
    setActiveTitle(s.title);
    try {
      const { data, error } = await supabase.functions.invoke("ai-text-generator", {
        body: { prompt: buildPrompt(s) },
      });
      if (error) throw error;
      const text = data?.text ?? data?.result ?? "";
      if (!text) throw new Error("No scenario produced. Try again in a moment.");
      setResult(text);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to generate");
    } finally {
      setLoading(null);
    }
  };

  const surprise = () => run(SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]);

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast.success("Copied");
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([`# ${activeTitle}\n\n${result}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(activeTitle ?? "timeline").toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm mb-4">
            <InfinityIcon className="w-4 h-4" /> Parallel Universe Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Explore the lives you didn't live</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nine deep timeline readings — each one traces a divergence year by year, then tells you what that
            other self is trying to teach the you that exists.
          </p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your context</CardTitle>
            <CardDescription>
              The more specific you are, the less generic every timeline becomes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="32" />
              </div>
              <div>
                <Label htmlFor="diverge">Divergence year</Label>
                <Input id="diverge" inputMode="numeric" value={divergeYear} onChange={(e) => setDivergeYear(e.target.value)} placeholder="2016" />
              </div>
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="crossroad">Key crossroad (optional)</Label>
              <Input id="crossroad" value={crossroad} onChange={(e) => setCrossroad(e.target.value)}
                placeholder="I chose a stable job over moving abroad to study film" />
            </div>

            <div>
              <Label htmlFor="seed">About you</Label>
              <Textarea id="seed" rows={4} value={seed} onChange={(e) => setSeed(e.target.value)}
                placeholder="I'm a software engineer in a long relationship, quietly restless. At 22 I almost moved abroad to study film. I save carefully, avoid risk, and wonder what boldness would have cost me…" />
              <p className="text-xs text-muted-foreground mt-1">{seed.trim().length} characters · aim for 200+</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <Label className="mb-1.5 block">Reading depth</Label>
                <Tabs value={depth} onValueChange={setDepth}>
                  <TabsList className="w-full">
                    {DEPTHS.map((d) => (
                      <TabsTrigger key={d.value} value={d.value} className="flex-1 text-xs">
                        {d.label}
                        <span className="hidden sm:inline text-muted-foreground ml-1">· {d.hint}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              <Button variant="outline" onClick={surprise} disabled={!!loading} className="gap-2">
                <Shuffle className="w-4 h-4" /> Surprise me
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {SCENARIOS.map((s) => (
            <Card key={s.title} className="hover:border-accent/50 transition flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <s.icon className="w-8 h-8 text-accent mb-2" />
                  <Badge variant="outline" className="border-primary/30 text-primary font-bold gap-1">
                    <Zap className="w-3 h-3" /> {s.cost} cr
                  </Badge>
                </div>
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button onClick={() => run(s)} disabled={!!loading} className="w-full gap-2">
                  {loading === s.title ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {loading === s.title ? "Writing your timeline…" : "Imagine this life"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <Card className="mb-8">
            <CardContent className="py-10 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
              <p className="text-sm text-muted-foreground">Tracing the divergence for “{loading}”…</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>{activeTitle}</CardTitle>
                <CardDescription>Generated for your context · {DEPTHS.find(d => d.value === depth)?.label}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={copyResult} aria-label="Copy reading">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={downloadResult} aria-label="Download reading">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AiMarkdown content={result} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
