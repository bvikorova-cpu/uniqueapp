import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Trash2, Loader2, ArrowLeft, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function JobPostingTemplates() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await (supabase as any).from("job_posting_templates")
      .select("*").eq("employer_id", user.id).order("created_at", { ascending: false });
    setList(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !name.trim() || !title.trim() || !description.trim()) return toast.error("Fill required fields");
    const { error } = await (supabase as any).from("job_posting_templates").insert({
      employer_id: user.id, name, category, title, description, requirements, benefits,
    });
    if (error) return toast.error(error.message);
    toast.success("Template saved");
    setName(""); setCategory(""); setTitle(""); setDescription(""); setRequirements(""); setBenefits("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("job_posting_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const applyTemplate = async (t: any) => {
    await (supabase as any).from("job_posting_templates").update({ use_count: (t.use_count || 0) + 1 }).eq("id", t.id);
    sessionStorage.setItem("jobTemplate", JSON.stringify(t));
    navigate("/jobs/post");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/15 via-primary/10 to-purple-500/5 border border-primary/20 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-xl"><FileText className="h-7 w-7 text-white" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Job Posting Templates</h1>
            <p className="text-sm text-muted-foreground">Save reusable job descriptions for fast posting.</p>
          </div>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">New template</h3>
        <Input placeholder="Template name *" value={name} onChange={e => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Category (e.g., Engineering)" value={category} onChange={e => setCategory(e.target.value)} />
          <Input placeholder="Job title *" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <Textarea rows={5} placeholder="Description *" value={description} onChange={e => setDescription(e.target.value)} />
        <Textarea rows={3} placeholder="Requirements" value={requirements} onChange={e => setRequirements(e.target.value)} />
        <Textarea rows={3} placeholder="Benefits" value={benefits} onChange={e => setBenefits(e.target.value)} />
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
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold">{t.name}</h4>
                  <p className="text-xs text-muted-foreground">{t.category} · {t.title} · used {t.use_count}×</p>
                  <p className="text-xs whitespace-pre-wrap mt-2 line-clamp-3">{t.description}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={() => applyTemplate(t)}><Copy className="h-3 w-3 mr-1" /> Use</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
