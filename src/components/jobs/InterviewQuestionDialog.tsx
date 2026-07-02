import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId?: string;
  companyName?: string;
  onSubmitted?: () => void;
}

export function InterviewQuestionDialog({ open, onOpenChange, companyId, companyName, onSubmitted }: Props) {
  const [form, setForm] = useState({ company_name: companyName || "", job_title: "", question: "", answer_tips: "", category: "general", difficulty: "medium" });
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (!form.job_title.trim() || !form.question.trim()) return toast({ title: "Job title and question required", variant: "destructive" });
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return toast({ title: "Sign in required", variant: "destructive" }); }
    const { error } = await supabase.from("interview_questions").insert({ ...form, company_id: companyId ?? null, user_id: user.id, is_anonymous: true });
    setBusy(false);
    if (error) return toast({ title: "Could not submit", description: error.message, variant: "destructive" });
    toast({ title: "Question shared" });
    onOpenChange(false);
    onSubmitted?.();
  };

  return (
    <>
      <FloatingHowItWorks title="How Interview Question Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Share an interview question</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {!companyName && <div><Label>Company</Label><Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} /></div>}
          <div><Label>Job title *</Label><Input value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} /></div>
          <div><Label>Question *</Label><Textarea rows={3} value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} /></div>
          <div><Label>Answer tips</Label><Textarea rows={3} value={form.answer_tips} onChange={e => setForm({ ...form, answer_tips: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="system_design">System design</SelectItem>
                  <SelectItem value="case_study">Case study</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={v => setForm({ ...form, difficulty: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={submit} disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
    );
}
