import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props { onBack: () => void; }

export function PortfolioReviewView({ onBack }: Props) {
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [testimonials, setTestimonials] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!bio.trim() && !skills.trim()) { toast.error("Enter your bio or skills"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("marketplace-ai", {
        body: { action: "portfolio-review", bio, skills, portfolio, testimonials },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Review complete! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Review failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Portfolio Review View works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Portfolio Review</h2>
            <p className="text-muted-foreground text-sm">Professional profile and branding advice · 4 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-pink-500/10">
          <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Bio</label>
              <Textarea placeholder="Your current bio or about section..." value={bio} onChange={e => setBio(e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Skills</label>
              <Input placeholder="e.g., JavaScript, Photoshop, Marketing..." value={skills} onChange={e => setSkills(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Portfolio Description</label>
              <Textarea placeholder="Describe your portfolio, projects, work samples..." value={portfolio} onChange={e => setPortfolio(e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Testimonials (Optional)</label>
              <Textarea placeholder="Any client feedback or testimonials..." value={testimonials} onChange={e => setTestimonials(e.target.value)} rows={2} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Reviewing...</> : <><Eye className="w-4 h-4 mr-2" />Get Review (4 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-pink-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Profile Review" : "Results"}</CardTitle>
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
              <p className="text-muted-foreground text-sm text-center py-12">Submit your profile for AI-powered branding advice</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
