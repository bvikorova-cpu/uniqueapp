import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props { onBack: () => void; }

export function VideoPortfolioView({ onBack }: Props) {
  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState("");
  const [tone, setTone] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!skills.trim()) { toast.error("Enter your skills"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("marketplace-ai", {
        body: { action: "video-portfolio", name, skills, projects, tone },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Script ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Video Portfolio View works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Video Portfolio Script</h2>
            <p className="text-muted-foreground text-sm">Professional video intro script for your portfolio · 4 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-purple-500/10">
          <CardHeader><CardTitle>Your Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Your Name</label>
              <Input placeholder="e.g., Sarah Johnson" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Your Skills *</label>
              <Input placeholder="e.g., UI/UX Design, Branding..." value={skills} onChange={e => setSkills(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Key Projects / Achievements</label>
              <Textarea placeholder="Notable projects, clients, or results..." value={projects} onChange={e => setProjects(e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Tone / Style</label>
              <Input placeholder="e.g., Professional, Casual, Energetic..." value={tone} onChange={e => setTone(e.target.value)} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing...</> : <><Video className="w-4 h-4 mr-2" />Generate Script (4 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-purple-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Your Video Script" : "Results"}</CardTitle>
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
              <p className="text-muted-foreground text-sm text-center py-12">Enter your details to generate a professional video intro script</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
