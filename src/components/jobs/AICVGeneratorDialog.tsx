import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSignature, Sparkles, Loader2, Download, Copy, Save, Zap, User, Check, Pencil, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CREDITS = 5;

type TemplateId = "modern" | "classic" | "minimal" | "creative" | "executive" | "academic";

const TEMPLATES: { id: TemplateId; name: string; desc: string; accent: [number, number, number] }[] = [
  { id: "modern", name: "Modern", desc: "Clean, achievement-first", accent: [124, 58, 237] },
  { id: "classic", name: "Classic", desc: "Formal & conservative", accent: [30, 41, 59] },
  { id: "minimal", name: "Minimal", desc: "Short, one-page feel", accent: [15, 118, 110] },
  { id: "creative", name: "Creative", desc: "Expressive, projects first", accent: [219, 39, 119] },
  { id: "executive", name: "Executive", desc: "Leadership & impact", accent: [180, 83, 9] },
  { id: "academic", name: "Academic", desc: "Research & publications", accent: [37, 99, 235] },
];

interface Section {
  heading: string; // "" for the header block (name + contact line)
  body: string;
}

/** Split CV markdown into editable sections by "## " headings. */
function parseSections(md: string): Section[] {
  const lines = md.split("\n");
  const out: Section[] = [];
  let current: Section = { heading: "", body: "" };
  for (const line of lines) {
    if (line.startsWith("## ")) {
      out.push({ ...current, body: current.body.trim() });
      current = { heading: line.slice(3).trim(), body: "" };
    } else {
      current.body += line + "\n";
    }
  }
  out.push({ ...current, body: current.body.trim() });
  return out.filter((s, i) => i === 0 || s.heading || s.body);
}

function buildMarkdown(sections: Section[]): string {
  return sections
    .map((s) => (s.heading ? `## ${s.heading}\n${s.body}` : s.body))
    .filter((s) => s.trim())
    .join("\n\n");
}

export function AICVGeneratorDialog() {
  const [open, setOpen] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("English");
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [extraNotes, setExtraNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [personal, setPersonal] = useState({
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    links: "",
  });
  const { toast } = useToast();

  const markdown = useMemo(() => (sections.length ? buildMarkdown(sections) : ""), [sections]);

  // Prefill personal info from the user's profile
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, headline, occupation, email, location, website")
        .eq("id", user.id)
        .maybeSingle();
      if (!data) return;
      setPersonal((p) => ({
        fullName: p.fullName || data.full_name || "",
        headline: p.headline || data.headline || (data as any).occupation || "",
        email: p.email || data.email || user.email || "",
        phone: p.phone,
        location: p.location || (data as any).location || "",
        links: p.links || (data as any).website || "",
      }));
    })();
  }, [open]);

  const generate = async () => {
    setLoading(true);
    setSections([]);
    setEditing(false);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cv", {
        body: { targetRole, tone, language, extraNotes, template, personal },
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

      setSections(parseSections(data.markdown));
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
    const accent = TEMPLATES.find((t) => t.id === template)?.accent ?? [124, 58, 237];
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
      let isSection = false;
      if (line.startsWith("### ")) { size = 12; style = "bold"; text = line.slice(4); }
      else if (line.startsWith("## ")) { size = 14; style = "bold"; text = line.slice(3); isSection = true; }
      else if (line.startsWith("# ")) { size = 20; style = "bold"; text = line.slice(2); isSection = true; }

      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(isSection ? accent[0] : 30, isSection ? accent[1] : 30, isSection ? accent[2] : 30);
      const wrapped = doc.splitTextToSize(text, width) as string[];
      for (const w of wrapped) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.text(w, margin, y);
        y += size * 1.35;
      }
      if (isSection) {
        doc.setDrawColor(accent[0], accent[1], accent[2]);
        doc.setLineWidth(size > 16 ? 1.4 : 0.7);
        doc.line(margin, y - size * 0.6, margin + width, y - size * 0.6);
        y += 8;
      } else if (style === "bold") y += 4;
    }

    doc.save(`my-cv-${template}.pdf`);
  };

  const saveToMyCvs = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const { count } = await supabase
        .from("candidate_resumes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const version = (count ?? 0) + 1;
      const fileName = `AI CV v${version}${targetRole ? ` — ${targetRole}` : ""} (${template})`;
      const path = `${user.id}/${Date.now()}-ai-cv.md`;
      const blob = new Blob([markdown], { type: "text/markdown" });
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, blob);
      if (upErr) throw upErr;

      const { error } = await supabase.from("candidate_resumes").insert({
        user_id: user.id,
        file_url: path,
        file_name: `${fileName}.md`,
        is_primary: (count ?? 0) === 0,
        parsed_summary: sections.find((s) => /summary/i.test(s.heading))?.body?.slice(0, 500) || null,
        parsed_full_text: markdown,
      });
      if (error) throw error;

      toast({ title: `Saved as new version (v${version})`, description: "Find it in My CVs." });
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (i: number, patch: Partial<Section>) =>
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

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

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 sm:p-6">
        <DialogHeader className="px-6 pt-6 sm:px-0 sm:pt-0 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            AI CV Generator
          </DialogTitle>
          <DialogDescription>
            Pick a template, check your personal info and let AI build a complete ATS-ready CV. {CREDITS} credits per CV.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-0" style={{ WebkitOverflowScrolling: "touch" }}>

          <div className="space-y-5 pb-4">
            {/* Template picker */}
            <div className="space-y-2">
              <Label>CV style / template</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TEMPLATES.map((t) => {
                  const active = template === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplate(t.id)}
                      className={`relative text-left rounded-xl border p-3 transition-all ${
                        active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {active && (
                        <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground grid place-items-center">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal info */}
            <Card className="p-4 space-y-3 bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <User className="h-4 w-4 text-primary" /> Personal info
                <span className="text-[11px] font-normal text-muted-foreground">(prefilled from your profile — edit anytime)</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} placeholder="Jane Doe" />
                </div>
                <div className="space-y-1.5">
                  <Label>Headline</Label>
                  <Input value={personal.headline} onChange={(e) => setPersonal({ ...personal, headline: e.target.value })} placeholder="Frontend Developer" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} placeholder="you@email.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} placeholder="+00 000 000 000" />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} placeholder="City" />
                </div>
                <div className="space-y-1.5">
                  <Label>Links</Label>
                  <Input value={personal.links} onChange={(e) => setPersonal({ ...personal, links: e.target.value })} placeholder="LinkedIn / portfolio" />
                </div>
              </div>
            </Card>

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
                <Label>Experience, education & extras</Label>
                <Textarea
                  rows={4}
                  placeholder="Describe your work experience, education, certifications and projects — anything not saved in your profile yet…"
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
                  <Button size="sm" onClick={downloadPdf} className="bg-primary"><Download className="h-4 w-4 mr-1.5" />Download PDF</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
                    {editing ? <><Eye className="h-4 w-4 mr-1.5" />Preview</> : <><Pencil className="h-4 w-4 mr-1.5" />Edit sections</>}
                  </Button>
                  <Button size="sm" variant="outline" onClick={copy}><Copy className="h-4 w-4 mr-1.5" />Copy</Button>
                  <Button size="sm" variant="outline" onClick={saveToMyCvs} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                    Save as new version
                  </Button>
                </div>

                {editing ? (
                  <div className="space-y-3">
                    {sections.map((s, i) => (
                      <Card key={i} className="p-3 space-y-2">
                        {s.heading ? (
                          <Input
                            value={s.heading}
                            onChange={(e) => updateSection(i, { heading: e.target.value })}
                            className="font-semibold"
                          />
                        ) : (
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Header (name & contact)</div>
                        )}
                        <Textarea
                          value={s.body}
                          rows={Math.min(14, Math.max(3, s.body.split("\n").length + 1))}
                          onChange={(e) => updateSection(i, { body: e.target.value })}
                          className="font-mono text-xs"
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setSections((prev) => prev.filter((_, idx) => idx !== i))}
                          >
                            Remove section
                          </Button>
                        </div>
                      </Card>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSections((prev) => [...prev, { heading: "New section", body: "" }])}
                    >
                      + Add section
                    </Button>
                  </div>
                ) : (
                  <Card className="p-5 bg-card/80">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{markdown}</ReactMarkdown>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AICVGeneratorDialog;
