import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Target, TrendingUp, Shield, Zap, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CompetitorAnalyzerProps {
  credits: number;
  onBack: () => void;
  onCreditsUsed: () => void;
}

const CompetitorAnalyzer = ({ credits, onBack, onCreditsUsed }: CompetitorAnalyzerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!businessName || !industry) {
      toast({ title: "Missing Info", description: "Business name and industry are required.", variant: "destructive" });
      return;
    }
    if (credits < 12) {
      toast({ title: "Insufficient Credits", description: "You need 12 credits.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const res = await supabase.functions.invoke("brand-ai", {
        body: { action: "competitor-analyzer", businessName, industry, description },
      });

      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      setAnalysis(res.data);
      onCreditsUsed();
      toast({ title: "🎯 Analysis Complete!", description: "Competitor landscape mapped." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Competitor Analyzer - How it works"} steps={[{ title: 'Open', desc: 'Access the Competitor Analyzer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Competitor Analyzer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 mb-3">
          <Target className="h-4 w-4 text-destructive" />
          <span className="text-sm font-semibold text-destructive">Competitor Analyzer</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Map Your Competitive Landscape</h2>
        <p className="text-muted-foreground mt-2">AI identifies top competitors and creates your unique positioning strategy</p>
        <Badge variant="secondary" className="mt-2">Cost: 12 credits | Your Credits: {credits}</Badge>
      </motion.div>

      {!analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-destructive" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name *</Label>
                  <Input placeholder="Your business name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Industry *</Label>
                  <Input placeholder="e.g., SaaS, E-commerce, Fintech" value={industry} onChange={e => setIndustry(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Business Description</Label>
                <Textarea placeholder="Briefly describe what your business does..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              </div>
              <Button onClick={handleAnalyze} disabled={loading || !businessName || !industry} className="w-full" size="lg">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Market...</> : <><Target className="mr-2 h-5 w-5" /> Analyze Competitors (12 Credits)</>}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Positioning */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Your Unique Positioning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Value Proposition</h4>
                  <p className="text-foreground font-medium">{analysis.positioning?.unique_value_proposition}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Key Differentiators</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.positioning?.differentiators?.map((d: string, i: number) => (
                      <Badge key={i} variant="outline" className="border-primary/30">{d}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Target Niche</h4>
                    <p className="text-sm text-foreground">{analysis.positioning?.target_niche}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Pricing Strategy</h4>
                    <p className="text-sm text-foreground">{analysis.positioning?.pricing_strategy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Competitors */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5" /> Competitor Landscape
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.competitors?.map((comp: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <Card className="h-full">
                    <CardContent className="pt-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-foreground">{comp.name}</h4>
                        <Badge variant="outline" className="text-xs">{comp.market_position}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Market Share</p>
                        <Progress value={parseInt(comp.estimated_market_share) || 20} className="h-2" />
                        <p className="text-xs text-right text-muted-foreground mt-0.5">{comp.estimated_market_share}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-green-600">Strengths</p>
                        <p className="text-xs text-muted-foreground">{comp.strengths}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-destructive">Weaknesses</p>
                        <p className="text-xs text-muted-foreground">{comp.weaknesses}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Market Gaps */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Market Gaps & Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {analysis.positioning?.market_gaps?.map((gap: string, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-foreground">{gap}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Button variant="outline" onClick={() => setAnalysis(null)} className="w-full">
            Run Another Analysis
          </Button>
        </div>
      )}
    </div>
    </>
  );
};

export default CompetitorAnalyzer;
