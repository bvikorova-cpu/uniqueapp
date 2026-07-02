import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users2, Plus, Loader2, ArrowLeft, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_BULKHIRING = [
  { title: "Upload a CSV", desc: "Provide a spreadsheet of roles or use the template." },
  { title: "Auto-create job posts", desc: "Each row becomes a live job with the same template branding." },
  { title: "Manage in one dashboard", desc: "Applicants across all bulk roles are unified for easier screening." },
];

export default function BulkHiring() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [target, setTarget] = useState(5);
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await (supabase as any).from("bulk_hiring_campaigns")
      .select("*").eq("employer_id", user.id).order("created_at", { ascending: false });
    setList(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !name.trim() || !role.trim()) return toast.error("Fill required fields");
    const { error } = await (supabase as any).from("bulk_hiring_campaigns").insert({
      employer_id: user.id, name, role_title: role, target_hires: target,
      deadline: deadline || null, description,
    });
    if (error) return toast.error(error.message);
    toast.success("Campaign created");
    setName(""); setRole(""); setTarget(5); setDeadline(""); setDescription("");
    load();
  };

  const close = async (id: string) => {
    await (supabase as any).from("bulk_hiring_campaigns").update({ status: "closed" }).eq("id", id);
    toast.success("Closed");
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Bulk Hiring" intro="Post many roles or hire many people at once." steps={HOW_STEPS_BULKHIRING} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 via-primary/10 to-cyan-500/5 border border-emerald-500/20 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-xl"><Users2 className="h-7 w-7 text-white" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Bulk Hiring</h1>
            <p className="text-sm text-muted-foreground">Run mass-hiring campaigns and track progress.</p>
          </div>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">New campaign</h3>
        <Input placeholder="Campaign name *" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Role title *" value={role} onChange={e => setRole(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" min={1} placeholder="Target hires" value={target} onChange={e => setTarget(parseInt(e.target.value || "1"))} />
          <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>
        <Textarea rows={3} placeholder="Description / notes" value={description} onChange={e => setDescription(e.target.value)} />
        <Button onClick={create}><Plus className="h-4 w-4 mr-1" /> Create campaign</Button>
      </CardContent></Card>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : list.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-10 text-center text-muted-foreground">No campaigns yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {list.map(c => {
            const pct = Math.min(100, Math.round((c.hired_count / Math.max(1, c.target_hires)) * 100));
            return (
              <Card key={c.id}><CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{c.name}</h4>
                    <p className="text-xs text-muted-foreground">{c.role_title} · deadline {c.deadline ?? "—"}</p>
                  </div>
                  <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Target className="h-3 w-3" /> {c.hired_count}/{c.target_hires} hired
                </div>
                <Progress value={pct} />
                {c.status === "active" && (
                  <Button size="sm" variant="outline" onClick={() => close(c.id)}>Close campaign</Button>
                )}
              </CardContent></Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
