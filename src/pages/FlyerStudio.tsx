import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    if (!list.length) { toast.error(t("flyer.upload_error_too_many")); return; }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of list) {
        if (f.size > 8 * 1024 * 1024) { toast.error(t("flyer.upload_error_size", { name: f.name })); continue; }
        const ext = f.name.split(".").pop() || "png";
        const path = `${user.id}/flyer-refs/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, f, { contentType: f.type || undefined });
        if (error) throw error;
        urls.push(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
      }
      setRefs((r) => [...r, ...urls]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("flyer.upload_error_fail"));
    } finally {
      setUploading(false);
    }
  };

  const generate = async () => {
    if (!user) return;
    if (!brief.headline.trim()) {
      toast.error(t("flyer.required_headline"));
      return;
    }
    if (paidBalance < COST) {
      toast.error(t("flyer.insufficient_credits", { cost: COST, balance: paidBalance }));
      return;
    }

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
      toast.success(t("flyer.toast_ready", { cost: COST }));
      refresh();
      loadHistory();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("flyer.toast_generate_failed"));
    } finally {
      setGenerating(false);
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("flyer_designs").delete().eq("id", id);
    if (error) { toast.error(t("flyer.toast_delete_failed")); return; }
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
        <SEO title={`${t("flyer.title")} — Unique`} description={t("flyer.subtitle")} />
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Megaphone className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-xl font-bold">{t("flyer.title")}</h1>
            <p className="text-muted-foreground">
              {t("flyer.sign_in_desc", { count: FLYER_STYLES.length, cost: COST })}
            </p>
            <Button onClick={() => navigate("/auth")}>{t("flyer.sign_in_button")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <SEO title={`${t("flyer.title")} — Unique`} description={t("flyer.subtitle")} />

      <div className="relative h-[180px] sm:h-[200px] md:h-[300px] overflow-hidden mt-14 md:mt-16">
        <video src={heroVideo.url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-end pb-4 md:pb-8 text-center px-4">
          <h1 className="text-lg sm:text-2xl md:text-4xl font-black leading-tight">{t("flyer.title")}</h1>
          <p className="text-muted-foreground max-w-xl text-sm md:text-base mt-1">
            {t("flyer.subtitle")}
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-2 md:mt-3">
            <Badge variant="secondary" className="gap-1"><Coins className="h-3 w-3" /> {t("flyer.credit_badge", { cost: COST })}</Badge>
            <Badge variant="secondary">{t("flyer.style_badge", { count: FLYER_STYLES.length })}</Badge>
            <Badge variant="secondary">{t("flyer.language_badge", { count: FLYER_LANGUAGES.length })}</Badge>
            <Badge variant="outline">{t("flyer.balance", { balance: paidBalance })}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-6">
        {/* 1. Content brief */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t("flyer.section_content")}</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="headline">{t("flyer.main_headline")}</Label>
              <Input id="headline" value={brief.headline} onChange={set("headline")} placeholder={t("flyer.main_headline_placeholder")} maxLength={120} />
            </div>
            <div>
              <Label htmlFor="subheadline">{t("flyer.sub_headline")}</Label>
              <Input id="subheadline" value={brief.subheadline} onChange={set("subheadline")} placeholder={t("flyer.sub_headline_placeholder")} />
            </div>
            <div>
              <Label htmlFor="businessName">{t("flyer.business_name")}</Label>
              <Input id="businessName" value={brief.businessName} onChange={set("businessName")} placeholder={t("flyer.business_name_placeholder")} />
            </div>
            <div>
              <Label htmlFor="offer">{t("flyer.offer")}</Label>
              <Input id="offer" value={brief.offer} onChange={set("offer")} placeholder={t("flyer.offer_placeholder")} />
            </div>
            <div>
              <Label htmlFor="cta">{t("flyer.cta")}</Label>
              <Input id="cta" value={brief.cta} onChange={set("cta")} placeholder={t("flyer.cta_placeholder")} />
            </div>
            <div>
              <Label htmlFor="date">{t("flyer.date")}</Label>
              <Input id="date" value={brief.date} onChange={set("date")} placeholder={t("flyer.date_placeholder")} />
            </div>
            <div>
              <Label htmlFor="time">{t("flyer.time")}</Label>
              <Input id="time" value={brief.time} onChange={set("time")} placeholder={t("flyer.time_placeholder")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="venue">{t("flyer.venue")}</Label>
              <Input id="venue" value={brief.venue} onChange={set("venue")} placeholder={t("flyer.venue_placeholder")} />
            </div>
            <div>
              <Label htmlFor="phone">{t("flyer.phone")}</Label>
              <Input id="phone" value={brief.phone} onChange={set("phone")} placeholder={t("flyer.phone_placeholder")} />
            </div>
            <div>
              <Label htmlFor="website">{t("flyer.website")}</Label>
              <Input id="website" value={brief.website} onChange={set("website")} placeholder={t("flyer.website_placeholder")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="social">{t("flyer.social")}</Label>
              <Input id="social" value={brief.social} onChange={set("social")} placeholder={t("flyer.social_placeholder")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bullets">{t("flyer.bullets")}</Label>
              <Textarea id="bullets" rows={4} value={brief.bullets} onChange={set("bullets")} placeholder={t("flyer.bullets_placeholder")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="finePrint">{t("flyer.fine_print")}</Label>
              <Input id="finePrint" value={brief.finePrint} onChange={set("finePrint")} placeholder={t("flyer.fine_print_placeholder")} />
            </div>
          </CardContent>
        </Card>

        {/* 2. Creative direction */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t("flyer.section_look")}</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">{t("flyer.subject")}</Label>
              <Input id="subject" value={brief.subject} onChange={set("subject")} placeholder={t("flyer.subject_placeholder")} />
            </div>
            <div>
              <Label htmlFor="audience">{t("flyer.audience")}</Label>
              <Input id="audience" value={brief.audience} onChange={set("audience")} placeholder={t("flyer.audience_placeholder")} />
            </div>
            <div>
              <Label htmlFor="tone">{t("flyer.tone")}</Label>
              <Input id="tone" value={brief.tone} onChange={set("tone")} placeholder={t("flyer.tone_placeholder")} />
            </div>
            <div>
              <Label htmlFor="colors">{t("flyer.colors")}</Label>
              <Input id="colors" value={brief.colors} onChange={set("colors")} placeholder={t("flyer.colors_placeholder")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="imagery">{t("flyer.imagery")}</Label>
              <Textarea id="imagery" rows={2} value={brief.imagery} onChange={set("imagery")} placeholder={t("flyer.imagery_placeholder")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="avoid">{t("flyer.avoid")}</Label>
              <Input id="avoid" value={brief.avoid} onChange={set("avoid")} placeholder={t("flyer.avoid_placeholder")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes">{t("flyer.notes")}</Label>
              <Textarea id="notes" rows={3} value={brief.notes} onChange={set("notes")} placeholder={t("flyer.notes_placeholder")} />
            </div>
            <div>
              <Label>{t("flyer.language_label")}</Label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full h-10 border border-input rounded-md bg-background px-3 text-sm">
                {FLYER_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <Label>{t("flyer.format")}</Label>
              <select value={aspect} onChange={(e) => setAspect(e.target.value)}
                className="mt-1 w-full h-10 border border-input rounded-md bg-background px-3 text-sm">
                {FLYER_ASPECTS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 3. Reference images */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t("flyer.section_images")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("flyer.images_hint")}
            </p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 text-muted-foreground mb-2" />}
              <span className="text-sm text-muted-foreground">{t("flyer.upload_label")}</span>
              <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
            {refs.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {refs.map((u) => (
                  <div key={u} className="relative">
                    <img src={u} alt={t("flyer.reference_alt")} className="h-24 w-24 object-cover rounded-lg border" />
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
            <CardTitle className="text-base">{t("flyer.section_style", { count: FLYER_STYLES.length })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("flyer.search_styles")} className="pl-9" />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="h-10 border border-input rounded-md bg-background px-3 text-sm">
                <option value="all">{t("flyer.all_categories")}</option>
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
              {filteredStyles.length === 0 && <p className="text-sm text-muted-foreground">{t("flyer.no_styles")}</p>}
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
            {generating ? t("flyer.generating") : t("flyer.generate", { cost: COST })}
          </Button>
        </div>

        {result && (
          <Card>
            <CardHeader><CardTitle className="text-base">{t("flyer.result_title")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <img src={result} alt={t("flyer.result_alt", { headline: brief.headline })} className="w-full rounded-lg border" />
              <Button variant="outline" onClick={() => download(result, brief.headline)}>
                <Download className="h-4 w-4 mr-2" /> {t("flyer.download_png")}
              </Button>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">{t("flyer.history_title")}</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-base">{t("flyer.how_it_works")}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>{t("flyer.step1")}</p>
            <p>{t("flyer.step2", { count: FLYER_LANGUAGES.length })}</p>
            <p>{t("flyer.step3")}</p>
            <p>{t("flyer.step4", { count: FLYER_STYLES.length, cost: COST })}</p>
            <p>{t("flyer.step5")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
