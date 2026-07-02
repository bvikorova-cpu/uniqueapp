import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Sparkles, Loader2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export function CoverLetterDialog({ jobId, jobTitle, jobDescription, companyName }: { jobId: string; jobTitle: string; jobDescription: string; companyName: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: resume } = await supabase.from("candidate_resumes").select("parsed_skills, parsed_summary").eq("user_id", user.id).order("is_primary", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
      body: {
        jobTitle, jobDescription, companyName, tone,
        candidateSummary: resume?.parsed_summary,
        candidateSkills: resume?.parsed_skills || [],
      },
    });
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); setLoading(false); return; }
    setContent(data.content);
    setLoading(false);
  };

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("cover_letters").insert({
      user_id: user.id, job_id: jobId, title: `Cover letter for ${jobTitle}`, content, is_ai_generated: true,
    });
    toast({ title: "Saved!" });
  };

  return (
    <>
      <FloatingHowItWorks title="How Cover Letter Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Mail className="h-4 w-4 mr-1.5" />Cover letter</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />AI Cover Letter (4 credits)</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
              <SelectItem value="confident">Confident</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4 mr-2" />Generate</>}
          </Button>
          {content && (
            <>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(content); toast({ title: "Copied" }); }}>
                  <Copy className="h-4 w-4 mr-1.5" />Copy
                </Button>
                <Button onClick={save} className="flex-1">Save</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
    );
}
