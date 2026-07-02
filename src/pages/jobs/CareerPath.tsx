import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Map, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_CAREERPATH = [
  { title: "Enter your current role", desc: "Pick title + years of experience." },
  { title: "See next steps", desc: "AI suggests 2-4 realistic next roles with required skills and typical salary jump." },
  { title: "Skill gaps", desc: "Missing skills are highlighted with links to courses and assessments to close the gap." },
  { title: "Save a path", desc: "Bookmark a chosen path \u2014 the tracker reminds you of milestones." },
];

export default function CareerPath() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ role_title: "", target_date: "", notes: "", skills_required: "" });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await (supabase as any).from("career_path_nodes").select("*").eq("user_id", user.id).order("order_index");
    setNodes(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.role_title) return toast.error("Role required");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in required");
    const { error } = await (supabase as any).from("career_path_nodes").insert({
      user_id: user.id, role_title: form.role_title,
      target_date: form.target_date || null, notes: form.notes,
      skills_required: form.skills_required.split(",").map(s => s.trim()).filter(Boolean),
      order_index: nodes.length,
    });
    if (error) return toast.error(error.message);
    setForm({ role_title: "", target_date: "", notes: "", skills_required: "" });
    load();
  };

  const toggle = async (n: any) => {
    await (supabase as any).from("career_path_nodes").update({ completed: !n.completed, completed_at: !n.completed ? new Date().toISOString() : null }).eq("id", n.id);
    load();
  };
  const del = async (id: string) => {
    await (supabase as any).from("career_path_nodes").delete().eq("id", id);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Career Path" intro="Visualise where your current role can lead." steps={HOW_STEPS_CAREERPATH} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-purple-500/15 via-primary/10 to-pink-500/5 border border-purple-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl"><Map className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">Career Path</h1>
          <p className="text-xs text-muted-foreground">Map your milestones to your dream role.</p>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 space-y-2">
        <Input placeholder="Role / milestone (e.g. Senior Engineer)" value={form.role_title} onChange={e => setForm({ ...form, role_title: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} />
          <Input placeholder="Skills (comma)" value={form.skills_required} onChange={e => setForm({ ...form, skills_required: e.target.value })} />
        </div>
        <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
        <Button onClick={add} className="w-full"><Plus className="h-4 w-4 mr-1" /> Add milestone</Button>
      </CardContent></Card>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> :
        <div className="space-y-2">
          {nodes.map((n, i) => (
            <Card key={n.id} className={n.completed ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-start gap-3">
                <button onClick={() => toggle(n)} className="mt-1">
                  <CheckCircle2 className={`h-5 w-5 ${n.completed ? "text-emerald-400" : "text-muted-foreground"}`} />
                </button>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm ${n.completed ? "line-through" : ""}`}>{i + 1}. {n.role_title}</h3>
                  {n.target_date && <p className="text-xs text-muted-foreground">🎯 {n.target_date}</p>}
                  {n.skills_required?.length > 0 && <p className="text-xs text-purple-400 mt-1">Skills: {n.skills_required.join(", ")}</p>}
                  {n.notes && <p className="text-xs text-muted-foreground mt-1">{n.notes}</p>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => del(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>}
    </div>
  );
}
