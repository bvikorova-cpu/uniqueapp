import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Dumbbell, TrendingUp, FileText, BookOpen, LineChart, Target, Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface ToolDef {
  id: string;
  title: string;
  description: string;
  credits: number;
  icon: any;
  color: string;
  fields: { key: string; label: string; type: "text" | "select" | "textarea"; options?: string[] }[];
}

const tools: ToolDef[] = [
  {
    id: "brain_training", title: "AI Brain Training", description: "Personalized exercises to boost memory, logic & speed", credits: 5,
    icon: Dumbbell, color: "from-blue-500 to-cyan-500",
    fields: [
      { key: "focusArea", label: "Focus Area", type: "select", options: ["General", "Memory", "Logic", "Processing Speed", "Pattern Recognition", "Spatial Reasoning"] },
      { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard", "Expert"] },
      { key: "duration", label: "Session Duration", type: "select", options: ["10 minutes", "15 minutes", "20 minutes", "30 minutes"] },
    ]
  },
  {
    id: "iq_predictor", title: "AI IQ Predictor", description: "Predict your future IQ score based on trends", credits: 4,
    icon: TrendingUp, color: "from-emerald-500 to-teal-500",
    fields: [
      { key: "age", label: "Your Age", type: "text" },
      { key: "trainingFrequency", label: "Training Frequency", type: "select", options: ["Daily", "3-4 times/week", "Weekly", "Monthly", "Rarely"] },
      { key: "recentScores", label: "Recent Test Scores (if any)", type: "text" },
    ]
  },
  {
    id: "cognitive_report", title: "AI Cognitive Report", description: "Comprehensive PDF-ready cognitive assessment", credits: 6,
    icon: FileText, color: "from-purple-500 to-violet-500",
    fields: [
      { key: "ageGroup", label: "Age Group", type: "select", options: ["18-25", "26-35", "36-45", "46-55", "55+"] },
      { key: "education", label: "Education Level", type: "select", options: ["High School", "Bachelor's", "Master's", "PhD", "Self-taught"] },
      { key: "testResults", label: "Test Results Summary", type: "textarea" },
    ]
  },
  {
    id: "study_coach", title: "AI Study Coach", description: "Personalized training plan to boost your IQ", credits: 5,
    icon: BookOpen, color: "from-amber-500 to-orange-500",
    fields: [
      { key: "goal", label: "Your Goal", type: "select", options: ["Maximize IQ", "Improve Memory", "Better Logic", "Faster Processing", "All-round Enhancement"] },
      { key: "dailyTime", label: "Daily Available Time", type: "select", options: ["15 minutes", "30 minutes", "45 minutes", "1 hour", "2+ hours"] },
      { key: "weakAreas", label: "Weak Areas", type: "text" },
      { key: "strongAreas", label: "Strong Areas", type: "text" },
    ]
  },
  {
    id: "cognitive_analysis", title: "Cognitive Profile Analysis", description: "Deep dive into your cognitive strengths & patterns", credits: 5,
    icon: Brain, color: "from-indigo-500 to-blue-500",
    fields: [
      { key: "strengths", label: "Self-Described Strengths", type: "textarea" },
      { key: "activities", label: "Preferred Activities", type: "text" },
      { key: "challenges", label: "Challenges Faced", type: "text" },
    ]
  },
  {
    id: "learning_style", title: "Learning Style Assessment", description: "Discover how you learn best", credits: 4,
    icon: Lightbulb, color: "from-yellow-500 to-amber-500",
    fields: [
      { key: "preferences", label: "How Do You Prefer to Learn?", type: "textarea" },
      { key: "experiences", label: "Best Study Experiences", type: "text" },
      { key: "difficulties", label: "Learning Difficulties", type: "text" },
    ]
  },
  {
    id: "strengths_report", title: "Strengths & Weaknesses Report", description: "Detailed breakdown of your abilities", credits: 5,
    icon: Target, color: "from-rose-500 to-pink-500",
    fields: [
      { key: "performance", label: "Test Area Performance", type: "textarea" },
      { key: "selfAssessment", label: "Your Self-Assessment", type: "textarea" },
    ]
  },
  {
    id: "improvement_plan", title: "IQ Improvement Roadmap", description: "AI-generated plan to boost your IQ", credits: 6,
    icon: Sparkles, color: "from-cyan-500 to-blue-500",
    fields: [
      { key: "currentIQ", label: "Current Estimated IQ", type: "text" },
      { key: "target", label: "Target", type: "select", options: ["Maximum improvement", "+5 points", "+10 points", "+15 points", "+20 points"] },
      { key: "timeline", label: "Timeline", type: "select", options: ["3 months", "6 months", "1 year"] },
      { key: "constraints", label: "Any Constraints?", type: "text" },
    ]
  },
];

export default function IQToolsGrid() {
  const [activeTool, setActiveTool] = useState<ToolDef | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!activeTool) return;
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please login first", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("iq-platform-ai", {
        body: { action: activeTool.id, ...formData },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Analysis complete!", description: `Used ${data.credits_used} credits` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderResult = (data: any) => {
    if (!data) return null;
    const { credits_used, credits_remaining, ...rest } = data;
    const md = jsonToMarkdown(rest);
    return (
      <>
        <FloatingHowItWorks title="How IQTools Grid works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{md}</ReactMarkdown>
        <div className="mt-4 text-xs text-muted-foreground">
          Credits used: {credits_used} | Remaining: {credits_remaining}
        </div>
      </div>
      </>
      );
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-black mb-4">🤖 AI-Powered Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="cursor-pointer group hover:shadow-lg hover:border-blue-500/30 transition-all active:scale-[0.97] backdrop-blur-xl bg-card/80 border-border/30 overflow-hidden h-full"
                onClick={() => { setActiveTool(tool); setFormData({}); setResult(null); }}
              >
                <CardContent className="p-4 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white`}>
                        <tool.icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">{tool.credits} CR</Badge>
                    </div>
                    <h3 className="font-bold text-sm mb-1">{tool.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-tight">{tool.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={!!activeTool} onOpenChange={(open) => { if (!open) { setActiveTool(null); setResult(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeTool && <activeTool.icon className="h-5 w-5 text-blue-500" />}
              {activeTool?.title}
              <Badge variant="outline" className="ml-auto">{activeTool?.credits} Credits</Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            {!result ? (
              <div className="space-y-4 py-2">
                {activeTool?.fields.map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-sm font-medium">{field.label}</label>
                    {field.type === "select" ? (
                      <Select value={formData[field.key] || ""} onValueChange={v => setFormData(p => ({ ...p, [field.key]: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {field.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : field.type === "textarea" ? (
                      <Textarea value={formData[field.key] || ""} onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))} placeholder={`Enter ${field.label.toLowerCase()}...`} />
                    ) : (
                      <Input value={formData[field.key] || ""} onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))} placeholder={`Enter ${field.label.toLowerCase()}...`} />
                    )}
                  </div>
                ))}
                <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : `Analyze (${activeTool?.credits} Credits)`}
                </Button>
              </div>
            ) : (
              <div className="py-2">{renderResult(result)}</div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

function jsonToMarkdown(obj: any, depth = 0): string {
  if (obj === null || obj === undefined) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === "string") return `- ${item}`;
      if (typeof item === "object") return jsonToMarkdown(item, depth);
      return `- ${String(item)}`;
    }).join("\n");
  }

  const lines: string[] = [];
  const prefix = "#".repeat(Math.min(depth + 2, 4));
  for (const [key, value] of Object.entries(obj)) {
    const title = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    if (typeof value === "object" && value !== null) {
      lines.push(`\n${prefix} ${title}\n`);
      lines.push(jsonToMarkdown(value, depth + 1));
    } else {
      lines.push(`**${title}:** ${value}`);
    }
  }
  return lines.join("\n");
}
