import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AiMarkdown from "@/components/common/AiMarkdown";
import { normalizeImageForUpload } from "@/utils/imageUploadPrep";
import { exportFaceReportPDF } from "@/lib/exportFaceReportPDF";
import { downloadFaceShareCard } from "@/lib/faceShareCard";
import { FaceInsightHero } from "@/components/face-insight/FaceInsightHero";
import {
  ScanFace, Sparkles, Loader2, Download, Share2, Trash2, FileText, Users, History, Gem, HelpCircle, Camera,
} from "lucide-react";

type Report = {
  id: string | null;
  mode: string;
  credits_used: number;
  headline: string;
  summary: string;
  report: string;
  scores: Record<string, number>;
  traits: { label: string; value: string }[];
  is_comparison?: boolean;
  created_at?: string;
};

const COSTS = { basic: 5, deep: 15, compare: 12 } as const;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

const PhotoPicker = ({
  label, value, onPick, id,
}: { label: string; value: string | null; onPick: (dataUrl: string | null) => void; id: string }) => {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handle = async (file?: File | null) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast({ title: "Unsupported file", description: "Please choose an image.", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "Photo too large", description: "Max 20 MB.", variant: "destructive" });
      return;
    }
    const normalized = await normalizeImageForUpload(file);
    onPick(await fileToDataUrl(normalized));
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <button
        type="button"
        onClick={() => uploadRef.current?.click()}
        className="w-full aspect-square rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 overflow-hidden flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
      >
        {value ? (
          <img src={value} alt={`${label} preview`} className="w-full h-full object-cover" />
        ) : (
          <>
            <ImagePlus className="w-8 h-8 text-primary" />
            <span className="text-xs text-muted-foreground px-4 text-center">Upload a clear front-facing photo</span>
          </>
        )}
      </button>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => uploadRef.current?.click()}>
          <ImagePlus className="w-4 h-4 mr-1" /> Upload photo
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => cameraRef.current?.click()}>
          <Camera className="w-4 h-4 mr-1" /> Take photo
        </Button>
      </div>
      <input
        ref={uploadRef}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { handle(e.target.files?.[0]); e.currentTarget.value = ""; }}
      />
      <input
        ref={cameraRef}
        id={`${id}-camera`}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => { handle(e.target.files?.[0]); e.currentTarget.value = ""; }}
      />
      {value && (
        <Button variant="ghost" size="sm" className="w-full" onClick={() => onPick(null)}>
          Remove photo
        </Button>
      )}
    </div>
  );
};


const ReportView = ({ report, photo }: { report: Report; photo?: string | null }) => (
  <Card className="overflow-hidden border-primary/20">
    <div className="bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-5 space-y-3">
      <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
        {report.mode === "deep" ? "Deep report" : report.mode === "compare" ? "Compare report" : "Basic report"}
      </Badge>
      <h2 className="text-2xl md:text-3xl font-black leading-tight">{report.headline}</h2>
      {report.summary && <p className="text-sm text-muted-foreground">{report.summary}</p>}

      {Object.keys(report.scores || {}).length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 pt-2">
          {Object.entries(report.scores).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="capitalize">{key.replace(/_/g, " ")}</span>
                <span>{Number(value) || 0}/100</span>
              </div>
              <Progress value={Math.max(0, Math.min(100, Number(value) || 0))} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {report.traits?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {report.traits.map((t, i) => (
            <Badge key={`${t.label}-${i}`} variant="secondary" className="text-[11px]">
              {t.label}: {t.value}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button size="sm" onClick={() => exportFaceReportPDF(report)}>
          <Download className="w-4 h-4 mr-1.5" />Download PDF
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            downloadFaceShareCard({
              headline: report.headline,
              summary: report.summary,
              scores: report.scores,
              photo: photo ?? null,
            })
          }
        >
          <Share2 className="w-4 h-4 mr-1.5" />Share card
        </Button>
      </div>
    </div>

    <div className="p-5">
      <AiMarkdown content={report.report} />
    </div>
  </Card>
);

const FaceInsight = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoB, setPhotoB] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<null | keyof typeof COSTS>(null);
  const [result, setResult] = useState<Report | null>(null);
  const [history, setHistory] = useState<Report[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  const loadCredits = useCallback(async () => {
    const { data: session } = await supabase.auth.getUser();
    const uid = session.user?.id;
    if (!uid) return;
    const { data } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", uid).maybeSingle();
    setCredits((data as { credits_remaining?: number } | null)?.credits_remaining ?? 0);
  }, []);

  const call = useCallback(async <T,>(body: Record<string, unknown>): Promise<T> => {
    const { data, error } = await supabase.functions.invoke("face-insight-ai", { body });
    const payload = data as { error?: string } | null;
    if (error) throw new Error(payload?.error || error.message);
    if (payload?.error) throw new Error(payload.error);
    return data as T;
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await call<{ reports: Report[] }>({ action: "history" });
      setHistory(res.reports ?? []);
    } catch {
      setHistory([]);
    }
  }, [call]);

  useEffect(() => {
    if (!authed) return;
    loadCredits();
    loadHistory();
  }, [authed, loadCredits, loadHistory]);

  const analyze = async (mode: keyof typeof COSTS) => {
    if (!photo) {
      toast({ title: "Add a photo", description: "Upload a clear front-facing photo first.", variant: "destructive" });
      return;
    }
    if (mode === "compare" && !photoB) {
      toast({ title: "Second photo needed", description: "Compare mode analyses two faces.", variant: "destructive" });
      return;
    }
    setBusy(mode);
    setResult(null);
    try {
      const res = await call<{ report: Report }>({
        action: "analyze",
        mode,
        photo,
        photoB: mode === "compare" ? photoB : undefined,
        note: note.trim().slice(0, 400),
      });
      setResult(res.report);
      toast({ title: "Report ready", description: `${COSTS[mode]} credits used.` });
      window.dispatchEvent(new Event("ai-credits-updated"));
      loadCredits();
      loadHistory();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      if (/insufficient credits/i.test(msg)) {
        toast({ title: "Not enough credits", description: `This report costs ${COSTS[mode]} credits.`, variant: "destructive" });
        navigate("/ai-credits-store");
      } else {
        toast({ title: "Analysis failed", description: msg, variant: "destructive" });
      }
    } finally {
      setBusy(null);
    }
  };

  const removeReport = async (id: string | null) => {
    if (!id) return;
    try {
      await call({ action: "delete", id });
      setHistory((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      toast({
        title: "Could not delete",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">
          <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">Sign in required</Badge>
          <h1 className="text-3xl md:text-5xl font-black">Face Insight Studio</h1>
          <p className="text-muted-foreground">
            Log in to get a detailed AI face analysis with styling, colour typology and a downloadable PDF report.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>Go to login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-16">
      <Helmet>
        <title>Face Insight Studio — AI Face Analysis Report</title>
        <meta
          name="description"
          content="Upload a photo and get a long AI face analysis: proportions, symmetry, colour typology, hair, make-up and style advice with a downloadable PDF report."
        />
        <link rel="canonical" href="https://uniqueapp.fun/face-insight" />
      </Helmet>

      <div className="container mx-auto px-3 sm:px-4 max-w-4xl space-y-6">
        <FaceInsightHero />

        {/* Hero */}
        <Card className="relative overflow-hidden border-primary/20 p-6 sm:p-8 bg-gradient-to-br from-primary/15 via-accent/10 to-background">
          <div className="relative space-y-3">
            <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />AI Image Consultant
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">Face Insight Studio</h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              One photo. A full personal report — face shape and proportions, symmetry, perceived traits, colour
              typology, hair, make-up, eyewear, outfits and a glow-up plan. Download it as PDF or share your result card.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary">Basic {COSTS.basic} credits</Badge>
              <Badge variant="secondary">Deep {COSTS.deep} credits</Badge>
              <Badge variant="secondary">Compare {COSTS.compare} credits</Badge>
              {credits !== null && (
                <Badge className="bg-primary/15 text-primary border-0">
                  <Gem className="w-3 h-3 mr-1" />{credits} credits left
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analyze" className="text-xs"><ScanFace className="w-3 h-3 mr-1" />Analyze</TabsTrigger>
            <TabsTrigger value="compare" className="text-xs"><Users className="w-3 h-3 mr-1" />Compare</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs"><History className="w-3 h-3 mr-1" />Reports</TabsTrigger>
            <TabsTrigger value="how" className="text-xs"><HelpCircle className="w-3 h-3 mr-1" />How it works</TabsTrigger>
          </TabsList>

          {/* ---------------------------------------------- Analyze */}
          <TabsContent value="analyze" className="space-y-4 mt-4">
            <Card className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <PhotoPicker id="face-photo" label="Your photo" value={photo} onPick={setPhoto} />
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Anything we should focus on? (optional)
                  </p>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. I want haircut and glasses ideas for job interviews"
                    rows={5}
                  />
                  <div className="grid gap-2">
                    <Button onClick={() => analyze("basic")} disabled={busy !== null}>
                      {busy === "basic" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScanFace className="w-4 h-4 mr-2" />}
                      Basic report ({COSTS.basic} credits)
                    </Button>
                    <Button variant="secondary" onClick={() => analyze("deep")} disabled={busy !== null}>
                      {busy === "deep" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                      Deep report + PDF ({COSTS.deep} credits)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/ai-credits-store")}>
                      <Gem className="w-3.5 h-3.5 mr-1.5" />Buy credits
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Entertainment and styling guidance only — not a medical, biometric or personality assessment.
                  </p>
                </div>
              </div>
            </Card>

            {busy && (
              <Card className="p-6 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Reading your features and writing the report…
              </Card>
            )}

            {result && !result.is_comparison && <ReportView report={result} photo={photo} />}
          </TabsContent>

          {/* ---------------------------------------------- Compare */}
          <TabsContent value="compare" className="space-y-4 mt-4">
            <Card className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Couple, siblings or parent and child — see shared features, resemblance score and matching style advice.
              </p>
              <div className="grid gap-4 grid-cols-2">
                <PhotoPicker id="face-a" label="Face A" value={photo} onPick={setPhoto} />
                <PhotoPicker id="face-b" label="Face B" value={photoB} onPick={setPhotoB} />
              </div>
              <Button className="w-full" onClick={() => analyze("compare")} disabled={busy !== null}>
                {busy === "compare" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                Compare faces ({COSTS.compare} credits)
              </Button>
            </Card>

            {result?.is_comparison && <ReportView report={result} photo={photo} />}
          </TabsContent>

          {/* ---------------------------------------------- Reports */}
          <TabsContent value="reports" className="space-y-3 mt-4">
            {history.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No reports yet. Your generated reports are saved here and can be downloaded any time.
              </Card>
            ) : (
              history.map((r) => (
                <Card key={r.id ?? r.created_at} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold leading-tight">{r.headline}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {r.mode} • {r.credits_used} credits • {new Date(r.created_at ?? "").toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeReport(r.id)} aria-label="Delete report">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setResult(r)}>Open</Button>
                    <Button size="sm" variant="outline" onClick={() => exportFaceReportPDF(r)}>
                      <Download className="w-4 h-4 mr-1.5" />PDF
                    </Button>
                  </div>
                </Card>
              ))
            )}
            {result && <ReportView report={result} photo={photo} />}
          </TabsContent>

          {/* ---------------------------------------------- How it works */}
          <TabsContent value="how" className="mt-4">
            <Card className="p-5 space-y-4 text-sm">
              <h2 className="text-xl font-black">How it works</h2>
              <ol className="space-y-3 list-decimal pl-5 text-muted-foreground">
                <li><span className="text-foreground font-semibold">Upload a photo.</span> Front-facing, good light, no sunglasses. Nothing is published — your photo is used only to create your report.</li>
                <li><span className="text-foreground font-semibold">Pick a report.</span> Basic ({COSTS.basic} credits) gives a compact analysis. Deep ({COSTS.deep} credits) adds symmetry detail, skin care plan, make-up, eyewear, celebrity style match and a 30-day glow-up plan.</li>
                <li><span className="text-foreground font-semibold">Read and download.</span> Every report can be exported as a formatted PDF and saved in the Reports tab.</li>
                <li><span className="text-foreground font-semibold">Share your card.</span> Generate a branded result card image with your archetype and scores.</li>
                <li><span className="text-foreground font-semibold">Compare two faces.</span> Compare mode ({COSTS.compare} credits) works for couples, siblings and families — resemblance score plus matching style advice.</li>
              </ol>
              <p className="text-xs text-muted-foreground">
                Credits are only charged for a successful report. If the AI cannot read the photo, your credits are
                refunded automatically. This studio is for entertainment and styling inspiration — it is not a medical,
                biometric or personality diagnosis and never identifies a person.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FaceInsight;
