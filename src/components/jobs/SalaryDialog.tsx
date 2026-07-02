import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

export function SalaryDialog({ open, onOpenChange, companyId, companyName, onSubmitted }: Props) {
  const [form, setForm] = useState({ company_name: companyName || "", job_title: "", location: "", years_experience: 0, base_salary: 0, bonus: 0, equity: 0 });
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (!form.company_name.trim() || !form.job_title.trim() || !form.base_salary) {
      return toast({ title: "Company, title and salary required", variant: "destructive" });
    }
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return toast({ title: "Sign in required", variant: "destructive" }); }
    const { error } = await supabase.from("salary_reports").insert({ ...form, company_id: companyId ?? null, user_id: user.id, currency: "EUR", is_anonymous: true });
    setBusy(false);
    if (error) return toast({ title: "Could not submit", description: error.message, variant: "destructive" });
    toast({ title: "Salary submitted (anonymous)" });
    onOpenChange(false);
    onSubmitted?.();
  };

  return (
    <>
      <FloatingHowItWorks title="How Salary Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Share salary (anonymous)</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {!companyName && <div><Label>Company *</Label><Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} /></div>}
          <div><Label>Job title *</Label><Input value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} /></div>
          <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Berlin" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Years experience</Label><Input type="number" value={form.years_experience} onChange={e => setForm({ ...form, years_experience: Number(e.target.value) })} /></div>
            <div><Label>Base salary (€/yr) *</Label><Input type="number" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: Number(e.target.value) })} /></div>
            <div><Label>Bonus (€)</Label><Input type="number" value={form.bonus} onChange={e => setForm({ ...form, bonus: Number(e.target.value) })} /></div>
            <div><Label>Equity (€)</Label><Input type="number" value={form.equity} onChange={e => setForm({ ...form, equity: Number(e.target.value) })} /></div>
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
