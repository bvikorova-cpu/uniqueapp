import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Loader2, Copy, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_AIJOBDESCRIPTIONWRITER = [
  { title: "Enter role & team info", desc: "Title, seniority, team, must-have skills, tone." },
  { title: "Generate the JD", desc: "AI writes a full posting: intro, responsibilities, requirements, benefits, EEO." },
  { title: "Edit and publish", desc: "Tweak, save as template, then publish to the board." },
];

export default function AIJobDescriptionWriter() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [level, setLevel] = useState("");
  const [skills, setSkills] = useState("");
  const [remote, setRemote] = useState(false);
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!title) return toast.error("Enter role title");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("ai-job-description", {
      body: { title, company, level, remote, tone, skills: skills.split(",").map(s => s.trim()).filter(Boolean) },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setResult(data.result);
  };

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in first");
    await (supabase as any).from("ai_job_description_drafts").insert({
      user_id: user.id, title, prompt: JSON.stringify({ title, company, level, skills, remote, tone }), result,
    });
    toast.success("Draft saved");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-fuchsia-500/15 via-primary/10 to-purple-500/5 border border-fuchsia-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-500 shadow-xl"><Sparkles className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">AI Job Description Writer</h1>
          <p className="text-xs text-muted-foreground">Inclusive, concrete, ready to post.</p>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 space-y-2">
        <Input placeholder="Role title (e.g. Senior Backend Engineer)" value={title} onChange={e => setTitle(e.target.value)} />
        <div className="grid sm:grid-cols-2 gap-2">
          <Input placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} />
          <Input placeholder="Level (Junior/Mid/Senior/Lead)" value={level} onChange={e => setLevel(e.target.value)} />
        </div>
        <Input placeholder="Required skills, comma-separated" value={skills} onChange={e => setSkills(e.target.value)} />
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="flex items-center justify-between gap-2 text-sm border rounded-md px-3 py-2">Remote-first <Switch checked={remote} onCheckedChange={setRemote} /></label>
          <select className="bg-background border rounded-md p-2 text-sm" value={tone} onChange={e => setTone(e.target.value)}>
            {["professional","friendly","bold","casual","formal"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <Button className="w-full" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Generate
        </Button>
      </CardContent></Card>

      {result && (
        <Card><CardContent className="p-4 space-y-3">
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied"); }}><Copy className="h-4 w-4 mr-1" />Copy</Button>
            <Button onClick={save}><Save className="h-4 w-4 mr-1" />Save draft</Button>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}
