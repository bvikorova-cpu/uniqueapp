import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AISkillValuationView({ onBack }: Props) {
  const [skillName, setSkillName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!skillName.trim()) { toast.error("Enter a skill name"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("skill-swap-ai", {
        body: { action: "skill-valuation", skillName, experienceLevel, location, details },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Skill valued! (${data.credits_used} credits used)`);
    } catch (e: any) {
      toast.error(e.message || "Valuation failed");
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Skill Valuation View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Skill Valuation View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Skill Valuation View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Skill Valuation</h2>
            <p className="text-muted-foreground text-sm">Get market value analysis for your skills · 4 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-amber-500/10">
          <CardHeader><CardTitle>Skill Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Skill Name *</label>
              <Input placeholder="e.g., Python Programming, Guitar..." value={skillName} onChange={e => setSkillName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Experience Level</label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
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
              <label className="text-sm font-semibold mb-1.5 block">Additional Details</label>
              <Textarea placeholder="Certifications, portfolio, notable projects..." value={details} onChange={e => setDetails(e.target.value)} rows={3} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><TrendingUp className="w-4 h-4 mr-2" />Get Valuation (4 CR)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className={result ? "border-emerald-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Valuation Report" : "Results"}</CardTitle>
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
              <p className="text-muted-foreground text-sm text-center py-12">Enter your skill details and get AI-powered market valuation</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
