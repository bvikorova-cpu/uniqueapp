import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props { onBack: () => void; }

export function ClientMatcherView({ onBack }: Props) {
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [preferredWork, setPreferredWork] = useState("");
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
        body: { action: "client-matcher", skills, experience, portfolio, preferredWork },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Matches found! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Matching failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Client Matcher View works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Client Matcher</h2>
            <p className="text-muted-foreground text-sm">Find your ideal clients with AI · 5 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />5 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-orange-500/10">
          <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Your Skills *</label>
              <Input placeholder="e.g., Web Design, Photography, Writing..." value={skills} onChange={e => setSkills(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Experience</label>
              <Textarea placeholder="Describe your professional experience..." value={experience} onChange={e => setExperience(e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Portfolio (Optional)</label>
              <Textarea placeholder="Links or descriptions of your best work..." value={portfolio} onChange={e => setPortfolio(e.target.value)} rows={2} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Preferred Work Type</label>
              <Input placeholder="e.g., Long-term, One-time, Remote..." value={preferredWork} onChange={e => setPreferredWork(e.target.value)} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Finding...</> : <><Target className="w-4 h-4 mr-2" />Find Clients (5 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-orange-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Client Matches" : "Results"}</CardTitle>
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
              <p className="text-muted-foreground text-sm text-center py-12">Enter your profile details to discover ideal client types</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
