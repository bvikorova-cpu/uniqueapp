import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAICredits } from "@/hooks/useAICredits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { FLYER_STYLES, FLYER_STYLE_CATEGORIES, FLYER_ASPECTS, FLYER_LANGUAGES } from "@/data/flyerStyles";
import { Megaphone, Loader2, Upload, Download, Sparkles, Trash2, Coins, X, Search } from "lucide-react";
import heroVideo from "@/assets/flyer-studio-hero.mp4.asset.json";

const COST = 3;

type Brief = {
  headline: string;
  subheadline: string;
  businessName: string;
  subject: string;
  audience: string;
  offer: string;
  date: string;
  time: string;
  venue: string;
  phone: string;
  website: string;
  social: string;
  bullets: string;
  cta: string;
  finePrint: string;
  tone: string;
  colors: string;
  imagery: string;
  avoid: string;
  notes: string;
};

const EMPTY_BRIEF: Brief = {
  headline: "", subheadline: "", businessName: "", subject: "", audience: "", offer: "",
  date: "", time: "", venue: "", phone: "", website: "", social: "", bullets: "",
  cta: "", finePrint: "", tone: "", colors: "", imagery: "", avoid: "", notes: "",
};

type FlyerRow = {
  id: string;
  title: string;
  style_name: string;
  language: string;
  aspect_ratio: string;
  image_url: string;
  created_at: string;
};

export default function FlyerStudio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { paidBalance, refresh } = useAICredits();

  const [brief, setBrief] = useState<Brief>(EMPTY_BRIEF);
  const [styleId, setStyleId] = useState(FLYER_STYLES[0].id);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("en");
  const [aspect, setAspect] = useState<string>("3:4");
  const [refs, setRefs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<FlyerRow[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = (k: keyof Brief) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setBrief((b) => ({ ...b, [k]: e.target.value }));

  const filteredStyles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FLYER_STYLES.filter(
      (s) =>
        (category === "all" || s.category === category) &&
        (!q || s.name.toLowerCase().includes(q) || s.prompt.toLowerCase().includes(q)),
    );
  }, [category, query]);

  const selectedStyle = FLYER_STYLES.find((s) => s.id === styleId) ?? FLYER_STYLES[0];

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("flyer_designs")
      .select("id, title, style_name, language, aspect_ratio, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(24);
    setHistory((data as FlyerRow[]) ?? []);
  }, [user]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !user) return;
    const list = Array.from(files).slice(0, 3 - refs.length);
    if (!list.length) { toast.error("You can attach up to 3 reference images"); return; }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of list) {
        if (f.size > 8 * 1024 * 1024) { toast.error(`${f.name} is larger than 8 MB`); continue; }
        const ext = f.name.split(".").pop() || "png";
        const path = `${user.id}/flyer-refs/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, f, { contentType: f.type || undefined });
        if (error) throw error;
        urls.push(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
      }
      setRefs((r) => [...r, ...urls]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const generate = async () => {
    if (!brief.headline.trim()) { toast.error("Please fill in the main headline"); return; }
    if (paidBalance < COST) { navigate("/ai-credits"); toast.error(`You need ${COST} credits for one flyer`); return; }
    setGenerating(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("flyer-generate", {
        body: {
          brief,
          styleId: selectedStyle.id,
          styleName: selectedStyle.name,
          stylePrompt: selectedStyle.prompt,
          language,
          languageLabel: FLYER_LANGUAGES.find((l) => l.code === language)?.label ?? "English",
          aspect,
          referenceImages: refs,
        },
      });
      if (error) {
        let msg = error.message;
        try {
          const res = (error as unknown as { context?: Response }).context;
          if (res?.text) msg = JSON.parse(await res.clone().text())?.error ?? msg;
        } catch { /* keep original */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      setResult(data.imageUrl);
      toast.success(`Flyer ready — ${COST} credits used`);
      refresh();
      loadHistory();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Flyer generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("flyer_designs").delete().eq("id", id);
    if (error) { toast.error("Could not delete this flyer"); return; }
    setHistory((h) => h.filter((x) => x.id !== id));
  };

  const download = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/[^\w-]+/g, "-").slice(0, 40) || "flyer"}.png`;
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <SEO title="Promotional Flyer Studio — Unique" description="Create print-ready promotional flyers with AI in any language." />
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Megaphone className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-xl font-bold">Promotional Flyer Studio</h1>
            <p className="text-muted-foreground">
              Sign in to design print-ready flyers from {FLYER_STYLES.length} preset styles. Each flyer costs {COST} credits.
            </p>
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <SEO title="Promotional Flyer Studio — Unique" description="Answer a detailed brief, pick one of 149 preset styles and generate a print-ready promotional flyer in any language for 3 credits." />

      <div className="relative h-[220px] md:h-[320px] overflow-hidden">
        <video src={heroVideo.url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-end pb-6 text-center px-4">
          <h1 className="text-3xl md:text-4xl font-black">Promotional Flyer Studio</h1>
          <p className="text-muted-foreground max-w-xl">
            Tell us exactly what the flyer should say, pick a style and get a print-ready design in any language.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            <Badge variant="secondary" className="gap-1"><Coins className="h-3 w-3" /> {COST} credits per flyer</Badge>
            <Badge variant="secondary">{FLYER_STYLES.length} preset styles</Badge>
            <Badge variant="secondary">{FLYER_LANGUAGES.length} languages</Badge>
            <Badge variant="outline">Balance: {paidBalance}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-6">
        {/* 1. Content brief */}
        <Card>
          <CardHeader><CardTitle className="text-base">1. What should the flyer say?</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="headline">Main headline *</Label>
              <Input id="headline" value={brief.headline} onChange={set("headline")} placeholder="Start driving school with TL Motion" maxLength={120} />
            </div>
            <div>
              <Label htmlFor="subheadline">Sub-headline</Label>
              <Input id="subheadline" value={brief.subheadline} onChange={set("subheadline")} placeholder="Courses starting every month" />
            </div>
            <div>
              <Label htmlFor="businessName">Business / organiser name</Label>
              <Input id="businessName" value={brief.businessName} onChange={set("businessName")} placeholder="TL Motion" />
            </div>
            <div>
              <Label htmlFor="offer">Price or offer</Label>
              <Input id="offer" value={brief.offer} onChange={set("offer")} placeholder="199 € / month" />
            </div>
            <div>
              <Label htmlFor="cta">Call to action</Label>
              <Input id="cta" value={brief.cta} onChange={set("cta")} placeholder="Sign up today" />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" value={brief.date} onChange={set("date")} placeholder="September 12" />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input id="time" value={brief.time} onChange={set("time")} placeholder="17:00" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="venue">Venue / address</Label>
              <Input id="venue" value={brief.venue} onChange={set("venue")} placeholder="Culture House, main square" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={brief.phone} onChange={set("phone")} placeholder="0907 685 799" />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={brief.website} onChange={set("website")} placeholder="example.com" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="social">Social handles</Label>
              <Input id="social" value={brief.social} onChange={set("social")} placeholder="@yourbrand" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bullets">Key selling points (one per line)</Label>
              <Textarea id="bullets" rows={4} value={brief.bullets} onChange={set("bullets")} placeholder={"Experienced instructors\nModern cars\nFlexible hours\nIndividual approach"} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="finePrint">Small print</Label>
              <Input id="finePrint" value={brief.finePrint} onChange={set("finePrint")} placeholder="Offer valid until the end of the month" />
            </div>
          </CardContent>
        </Card>

        {/* 2. Creative direction */}
        <Card>
          <CardHeader><CardTitle className="text-base">2. How should it look and feel?</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">What are you promoting?</Label>
              <Input id="subject" value={brief.subject} onChange={set("subject")} placeholder="Driving school courses" />
            </div>
            <div>
              <Label htmlFor="audience">Target audience</Label>
              <Input id="audience" value={brief.audience} onChange={set("audience")} placeholder="Young adults 17-25" />
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Input id="tone" value={brief.tone} onChange={set("tone")} placeholder="Energetic and trustworthy" />
            </div>
            <div>
              <Label htmlFor="colors">Brand colours</Label>
              <Input id="colors" value={brief.colors} onChange={set("colors")} placeholder="Red, black, white" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="imagery">Imagery that must appear</Label>
              <Textarea id="imagery" rows={2} value={brief.imagery} onChange={set("imagery")} placeholder="Three cars in front of a castle, roof signs on the cars" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="avoid">Things to avoid</Label>
              <Input id="avoid" value={brief.avoid} onChange={set("avoid")} placeholder="No people's faces, no dark backgrounds" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes">Anything else</Label>
              <Textarea id="notes" rows={3} value={brief.notes} onChange={set("notes")} placeholder="Leave clear space in the bottom right for a QR code" />
            </div>
            <div>
              <Label>Flyer language</Label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full h-10 border border-input rounded-md bg-background px-3 text-sm">
                {FLYER_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Format</Label>
              <select value={aspect} onChange={(e) => setAspect(e.target.value)}
                className="mt-1 w-full h-10 border border-input rounded-md bg-background px-3 text-sm">
                {FLYER_ASPECTS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 3. Reference images */}
        <Card>
          <CardHeader><CardTitle className="text-base">3. Your images (optional, up to 3)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Attach product photos, a portrait or your logo. The AI keeps them as the real subject of the flyer.
            </p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 text-muted-foreground mb-2" />}
              <span className="text-sm text-muted-foreground">Click to upload images (max 8 MB each)</span>
              <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
            {refs.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {refs.map((u) => (
                  <div key={u} className="relative">
                    <img src={u} alt="Reference" className="h-24 w-24 object-cover rounded-lg border" />
                    <button type="button" onClick={() => setRefs((r) => r.filter((x) => x !== u))}
                      className="absolute -top-2 -right-2 bg-background border rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Style picker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">4. Pick a style ({FLYER_STYLES.length} presets)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search styles…" className="pl-9" />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="h-10 border border-input rounded-md bg-background px-3 text-sm">
                <option value="all">All categories</option>
                {FLYER_STYLE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredStyles.map((s) => (
                <button key={s.id} type="button" onClick={() => setStyleId(s.id)}
                  className={`text-left rounded-lg border-2 p-3 transition ${styleId === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <span className="block font-semibold text-sm">{s.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{s.category}</span>
                  <span className="block text-[11px] text-muted-foreground mt-1 line-clamp-2">{s.prompt}</span>
                </button>
              ))}
              {filteredStyles.length === 0 && <p className="text-sm text-muted-foreground">No style matches your search.</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border p-4">
          <div className="text-sm">
            <span className="font-semibold">{selectedStyle.name}</span>
            <span className="text-muted-foreground"> · {FLYER_LANGUAGES.find((l) => l.code === language)?.label} · {aspect}</span>
          </div>
          <Button size="lg" variant="premium" onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {generating ? "Designing your flyer…" : `Generate flyer (${COST} credits)`}
          </Button>
        </div>

        {result && (
          <Card>
            <CardHeader><CardTitle className="text-base">Your flyer</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <img src={result} alt={`Promotional flyer: ${brief.headline}`} className="w-full rounded-lg border" />
              <Button variant="outline" onClick={() => download(result, brief.headline)}>
                <Download className="h-4 w-4 mr-2" /> Download PNG
              </Button>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">My flyers</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {history.map((f) => (
                <div key={f.id} className="space-y-2">
                  <img src={f.image_url} alt={f.title} loading="lazy" className="w-full rounded-lg border aspect-[3/4] object-cover" />
                  <p className="text-xs font-medium line-clamp-1">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground">{f.style_name}</p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => download(f.image_url, f.title)}>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(f.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">How it works</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Fill in the brief — every line you write is printed on the flyer exactly as you typed it.</p>
            <p>2. Choose the flyer language ({FLYER_LANGUAGES.length} available) and the format (A4/A5 portrait, story, square or landscape).</p>
            <p>3. Optionally attach your own photos or logo so the design uses your real product.</p>
            <p>4. Pick one of {FLYER_STYLES.length} preset styles, then generate. Each flyer costs {COST} credits from your AI credit balance.</p>
            <p>5. Download the PNG for print or social media. Every flyer is saved in “My flyers”.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
