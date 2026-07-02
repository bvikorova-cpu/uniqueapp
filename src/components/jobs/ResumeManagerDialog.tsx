import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Sparkles, Loader2, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export function ResumeManagerDialog() {
  const [open, setOpen] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [parsing, setParsing] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("candidate_resumes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setResumes(data || []);
  };

  useEffect(() => { if (open) load(); }, [open]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setName(file.name);
    if (file.type === "text/plain") {
      setText(await file.text());
    } else {
      toast({ title: "Tip", description: "For PDFs, paste the text below or use a .txt file" });
    }
  };

  const save = async () => {
    if (!text.trim() || !name.trim()) { toast({ title: "Add file name and paste resume text", variant: "destructive" }); return; }
    setParsing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setParsing(false); return; }

    const { data: parsed, error } = await supabase.functions.invoke("parse-resume", { body: { resumeText: text } });
    if (error) { toast({ title: "Parse failed", description: error.message, variant: "destructive" }); setParsing(false); return; }

    const path = `${user.id}/${Date.now()}-${name}`;
    const blob = new Blob([text], { type: "text/plain" });
    await supabase.storage.from("resumes").upload(path, blob);

    await supabase.from("candidate_resumes").insert({
      user_id: user.id,
      file_url: path,
      file_name: name,
      is_primary: resumes.length === 0,
      parsed_skills: parsed?.skills || [],
      parsed_experience: parsed?.experience || [],
      parsed_education: parsed?.education || [],
      parsed_summary: parsed?.summary || null,
      parsed_full_text: text,
      years_experience: parsed?.years_experience || null,
    });

    toast({ title: "Resume saved & parsed!", description: `Found ${(parsed?.skills || []).length} skills` });
    setText(""); setName(""); setParsing(false); load();
  };

  const setPrimary = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("candidate_resumes").update({ is_primary: false }).eq("user_id", user.id);
    await supabase.from("candidate_resumes").update({ is_primary: true }).eq("id", id);
    load();
  };

  const del = async (id: string) => {
    await supabase.from("candidate_resumes").delete().eq("id", id);
    load();
  };

  return (
    <>
      <FloatingHowItWorks title="How Resume Manager Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1.5" />My CVs</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Resume Manager</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-primary" />Add new CV (3 credits to AI-parse)</div>
            <Input placeholder="CV name (e.g. My Tech CV)" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="file" accept=".txt,.pdf,.doc,.docx" onChange={onFile} />
            <Textarea placeholder="Paste resume text here..." value={text} onChange={(e) => setText(e.target.value)} rows={6} />
            <Button onClick={save} disabled={parsing} className="w-full">
              {parsing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Parsing...</> : <><Upload className="h-4 w-4 mr-2" />Save & Parse</>}
            </Button>
          </Card>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Your CVs ({resumes.length})</h3>
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No CVs yet. Add your first one above.</p>
            ) : resumes.map((r) => (
              <Card key={r.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{r.file_name}</span>
                      {r.is_primary && <Badge variant="default" className="text-[10px]">Primary</Badge>}
                    </div>
                    {r.parsed_summary && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.parsed_summary}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(r.parsed_skills || []).slice(0, 8).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!r.is_primary && <Button size="icon" variant="ghost" onClick={() => setPrimary(r.id)}><Star className="h-4 w-4" /></Button>}
                    <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
    );
}
