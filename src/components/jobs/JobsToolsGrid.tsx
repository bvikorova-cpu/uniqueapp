import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Mic, DollarSign, Map, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

const TOOLS = [
  { id: "resume_builder", title: "AI Resume Builder", desc: "Generate ATS-optimized professional resumes tailored to specific jobs", icon: FileText, credits: 5, color: "from-amber-500 to-yellow-600" },
  { id: "interview_coach", title: "AI Interview Coach", desc: "Practice interviews with AI feedback, STAR answers & confidence scoring", icon: Mic, credits: 5, color: "from-blue-500 to-cyan-600" },
  { id: "salary_negotiator", title: "AI Salary Negotiator", desc: "Data-driven salary analysis, negotiation scripts & compensation strategy", icon: DollarSign, credits: 4, color: "from-emerald-500 to-green-600" },
  { id: "career_path", title: "AI Career Path Planner", desc: "Personalized career roadmap with skill gaps, milestones & salary forecasts", icon: Map, credits: 6, color: "from-purple-500 to-violet-600" },
];

const TOOL_FIELDS: Record<string, { key: string; label: string; type: "input" | "textarea" }[]> = {
  resume_builder: [
    { key: "job_title", label: "Target Job Title", type: "input" },
    { key: "industry", label: "Industry", type: "input" },
    { key: "experience_level", label: "Experience Level", type: "input" },
    { key: "skills", label: "Key Skills", type: "input" },
    { key: "work_history", label: "Work History", type: "textarea" },
    { key: "education", label: "Education", type: "input" },
  ],
  interview_coach: [
    { key: "position", label: "Position Applying For", type: "input" },
    { key: "company_type", label: "Company Type (startup, corporate, etc.)", type: "input" },
    { key: "interview_type", label: "Interview Type (technical, behavioral, etc.)", type: "input" },
    { key: "experience_level", label: "Experience Level", type: "input" },
    { key: "concerns", label: "Key Concerns or Weak Areas", type: "textarea" },
  ],
  salary_negotiator: [
    { key: "position", label: "Position", type: "input" },
    { key: "location", label: "Location / Country", type: "input" },
    { key: "years_experience", label: "Years of Experience", type: "input" },
    { key: "current_salary", label: "Current Salary", type: "input" },
    { key: "target_salary", label: "Target Salary", type: "input" },
    { key: "industry", label: "Industry", type: "input" },
  ],
  career_path: [
    { key: "current_role", label: "Current Role", type: "input" },
    { key: "target_role", label: "Dream Role", type: "input" },
    { key: "industry", label: "Industry", type: "input" },
    { key: "skills", label: "Current Skills", type: "textarea" },
    { key: "years_experience", label: "Years of Experience", type: "input" },
    { key: "goals", label: "Career Goals", type: "textarea" },
  ],
};

export default function JobsToolsGrid() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleGenerate = async (toolId: string) => {
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in to use AI tools"); return; }

      const { data, error } = await supabase.functions.invoke("jobs-ai", {
        body: { action: toolId, ...formData },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);

      // Log usage for achievements + track weekly Skill Sharpener challenge
      try {
        await (supabase as any).from("ai_usage_history").insert({
          user_id: session.user.id,
          usage_type: toolId,
          credits_used: TOOLS.find((t) => t.id === toolId)?.credits ?? 0,
          description: `Jobs AI: ${toolId}`,
        });
        await (supabase as any).rpc("track_challenge_action", { _action: "job_tool_use" });
      } catch (e) {
        console.warn("usage tracking failed", e);
      }

      toast.success("AI analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  if (activeTool) {
    const tool = TOOLS.find(t => t.id === activeTool)!;
    const fields = TOOL_FIELDS[activeTool] || [];
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" onClick={() => { setActiveTool(null); setResult(null); setFormData({}); }} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tools
        </Button>
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border-amber-500/20">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
              <tool.icon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{tool.title}</CardTitle>
            <p className="text-muted-foreground">{tool.desc}</p>
            <Badge className="w-fit mx-auto bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Sparkles className="h-3 w-3 mr-1" /> {tool.credits} Credits
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                {f.type === "textarea" ? (
                  <Textarea placeholder={f.label} value={formData[f.key] || ""} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} rows={3} />
                ) : (
                  <Input placeholder={f.label} value={formData[f.key] || ""} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} />
                )}
              </div>
            ))}
            <Button onClick={() => handleGenerate(activeTool)} disabled={loading} className={`w-full bg-gradient-to-r ${tool.color}`}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate ({tool.credits} CR)</>}
            </Button>
            {result && (
              <Card className="bg-card/80 border-amber-500/20 p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-black">🛠️ AI Career Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOLS.map((tool, i) => (
          <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card
              className="cursor-pointer hover:border-amber-500/40 transition-all hover:shadow-lg hover:shadow-amber-500/10 bg-card/80 border-border/30"
              onClick={() => setActiveTool(tool.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm">{tool.title}</h3>
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">{tool.credits} CR</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
