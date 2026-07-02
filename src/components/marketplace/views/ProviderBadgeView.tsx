import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldCheck, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function ProviderBadgeView({ onBack }: Props) {
  const [skills, setSkills] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [experience, setExperience] = useState("");
  const [certifications, setCertifications] = useState("");
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
        body: { action: "provider-badge", skills, portfolio, experience, certifications },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Verification complete! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Provider Badge View - How it works"} steps={[{ title: 'Open', desc: 'Access the Provider Badge View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Provider Badge View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Provider Verification</h2>
            <p className="text-muted-foreground text-sm">Get AI-verified badge & quality score for your profile · 5 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />5 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-yellow-500/10">
          <CardHeader><CardTitle>Verification Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Your Skills *</label>
              <Input placeholder="e.g., Full-Stack Development, UX Design..." value={skills} onChange={e => setSkills(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Portfolio / Work Samples</label>
              <Textarea placeholder="Describe your best projects, links, results..." value={portfolio} onChange={e => setPortfolio(e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Experience</label>
              <Input placeholder="e.g., 5 years, 50+ completed projects..." value={experience} onChange={e => setExperience(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Certifications (Optional)</label>
              <Input placeholder="e.g., AWS Certified, Google UX Certificate..." value={certifications} onChange={e => setCertifications(e.target.value)} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : <><ShieldCheck className="w-4 h-4 mr-2" />Get Verified (5 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-yellow-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Verification Report" : "Results"}</CardTitle>
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
              <p className="text-muted-foreground text-sm text-center py-12">Submit your profile for AI-powered quality verification and badge</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
