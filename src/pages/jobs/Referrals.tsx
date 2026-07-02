import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_REFERRALS = [
  { title: "Pick a job", desc: "Open any job that supports referrals (badge on the card)." },
  { title: "Share a unique link", desc: "Copy your referral link or send via email/socials directly from the page." },
  { title: "Track referrals", desc: "See who clicked, applied and got hired \u2014 payouts settle after the hire is confirmed." },
];

export default function Referrals() {
  const [items, setItems] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ job_id: "", referred_email: "", referred_name: "", message: "" });

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const [{ data: refs }, { data: js }] = await Promise.all([
      (supabase as any).from("job_referrals").select("*, job_listings(title, company_name)").eq("referrer_id", user.id).order("created_at", { ascending: false }),
      (supabase as any).from("job_listings").select("id, title, company_name").eq("is_active", true).limit(100),
    ]);
    setItems(refs ?? []);
    setJobs(js ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in required");
    if (!form.job_id || !form.referred_email) return toast.error("Job and email required");
    const { error } = await (supabase as any).from("job_referrals").insert({ ...form, referrer_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Referral sent");
    setOpen(false); setForm({ job_id: "", referred_email: "", referred_name: "", message: "" });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-primary/10 to-cyan-500/5 border border-emerald-500/20 p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-xl"><Users className="h-6 w-6 text-white" /></div>
          <div>
            <h1 className="text-2xl font-black">Referrals</h1>
            <p className="text-xs text-muted-foreground">Refer talent. Earn bonuses on hire.</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New referral</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Refer a candidate</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <select className="w-full bg-background border rounded-md p-2 text-sm" value={form.job_id} onChange={e => setForm({ ...form, job_id: e.target.value })}>
                <option value="">Select a job…</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title} — {j.company_name}</option>)}
              </select>
              <Input placeholder="Candidate name" value={form.referred_name} onChange={e => setForm({ ...form, referred_name: e.target.value })} />
              <Input type="email" placeholder="Candidate email" value={form.referred_email} onChange={e => setForm({ ...form, referred_email: e.target.value })} />
              <Textarea placeholder="Why this person is a great fit" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              <Button className="w-full" onClick={submit}>Send referral</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> :
        items.length === 0 ? <Card className="border-dashed"><CardContent className="py-16 text-center text-muted-foreground">No referrals yet.</CardContent></Card> :
        <div className="grid gap-3">{items.map((r: any) => (
          <Card key={r.id}><CardContent className="p-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm">{r.referred_name || r.referred_email}</h3>
              <p className="text-xs text-muted-foreground">{r.job_listings?.title} @ {r.job_listings?.company_name}</p>
            </div>
            <div className="text-right">
              <Badge variant={r.status === 'hired' ? 'default' : 'secondary'}>{r.status}</Badge>
              {r.bonus_amount > 0 && <p className="text-xs text-emerald-400 mt-1">€{r.bonus_amount}</p>}
            </div>
          </CardContent></Card>
        ))}</div>}
    </div>
  );
}
