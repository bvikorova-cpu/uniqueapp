import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Activity, Coins, FileText, HeartPulse, History, Lock, Loader2, Send, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAICredits } from "@/hooks/useAICredits";
import { HealthDisclaimerBanner } from "@/components/ai-health/HealthDisclaimerBanner";
import { HealthUploadZone, type PickedFile } from "@/components/ai-health/HealthUploadZone";
import { HealthResultCard, type HealthAnalysis } from "@/components/ai-health/HealthResultCard";

type Action = "symptom_chat" | "lab_document" | "medical_image";
const COST: Record<Action, number> = { symptom_chat: 1, lab_document: 2, medical_image: 3 };

interface ChatMessage { role: "user" | "assistant"; content: string }

const AIHealthAssistant = () => {
  const { user, loading: authLoading } = useAuth();
  const { paidBalance, refresh } = useAICredits();

  const [busy, setBusy] = useState<Action | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatResult, setChatResult] = useState<HealthAnalysis | null>(null);
  const [labFile, setLabFile] = useState<PickedFile | null>(null);
  const [labNote, setLabNote] = useState("");
  const [labResult, setLabResult] = useState<HealthAnalysis | null>(null);
  const [imgFile, setImgFile] = useState<PickedFile | null>(null);
  const [imgNote, setImgNote] = useState("");
  const [imgResult, setImgResult] = useState<HealthAnalysis | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("health_ai_scans")
      .select("id, kind, title, severity, credits_spent, result, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    setHistory(data ?? []);
  };

  useEffect(() => { loadHistory(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  const run = async (action: Action, body: Record<string, unknown>, apply: (r: HealthAnalysis) => void) => {
    const cost = COST[action];
    if (paidBalance < cost) {
      toast.error(`You need ${cost} credits for this analysis.`);
      return;
    }
    setBusy(action);
    try {
      const { data, error } = await supabase.functions.invoke("health-ai-analyze", { body: { action, ...body } });
      if (error) {
        const msg = (error as any)?.message ?? "Analysis failed";
        if (/insufficient|credits/i.test(msg)) toast.error("Not enough credits — top up to continue.");
        else toast.error(msg);
        return;
      }
      if ((data as any)?.error) { toast.error((data as any).error); return; }
      apply(data as HealthAnalysis);
      toast.success(`Analysis ready · ${cost} credits used`);
      await refresh();
      await loadHistory();
    } catch (e: any) {
      toast.error(e?.message ?? "Analysis failed");
    } finally {
      setBusy(null);
    }
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text) return;
    const nextChat: ChatMessage[] = [...chat, { role: "user", content: text }];
    setChat(nextChat);
    setChatInput("");
    await run("symptom_chat", { messages: nextChat }, (r) => {
      setChatResult(r);
      setChat((prev) => [...prev, { role: "assistant", content: r.summary }]);
    });
  };

  if (authLoading) {
    return <div className="container mx-auto px-4 pt-24">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-xl px-4 pb-12 pt-24">
          <Helmet>
            <title>AI Health & Medical Assistant | Unique</title>
            <meta name="description" content="Educational AI health assistant: symptom checker, lab result interpreter and medical image analysis, paid with your AI credits." />
          </Helmet>
          <Card className="backdrop-blur-xl bg-card/80">
            <CardContent className="p-10 text-center">
              <Lock className="mx-auto mb-4 h-14 w-14 text-primary" />
              <h1 className="mb-2 text-2xl font-black">Sign in to use the AI Health Assistant</h1>
              <p className="mb-6 text-muted-foreground">
                Your analyses and history are saved to your account and paid with your AI credits.
              </p>
              <Button asChild size="lg"><Link to="/auth">Sign in / Create account</Link></Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const CostBadge = ({ action }: { action: Action }) => (
    <Badge variant="secondary" className="gap-1">
      <Coins className="h-3 w-3" /> {COST[action]} credits
    </Badge>
  );

  const insufficient = (action: Action) => paidBalance < COST[action];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Health & Medical Assistant | Unique</title>
        <meta name="description" content="Educational AI health assistant: symptom checker, lab result interpreter and ECG/medical image analysis, paid with your AI credits." />
        <meta property="og:title" content="AI Health & Medical Assistant | Unique" />
        <meta property="og:description" content="Symptom checker, lab result interpreter and medical image analysis — educational AI insights in plain language." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <main className="container mx-auto max-w-3xl px-4 pb-16 pt-24">
        <header className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-black sm:text-3xl">AI Health & Medical Assistant</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Understand symptoms, blood work and medical images in plain language — then talk to a doctor with better questions.
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-semibold">{paidBalance}</span> credits available
            <Button asChild variant="link" size="sm" className="h-auto p-0"><Link to="/ai-credits">Top up</Link></Button>
          </p>
        </header>

        <div className="mb-5"><HealthDisclaimerBanner /></div>

        <Tabs defaultValue="symptoms">
          <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
            <TabsTrigger value="symptoms" className="text-xs sm:text-sm"><Stethoscope className="mr-1 h-4 w-4" />Symptoms</TabsTrigger>
            <TabsTrigger value="labs" className="text-xs sm:text-sm"><FileText className="mr-1 h-4 w-4" />Lab scanner</TabsTrigger>
            <TabsTrigger value="images" className="text-xs sm:text-sm"><Activity className="mr-1 h-4 w-4" />ECG / image</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm"><History className="mr-1 h-4 w-4" />History</TabsTrigger>
          </TabsList>

          {/* Tab 1 — Symptom Checker */}
          <TabsContent value="symptoms" className="mt-4 space-y-4">
            <Card><CardContent className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold">Symptom Checker</h2>
                <CostBadge action="symptom_chat" />
              </div>
              {chat.length > 0 && (
                <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg bg-muted/40 p-3">
                  {chat.map((m, i) => (
                    <div key={i} className={`text-sm ${m.role === "user" ? "text-foreground" : "text-muted-foreground"}`}>
                      <span className="font-semibold">{m.role === "user" ? "You" : "Assistant"}: </span>{m.content}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  placeholder="Describe your symptoms…"
                  aria-label="Describe your symptoms"
                />
                <Button onClick={sendChat} disabled={busy === "symptom_chat" || !chatInput.trim() || insufficient("symptom_chat")}>
                  {busy === "symptom_chat" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              {insufficient("symptom_chat") && (
                <p className="text-xs text-destructive">Not enough credits — <Link to="/ai-credits" className="underline">top up</Link>.</p>
              )}
            </CardContent></Card>
            {chatResult && <HealthResultCard result={chatResult} />}
          </TabsContent>

          {/* Tab 2 — Document & Lab Scanner */}
          <TabsContent value="labs" className="mt-4 space-y-4">
            <Card><CardContent className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold">Document & Lab Scanner</h2>
                <CostBadge action="lab_document" />
              </div>
              <HealthUploadZone
                accept="image/png,image/jpeg,application/pdf"
                label="Upload blood test or medical report"
                hint="Drag & drop or tap to choose a file (max 8 MB)"
                value={labFile}
                onChange={setLabFile}
              />
              <Textarea
                value={labNote}
                onChange={(e) => setLabNote(e.target.value)}
                placeholder="Optional: add context (age, symptoms, medication)…"
                rows={3}
              />
              <Button
                className="w-full"
                disabled={!labFile || busy === "lab_document" || insufficient("lab_document")}
                onClick={() => labFile && run(
                  "lab_document",
                  { file_base64: labFile.base64, mime: labFile.file.type, file_name: labFile.file.name, note: labNote },
                  setLabResult,
                )}
              >
                {busy === "lab_document" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing…</> : `Interpret document · ${COST.lab_document} credits`}
              </Button>
              {insufficient("lab_document") && (
                <p className="text-xs text-destructive">Not enough credits — <Link to="/ai-credits" className="underline">top up</Link>.</p>
              )}
            </CardContent></Card>
            {labResult && <HealthResultCard result={labResult} />}
          </TabsContent>

          {/* Tab 3 — Medical Image & ECG Scanner */}
          <TabsContent value="images" className="mt-4 space-y-4">
            <Card><CardContent className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold">Medical Image & ECG Scanner</h2>
                <CostBadge action="medical_image" />
              </div>
              <HealthUploadZone
                accept="image/png,image/jpeg"
                label="Upload ECG strip, X-ray or skin photo"
                hint="PNG or JPG, max 8 MB"
                value={imgFile}
                onChange={setImgFile}
              />
              <Textarea
                value={imgNote}
                onChange={(e) => setImgNote(e.target.value)}
                placeholder="Optional: what should the assistant pay attention to?"
                rows={3}
              />
              <Button
                className="w-full"
                disabled={!imgFile || busy === "medical_image" || insufficient("medical_image")}
                onClick={() => imgFile && run(
                  "medical_image",
                  { file_base64: imgFile.base64, mime: imgFile.file.type, file_name: imgFile.file.name, note: imgNote },
                  setImgResult,
                )}
              >
                {busy === "medical_image" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing…</> : `Analyze image · ${COST.medical_image} credits`}
              </Button>
              {insufficient("medical_image") && (
                <p className="text-xs text-destructive">Not enough credits — <Link to="/ai-credits" className="underline">top up</Link>.</p>
              )}
            </CardContent></Card>
            {imgResult && <HealthResultCard result={imgResult} />}
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="mt-4 space-y-3">
            {history.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
                No saved analyses yet.
              </CardContent></Card>
            ) : (
              history.map((h) => (
                <HealthResultCard
                  key={h.id}
                  result={{ ...(h.result as HealthAnalysis), title: h.title ?? "Health analysis", severity: (h.severity ?? "low") as any }}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AIHealthAssistant;
