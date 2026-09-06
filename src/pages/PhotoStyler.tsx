import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAICredits } from "@/hooks/useAICredits";
import { screenMediaFile, NSFW_BLOCK_MESSAGE } from "@/lib/mediaModeration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { shareLink } from "@/lib/shareLink";
import {
  Brush, Download, ImagePlus, Loader2, Palette, Share2, ShieldCheck, Sparkles, Wand2, Zap,
  ChevronDown,
} from "lucide-react";
import heroAsset from "@/assets/section-videos/photo-styler.mp4.asset.json";
import { PHOTO_STYLES, PHOTO_STYLE_COST, PHOTO_STYLE_CATEGORIES } from "@/data/photoStyles";
import { addUniqueWatermark } from "@/lib/watermarkImage";

interface StyledResult {
  style: string;
  image?: string;
  error?: string;
}

const MAX_STYLES = 4;
const MAX_FILE_MB = 12;
const WATERMARK_REMOVAL_COST = 1;


const PhotoStyler = () => {
  const { user } = useAuth();
  const { totalBalance, refresh } = useAICredits();
  const fileRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspect, setAspect] = useState<"1:1" | "9:16" | "16:9">("1:1");
  const [changeOutfit, setChangeOutfit] = useState(false);
  const [photoreal, setPhotoreal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [screening, setScreening] = useState(false);
  const [results, setResults] = useState<StyledResult[]>([]);

  const cost = selected.length * PHOTO_STYLE_COST;

  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [styleQuery, setStyleQuery] = useState("");

  const categories = useMemo(() => {
    const q = styleQuery.trim().toLowerCase();
    return PHOTO_STYLE_CATEGORIES.map((c) => {
      const groups = c.groups
        .map((g) => ({
          group: g,
          items: PHOTO_STYLES.filter(
            (s) => s.group === g && (!q || s.label.toLowerCase().includes(q) || g.toLowerCase().includes(q)),
          ),
        }))
        .filter((g) => g.items.length > 0);
      return { ...c, groups, count: groups.reduce((n, g) => n + g.items.length, 0) };
    }).filter((c) => c.count > 0);
  }, [styleQuery]);

  const toggleCategory = (name: string) =>
    setOpenCategories((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));



  const toggleStyle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_STYLES) {
        toast.info(`You can render ${MAX_STYLES} styles at a time.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Max photo size is ${MAX_FILE_MB} MB.`);
      return;
    }
    setScreening(true);
    try {
      const verdict = await screenMediaFile(file);
      if (!verdict.allowed) {
        toast.error(NSFW_BLOCK_MESSAGE);
        return;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsDataURL(file);
      });
      setPhoto(dataUrl);
      setResults([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load the photo.");
    } finally {
      setScreening(false);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Please log in first.");
      return;
    }
    if (!photo) {
      toast.error("Upload a photo first.");
      return;
    }
    if (!selected.length) {
      toast.error("Pick at least one style.");
      return;
    }
    if (totalBalance < cost) {
      toast.error(`You need ${cost} credits for ${selected.length} style(s).`);
      return;
    }

    setBusy(true);
    setResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("photo-styler", {
        body: { image: photo, styles: selected, customPrompt, aspect, changeOutfit, photoreal },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const list = ((data as any)?.results ?? []) as StyledResult[];
      setResults(list);
      setUnlocked([]);
      // Brand every artwork with the small Unique logo + uniqueapp.fun label.
      const marks: Record<string, string> = {};
      await Promise.all(
        list.filter((r) => r.image).map(async (r) => {
          marks[r.style] = await addUniqueWatermark(r.image as string);
        }),
      );
      setMarked(marks);
      const ok = list.filter((r) => r.image).length;
      toast.success(`${ok} artwork(s) ready — ${ok * PHOTO_STYLE_COST} credits used.`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not style the photo.");
    } finally {
      setBusy(false);
    }
  };

  /** The image the user sees / saves: watermarked unless they paid to remove it. */
  const finalImage = (r: StyledResult) =>
    (unlocked.includes(r.style) ? r.image : marked[r.style] ?? r.image) as string | undefined;

  const removeWatermark = async (r: StyledResult) => {
    if (!r.image || unlocked.includes(r.style)) return;
    if (!user) {
      toast.error("Please sign in first.");
      return;
    }
    setUnlocking(r.style);
    try {
      const { data: ok, error } = await supabase.rpc("deduct_ai_credits", {
        p_user_id: user.id,
        p_amount: WATERMARK_REMOVAL_COST,
        p_reason: `Photo Styler — remove watermark (${styleLabel(r.style)})`,
        p_source: "photo-styler",
      });
      if (error) throw new Error(error.message);
      if (ok === false) throw new Error(`Not enough credits — removing the logo costs ${WATERMARK_REMOVAL_COST} credit.`);
      setUnlocked((prev) => [...prev, r.style]);
      window.dispatchEvent(new Event("ai-credits-updated"));
      await refresh();
      toast.success("Logo removed — download the clean image.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not remove the logo.");
    } finally {
      setUnlocking(null);
    }
  };

  const download = (r: StyledResult) => {
    const src = finalImage(r);
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `unique-${r.style}.png`;
    a.click();
  };

  const share = async (r: StyledResult) => {
    const src = finalImage(r);
    if (!src) return;
    // 1) Native file share (mobile / installed PWA)
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], `unique-${r.style}.png`, { type: "image/png" });
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Unique artwork",
          text: `My photo in ${styleLabel(r.style)} style — made with Unique Photo Styler · uniqueapp.fun`,
        });
        return;
      }
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      // fall through to link share
    }
    // 2) Fallback: share/copy the Photo Styler link (never silently download)
    const res = await shareLink({
      title: "Unique Photo Styler",
      text: `My photo in ${styleLabel(r.style)} style — made with Unique Photo Styler.`,
      url: `${window.location.origin}/photo-styler`,
    });
    if (res === "shared") return;
    if (res === "copied") {
      toast.success("Link copied — use Download to save the image.");
      return;
    }
    if (res === "cancelled") return;
    toast.error("Sharing is not available here. Use Download instead.");
  };



  const styleLabel = (id: string) => PHOTO_STYLES.find((s) => s.id === id)?.label ?? id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-6">
        {/* HERO */}
        <div className="relative mb-6 h-[260px] w-full overflow-hidden rounded-3xl sm:h-[460px]">
          <video
            autoPlay
            muted
            loop
            playsInline
            src={heroAsset.url}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: "translateZ(0)" }}
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end gap-3 p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-lg space-y-2"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3 w-3" /> {PHOTO_STYLES.length} art styles
              </span>
              <h1 className="text-3xl font-black leading-none text-foreground drop-shadow-lg sm:text-5xl">
                Photo <span className="text-primary">Styler</span>
              </h1>
              <p className="text-sm font-semibold text-foreground/90 sm:text-base">
                Upload one photo and AI redraws you — pencil sketch, cartoon, anime, hippie 70s,
                watercolour, cyberpunk and more. {PHOTO_STYLE_COST} credits per style.
              </p>
            </motion.div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1 bg-primary/15 text-primary hover:bg-primary/20">
                <Zap className="h-3 w-3" /> {totalBalance} credits
              </Badge>
              <Badge variant="outline" className="gap-1 bg-background/70">
                <ShieldCheck className="h-3 w-3 text-primary" /> Your photo is never published
              </Badge>
              <Badge variant="outline" className="gap-1 bg-background/70">
                <Download className="h-3 w-3" /> Download &amp; share
              </Badge>
            </div>
          </div>
        </div>


        {/* HOW IT WORKS */}
        <Card className="mb-6 border-primary/20 bg-card/70">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-primary" /> How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-4">
            {[
              { icon: ImagePlus, t: "1. Upload a photo", d: "A clear face photo works best." },
              { icon: Brush, t: "2. Pick styles", d: `Up to ${MAX_STYLES} styles per run.` },
              { icon: Wand2, t: "3. Generate", d: `${PHOTO_STYLE_COST} credits per style, charged only when it renders.` },
              { icon: Download, t: "4. Save it", d: "Download the PNG or share it straight away." },
            ].map((s) => (
              <div key={s.t} className="rounded-xl border border-border bg-background/60 p-3">
                <s.icon className="mb-1.5 h-4 w-4 text-primary" />
                <p className="font-bold text-foreground">{s.t}</p>
                <p className="text-xs">{s.d}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT: upload + styles */}
          <Card className="min-w-0 border-primary/20 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Your photo
              </CardTitle>
            </CardHeader>
            <CardContent className="min-w-0 space-y-5 p-4 sm:p-6">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-background/50 p-6 transition-colors hover:border-primary"
              >
                {photo ? (
                  <img src={photo} alt="Uploaded photo preview" className="max-h-64 rounded-xl object-contain" />
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-primary" />
                    <span className="text-sm font-bold text-foreground">Tap to upload a photo</span>
                    <span className="text-xs text-muted-foreground">JPG or PNG, max {MAX_FILE_MB} MB</span>
                  </>
                )}
              </button>
              {screening && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking the photo…
                </p>
              )}

              <div className="space-y-3">
                <Label className="flex items-center justify-between">
                  <span>Styles ({selected.length}/{MAX_STYLES})</span>
                  <span className="text-xs font-normal text-muted-foreground">{cost} credits</span>
                </Label>

                <Input
                  value={styleQuery}
                  onChange={(e) => setStyleQuery(e.target.value)}
                  placeholder="Search styles (Paris, anime, beach…)"
                  className="h-9 text-sm"
                />

                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground">No style matches “{styleQuery}”.</p>
                )}

                <div className="space-y-2">
                  {categories.map((c) => {
                    const open = openCategories.includes(c.name) || !!styleQuery.trim();
                    return (
                      <div key={c.name} className="overflow-hidden rounded-xl border border-border bg-background/50">
                        <button
                          type="button"
                          onClick={() => toggleCategory(c.name)}
                          aria-expanded={open}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                        >
                          <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
                            <span>{c.emoji}</span>
                            <span className="truncate">{c.name}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              {c.count}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                            />
                          </span>
                        </button>

                        {open && (
                          <div className="space-y-3 border-t border-border/60 px-3 py-3">
                            {c.groups.map(({ group, items }) => (
                              <div key={group} className="space-y-1.5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                  {group}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {items.map((s) => {
                                    const active = selected.includes(s.id);
                                    return (
                                      <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => toggleStyle(s.id)}
                                        aria-pressed={active}
                                        className={`max-w-full rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                                          active
                                            ? "border-primary bg-primary/15 text-primary shadow-sm"
                                            : "border-border bg-background/60 text-muted-foreground hover:border-primary/40"
                                        }`}
                                      >
                                        <span className="mr-1">{s.emoji}</span>
                                        {s.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              <div className="rounded-xl border border-border bg-background/60 p-3">
                <button
                  type="button"
                  onClick={() => setChangeOutfit((v) => !v)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      changeOutfit ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${
                        changeOutfit ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Change outfit to match the style</span>
                    <span className="block text-xs text-muted-foreground">
                      Works with every style — AI dresses you in a themed costume. Off = your original clothes are kept.
                    </span>
                  </span>
                </button>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-3">
                <button
                  type="button"
                  onClick={() => setPhotoreal((v) => !v)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      photoreal ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${
                        photoreal ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Photorealistic result (real photo look)</span>
                    <span className="block text-xs text-muted-foreground">
                      On = output looks like a real camera photo instead of a drawing or animation. Best for costume,
                      holiday and travel styles.
                    </span>
                  </span>
                </button>
              </div>

              <div className="space-y-1.5">
                <Label>Extra direction (optional)</Label>
                <Input
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add a flower crown, warmer colours…"
                  maxLength={300}
                />
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <div className="flex flex-wrap gap-2">
                  {(["1:1", "9:16", "16:9"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAspect(a)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        aspect === a
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-background/60 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={busy || screening || !photo || !selected.length}
                className="w-full gap-2"
                size="lg"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {busy ? "Painting…" : `Style my photo · ${cost} credits`}
              </Button>
              {totalBalance < cost && (
                <p className="text-center text-xs text-muted-foreground">
                  Not enough credits.{" "}
                  <Link to="/ai-credits" className="font-semibold text-primary underline">
                    Top up
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: results */}
          <Card className="min-w-0 border-primary/20 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brush className="h-5 w-5 text-primary" /> Your artworks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!results.length && !busy && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nothing yet — upload a photo and pick your styles.
                </p>
              )}
              {busy && (
                <div className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  Redrawing your photo in {selected.length} style(s)…
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((r) => (
                  <div key={r.style} className="space-y-2 rounded-2xl border border-border bg-background/60 p-2">
                    {r.image ? (
                      <>
                        <img
                          src={r.image}
                          alt={`${styleLabel(r.style)} version of the uploaded photo`}
                          className="w-full rounded-xl object-cover"
                        />
                        <div className="flex items-center justify-between gap-2 px-1 pb-1">
                          <span className="text-xs font-bold text-foreground">{styleLabel(r.style)}</span>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => download(r)} aria-label="Download artwork">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => share(r)} aria-label="Share artwork">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 text-xs text-muted-foreground">
                        <p className="font-bold text-foreground">{styleLabel(r.style)}</p>
                        <p>{r.error ?? "Failed"} — no credits were charged for this style.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PhotoStyler;
