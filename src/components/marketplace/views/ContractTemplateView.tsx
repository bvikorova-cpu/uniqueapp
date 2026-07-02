import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ScrollText, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props { onBack: () => void; }

export function ContractTemplateView({ onBack }: Props) {
  const [serviceType, setServiceType] = useState("");
  const [scope, setScope] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!serviceType.trim()) { toast.error("Enter the service type"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("marketplace-ai", {
        body: { action: "contract-template", serviceType, scope, budget, timeline },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Contract ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Contract Template View works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-zinc-800 flex items-center justify-center shadow-lg">
            <ScrollText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Smart Contract Templates</h2>
            <p className="text-muted-foreground text-sm">AI-generated service agreements & legal templates · 4 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-slate-600 to-zinc-700 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-500/10">
          <CardHeader><CardTitle>Contract Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Service Type *</label>
              <Input placeholder="e.g., Web Development, Logo Design, Consulting..." value={serviceType} onChange={e => setServiceType(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Project Scope</label>
              <Textarea placeholder="Describe deliverables, requirements, expectations..." value={scope} onChange={e => setScope(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Budget (€)</label>
              <Input placeholder="e.g., 2000" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Timeline</label>
              <Input placeholder="e.g., 3 weeks, 2 months..." value={timeline} onChange={e => setTimeline(e.target.value)} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-slate-600 to-zinc-800 hover:from-slate-700 hover:to-zinc-900 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><ScrollText className="w-4 h-4 mr-2" />Generate Contract (4 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-slate-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Your Contract" : "Results"}</CardTitle>
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
              <p className="text-muted-foreground text-sm text-center py-12">Enter project details to generate a professional service contract</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
