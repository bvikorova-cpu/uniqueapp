import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props { onBack: () => void; }

export function PricingAdvisorView({ onBack }: Props) {
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState("intermediate");
  const [location, setLocation] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!skill.trim()) { toast.error("Enter a skill"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("marketplace-ai", {
        body: { action: "pricing-advisor", skill, experience, location, currentPrice },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Analysis complete! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Analysis failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Pricing Advisor View works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Pricing Advisor</h2>
            <p className="text-muted-foreground text-sm">Data-driven pricing recommendations · 3 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-emerald-500/10">
          <CardHeader><CardTitle>Your Service</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Skill / Service *</label>
              <Input placeholder="e.g., React Development, Logo Design..." value={skill} onChange={e => setSkill(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Experience Level</label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-7 years)</SelectItem>
                  <SelectItem value="expert">Expert (7+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Location (Optional)</label>
              <Input placeholder="City, Country..." value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Current Price (€/hr, Optional)</label>
              <Input type="number" placeholder="25" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><DollarSign className="w-4 h-4 mr-2" />Get Advice (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-emerald-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Pricing Report" : "Results"}</CardTitle>
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
              <p className="text-muted-foreground text-sm text-center py-12">Enter your service details for AI-powered pricing advice</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
