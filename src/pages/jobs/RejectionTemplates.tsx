import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_REJECTIONTEMPLATES = [
  { title: "Pick a template", desc: "Choose Post-application, Post-interview or Final-round wording." },
  { title: "Personalise", desc: "Merge fields auto-fill candidate name, role and interviewer." },
  { title: "Send in bulk or single", desc: "Select many candidates in ATS and send the same template at once." },
];

const DEFAULT_TPL = `Dear {candidate},

Thank you for your interest in the {job_title} position at {company}. After careful consideration, we have decided not to move forward with your application at this time.

We genuinely appreciate the time you invested. We will keep your profile on file for future opportunities.

Best regards,
{company} Hiring Team`;

export default function RejectionTemplates() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Update on your application");
  const [body, setBody] = useState(DEFAULT_TPL);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await (supabase as any).from("rejection_templates").select("*").eq("employer_id", user.id).order("created_at", { ascending: false });
    setList(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !name.trim() || !subject.trim() || !body.trim()) return toast.error("Fill all fields");
    const { error } = await (supabase as any).from("rejection_templates").insert({
      employer_id: user.id, name, subject, body, is_default: list.length === 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Template saved");
    setName(""); setSubject("Update on your application"); setBody(DEFAULT_TPL);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("rejection_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/15 via-primary/10 to-orange-500/5 border border-rose-500/20 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-xl"><Mail className="h-7 w-7 text-white" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Rejection Templates</h1>
            <p className="text-sm text-muted-foreground">Reusable templates. Use {"{candidate}, {job_title}, {company}"} placeholders.</p>
          </div>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">New template</h3>
        <Input placeholder="Template name (e.g., Polite decline)" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Email subject" value={subject} onChange={e => setSubject(e.target.value)} />
        <Textarea rows={8} value={body} onChange={e => setBody(e.target.value)} />
        <Button onClick={save}><Plus className="h-4 w-4 mr-1" /> Save template</Button>
      </CardContent></Card>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : list.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-10 text-center text-muted-foreground">No templates yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {list.map(t => (
            <Card key={t.id}><CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{t.name} {t.is_default && <span className="text-xs text-primary">(default)</span>}</h4>
                  <p className="text-xs text-muted-foreground">{t.subject}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs whitespace-pre-wrap mt-2 line-clamp-4">{t.body}</p>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
