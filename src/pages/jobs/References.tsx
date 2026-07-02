import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_REFERENCES = [
  { title: "Add a reference", desc: "Enter name, role and email of a previous manager/colleague." },
  { title: "Request via email", desc: "System sends a short form for them to fill in. You never see the response until they submit." },
  { title: "Attach to applications", desc: "Verified references get a badge and can be attached to any application." },
];

export default function References() {
  const [items, setItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ ref_name: "", ref_email: "", ref_phone: "", relationship: "", company: "" });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await (supabase as any).from("reference_checks").select("*").eq("candidate_id", user.id).order("created_at", { ascending: false });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.ref_name || !form.ref_email) return toast.error("Name + email required");
    const { error } = await (supabase as any).from("reference_checks").insert({ candidate_id: userId, ...form });
    if (error) return toast.error(error.message);
    setForm({ ref_name: "", ref_email: "", ref_phone: "", relationship: "", company: "" });
    toast.success("Reference added");
    load();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-teal-500/15 via-primary/10 to-cyan-500/5 border border-teal-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-xl"><Users className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">References</h1>
          <p className="text-xs text-muted-foreground">Add people who can vouch for you.</p>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 space-y-2">
        <Input placeholder="Full name" value={form.ref_name} onChange={e => setForm({ ...form, ref_name: e.target.value })} />
        <div className="grid sm:grid-cols-2 gap-2">
          <Input placeholder="Email" value={form.ref_email} onChange={e => setForm({ ...form, ref_email: e.target.value })} />
          <Input placeholder="Phone (optional)" value={form.ref_phone} onChange={e => setForm({ ...form, ref_phone: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <Input placeholder="Relationship (Manager, Colleague…)" value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} />
          <Input placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
        </div>
        <Button className="w-full" onClick={add}><Plus className="h-4 w-4 mr-2" />Add reference</Button>
      </CardContent></Card>

      <div className="space-y-2">
        {items.map(r => (
          <Card key={r.id}><CardContent className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-sm">{r.ref_name}</p>
                <p className="text-xs text-muted-foreground">{r.relationship} {r.company && `· ${r.company}`}</p>
                <p className="text-xs text-muted-foreground">{r.ref_email}</p>
              </div>
              {r.contacted ? <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Contacted</span> : <span className="text-xs text-muted-foreground">Pending</span>}
            </div>
            {r.feedback && <p className="text-xs mt-2 p-2 rounded bg-muted">{r.feedback}</p>}
            {r.rating && <p className="text-xs mt-1 flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</p>}
          </CardContent></Card>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No references yet.</p>}
      </div>
    </div>
  );
}
