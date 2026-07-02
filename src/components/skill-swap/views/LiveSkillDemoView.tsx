import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Radio, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function LiveSkillDemoView({ onBack }: Props) {
  const [skillName, setSkillName] = useState("");
  const [targetAudience, setTargetAudience] = useState("general");
  const [duration, setDuration] = useState("10 minutes");
  const [strengths, setStrengths] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!skillName.trim()) { toast.error("Enter a skill name"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("skill-swap-ai", {
        body: { action: "live-demo-script", skillName, targetAudience, duration, strengths },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Demo script created! (${data.credits_used} credits used)`);
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Live Skill Demo View - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Skill Demo View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Skill Demo View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Live Skill Demo</h2>
            <p className="text-muted-foreground text-sm">AI-generated demo scripts to showcase your skills · 3 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-rose-500/10">
          <CardHeader><CardTitle>Demo Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Skill to Demonstrate *</label>
              <Input placeholder="e.g., Watercolor Painting, Coding..." value={skillName} onChange={e => setSkillName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Target Audience</label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Audience</SelectItem>
                  <SelectItem value="beginners">Complete Beginners</SelectItem>
                  <SelectItem value="intermediate">Intermediate Learners</SelectItem>
                  <SelectItem value="professionals">Industry Professionals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Demo Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5 minutes">5 Minutes (Quick)</SelectItem>
                  <SelectItem value="10 minutes">10 Minutes (Standard)</SelectItem>
                  <SelectItem value="20 minutes">20 Minutes (Detailed)</SelectItem>
                  <SelectItem value="30 minutes">30 Minutes (Workshop)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Key Strengths (Optional)</label>
              <Textarea placeholder="What makes your skill unique..." value={strengths} onChange={e => setStrengths(e.target.value)} rows={3} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Radio className="w-4 h-4 mr-2" />Generate Demo Script (3 CR)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className={result ? "border-emerald-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Demo Script" : "Results"}</CardTitle>
            {result && (
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Configure your demo and generate a professional presentation script</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
