import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Network, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface EntanglementNode {
  id: string;
  name: string;
  strength: number;
  type: string;
  x: number;
  y: number;
}

const NODE_COLORS: Record<string, string> = {
  strong: "bg-cyan-500",
  moderate: "bg-violet-500",
  weak: "bg-pink-500",
  dormant: "bg-gray-500",
};

export function EntanglementNetworkMap({ onBack }: { onBack: () => void }) {
  const [nodes, setNodes] = useState<EntanglementNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [totalStrength, setTotalStrength] = useState(0);
  const { toast } = useToast();
  const { spendCredit } = useAICredits();

  useEffect(() => { generateNetwork(); }, []);

  const generateNetwork = () => {
    setLoading(true);
    const names = ["Alice", "Bob", "Charlie", "Diana", "Echo", "Felix", "Grace", "Hugo", "Iris", "James", "Kai", "Luna", "Max", "Nova", "Otto", "Pearl"];
    const types = ["strong", "moderate", "weak", "dormant"];
    const generated = names.slice(0, 8 + Math.floor(Math.random() * 8)).map((name, i) => ({
      id: `node-${i}`,
      name,
      strength: Math.floor(Math.random() * 100),
      type: types[Math.floor(Math.random() * types.length)],
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    }));
    setNodes(generated);
    setTotalStrength(generated.reduce((s, n) => s + n.strength, 0));
    setLoading(false);
  };

  const analyzeNetwork = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }

    const hasCredits = await spendCredit("custom_generation", "Entanglement Network Analysis");
    if (!hasCredits) { toast({ title: "Not enough credits (2 required)", variant: "destructive" }); return; }

    setAnalyzing(true);
    try {
      const nodeList = nodes.map(n => `${n.name} (strength: ${n.strength}, type: ${n.type})`).join(", ");
      const response = await supabase.functions.invoke("ai-mood-therapist", {
        body: {
          messages: [{ role: "user", content: `Analyze this quantum entanglement network: ${nodeList}. Total network strength: ${totalStrength}. Provide insights about: 1) Network health, 2) Strongest connections, 3) Recommendations for strengthening weak links, 4) Quantum coherence score. Use quantum physics metaphors.` }],
          systemPrompt: "You are a Quantum Network Analyst. You analyze entanglement networks and provide insights using quantum physics metaphors. Be insightful and specific.",
        },
      });

      let content = `## Network Analysis\n\n**Network Health:** ${totalStrength > 400 ? "Strong" : totalStrength > 200 ? "Moderate" : "Needs attention"}\n\n**Nodes:** ${nodes.length} entangled connections\n**Total Strength:** ${totalStrength}\n\nYour strongest entanglements show quantum coherence at ${(totalStrength / nodes.length).toFixed(1)}% average. Consider strengthening dormant connections through observation.`;

      if (response.data) {
        try {
          if (typeof response.data === 'string') {
            let text = "";
            for (const line of response.data.split('\n')) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try { const p = JSON.parse(line.slice(6)); const d = p.choices?.[0]?.delta?.content; if (d) text += d; } catch {}
              }
            }
            if (text) content = text;
          } else if (response.data.choices?.[0]?.message?.content) {
            content = response.data.choices[0].message.content;
          }
        } catch {}
      }

      setAnalysis(content);
    } catch {
      toast({ title: "Analysis failed", variant: "destructive" });
    }
    setAnalyzing(false);
  };

  return (
    <>
      <FloatingHowItWorks
        title='Entanglement Network Map'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Entanglement Network Map panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Network className="h-5 w-5 text-emerald-400" /> Entanglement Map</h2>
            <p className="text-xs text-muted-foreground">Visual graph of all quantum connections</p>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">2 credits/analysis</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-center">
          <p className="text-xl font-bold text-cyan-400">{nodes.length}</p>
          <p className="text-[10px] text-muted-foreground">Nodes</p>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-center">
          <p className="text-xl font-bold text-violet-400">{totalStrength}</p>
          <p className="text-[10px] text-muted-foreground">Total Strength</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
          <p className="text-xl font-bold text-emerald-400">{nodes.length > 0 ? (totalStrength / nodes.length).toFixed(0) : 0}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Coherence</p>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 p-4 relative" style={{ minHeight: 300 }}>
        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
        ) : (
          <div className="relative w-full" style={{ height: 280 }}>
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              {nodes.map((n, i) => nodes.slice(i + 1).filter(() => Math.random() > 0.5).map((n2, j) => (
                <line key={`${i}-${j}`} x1={`${n.x}%`} y1={`${n.y}%`} x2={`${n2.x}%`} y2={`${n2.y}%`}
                  stroke="rgba(6,182,212,0.15)" strokeWidth="1" />
              )))}
            </svg>
            {/* Nodes */}
            {nodes.map((node, i) => (
              <motion.div key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="absolute group cursor-pointer"
                style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)", zIndex: 1 }}
              >
                <div className={`w-3 h-3 rounded-full ${NODE_COLORS[node.type]} shadow-lg`} />
                <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-background border rounded px-2 py-1 text-[10px] whitespace-nowrap z-10">
                  {node.name} · {node.strength}% · {node.type}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-2 justify-center">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={generateNetwork} variant="outline" className="flex-1 border-emerald-500/20">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Network
        </Button>
        <Button onClick={analyzeNetwork} disabled={analyzing} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          {analyzing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> AI Analysis (2 cr)</>}
        </Button>
      </div>

      {analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
        >
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
    </>
  );
}
