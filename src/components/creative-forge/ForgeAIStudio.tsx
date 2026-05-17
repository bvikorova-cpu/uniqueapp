import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Globe, Search, ShieldCheck, BarChart3, Wand2, ScanText, Maximize2, Minimize2, FileText } from "lucide-react";
import { useForgeAITools, FORGE_AI_COST } from "@/hooks/useForgeAITools";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  currentText: string;
  onReplace: (text: string) => void;
  onAppend: (text: string) => void;
  brandVoice?: Record<string, any> | null;
}

const LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Portuguese", "Polish", "Czech",
  "Slovak", "Hungarian", "Romanian", "Dutch", "Japanese", "Chinese (Simplified)", "Arabic",
];

const BRAINSTORM_KINDS = [
  { id: "titles", label: "Titles / Headlines" },
  { id: "hooks", label: "Opening hooks" },
  { id: "ideas", label: "Story / topic ideas" },
  { id: "ctas", label: "Calls to action" },
  { id: "taglines", label: "Taglines" },
];

export function ForgeAIStudio({ open, onClose, currentText, onReplace, onAppend, brandVoice }: Props) {
  const { run, loading } = useForgeAITools();
  const [result, setResult] = useState<string>("");
  const [parsed, setParsed] = useState<any>(null);

  const [brainTopic, setBrainTopic] = useState("");
  const [brainKind, setBrainKind] = useState("titles");
  const [brainAudience, setBrainAudience] = useState("");

  const [seoKeywords, setSeoKeywords] = useState("");
  const [translateLang, setTranslateLang] = useState("Spanish");

  const exec = async (action: any, text: string, extra: Record<string, any> = {}) => {
    setResult(""); setParsed(null);
    const data = await run(action, text, { ...extra, brand_voice: brandVoice ?? undefined });
    if (data) {
      setResult(data.content);
      setParsed(data.parsed);
    }
  };

  const Quick = ({ action, icon: Icon, label, hint }: any) => (
    <Button variant="outline" disabled={loading === action || !currentText.trim()} onClick={() => exec(action, currentText)} className="justify-start gap-2 h-auto py-3">
      {loading === action ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      <div className="text-left">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />AI Studio</DialogTitle>
          <DialogDescription>Brainstorm, refine, optimize, translate, score — {FORGE_AI_COST} credits per action.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="quick"><Wand2 className="h-3.5 w-3.5 mr-1" />Quick</TabsTrigger>
            <TabsTrigger value="brainstorm"><Sparkles className="h-3.5 w-3.5 mr-1" />Brainstorm</TabsTrigger>
            <TabsTrigger value="seo"><Search className="h-3.5 w-3.5 mr-1" />SEO</TabsTrigger>
            <TabsTrigger value="plagiarism"><ShieldCheck className="h-3.5 w-3.5 mr-1" />Originality</TabsTrigger>
            <TabsTrigger value="translate"><Globe className="h-3.5 w-3.5 mr-1" />Translate</TabsTrigger>
            <TabsTrigger value="score"><BarChart3 className="h-3.5 w-3.5 mr-1" />Score</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-3">
            <p className="text-xs text-muted-foreground">Acts on your current generated content.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Quick action="describe" icon={ScanText} label="Describe" hint="Add vivid sensory detail" />
              <Quick action="expand" icon={Maximize2} label="Expand" hint="Continue ~2 paragraphs" />
              <Quick action="rewrite" icon={Wand2} label="Rewrite" hint="Improve clarity & rhythm" />
              <Quick action="shorten" icon={Minimize2} label="Shorten" hint="Cut to ~50% length" />
            </div>
          </TabsContent>

          <TabsContent value="brainstorm" className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={brainKind} onValueChange={setBrainKind}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BRAINSTORM_KINDS.map((k) => <SelectItem key={k.id} value={k.id}>{k.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Audience</Label><Input value={brainAudience} onChange={(e) => setBrainAudience(e.target.value)} placeholder="e.g. indie founders" /></div>
            </div>
            <div><Label>Topic / seed</Label><Textarea rows={3} value={brainTopic} onChange={(e) => setBrainTopic(e.target.value)} placeholder="What is this about?" /></div>
            <Button onClick={() => exec("brainstorm", brainTopic, { kind: brainKind, audience: brainAudience, topic: brainTopic })} disabled={loading === "brainstorm" || !brainTopic.trim()}>
              {loading === "brainstorm" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}Generate 10 ({FORGE_AI_COST}c)
            </Button>
          </TabsContent>

          <TabsContent value="seo" className="space-y-3">
            <p className="text-xs text-muted-foreground">Optimizes current content for target keywords.</p>
            <div><Label>Target keywords (comma-separated)</Label><Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="ai writing, content marketing, blog" /></div>
            <Button onClick={() => exec("seo_optimize", currentText, { keywords: seoKeywords.split(",").map((s) => s.trim()).filter(Boolean) })} disabled={loading === "seo_optimize" || !currentText.trim() || !seoKeywords.trim()}>
              {loading === "seo_optimize" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}Optimize ({FORGE_AI_COST}c)
            </Button>
            {parsed && (
              <Card className="p-3 space-y-2">
                <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /><strong>SEO score:</strong> {parsed.score ?? "—"}/100</div>
                {parsed.meta_title && <p className="text-sm"><strong>Meta title:</strong> {parsed.meta_title}</p>}
                {parsed.meta_description && <p className="text-sm"><strong>Meta description:</strong> {parsed.meta_description}</p>}
                {parsed.keyword_density && (
                  <div className="flex gap-2 flex-wrap">{Object.entries(parsed.keyword_density).map(([k, v]) => <Badge key={k} variant="secondary">{k}: {String(v)}</Badge>)}</div>
                )}
                {parsed.suggestions?.length > 0 && <ul className="text-xs list-disc pl-5 space-y-1">{parsed.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>}
              </Card>
            )}
          </TabsContent>

          <TabsContent value="plagiarism" className="space-y-3">
            <p className="text-xs text-muted-foreground">Heuristic AI audit — flags clichés & derivative passages. Not a definitive plagiarism check.</p>
            <Button onClick={() => exec("plagiarism_check", currentText)} disabled={loading === "plagiarism_check" || !currentText.trim()}>
              {loading === "plagiarism_check" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}Check Originality ({FORGE_AI_COST}c)
            </Button>
            {parsed && (
              <Card className="p-3 space-y-2">
                <div><strong>Originality score:</strong> {parsed.originality_score ?? "—"}/100</div>
                {parsed.flagged?.length > 0 ? (
                  <ul className="space-y-2">{parsed.flagged.map((f: any, i: number) => (
                    <li key={i} className="text-xs border-l-2 border-amber-500 pl-2">
                      <p className="italic">"{f.excerpt}"</p>
                      <p className="text-muted-foreground">{f.reason}</p>
                    </li>
                  ))}</ul>
                ) : <p className="text-sm text-green-500">No issues flagged.</p>}
              </Card>
            )}
          </TabsContent>

          <TabsContent value="translate" className="space-y-3">
            <div><Label>Target language</Label>
              <Select value={translateLang} onValueChange={setTranslateLang}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={() => exec("translate", currentText, { language: translateLang })} disabled={loading === "translate" || !currentText.trim()}>
              {loading === "translate" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />}Translate ({FORGE_AI_COST}c)
            </Button>
          </TabsContent>

          <TabsContent value="score" className="space-y-3">
            <p className="text-xs text-muted-foreground">Quality / readability / emotion / structure analysis.</p>
            <Button onClick={() => exec("score_content", currentText)} disabled={loading === "score_content" || !currentText.trim()}>
              {loading === "score_content" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}Score ({FORGE_AI_COST}c)
            </Button>
            {parsed && (
              <Card className="p-3 space-y-2">
                <div className="text-lg"><strong>Overall:</strong> {parsed.overall}/100</div>
                {parsed.breakdown && <div className="grid grid-cols-2 gap-2 text-sm">{Object.entries(parsed.breakdown).map(([k, v]) => <div key={k} className="flex justify-between border-b border-border/40 py-1"><span className="capitalize">{k}</span><span>{String(v)}</span></div>)}</div>}
                {parsed.suggestions?.length > 0 && <ul className="text-xs list-disc pl-5 space-y-1">{parsed.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>}
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {result && (
          <div className="space-y-2 mt-4">
            <Label className="flex items-center gap-2"><FileText className="h-4 w-4" />Result</Label>
            <Textarea rows={10} value={parsed?.content ?? result} onChange={(e) => setResult(e.target.value)} className="font-mono text-sm" />
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => { onReplace(parsed?.content ?? result); toast({ title: "Replaced" }); }}>Replace</Button>
              <Button variant="outline" onClick={() => { onAppend(parsed?.content ?? result); toast({ title: "Appended" }); }}>Append</Button>
              <Button variant="ghost" onClick={() => { navigator.clipboard.writeText(parsed?.content ?? result); toast({ title: "Copied" }); }}>Copy</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
