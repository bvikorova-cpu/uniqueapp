import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSignature, Sparkles, Loader2, Download, Copy, Save, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CREDITS = 5;

export function AICVGeneratorDialog() {
  const [open, setOpen] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("English");
  const [extraNotes, setExtraNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    setMarkdown("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-cv", {
        body: { targetRole, tone, language, extraNotes },
      });

      if (error) {
        const ctx = (error as { context?: Response }).context;
        let message = error.message || "Generation failed";
        try {
          const body = ctx ? await ctx.clone().json() : null;
          if (body?.message || body?.error) message = body.message || body.error;
        } catch { /* keep default message */ }
        throw new Error(message);
      }

      if (data?.error) throw new Error(data.message || data.error);
      if (!data?.markdown) throw new Error("No CV returned");

      setMarkdown(data.markdown);
      toast({ title: "CV generated", description: `${CREDITS} credits used.` });
    } catch (e) {
      toast({ title: "CV generation failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    toast({ title: "Copied to clipboard" });
  };

  const downloadPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = margin;

    const lines = markdown.split("\n");
    for (const raw of lines) {
      const line = raw.replace(/\*\*/g, "").replace(/^\s*[-*]\s+/, "• ").trimEnd();
      if (!line.trim()) { y += 8; continue; }

      let size = 11;
      let style: "normal" | "bold" = "normal";
      let text = line;
      if (line.startsWith("### ")) { size = 12; style = "bold"; text = line.slice(4); }
      else if (line.startsWith("## ")) { size = 14; style = "bold"; text = line.slice(3); }
      else if (line.startsWith("# ")) { size = 20; style = "bold"; text = line.slice(2); }

      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      const wrapped = doc.splitTextToSize(text, width) as string[];
      for (const w of wrapped) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.text(w, margin, y);
        y += size * 1.35;
      }
      if (style === "bold") y += 4;
    }

    doc.save("my-cv.pdf");
  };

  const saveToMyCvs = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const fileName = `AI CV${targetRole ? ` — ${targetRole}` : ""} (${new Date().toLocaleDateString("en-GB")}).md`;
      const path = `${user.id}/${Date.now()}-ai-cv.md`;
      const blob = new Blob([markdown], { type: "text/markdown" });
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, blob);
      if (upErr) throw upErr;

      const { count } = await supabase
        .from("candidate_resumes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { error } = await supabase.from("candidate_resumes").insert({
        user_id: user.id,
        file_url: path,
        file_name: fileName,
        is_primary: (count ?? 0) === 0,
        parsed_full_text: markdown,
      });
      if (error) throw error;

      toast({ title: "Saved to My CVs" });
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm border-primary/30 hover:border-primary/50 hover:bg-primary/5">
          <FileSignature className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">CV Generator</span>
          <span className="sm:hidden">CV</span>
          <Badge className="ml-1 text-[10px] bg-gradient-to-r from-amber-500 to-yellow-600 text-primary-foreground border-0">
            <Zap className="h-2.5 w-2.5 mr-0.5" />
            {CREDITS} credits
          </Badge>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            AI CV Generator
          </DialogTitle>
          <DialogDescription>
            Builds a complete, ATS-ready CV automatically from your profile, skills and saved experience. {CREDITS} credits per CV.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Target role (optional)</Label>
                <Input placeholder="e.g. Frontend Developer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="confident">Confident</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Slovak">Slovak</SelectItem>
                    <SelectItem value="Czech">Czech</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Anything to add? (optional)</Label>
                <Textarea
                  rows={3}
                  placeholder="Extra skills, certifications, projects or achievements that are not in your profile yet…"
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600">
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Building your CV…</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate my CV ({CREDITS} credits)</>
              )}
            </Button>

            {markdown && (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={downloadPdf}><Download className="h-4 w-4 mr-1.5" />PDF</Button>
                  <Button size="sm" variant="outline" onClick={copy}><Copy className="h-4 w-4 mr-1.5" />Copy</Button>
                  <Button size="sm" variant="outline" onClick={saveToMyCvs} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                    Save to My CVs
                  </Button>
                </div>
                <Card className="p-5 bg-card/80">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{markdown}</ReactMarkdown>
                  </div>
                </Card>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default AICVGeneratorDialog;
