import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId: string;
  onSubmitted?: () => void;
}

export function ReviewDialog({ open, onOpenChange, companyId, onSubmitted }: Props) {
  const [form, setForm] = useState({ rating: 4, title: "", pros: "", cons: "", advice: "", job_title: "", employment_status: "current" });
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (!form.title.trim()) return toast({ title: "Title required", variant: "destructive" });
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return toast({ title: "Sign in required", variant: "destructive" }); }
    const { error } = await supabase.from("company_reviews").insert({ ...form, company_id: companyId, user_id: user.id, is_anonymous: true });
    setBusy(false);
    if (error) return toast({ title: "Could not submit", description: error.message, variant: "destructive" });
    toast({ title: "Review submitted" });
    onOpenChange(false);
    onSubmitted?.();
  };

  return (
    <>
      <FloatingHowItWorks title="How Review Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Write a review</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Overall rating</Label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                  <Star className={`h-7 w-7 ${n <= form.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Great place to grow" /></div>
          <div><Label>Job title</Label><Input value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} placeholder="Software Engineer" /></div>
          <div><Label>Pros</Label><Textarea rows={3} value={form.pros} onChange={e => setForm({ ...form, pros: e.target.value })} /></div>
          <div><Label>Cons</Label><Textarea rows={3} value={form.cons} onChange={e => setForm({ ...form, cons: e.target.value })} /></div>
          <div><Label>Advice to management</Label><Textarea rows={2} value={form.advice} onChange={e => setForm({ ...form, advice: e.target.value })} /></div>
          <Button onClick={submit} disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
    );
}
