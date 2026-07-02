import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_BACKGROUNDCHECKS = [
  { title: "Choose check type", desc: "ID, criminal, education, employment or full package." },
  { title: "Candidate consents", desc: "Candidate receives an email to consent and upload documents securely." },
  { title: "Receive the report", desc: "Report arrives in-app once complete, typically within 24-72h." },
];

const CHECK_TYPES = [
  { id: "criminal", label: "Criminal record" },
  { id: "employment", label: "Employment history" },
  { id: "education", label: "Education verification" },
  { id: "credit", label: "Credit check" },
  { id: "identity", label: "Identity (KYC)" },
  { id: "drivers", label: "Driver's license" },
];

export default function BackgroundChecks() {
  const [items, setItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data: emp } = await (supabase as any).from("background_check_requests").select("*").eq("employer_id", user.id).order("created_at", { ascending: false });
    const { data: cand } = await (supabase as any).from("background_check_requests").select("*").eq("candidate_id", user.id).order("created_at", { ascending: false });
    setItems([...(emp || []), ...(cand || [])]);
  };
  useEffect(() => { load(); }, []);

  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const send = async () => {
    if (!candidateEmail || selected.length === 0) return toast.error("Email + at least one check");
    const { data: prof } = await (supabase as any).from("profiles_public").select("user_id").eq("email", candidateEmail).maybeSingle();
    if (!prof) return toast.error("Candidate not found");
    const { error } = await (supabase as any).from("background_check_requests").insert({
      employer_id: userId, candidate_id: prof.user_id, check_types: selected, status: "awaiting_consent",
    });
    if (error) return toast.error(error.message);
    toast.success("Request sent — candidate will be asked for consent");
    setCandidateEmail(""); setSelected([]); load();
  };

  const giveConsent = async (id: string) => {
    await (supabase as any).from("background_check_requests").update({ consent_given: true, consent_at: new Date().toISOString(), status: "in_progress" }).eq("id", id);
    toast.success("Consent given");
    load();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Background Checks" intro="Run compliant checks on final candidates." steps={HOW_STEPS_BACKGROUNDCHECKS} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-primary/10 to-teal-500/5 border border-emerald-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl"><ShieldCheck className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">Background Checks</h1>
          <p className="text-xs text-muted-foreground">GDPR-compliant. Consent-required.</p>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 space-y-2">
        <p className="font-bold text-sm">Request a check</p>
        <Input placeholder="Candidate email" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          {CHECK_TYPES.map(c => (
            <label key={c.id} className="flex items-center justify-between gap-2 text-sm border rounded-md px-3 py-2">
              {c.label} <Switch checked={selected.includes(c.id)} onCheckedChange={() => toggle(c.id)} />
            </label>
          ))}
        </div>
        <Button className="w-full" onClick={send}><Send className="h-4 w-4 mr-2" />Send request</Button>
      </CardContent></Card>

      <div className="space-y-2">
        {items.map(r => (
          <Card key={r.id}><CardContent className="p-3 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">{r.check_types.join(", ")}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{r.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">{r.candidate_id === userId ? "You are the subject" : "Your request"}</p>
            {r.candidate_id === userId && !r.consent_given && (
              <Button size="sm" onClick={() => giveConsent(r.id)}><Check className="h-3 w-3 mr-1" />Give consent</Button>
            )}
            {r.result_summary && <p className="text-xs mt-1 p-2 rounded bg-muted">{r.result_summary}</p>}
          </CardContent></Card>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No requests yet.</p>}
      </div>
    </div>
  );
}
