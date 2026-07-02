import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Gem, Eye, Activity, Star, Heart, Upload, Sparkles, Brain, Salad } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const tools = [
  { id: "age_progression", name: "AI Age Progression", desc: "See your future self in 10-50 years", icon: Gem, credits: 5, color: "from-cyan-500 to-blue-500" },
  { id: "skin_health", name: "AI Skin Health Analyzer", desc: "Deep skin analysis with aging factors & UV damage", icon: Eye, credits: 5, color: "from-purple-500 to-pink-500" },
  { id: "lifestyle_impact", name: "AI Lifestyle Impact", desc: "See how habits affect your aging trajectory", icon: Activity, credits: 4, color: "from-green-500 to-emerald-500" },
  { id: "celebrity_match", name: "AI Celebrity Age Match", desc: "Find your celebrity age twin", icon: Star, credits: 4, color: "from-amber-500 to-orange-500" },
  { id: "anti_aging", name: "AI Anti-Aging Coach", desc: "Personalized anti-aging plan for your face", icon: Heart, credits: 5, color: "from-red-500 to-rose-500" },
  { id: "healthy_comparison", name: "Healthy vs Unhealthy", desc: "See dramatic lifestyle impact comparison", icon: Sparkles, credits: 6, color: "from-indigo-500 to-violet-500" },
  { id: "skin_routine", name: "AI Skincare Routine", desc: "Custom skincare regimen based on your skin type", icon: Salad, credits: 4, color: "from-teal-500 to-cyan-500" },
  { id: "age_reversal", name: "AI Age Reversal Tips", desc: "Science-backed tips to look younger", icon: Brain, credits: 4, color: "from-fuchsia-500 to-purple-500" },
];

export default function FutureFaceToolsGrid() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [age, setAge] = useState("30");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUse = async (toolId: string) => {
    if (!input.trim()) { toast({ title: "Please describe your request", variant: "destructive" }); return; }
    try {
      setLoading(true);
      setResult("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in first", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const res = await supabase.functions.invoke("future-face-ai", {
        body: { action: toolId, prompt: input, age: parseInt(age) }
      });
      const data = throwIfInvokeError(res);
      setResult(data.result || "No result returned.");
    } catch (err: any) {
      if (!handleEdgeError(err, { navigate, context: "Future Face" })) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Future Face Tools Grid - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Tools Grid section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Tools Grid.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">💎 AI Face Tools</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {tools.map((tool, i) => (
          <motion.div key={tool.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
            <Card
              className={`cursor-pointer transition-all h-full hover:shadow-lg ${activeTool === tool.id ? "border-cyan-500 shadow-cyan-500/20 shadow-lg" : "border-border/30"}`}
              onClick={() => { setActiveTool(tool.id); setResult(""); }}
            >
              <CardContent className="p-3 text-center">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white mx-auto w-fit mb-2`}>
                  <tool.icon className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold leading-tight">{tool.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{tool.desc}</p>
                <Badge variant="outline" className="mt-1.5 text-[8px]">{tool.credits} CR</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {activeTool && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Gem className="h-4 w-4 text-cyan-400" />
                {tools.find(t => t.id === activeTool)?.name}
              </h3>
              <div className="flex gap-2">
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" className="w-24" />
              </div>
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Describe your skin type, lifestyle habits, concerns..."
                rows={3}
              />
              <Button
                onClick={() => handleUse(activeTool)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gem className="h-4 w-4 mr-2" />}
                {loading ? "Analyzing..." : `Analyze (${tools.find(t => t.id === activeTool)?.credits} Credits)`}
              </Button>
              {result && (
                <Card className="bg-card/80 border-cyan-500/20">
                  <CardContent className="p-4 prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
}
