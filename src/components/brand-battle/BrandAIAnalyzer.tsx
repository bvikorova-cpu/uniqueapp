import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, FileText, Target, BarChart3, Loader2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Brand { id: string; name: string; logo: string; }

const INSIGHTS = [
  { id: "audit", name: "Full Brand Audit", icon: FileText, cost: 5, color: "from-amber-400 to-yellow-600", desc: "Executive-grade strengths, weaknesses, opportunities, action plan" },
  { id: "competitor", name: "Competitor Landscape", icon: Target, cost: 4, color: "from-violet-400 to-purple-600", desc: "Porter's 5 Forces + differentiation strategy" },
  { id: "sentiment", name: "Sentiment Deep Dive", icon: Brain, cost: 3, color: "from-cyan-400 to-blue-600", desc: "Public perception themes & sentiment score" },
  { id: "market_outlook", name: "12-Month Outlook", icon: BarChart3, cost: 4, color: "from-emerald-400 to-green-600", desc: "Trends, growth %, risks, investment thesis" },
];

export const BrandAIAnalyzer = ({ brands }: { brands: Brand[] }) => {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ title: string; summary: string } | null>(null);

  const run = async (insightType: string) => {
    if (!selectedBrand) { toast.error("Pick a brand first"); return; }
    setRunning(insightType);
    try {
      const { data, error } = await supabase.functions.invoke("brand-ai-analyzer", {
        body: { brandId: selectedBrand, insightType },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const insight = (data as any).insight;
      setResult({ title: insight.title, summary: insight.summary });
      toast.success(`Insight ready! Charged ${(data as any).charged} credits.`);
    } catch (e: any) {
      toast.error(e.message ?? "Analysis failed");
    } finally {
      setRunning(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Brand A I Analyzer - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand A I Analyzer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand A I Analyzer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(45_90%_55%/.12),transparent_60%)]" />
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-amber-100">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-zinc-950">
                <Brain className="h-5 w-5" />
              </div>
              AI Brand Intelligence
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40">PREMIUM</Badge>
            </CardTitle>
            <Crown className="h-5 w-5 text-amber-400" />
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full rounded-xl bg-zinc-900/80 border border-amber-500/30 text-amber-100 px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
          >
            <option value="" style={{ background: "#18181b", color: "#fef3c7" }}>
              Select a brand to analyze...
            </option>
            {brands.map(b => (
              <option key={b.id} value={b.id} style={{ background: "#18181b", color: "#fef3c7" }}>
                {b.name}
              </option>
            ))}
          </select>
          {brands.length === 0 && (
            <p className="text-xs text-amber-300/70 italic">
              No brands available yet. Add sponsors to start analyzing.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INSIGHTS.map(ins => {
              const Icon = ins.icon;
              const isRunning = running === ins.id;
              return (
                <motion.button
                  key={ins.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!selectedBrand || !!running}
                  onClick={() => run(ins.id)}
                  className="group relative text-left rounded-xl border border-amber-500/20 bg-zinc-950/60 p-4 hover:border-amber-400/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${ins.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${ins.color}`}>
                      {isRunning ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Icon className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-amber-100">{ins.name}</p>
                        <Badge className="bg-amber-500/20 text-amber-300 border-0 text-[10px]">{ins.cost}c</Badge>
                      </div>
                      <p className="text-[11px] text-amber-100/60 leading-snug">{ins.desc}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <p className="text-[10px] text-amber-100/40 text-center flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" /> Reports stored to your account · Pay-per-insight model
          </p>
        </CardContent>
      </Card>

      <Dialog open={!!result} onOpenChange={() => setResult(null)}>
        <DialogContent className="max-w-3xl bg-zinc-950 border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-amber-100 flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-400" /> {result?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="prose prose-invert prose-sm max-w-none text-amber-100/90 whitespace-pre-wrap leading-relaxed">
              {result?.summary}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
    </>
  );
};
